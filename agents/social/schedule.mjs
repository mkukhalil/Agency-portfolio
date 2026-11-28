/**
 * Gives each queued post its publish times. The run script calls this after
 * Claude writes the day files, so timing never depends on the model.
 *
 *   node agents/social/schedule.mjs agents/social/queue/2026-12-04.json [...]
 *
 * Rules, all in US Eastern time (DST-aware):
 * - every time is between 08:00 and 18:00 on the file's date, and not before
 *   20 minutes from now;
 * - minutes are never round (never a multiple of 5);
 * - the Facebook and LinkedIn versions of a post go out 30–120 minutes apart,
 *   in random order;
 * - two posts on one day are at least 3 hours apart on each platform.
 * If a second post cannot fit in what is left of the day, it is dropped; if no
 * post fits, the script fails so nothing half-scheduled is committed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POST_WINDOW, easternParts, easternToUtc, formatEastern } from './worker/src/time.js';

export const RULES = { minGap: 30, maxGap: 120, postSpacing: 180, leadMinutes: 20 };
const PLATFORMS = ['facebook', 'linkedin'];
const ATTEMPTS = 20_000;

const isRound = (minutes) => minutes % 5 === 0;

/** Deterministic PRNG for tests; production uses Math.random. */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const randomInt = (random, min, max) => min + Math.floor(random() * (max - min + 1));

/** Earliest usable minute on `date`, given the current time. */
export function windowStart(date, now) {
  const current = easternParts(now);
  if (current.date > date) return Infinity;
  if (current.date < date) return POST_WINDOW.start;
  return Math.max(POST_WINDOW.start, current.minutes + RULES.leadMinutes);
}

function pickSlot(random, start) {
  const first = randomInt(random, start, POST_WINDOW.end - RULES.minGap);
  const second = first + randomInt(random, RULES.minGap, RULES.maxGap);
  if (second > POST_WINDOW.end || isRound(first) || isRound(second)) return null;
  const [a, b] = random() < 0.5 ? PLATFORMS : [...PLATFORMS].reverse();
  return { [a]: first, [b]: second };
}

const spaced = (slots) =>
  slots.length < 2 || PLATFORMS.every((platform) => Math.abs(slots[1][platform] - slots[0][platform]) >= RULES.postSpacing);

/** Minute-of-day slots for `count` posts, or null when they cannot fit. */
export function pickSlots(count, start, random) {
  if (count === 0) return [];
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const slots = Array.from({ length: count }, () => pickSlot(random, start));
    if (slots.every(Boolean) && spaced(slots)) {
      return slots.sort((x, y) => Math.min(x.facebook, x.linkedin) - Math.min(y.facebook, y.linkedin));
    }
  }
  return null;
}

/** Adds `schedule` (UTC ISO) and `scheduleEastern` (readable) to each post of a day file. */
export function scheduleDay(day, { now = Date.now(), random = Math.random } = {}) {
  const start = windowStart(day.date, now);
  let posts = day.posts;
  let slots = start === Infinity ? null : pickSlots(posts.length, start, random);
  const notes = [];

  if (!slots && posts.length === 2) {
    notes.push(`Dropped "${posts[1].card?.headline}": no room left today for a second post 3 hours apart.`);
    posts = posts.slice(0, 1);
    slots = pickSlots(1, start, random);
  }
  if (!slots) throw new Error(`${day.date}: no time left between 08:00 and 18:00 ET to schedule ${posts.length} post(s)`);

  const scheduled = posts.map((post, index) => {
    const schedule = {};
    const scheduleEastern = {};
    for (const platform of PLATFORMS) {
      const at = easternToUtc(day.date, slots[index][platform]);
      schedule[platform] = new Date(at).toISOString();
      scheduleEastern[platform] = formatEastern(at);
    }
    return { ...post, schedule, scheduleEastern };
  });

  return { day: { ...day, posts: scheduled }, notes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: node agents/social/schedule.mjs <queue-day.json> [...]');
    process.exit(2);
  }
  let failed = 0;
  for (const file of files) {
    try {
      const { day, notes } = scheduleDay(JSON.parse(readFileSync(file, 'utf8')));
      writeFileSync(file, `${JSON.stringify(day, null, 2)}\n`);
      notes.forEach((note) => console.log(`  note: ${note}`));
      for (const post of day.posts) {
        console.log(`  ${post.id}: facebook ${post.scheduleEastern.facebook} · linkedin ${post.scheduleEastern.linkedin}`);
      }
      console.log(`scheduled ${day.date}: ${day.posts.length} post(s)`);
    } catch (error) {
      failed += 1;
      console.error(error.message);
    }
  }
  process.exit(failed ? 1 : 0);
}
