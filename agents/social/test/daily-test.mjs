/**
 * Tests for the laptop side of the daily run: DST-aware Eastern time
 * conversion, the post-time scheduler, and the validator's daily rules
 * (0/1/2 posts, Friday's weekend entries, rolling 7-day limits) and the
 * one-blog-per-ISO-week rule.
 *
 *   node agents/social/test/daily-test.mjs
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { easternParts, easternToUtc, isoWeek } from '../worker/src/time.js';
import { RULES, scheduleDay, seededRandom } from '../schedule.mjs';
import { blogSource } from './blog-fixture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../worker/test/fixtures');
const VALIDATOR = join(HERE, '../validate-queue.mjs');
const BLOG_WEEK = join(HERE, '../blog-week.mjs');
const fixturePost = (kind) => JSON.parse(readFileSync(join(FIXTURES, `queue/sample-${kind}.json`), 'utf8'));

const steps = [];
const step = (name, fn) => steps.push([name, fn]);
const iso = (ms) => new Date(ms).toISOString();

// ---- Time conversion -------------------------------------------------------

step('DST: 08:00 ET is 13:00Z in winter and 12:00Z in summer', () => {
  assert.equal(iso(easternToUtc('2026-12-15', 8 * 60)), '2026-12-15T13:00:00.000Z');
  assert.equal(iso(easternToUtc('2026-07-15', 8 * 60)), '2026-07-15T12:00:00.000Z');
});

step('DST: spring-forward weekend (Mar 7–8, 2026)', () => {
  assert.equal(iso(easternToUtc('2026-03-07', 8 * 60)), '2026-03-07T13:00:00.000Z'); // EST, day before
  assert.equal(iso(easternToUtc('2026-03-08', 8 * 60)), '2026-03-08T12:00:00.000Z'); // EDT from 02:00
  assert.equal(iso(easternToUtc('2026-03-08', 18 * 60)), '2026-03-08T22:00:00.000Z');
});

step('DST: fall-back weekend (Oct 31 – Nov 1, 2026)', () => {
  assert.equal(iso(easternToUtc('2026-10-31', 8 * 60)), '2026-10-31T12:00:00.000Z'); // EDT
  assert.equal(iso(easternToUtc('2026-11-01', 8 * 60)), '2026-11-01T13:00:00.000Z'); // EST from 02:00
});

step('round trip: every 7th minute of DST-change days converts back exactly', () => {
  for (const date of ['2026-03-08', '2026-11-01', '2026-06-01', '2026-12-01']) {
    for (let minutes = 8 * 60; minutes <= 18 * 60; minutes += 7) {
      const back = easternParts(easternToUtc(date, minutes));
      assert.equal(back.date, date);
      assert.equal(back.minutes, minutes, `${date} ${minutes}`);
    }
  }
});

// ---- Scheduler -------------------------------------------------------------

const post = (index) => ({ id: `x-${index}`, card: { headline: `Post ${index}` } });
const dayBefore = (date) => Date.parse(`${date}T00:00:00Z`) - 86_400_000;

function assertScheduleRules(date, posts) {
  const slots = posts.map((scheduled) => {
    const slot = {};
    for (const platform of ['facebook', 'linkedin']) {
      const local = easternParts(Date.parse(scheduled.schedule[platform]));
      assert.equal(local.date, date, 'on the right Eastern date');
      assert.ok(local.minutes >= 8 * 60 && local.minutes <= 18 * 60, `${platform} ${local.hour}:${local.minute} within 08:00–18:00`);
      assert.notEqual(local.minute % 5, 0, 'non-round minute');
      slot[platform] = local.minutes;
    }
    const gap = Math.abs(slot.facebook - slot.linkedin);
    assert.ok(gap >= RULES.minGap && gap <= RULES.maxGap, `platform gap ${gap}`);
    return slot;
  });
  if (slots.length === 2) {
    for (const platform of ['facebook', 'linkedin']) {
      assert.ok(Math.abs(slots[1][platform] - slots[0][platform]) >= 180, `${platform} posts 3h apart`);
    }
  }
}

step('scheduler: 500 random 1- and 2-post days (incl. DST dates) all follow the rules', () => {
  const dates = ['2026-03-08', '2026-03-09', '2026-11-01', '2026-11-02', '2026-07-01', '2026-12-04'];
  let order = { facebookFirst: 0, linkedinFirst: 0 };
  for (let seed = 1; seed <= 500; seed += 1) {
    const date = dates[seed % dates.length];
    const count = (seed % 2) + 1;
    const { day } = scheduleDay({ date, posts: [post(1), post(2)].slice(0, count) }, { now: dayBefore(date), random: seededRandom(seed) });
    assert.equal(day.posts.length, count);
    assertScheduleRules(date, day.posts);
    const first = day.posts[0];
    order[Date.parse(first.schedule.facebook) < Date.parse(first.schedule.linkedin) ? 'facebookFirst' : 'linkedinFirst'] += 1;
  }
  assert.ok(order.facebookFirst > 100 && order.linkedinFirst > 100, 'either platform can go first');
});

step('scheduler: 0 posts stays 0', () => {
  const { day } = scheduleDay({ date: '2026-12-04', posts: [] }, { now: dayBefore('2026-12-04') });
  assert.deepEqual(day.posts, []);
});

step('scheduler: a late run only uses the rest of the day; drops a 2nd post that cannot fit', () => {
  const now = easternToUtc('2026-12-04', 14 * 60); // 2 PM ET
  const { day, notes } = scheduleDay({ date: '2026-12-04', posts: [post(1), post(2)] }, { now, random: seededRandom(5) });
  assert.equal(day.posts.length, 1);
  assert.equal(notes.length, 1);
  assert.ok(Date.parse(day.posts[0].schedule.facebook) >= now + 20 * 60_000);
  assert.throws(() => scheduleDay({ date: '2026-12-04', posts: [post(1)] }, { now: easternToUtc('2026-12-04', 17 * 60 + 50) }), /no time left/);
});

// ---- Validator -------------------------------------------------------------

function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'nukt-social-test-'));
  for (const dir of ['agents/social/queue', 'agents/social/images', 'src/content/blog']) mkdirSync(join(root, dir), { recursive: true });
  return root;
}

function writeDay(root, date, kinds, seed = 1) {
  const posts = kinds.map(([kind, type], index) => {
    const id = `${date}-${index + 1}`;
    copyFileSync(join(FIXTURES, 'images/sample.png'), join(root, `agents/social/images/${id}.png`));
    const base = { ...fixturePost(kind), id, image: `agents/social/images/${id}.png` };
    if (type === 'news') {
      Object.assign(base, { type: 'news', link: 'https://developers.google.com/search/blog/2026/12/example', sources: ['https://developers.google.com/search/blog/2026/12/example'] });
    } else if (type) base.type = type;
    if (base.type === 'tip' && base.link?.includes('/blog/')) base.link = null;
    if (!base.link) {
      base.linkedin = base.linkedin.replace(/\s*Full walkthrough: \{link\}/, '');
      base.facebook = base.facebook.replace(/\s*More here: \{link\}/, '');
    }
    return base;
  });
  const { day } = scheduleDay({ date, blog: null, posts }, { now: dayBefore(date), random: seededRandom(seed) });
  writeFileSync(join(root, `agents/social/queue/${date}.json`), JSON.stringify(day, null, 2));
  return day;
}

function validate(root, dates, extra = []) {
  try {
    return { ok: true, output: execFileSync('node', [VALIDATOR, '--root', root, '--dates', dates.join(','), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (error) {
    return { ok: false, output: `${error.stdout}${error.stderr}` };
  }
}

step('validator: days with 0, 1 and 2 (news) posts pass', () => {
  const root = makeRepo();
  writeFileSync(join(root, 'agents/social/queue/2026-12-01.json'), JSON.stringify({ date: '2026-12-01', blog: null, note: 'quiet day', posts: [] }));
  writeDay(root, '2026-12-02', [['tip']]);
  writeDay(root, '2026-12-03', [['tip'], ['tip', 'news']], 9);
  const result = validate(root, ['2026-12-01', '2026-12-02', '2026-12-03']);
  rmSync(root, { recursive: true, force: true });
  assert.ok(result.ok, result.output);
  assert.match(result.output, /3 post\(s\) passed/);
});

step('validator: 2 posts without news, or 3 posts, are rejected', () => {
  const root = makeRepo();
  writeDay(root, '2026-12-02', [['tip'], ['tip', 'question']], 9);
  writeDay(root, '2026-12-03', [['tip'], ['tip', 'news'], ['tip', 'question']], 9);
  const result = validate(root, ['2026-12-02', '2026-12-03']);
  rmSync(root, { recursive: true, force: true });
  assert.equal(result.ok, false);
  assert.match(result.output, /second post is only allowed for significant news/);
  assert.match(result.output, /3 posts; max 2/);
});

step("Friday's run: weekday + weekend files pass with evergreen formats", () => {
  const root = makeRepo();
  writeDay(root, '2026-12-04', [['tip']]); // Friday
  writeDay(root, '2026-12-05', [['tip', 'question']], 2); // Saturday
  writeDay(root, '2026-12-06', [['cta']], 3); // Sunday: checklist
  const result = validate(root, ['2026-12-04', '2026-12-05', '2026-12-06']);
  rmSync(root, { recursive: true, force: true });
  assert.ok(result.ok, result.output);
});

step("Friday's run: news or a showcase on the weekend is rejected", () => {
  const root = makeRepo();
  writeDay(root, '2026-12-04', [['tip']]);
  writeDay(root, '2026-12-05', [['tip', 'news']], 2);
  writeDay(root, '2026-12-06', [['tip', 'showcase']], 3);
  const result = validate(root, ['2026-12-04', '2026-12-05', '2026-12-06']);
  rmSync(root, { recursive: true, force: true });
  assert.equal(result.ok, false);
  assert.match(result.output, /2026-12-05\.json post 1: weekend posts must be tip, question, checklist/);
  assert.match(result.output, /2026-12-06\.json post 1: weekend posts must be/);
});

step('rolling 7 days: a 3rd CTA or 2nd showcase within any 7-day window is rejected', () => {
  const root = makeRepo();
  writeDay(root, '2026-11-30', [['cta']]);
  writeDay(root, '2026-12-02', [['cta']], 2);
  writeDay(root, '2026-12-03', [['tip', 'showcase']], 3);
  writeDay(root, '2026-12-04', [['cta']], 4); // 3rd CTA in Nov 28–Dec 4
  writeDay(root, '2026-12-07', [['tip', 'showcase']], 5); // 2nd showcase in Dec 1–7
  const result = validate(root, ['2026-12-04', '2026-12-07']);
  const later = validate(root, ['2026-12-10']); // window Dec 4–10: 1 CTA, 1 showcase
  rmSync(root, { recursive: true, force: true });
  assert.equal(result.ok, false);
  assert.match(result.output, /rolling 7 days to 2026-12-04: 3 cta posts; max 2/);
  assert.match(result.output, /rolling 7 days to 2026-12-07: 2 showcase posts; max 1/);
  assert.match(later.output, /queue\/2026-12-10\.json: missing/); // only the missing file, no rolling error
  assert.doesNotMatch(later.output, /rolling/);
});

step('validator: tampered schedule (round minute, outside window, platforms too close) is rejected', () => {
  const root = makeRepo();
  const day = writeDay(root, '2026-12-02', [['tip']]);
  day.posts[0].schedule = { facebook: iso(easternToUtc('2026-12-02', 7 * 60 + 30)), linkedin: iso(easternToUtc('2026-12-02', 7 * 60 + 40)) };
  writeFileSync(join(root, 'agents/social/queue/2026-12-02.json'), JSON.stringify(day));
  const result = validate(root, ['2026-12-02']);
  rmSync(root, { recursive: true, force: true });
  assert.equal(result.ok, false);
  assert.match(result.output, /outside 08:00–18:00 ET/);
  assert.match(result.output, /round minute/);
  assert.match(result.output, /10 min apart/);
});

// ---- Weekly blog -----------------------------------------------------------

const writeBlog = (root, slug, date, words) => writeFileSync(join(root, `src/content/blog/${slug}.md`), blogSource(date, words));

step('ISO weeks: Monday–Sunday, including year boundaries', () => {
  assert.equal(isoWeek('2026-12-07'), '2026-W50');
  assert.equal(isoWeek('2026-12-13'), '2026-W50');
  assert.equal(isoWeek('2026-12-14'), '2026-W51');
  assert.equal(isoWeek('2027-01-01'), '2026-W53');
  assert.equal(isoWeek('2025-12-29'), '2026-W01');
});

step('missed Monday: the blog is still needed on Tuesday, then done for the rest of the week', () => {
  const root = makeRepo();
  const status = (today) =>
    execFileSync('node', [BLOG_WEEK, '--today', today, '--root', root], { encoding: 'utf8' }).trim();
  writeBlog(root, 'last-week', '2026-12-02'); // previous ISO week
  const tuesdayBefore = status('2026-12-08');
  writeBlog(root, 'this-week', '2026-12-08'); // written on Tuesday
  const wednesday = status('2026-12-09');
  const nextMonday = status('2026-12-14');
  rmSync(root, { recursive: true, force: true });
  assert.equal(tuesdayBefore, 'needed');
  assert.equal(wednesday, 'done this-week');
  assert.equal(nextMonday, 'needed');
});

step('validator: a blog on any weekday passes; a 2nd in the same ISO week fails; next week passes', () => {
  const root = makeRepo();
  writeBlog(root, 'wednesday-post', '2026-12-09');
  const wednesday = validate(root, [], ['--blog', 'wednesday-post', '--blog-date', '2026-12-09']);
  writeBlog(root, 'friday-post', '2026-12-11');
  const second = validate(root, [], ['--blog', 'friday-post', '--blog-date', '2026-12-11']);
  writeBlog(root, 'next-week-post', '2026-12-14');
  const nextWeek = validate(root, [], ['--blog', 'next-week-post', '--blog-date', '2026-12-14']);
  rmSync(root, { recursive: true, force: true });
  assert.ok(wednesday.ok, wednesday.output);
  assert.match(second.output, /2026-W50 already has a blog post \(wednesday-post\); max one per ISO week/);
  assert.ok(nextWeek.ok, nextWeek.output);
});

step('validator: blog and posts are independent (a bad blog does not fail the posts)', () => {
  const root = makeRepo();
  writeDay(root, '2026-12-09', [['tip']]);
  writeBlog(root, 'too-short', '2026-12-09', 200);
  const blog = validate(root, [], ['--blog', 'too-short', '--blog-date', '2026-12-09']);
  const posts = validate(root, ['2026-12-09']);
  rmSync(root, { recursive: true, force: true });
  assert.equal(blog.ok, false);
  assert.match(blog.output, /words before Sources; needs 800–1,200/);
  assert.ok(posts.ok, posts.output);
});

let failed = 0;
for (const [name, fn] of steps) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  ✗ ${name}\n    ${error.message.split('\n').slice(0, 6).join('\n    ')}`);
  }
}
console.log(failed ? `\n${failed} failed` : `\nAll ${steps.length} daily-run checks passed`);
process.exit(failed ? 1 : 0);
