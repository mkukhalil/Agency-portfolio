/**
 * nukt-social poster.
 *
 * Cron every 15 minutes: reads today's queue file (US Eastern date) from
 * GitHub and publishes every post/platform whose scheduled time has passed and
 * that has no record yet — Facebook via the Graph API, LinkedIn via Make.com.
 * KV keeps one record per post and platform (written before posting, so
 * nothing is ever posted twice), the kill switch ("enabled"), and daily logs
 * for the Monday digest.
 */
import { sendAlert, sendDigest } from './email.js';
import { IMAGE_NAME, getImage, getQueueDay, imageName } from './github.js';
import { publishers, textFor } from './platforms.js';
import { appendLog, getItem, isDryRun, isEnabled, once, setItem } from './state.js';
import { POST_WINDOW, easternParts, weekdayOf } from './time.js';
import { PLATFORMS, hmac } from './util.js';

const IMAGE_URL_TTL_MS = 24 * 3_600_000;

/** Short-lived signed URL so Make.com can fetch the card without the repo being public. */
async function signedImageUrl(env, name, now) {
  const expires = now + IMAGE_URL_TTL_MS;
  const signature = await hmac(env.IMAGE_SIGNING_KEY, `${name}.${expires}`);
  return `${env.PUBLIC_URL}/image/${name}?exp=${expires}&sig=${signature}`;
}

/** Posts (or dry-runs) everything due. Returns problems for the alert email. */
async function publishDue(env, kv, day, now, events) {
  const problems = [];
  const due = day.posts.flatMap((post) =>
    PLATFORMS.filter((platform) => Date.parse(post.schedule[platform]) <= now).map((platform) => ({ post, platform })),
  );
  if (!due.length) return problems;

  const dryRun = await isDryRun(kv, day.date);

  for (const { post, platform } of due) {
    if (await getItem(kv, post.id, platform)) continue;
    const base = { at: now, post: post.id, platform };

    if (dryRun) {
      await setItem(kv, post.id, platform, { status: 'dry-run', at: now });
      events.push({ ...base, status: 'dry-run', detail: textFor(post, platform, day.date) });
      continue;
    }

    await setItem(kv, post.id, platform, { status: 'claimed', at: now });
    try {
      const imageUrl = await signedImageUrl(env, imageName(post), now);
      const id = await publishers[platform](env, post, { date: day.date, imageUrl });
      await setItem(kv, post.id, platform, { status: 'posted', at: now, id: String(id) });
      events.push({ ...base, status: 'posted', detail: String(id) });
    } catch (error) {
      await setItem(kv, post.id, platform, { status: 'failed', at: now, error: error.message });
      events.push({ ...base, status: 'failed', detail: error.message });
      problems.push(`${post.id} ${platform}: ${error.message}`);
    }
  }
  return problems;
}

export async function runTick(env, now = Date.now()) {
  const kv = env.SOCIAL_KV;
  const { date, minutes } = easternParts(now);
  const inWindow = minutes >= POST_WINDOW.start;
  const events = [];
  let problems = [];

  try {
    if (!(await isEnabled(kv))) {
      if (await once(kv, `paused:${date}`)) events.push({ at: now, status: 'paused', detail: 'KV "enabled" is not "true"' });
    } else {
      const day = await getQueueDay(env, date);
      if (!day) {
        // The daily run failed or has not happened: nothing to post; alert once.
        if (inWindow && (await once(kv, `missing:${date}`))) {
          events.push({ at: now, status: 'missing', detail: `No queue file for ${date} at 08:00 ET` });
          problems.push(`No queue file for ${date} at 08:00 ET: the daily run failed or has not run, so nothing is posting. If a run completes later today, its posts still go out at their scheduled times.`);
        }
      } else if (!day.posts.length) {
        if (await once(kv, `empty:${date}`)) events.push({ at: now, status: 'no posts', detail: day.note ?? 'Nothing worth posting today' });
      } else {
        problems = await publishDue(env, kv, day, now, events);
      }
    }
  } catch (error) {
    events.push({ at: now, status: 'error', detail: error.message });
    // Errors repeat every tick (e.g. an expired token); alert once per message per day.
    if (await once(kv, `error:${date}:${error.message.slice(0, 80)}`)) problems.push(error.message);
  }

  await appendLog(kv, date, events);
  if (problems.length) await sendAlert(env, date, problems).catch((error) => console.error('alert failed', error));

  if (weekdayOf(date) === 1 && inWindow && (await once(kv, `digest:${date}`))) {
    await sendDigest(env, kv, date).catch((error) => console.error('digest failed', error));
  }

  if (events.length) console.log(JSON.stringify({ date, events }));
  return { date, events, problems };
}

async function serveImage(env, url, now) {
  const name = url.pathname.slice('/image/'.length);
  const expires = Number(url.searchParams.get('exp'));
  const signature = url.searchParams.get('sig') ?? '';

  if (!IMAGE_NAME.test(name) || !(expires > now)) return new Response('Not found', { status: 404 });
  if (signature !== (await hmac(env.IMAGE_SIGNING_KEY, `${name}.${expires}`))) return new Response('Not found', { status: 404 });

  return new Response(await getImage(env, name), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=3600' },
  });
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runTick(env, controller.scheduledTime));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname.startsWith('/image/')) return serveImage(env, url, Date.now());
    return new Response('Not found', { status: 404 });
  },
};
