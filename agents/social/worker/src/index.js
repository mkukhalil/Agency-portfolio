/**
 * nukt-social daily poster.
 *
 * Cron (14:00 UTC): reads today's queue entry from GitHub and posts it to the
 * Facebook Page (Graph API) and the LinkedIn company page (via Make.com).
 * KV keeps a per-platform record so nothing is posted twice, a kill switch
 * ("enabled"), and a daily log used by the Monday digest.
 */
import { sendAlert, sendDigest } from './email.js';
import { getImage, getQueueEntry } from './github.js';
import { publishers, textFor } from './platforms.js';
import { appendLog, getPosted, isDryRun, isEnabled, markPosted } from './state.js';
import { DATE_PATTERN, PLATFORMS, hmac, isMonday, utcDate } from './util.js';

const IMAGE_URL_TTL_MS = 24 * 3_600_000;
const LOCK_TTL_SECONDS = 900;

/** Short-lived signed URL so Make.com can fetch the card without the repo being public. */
async function signedImageUrl(env, date, now) {
  const expires = now + IMAGE_URL_TTL_MS;
  const signature = await hmac(env.IMAGE_SIGNING_KEY, `${date}.${expires}`);
  return `${env.PUBLIC_URL}/image/${date}.png?exp=${expires}&sig=${signature}`;
}

async function postEntry(env, kv, entry, now, events, problems) {
  const { date } = entry;
  const dryRun = await isDryRun(kv, date);
  const imageUrl = await signedImageUrl(env, date, now);

  for (const platform of PLATFORMS) {
    if (await getPosted(kv, date, platform)) {
      events.push({ platform, status: 'skipped', detail: 'already posted' });
      continue;
    }

    if (dryRun) {
      events.push({ platform, status: 'dry-run', detail: textFor(entry, platform) });
      continue;
    }

    try {
      const id = await publishers[platform](env, entry, { imageUrl });
      await markPosted(kv, date, platform, { at: new Date(now).toISOString(), id });
      events.push({ platform, status: 'posted', detail: String(id) });
    } catch (error) {
      events.push({ platform, status: 'failed', detail: error.message });
      problems.push(`${platform}: ${error.message}`);
    }
  }
}

export async function runDaily(env, now = Date.now()) {
  const kv = env.SOCIAL_KV;
  const date = utcDate(now);
  const events = [];
  const problems = [];

  try {
    if (!(await isEnabled(kv))) {
      events.push({ status: 'paused', detail: 'KV "enabled" is not "true"' });
    } else if (await kv.get(`lock:${date}`)) {
      events.push({ status: 'skipped', detail: 'another run for this date is in progress or finished' });
    } else {
      await kv.put(`lock:${date}`, String(now), { expirationTtl: LOCK_TTL_SECONDS });
      const entry = await getQueueEntry(env, date);

      if (entry) {
        await postEntry(env, kv, entry, now, events, problems);
      } else {
        events.push({ status: 'missing', detail: `No queue entry for ${date}; nothing posted` });
        problems.push(`No queue entry for ${date}; nothing was posted.`);
      }
    }
  } catch (error) {
    events.push({ status: 'error', detail: error.message });
    problems.push(error.message);
  }

  await appendLog(kv, date, events);

  if (problems.length) {
    await sendAlert(env, date, problems).catch((error) => console.error('alert failed', error));
  }
  if (isMonday(date)) {
    await sendDigest(env, kv, date).catch((error) => console.error('digest failed', error));
  }

  console.log(JSON.stringify({ date, events }));
  return { date, events, problems };
}

async function serveImage(env, url, now) {
  const date = url.pathname.match(/^\/image\/(\d{4}-\d{2}-\d{2})\.png$/)?.[1];
  const expires = Number(url.searchParams.get('exp'));
  const signature = url.searchParams.get('sig') ?? '';

  if (!date || !DATE_PATTERN.test(date) || !(expires > now)) return new Response('Not found', { status: 404 });
  if (signature !== (await hmac(env.IMAGE_SIGNING_KEY, `${date}.${expires}`))) {
    return new Response('Not found', { status: 404 });
  }

  const entry = await getQueueEntry(env, date);
  if (!entry) return new Response('Not found', { status: 404 });

  return new Response(await getImage(env, entry.image), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=3600' },
  });
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runDaily(env, controller.scheduledTime));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname.startsWith('/image/')) return serveImage(env, url, Date.now());
    return new Response('Not found', { status: 404 });
  },
};
