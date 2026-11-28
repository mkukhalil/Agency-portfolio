/**
 * Deterministic guardrails for daily social content. The run script runs this
 * after scheduling and before committing; anything failing blocks the push.
 *
 *   node agents/social/validate-queue.mjs --dates 2026-12-04,2026-12-05 [--require-blog] [--root <dir>]
 *
 * Checks each day file, its posts and schedule, the rolling 7-day mix (read
 * from every queue file in the window), and the day's blog post if it has one.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POST_WINDOW, addDays, easternParts, weekdayOf } from './worker/src/time.js';
import { RULES } from './schedule.mjs';

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const ROOT = resolve(option('--root') ?? join(dirname(fileURLToPath(import.meta.url)), '../..'));
const QUEUE = join(ROOT, 'agents/social/queue');
const BLOG = join(ROOT, 'src/content/blog');

const TYPES = ['tip', 'myth', 'news', 'checklist', 'showcase', 'question', 'blog'];
const WEEKEND_TYPES = ['tip', 'question', 'checklist'];
const BANNED = ['seamless', 'cutting-edge', 'cutting edge', 'elevate', 'unlock', 'game-changer', 'game changer', 'delve', 'revolutionize', "in today's fast-paced", 'supercharge'];
const BAIT = [/comment\s+["“']?(yes|below|if|a\b)/i, /tag\s+(a|your)\s+friend/i, /\b(like|share)\s+if\b/i, /type\s+["“']?\w+["”']?\s+(below|in the comments)/i, /\bsmash\b/i];
const CTA_URL = 'https://nukt.agency/services/seo-aeo';
const ROLLING_LIMITS = { cta: 2, showcase: 1, blog: 1 }; // per rolling 7 days
const MAX_POSTS_PER_DAY = 2;
const LINKEDIN_MAX = 1200;
const FACEBOOK_MAX = 700;
const UTM_ALLOWANCE = 70; // the Worker appends ?utm_source=…&utm_medium=social&utm_campaign=YYYY-MM-DD

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const findBanned = (text) => BANNED.filter((word) => new RegExp(`\\b${word.replace(/[-']/g, (c) => `\\${c}`)}`, 'i').test(text));

function checkCopy(where, text) {
  for (const word of findBanned(text)) fail(where, `banned word "${word}"`);
  for (const pattern of BAIT) if (pattern.test(text)) fail(where, `engagement bait (${pattern})`);
  if (/https?:\/\//i.test(text)) fail(where, 'contains a raw URL; use {link} and the "link" field');
}

function pngSize(path) {
  const header = readFileSync(path).subarray(0, 24);
  if (header.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const readDay = (date) => {
  const file = join(QUEUE, `${date}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

function checkLink(where, post) {
  const { linkedin = '', facebook = '' } = post;
  if (post.link === null || post.link === undefined) {
    if (/\{link\}/.test(linkedin + facebook)) fail(where, 'uses {link} but link is null');
    return;
  }
  let url;
  try {
    url = new URL(post.link);
  } catch {
    return fail(where, 'link is not a valid URL');
  }
  if (url.protocol !== 'https:') fail(where, 'link must be https');
  if ([...url.searchParams.keys()].some((key) => key.startsWith('utm_'))) fail(where, 'link must not carry utm_ tags; the Worker adds them');
  if (post.type === 'blog') {
    const slug = url.hostname === 'nukt.agency' && url.pathname.match(/^\/blog\/([a-z0-9-]+)$/)?.[1];
    if (!slug || !existsSync(join(BLOG, `${slug}.md`))) fail(where, 'blog teaser must link to an existing https://nukt.agency/blog/<slug>');
  }
}

function checkSchedule(where, date, post) {
  const { schedule } = post;
  if (!schedule?.facebook || !schedule?.linkedin) return fail(where, 'schedule.facebook and schedule.linkedin are required (run schedule.mjs)');

  const minutes = {};
  for (const platform of ['facebook', 'linkedin']) {
    const at = Date.parse(schedule[platform]);
    const local = easternParts(at);
    if (Number.isNaN(at) || local.date !== date) fail(where, `${platform} time is not on ${date} (US Eastern)`);
    if (local.minutes < POST_WINDOW.start || local.minutes > POST_WINDOW.end) fail(where, `${platform} time is outside 08:00–18:00 ET`);
    if (local.minute % 5 === 0) fail(where, `${platform} time is on a round minute`);
    minutes[platform] = local.minutes;
  }
  const gap = Math.abs(minutes.facebook - minutes.linkedin);
  if (gap < RULES.minGap || gap > RULES.maxGap) fail(where, `facebook and linkedin are ${gap} min apart; need ${RULES.minGap}–${RULES.maxGap}`);
  return minutes;
}

function checkPost(where, date, post, index) {
  if (post.id !== `${date}-${index + 1}`) fail(where, `id must be ${date}-${index + 1}`);
  if (!TYPES.includes(post.type)) fail(where, `type must be one of ${TYPES.join(', ')}`);
  if (typeof post.cta !== 'boolean') fail(where, 'cta must be true or false');

  const { linkedin = '', facebook = '' } = post;
  const linkLength = post.link ? post.link.length + UTM_ALLOWANCE : 0;
  if (!linkedin.trim()) fail(where, 'linkedin text missing');
  if (!facebook.trim()) fail(where, 'facebook text missing');
  if (linkedin.replace('{link}', '').length + linkLength > LINKEDIN_MAX) fail(where, `linkedin over ${LINKEDIN_MAX} characters with its link`);
  if (facebook.replace('{link}', '').length + linkLength > FACEBOOK_MAX) fail(where, `facebook over ${FACEBOOK_MAX} characters with its link`);
  if (facebook.length >= linkedin.length) fail(where, 'facebook version should be shorter than linkedin');
  if ((linkedin.match(/#\w+/g) ?? []).length > 3) fail(where, 'linkedin has more than 3 hashtags');
  if (/#\w+/.test(facebook)) fail(where, 'facebook version should not use hashtags');
  if (!facebook.trim().endsWith('?')) fail(where, 'facebook version must end with a question');
  checkCopy(`${where} linkedin`, linkedin);
  checkCopy(`${where} facebook`, facebook);
  checkLink(where, post);

  const mentionsCheck = /free AI visibility check/i.test(linkedin + facebook);
  if (post.cta && post.link !== CTA_URL) fail(where, `CTA posts must link to ${CTA_URL}`);
  if (post.cta && !mentionsCheck) fail(where, 'CTA posts must name the free AI visibility check');
  if (!post.cta && mentionsCheck) fail(where, 'mentions the free check but cta is false');

  if (post.type === 'news') {
    const sources = post.sources ?? [];
    if (!sources.length || !sources.every((source) => /^https:\/\//.test(source))) fail(where, 'news posts need https sources');
    if (!post.link || !sources.includes(post.link)) fail(where, 'news posts must link to their primary source');
  }

  if (!post.card?.kicker || !post.card?.headline) fail(where, 'card.kicker and card.headline required');
  else checkCopy(`${where} card`, `${post.card.kicker} ${post.card.headline}`);

  const image = `agents/social/images/${date}-${index + 1}.png`;
  if (post.image !== image) fail(where, `image must be ${image}`);
  else if (!existsSync(join(ROOT, image))) fail(where, 'image file missing');
  else {
    const size = pngSize(join(ROOT, image));
    if (!size || size.width !== 1080 || size.height !== 1080) fail(where, 'image must be a 1080x1080 PNG');
  }

  return checkSchedule(where, date, post);
}

function checkBlog(date, slug) {
  const where = `blog/${slug}.md`;
  const file = join(BLOG, `${slug}.md`);
  if (weekdayOf(date) !== 1) return fail(where, 'blog posts are written on Monday only');
  if (!existsSync(file)) return fail(where, 'missing');

  const source = readFileSync(file, 'utf8');
  const body = source.replace(/^---[\s\S]*?---/, '');
  const prose = body.split(/^#{1,4}\s+Sources\s*$/im)[0];
  const words = prose.split(/\s+/).filter(Boolean).length;

  if (!new RegExp(`^date:\\s*["']?${date}["']?\\s*$`, 'm').test(source)) fail(where, `frontmatter date must be ${date}`);
  if (words < 800 || words > 1200) fail(where, `${words} words before Sources; needs 800–1,200`);
  if (!/^#{2,3}\s+Sources[\s\S]*\]\(https:\/\//im.test(body)) fail(where, 'needs a "## Sources" section with linked sources');
  if (!/free AI visibility check/i.test(prose.slice(-900))) fail(where, 'must end with the free AI visibility check CTA');
  for (const word of findBanned(body)) fail(where, `banned word "${word}"`);
  for (const quote of body.match(/["“][^"”]+["”]/g) ?? []) {
    if (quote.split(/\s+/).length > 15) fail(where, `quote over 15 words: ${quote.slice(0, 60)}…`);
  }
}

function checkDay(date) {
  const where = `queue/${date}.json`;
  let day;
  try {
    day = readDay(date);
  } catch (error) {
    return fail(where, `unreadable JSON (${error.message})`);
  }
  if (!day) return fail(where, 'missing');
  if (day.date !== date) fail(where, `date field is ${day.date}`);
  if (!Array.isArray(day.posts)) return fail(where, 'posts must be an array (empty is allowed)');
  if (day.posts.length > MAX_POSTS_PER_DAY) fail(where, `${day.posts.length} posts; max ${MAX_POSTS_PER_DAY}`);
  if (day.posts.length === 2 && !day.posts.some((post) => post.type === 'news')) {
    fail(where, 'a second post is only allowed for significant news (one post must be type "news")');
  }

  const weekend = [0, 6].includes(weekdayOf(date));
  const slots = day.posts.map((post, index) => {
    const postWhere = `${where} post ${index + 1}`;
    if (weekend && !WEEKEND_TYPES.includes(post.type)) fail(postWhere, `weekend posts must be ${WEEKEND_TYPES.join(', ')}`);
    return checkPost(postWhere, date, post, index);
  });

  if (slots.length === 2 && slots.every(Boolean)) {
    for (const platform of ['facebook', 'linkedin']) {
      if (Math.abs(slots[1][platform] - slots[0][platform]) < RULES.postSpacing) fail(where, `the two ${platform} posts are under 3 hours apart`);
    }
  }

  if (day.blog) checkBlog(date, day.blog);
  return day;
}

/** Rolling 7 days ending on each date, across every queue file in the window. */
function checkRolling(date) {
  const window = Array.from({ length: 7 }, (_, index) => addDays(date, index - 6));
  const posts = window.flatMap((day) => readDay(day)?.posts ?? []);
  const counts = {
    cta: posts.filter((post) => post.cta).length,
    showcase: posts.filter((post) => post.type === 'showcase').length,
    blog: posts.filter((post) => post.type === 'blog').length,
  };
  for (const [rule, limit] of Object.entries(ROLLING_LIMITS)) {
    if (counts[rule] > limit) fail(`rolling 7 days to ${date}`, `${counts[rule]} ${rule} posts; max ${limit}`);
  }
}

const dates = (option('--dates') ?? '').split(',').filter(Boolean);
if (!dates.length || !dates.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))) {
  console.error('Usage: node agents/social/validate-queue.mjs --dates YYYY-MM-DD[,YYYY-MM-DD…] [--require-blog]');
  process.exit(2);
}

const days = dates.map(checkDay);
dates.forEach(checkRolling);
if (args.includes('--require-blog') && !days.some((day) => day?.blog)) fail('blog', "Monday's run must write the weekly blog post");

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n${errors.map((error) => `  - ${error}`).join('\n')}`);
  process.exit(1);
}
const total = days.reduce((sum, day) => sum + (day?.posts.length ?? 0), 0);
console.log(`✓ ${dates.join(', ')}: ${total} post(s) passed`);
