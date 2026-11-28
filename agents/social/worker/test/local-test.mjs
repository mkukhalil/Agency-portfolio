/**
 * Local end-to-end test of the Worker with a sample queue. Runs the real
 * Worker code in Node with in-memory KV and mocked GitHub, Facebook, Make.com
 * and Resend — nothing is posted anywhere. Times come from the real scheduler.
 *
 *   node agents/social/worker/test/local-test.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { runTick } from '../src/index.js';
import { easternToUtc, formatEastern } from '../src/time.js';
import { scheduleDay, seededRandom } from '../../schedule.mjs';

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url));
const image = fixture('images/sample.png');
const samplePost = (kind, date, index, type) => ({
  ...JSON.parse(String(fixture(`queue/sample-${kind}.json`))),
  id: `${date}-${index}`,
  image: `agents/social/images/${date}-${index}.png`,
  ...(type && { type }),
});

/** A scheduled day file, as the run script would commit it. */
const day = (date, posts, seed = 1) =>
  scheduleDay({ date, blog: null, posts }, { now: Date.parse(`${date}T00:00:00Z`) - 86_400_000, random: seededRandom(seed) }).day;

let queue = {};
const calls = { facebook: [], make: [], email: [] };
let facebookFails = false;

class MemoryKV {
  store = new Map();
  async get(key, type) {
    const value = this.store.get(key);
    if (value === undefined) return null;
    return type === 'json' ? JSON.parse(value) : value;
  }
  async put(key, value) {
    this.store.set(key, String(value));
  }
  async delete(key) {
    this.store.delete(key);
  }
}

const env = {
  GITHUB_REPO: 'owner/repo',
  GITHUB_TOKEN: 'test-github-token',
  FB_PAGE_ID: '123',
  FB_PAGE_TOKEN: 'test-page-token',
  MAKE_WEBHOOK_URL: 'https://hook.make.test/abc',
  RESEND_API_KEY: 'test-resend',
  ALERT_EMAIL: 'alerts@example.com',
  IMAGE_SIGNING_KEY: 'test-signing-key',
  PUBLIC_URL: 'https://nukt-social.example.workers.dev',
};

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url);

  if (url.hostname === 'api.github.com') {
    const path = url.pathname.split('/contents/')[1];
    const date = path.match(/^agents\/social\/queue\/(.+)\.json$/)?.[1];
    if (date) return queue[date] ? Response.json(queue[date]) : new Response('', { status: 404 });
    if (/^agents\/social\/images\/[\d-]+\.png$/.test(path)) return new Response(image);
    return new Response('', { status: 404 });
  }
  if (url.hostname === 'graph.facebook.com') {
    calls.facebook.push({ message: init.body.get('message'), source: init.body.get('source') });
    return facebookFails
      ? Response.json({ error: { message: 'Invalid OAuth access token' } }, { status: 400 })
      : Response.json({ id: 'photo', post_id: `fb_${calls.facebook.length}` });
  }
  if (url.toString() === env.MAKE_WEBHOOK_URL) {
    calls.make.push(JSON.parse(init.body));
    return Response.json({ ok: true, id: `urn:li:share:${calls.make.length}` });
  }
  if (url.hostname === 'api.resend.com') {
    calls.email.push(JSON.parse(init.body));
    return Response.json({ id: 'email' });
  }
  throw new Error(`Unexpected fetch ${url}`);
};

/** Runs every 15-minute tick of an Eastern day; returns what was published at which tick. */
async function runDay(date, testEnv) {
  const published = [];
  for (let minute = 0; minute < 24 * 60; minute += 15) {
    const now = easternToUtc(date, minute);
    const before = { fb: calls.facebook.length, li: calls.make.length };
    await runTick(testEnv, now);
    for (let i = before.fb; i < calls.facebook.length; i += 1) published.push({ platform: 'facebook', now });
    for (let i = before.li; i < calls.make.length; i += 1) published.push({ platform: 'linkedin', now, text: calls.make[i].text });
  }
  return published;
}

const freshEnv = async ({ live = true } = {}) => {
  const kv = new MemoryKV();
  await kv.put('enabled', 'true');
  if (live) await kv.put('first_run', '2026-01-01'); // past the dry-run days
  return { ...env, SOCIAL_KV: kv };
};

const reset = () => {
  queue = {};
  Object.values(calls).forEach((list) => (list.length = 0));
  facebookFails = false;
};

/** Each platform is published at the first tick at or after its scheduled time. */
function assertOnSchedule(published, posts) {
  const expected = posts.flatMap((post) =>
    ['facebook', 'linkedin'].map((platform) => {
      const at = Date.parse(post.schedule[platform]);
      return { platform, at, tick: Math.ceil(at / 900_000) * 900_000 };
    }),
  );
  assert.equal(published.length, expected.length, 'one publish per post and platform');
  for (const item of expected) {
    const match = published.find((entry) => entry.platform === item.platform && entry.now === item.tick);
    assert.ok(match, `${item.platform} due ${formatEastern(item.at)} published at the next tick`);
    assert.ok(match.now >= item.at, 'never before its scheduled time');
  }
}

const steps = [];
const step = (name, fn) => steps.push([name, fn]);

step('day with 0 posts: nothing published, logged once', async () => {
  const testEnv = await freshEnv();
  queue['2026-12-02'] = { date: '2026-12-02', blog: null, note: 'Nothing new worth saying', posts: [] };
  const published = await runDay('2026-12-02', testEnv);
  assert.equal(published.length, 0);
  const log = await testEnv.SOCIAL_KV.get('log:2026-12-02', 'json');
  assert.deepEqual(log.map((event) => event.status), ['no posts']);
  assert.equal(calls.email.length, 0);
});

step('day with 1 post: each platform goes out once, at its own time', async () => {
  const testEnv = await freshEnv();
  const file = day('2026-12-03', [samplePost('tip', '2026-12-03', 1)], 7);
  queue['2026-12-03'] = file;
  const published = await runDay('2026-12-03', testEnv);
  assertOnSchedule(published, file.posts);
  assert.notEqual(published[0].now, published[1].now, 'Facebook and LinkedIn at different times');
  assert.match(calls.facebook[0].message, /utm_source=facebook&utm_medium=social&utm_campaign=2026-12-03/);
  assert.match(published.find((entry) => entry.platform === 'linkedin').text, /utm_source=linkedin/);
});

step('day with 2 posts: 4 publishes, each on schedule, posts 3+ hours apart', async () => {
  const testEnv = await freshEnv();
  const file = day('2026-12-04', [samplePost('cta', '2026-12-04', 1), samplePost('tip', '2026-12-04', 2, 'news')], 11);
  queue['2026-12-04'] = file;
  const published = await runDay('2026-12-04', testEnv);
  assertOnSchedule(published, file.posts);
  for (const platform of ['facebook', 'linkedin']) {
    const [a, b] = file.posts.map((post) => Date.parse(post.schedule[platform]));
    assert.ok(Math.abs(b - a) >= 3 * 3_600_000, `${platform} posts at least 3 hours apart`);
  }
  assert.equal(calls.make.map((call) => call.id).join(), [...file.posts].sort((x, y) =>
    Date.parse(x.schedule.linkedin) - Date.parse(y.schedule.linkedin)).map((post) => post.id).join());
});

step('never posts twice: re-running every tick of the day again publishes nothing', async () => {
  const testEnv = await freshEnv();
  queue['2026-12-03'] = day('2026-12-03', [samplePost('tip', '2026-12-03', 1)], 7);
  await runDay('2026-12-03', testEnv);
  const again = await runDay('2026-12-03', testEnv);
  assert.equal(again.length, 0);
});

step('first 3 days are dry runs, then live automatically', async () => {
  const testEnv = await freshEnv({ live: false });
  const dates = ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10'];
  dates.forEach((date, index) => (queue[date] = day(date, [samplePost('tip', date, 1)], 20 + index)));
  for (const date of dates.slice(0, 3)) assert.equal((await runDay(date, testEnv)).length, 0, `${date} dry`);
  const log = await testEnv.SOCIAL_KV.get('log:2026-12-08', 'json');
  assert.deepEqual(log.map((event) => event.status), ['dry-run', 'dry-run']);
  assert.equal((await runDay('2026-12-10', testEnv)).length, 2, 'day 4 live');
});

step('missing day file: nothing published, one alert at 08:00 ET', async () => {
  const testEnv = await freshEnv();
  await runDay('2026-12-05', testEnv);
  const alerts = calls.email.filter((email) => /problem/.test(email.subject));
  assert.equal(alerts.length, 1);
  assert.match(alerts[0].html, /No queue file for 2026-12-05/);
});

step('platform failure: alert once, never retried, other platform still posts', async () => {
  const testEnv = await freshEnv();
  queue['2026-12-03'] = day('2026-12-03', [samplePost('tip', '2026-12-03', 1)], 7);
  facebookFails = true;
  const published = await runDay('2026-12-03', testEnv);
  assert.equal(calls.facebook.length, 1, 'Facebook attempted exactly once');
  assert.equal(published.filter((entry) => entry.platform === 'linkedin').length, 1);
  assert.equal(calls.email.length, 1);
  assert.equal((await testEnv.SOCIAL_KV.get('item:2026-12-03-1:facebook', 'json')).status, 'failed');
});

step('kill switch: nothing posted while "enabled" is not "true"', async () => {
  const testEnv = await freshEnv();
  await testEnv.SOCIAL_KV.put('enabled', 'false');
  queue['2026-12-03'] = day('2026-12-03', [samplePost('tip', '2026-12-03', 1)], 7);
  assert.equal((await runDay('2026-12-03', testEnv)).length, 0);
});

step('Monday digest: sent once, with scheduled times in ET', async () => {
  const testEnv = await freshEnv();
  queue['2026-12-07'] = day('2026-12-07', [samplePost('tip', '2026-12-07', 1)], 3);
  await runDay('2026-12-07', testEnv);
  const digests = calls.email.filter((email) => /Weekly digest 2026-12-07/.test(email.subject));
  assert.equal(digests.length, 1);
  const post = queue['2026-12-07'].posts[0];
  assert.ok(digests[0].html.includes(formatEastern(Date.parse(post.schedule.facebook))), 'Facebook time shown');
  assert.ok(digests[0].html.includes(formatEastern(Date.parse(post.schedule.linkedin))), 'LinkedIn time shown');
});

step('signed image URL: valid serves PNG, tampered or expired is 404', async () => {
  const testEnv = await freshEnv();
  queue['2026-12-03'] = day('2026-12-03', [samplePost('tip', '2026-12-03', 1)], 7);
  await runDay('2026-12-03', testEnv);
  const url = calls.make[0].imageUrl;
  assert.match(url, /\/image\/2026-12-03-1\.png\?exp=\d+&sig=[0-9a-f]{64}$/);

  const ok = await worker.fetch(new Request(url), testEnv);
  assert.equal(ok.status, 200);
  assert.equal((await ok.arrayBuffer()).byteLength, image.length);
  assert.equal((await worker.fetch(new Request(url.replace(/sig=./, 'sig=0')), testEnv)).status, 404);
  assert.equal((await worker.fetch(new Request(url.replace(/exp=\d+/, 'exp=1')), testEnv)).status, 404);
});

let failed = 0;
console.log = ((log) => (...parts) => (String(parts[0]).startsWith('{"date"') ? undefined : log(...parts)))(console.log);
for (const [name, fn] of steps) {
  reset();
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  ✗ ${name}\n    ${error.message}`);
  }
}
console.log(failed ? `\n${failed} failed` : `\nAll ${steps.length} Worker checks passed`);
process.exit(failed ? 1 : 0);
