/**
 * Local end-to-end test of the Worker with a sample queue. Runs the real
 * Worker code in Node with in-memory KV and mocked GitHub, Facebook, Make.com
 * and Resend endpoints — nothing is posted anywhere.
 *
 *   node agents/social/worker/test/local-test.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { runDaily } from '../src/index.js';

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url));
const sampleEntry = (kind, date) =>
  JSON.parse(String(fixture(`queue/sample-${kind}.json`)).replaceAll('SAMPLE', date));
const image = fixture('images/sample.png');

// Sample queue: 2026-12-05 is deliberately missing.
const queue = {
  '2026-12-01': sampleEntry('tip', '2026-12-01'),
  '2026-12-02': sampleEntry('tip', '2026-12-02'),
  '2026-12-03': sampleEntry('cta', '2026-12-03'),
  '2026-12-04': sampleEntry('cta', '2026-12-04'),
  '2026-12-06': sampleEntry('tip', '2026-12-06'),
  '2026-12-07': sampleEntry('tip', '2026-12-07'),
  '2026-12-08': sampleEntry('tip', '2026-12-08'),
};

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

const calls = { facebook: [], make: [], email: [] };
let facebookFails = false;

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url);

  if (url.hostname === 'api.github.com') {
    assert.equal(init.headers.Authorization, 'Bearer test-github-token');
    const path = url.pathname.split('/contents/')[1];
    const queueDate = path.match(/^agents\/social\/queue\/(.+)\.json$/)?.[1];
    if (queueDate) return queue[queueDate] ? Response.json(queue[queueDate]) : new Response('', { status: 404 });
    if (/^agents\/social\/images\/.+\.png$/.test(path)) return new Response(image);
    return new Response('', { status: 404 });
  }

  if (url.hostname === 'graph.facebook.com') {
    const form = init.body;
    calls.facebook.push({ url: url.toString(), message: form.get('message'), source: form.get('source') });
    return facebookFails
      ? Response.json({ error: { message: 'Invalid OAuth access token' } }, { status: 400 })
      : Response.json({ id: 'photo1', post_id: `page_${calls.facebook.length}` });
  }

  if (url.toString() === env.MAKE_WEBHOOK_URL) {
    calls.make.push(JSON.parse(init.body));
    return Response.json({ ok: true, id: `urn:li:share:${calls.make.length}` });
  }

  if (url.hostname === 'api.resend.com') {
    calls.email.push(JSON.parse(init.body));
    return Response.json({ id: 'email1' });
  }

  throw new Error(`Unexpected fetch ${url}`);
};

const env = {
  SOCIAL_KV: new MemoryKV(),
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
const kv = env.SOCIAL_KV;
const at = (date) => Date.parse(`${date}T14:00:00Z`);
const reset = () => Object.values(calls).forEach((list) => (list.length = 0));
const statuses = (result) => result.events.map((event) => `${event.platform ?? '-'}:${event.status}`);

const steps = [];
const step = (name, fn) => steps.push([name, fn]);

step('kill switch off: nothing posted (Monday still sends the digest)', async () => {
  const result = await runDaily(env, at('2026-11-30'));
  assert.deepEqual(statuses(result), ['-:paused']);
  assert.equal(calls.facebook.length + calls.make.length, 0);
  assert.equal(calls.email.length, 1);
  assert.match(calls.email[0].subject, /Weekly digest/);
});

step('first three days are dry runs: logged, not posted', async () => {
  await kv.put('enabled', 'true');
  for (const date of ['2026-12-01', '2026-12-02', '2026-12-03']) {
    const result = await runDaily(env, at(date));
    assert.deepEqual(statuses(result), ['facebook:dry-run', 'linkedin:dry-run'], date);
  }
  assert.equal(calls.facebook.length + calls.make.length, 0);
  assert.equal(await kv.get('first_run'), '2026-12-01');
  const log = await kv.get('log:2026-12-03', 'json');
  assert.match(log[0].detail, /utm_source=facebook&utm_medium=social&utm_campaign=2026-12-03/);
});

step('day four goes live automatically on both platforms', async () => {
  const result = await runDaily(env, at('2026-12-04'));
  assert.deepEqual(statuses(result), ['facebook:posted', 'linkedin:posted']);

  const [fb] = calls.facebook;
  assert.equal(fb.url, 'https://graph.facebook.com/v21.0/123/photos');
  assert.match(fb.message, /https:\/\/nukt\.agency\/services\/seo-aeo\?utm_source=facebook&utm_medium=social&utm_campaign=2026-12-04/);
  assert.ok(fb.message.trim().endsWith('?'), 'Facebook text still ends with its question');
  assert.equal(fb.source.type, 'image/png');
  assert.equal(fb.source.size, image.length);

  const [li] = calls.make;
  assert.match(li.text, /utm_source=linkedin&utm_medium=social&utm_campaign=2026-12-04/);
  assert.doesNotMatch(li.text, /\{link\}/);
  assert.match(li.imageUrl, /^https:\/\/nukt-social\.example\.workers\.dev\/image\/2026-12-04\.png\?exp=\d+&sig=[0-9a-f]{64}$/);
  assert.ok(await kv.get('posted:2026-12-04:facebook'));
});

step('a second run for the same date never posts twice', async () => {
  await kv.delete('lock:2026-12-04'); // even after the lock expires
  const result = await runDaily(env, at('2026-12-04'));
  assert.deepEqual(statuses(result), ['facebook:skipped', 'linkedin:skipped']);
  assert.equal(calls.facebook.length + calls.make.length, 0);
});

step('missing entry: nothing posted, alert emailed', async () => {
  const result = await runDaily(env, at('2026-12-05'));
  assert.deepEqual(statuses(result), ['-:missing']);
  assert.equal(calls.facebook.length + calls.make.length, 0);
  assert.equal(calls.email.length, 1);
  assert.match(calls.email[0].subject, /problem/);
});

step('one platform failing: alert sent, the other still posts', async () => {
  facebookFails = true;
  const result = await runDaily(env, at('2026-12-06'));
  facebookFails = false;
  assert.deepEqual(statuses(result), ['facebook:failed', 'linkedin:posted']);
  assert.match(calls.email[0].html, /Invalid OAuth access token/);
  assert.equal(await kv.get('posted:2026-12-06:facebook'), null);
});

step('Monday digest covers last week, dry runs, failures and next week', async () => {
  await runDaily(env, at('2026-12-07'));
  const digest = calls.email.find((email) => /Weekly digest 2026-12-07/.test(email.subject));
  assert.ok(digest, 'digest sent');
  assert.match(digest.html, /dry-run/);
  assert.match(digest.html, /2026-12-05<\/td><td><\/td><td>missing/);
  assert.match(digest.html, /Invalid OAuth access token/);
  assert.match(digest.html, /2026-12-08<\/strong> \(tip\)/);
  assert.match(digest.html, /2026-12-09<\/strong>: <em>missing/);
});

step('kill switch can pause again', async () => {
  await kv.put('enabled', 'false');
  const result = await runDaily(env, at('2026-12-08'));
  assert.deepEqual(statuses(result), ['-:paused']);
  assert.equal(calls.facebook.length + calls.make.length, 0);
});

step('signed image URL: valid serves PNG, tampered or expired is 404', async () => {
  const valid = calls.make.length ? calls.make[0].imageUrl : null;
  await kv.put('enabled', 'true');
  await runDaily(env, at('2026-12-08'));
  const url = valid ?? calls.make.at(-1).imageUrl;

  const ok = await worker.fetch(new Request(url), env);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('Content-Type'), 'image/png');
  assert.equal((await ok.arrayBuffer()).byteLength, image.length);

  const tampered = await worker.fetch(new Request(url.replace(/sig=./, 'sig=0')), env);
  assert.equal(tampered.status, 404);
  const expired = await worker.fetch(new Request(url.replace(/exp=\d+/, 'exp=1')), env);
  assert.equal(expired.status, 404);
});

let failed = 0;
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
console.log(failed ? `\n${failed} failed` : `\nAll ${steps.length} checks passed`);
process.exit(failed ? 1 : 0);
