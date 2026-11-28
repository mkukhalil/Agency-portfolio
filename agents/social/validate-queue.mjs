/**
 * Deterministic guardrails for a week of social content. The weekly run must
 * pass this before committing; run-weekly.ps1 runs it again as a gate.
 *
 *   node agents/social/validate-queue.mjs --week 2026-11-30
 *
 * Checks every queue entry for that week (Monday through the following Monday),
 * the week marker, and the blog post the marker names.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const QUEUE = join(ROOT, 'agents/social/queue');
const BLOG = join(ROOT, 'src/content/blog');

const TYPES = ['tip', 'myth', 'news', 'checklist', 'showcase', 'question', 'blog'];
const BANNED = ['seamless', 'cutting-edge', 'cutting edge', 'elevate', 'unlock', 'game-changer', 'game changer', 'delve', 'revolutionize', "in today's fast-paced", 'supercharge'];
const BAIT = [/comment\s+["“']?(yes|below|if|a\b)/i, /tag\s+(a|your)\s+friend/i, /\b(like|share)\s+if\b/i, /type\s+["“']?\w+["”']?\s+(below|in the comments)/i, /\bsmash\b/i];
const CTA_URL = 'https://nukt.agency/services/seo-aeo';
const MAX_CTA_PER_WEEK = 2;
const LINKEDIN_MAX = 1200;
const FACEBOOK_MAX = 700;
const UTM_ALLOWANCE = 70; // the Worker appends ?utm_source=…&utm_medium=social&utm_campaign=YYYY-MM-DD

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const addDays = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

const findBanned = (text) => BANNED.filter((word) => new RegExp(`\\b${word.replace(/[-']/g, (c) => `\\${c}`)}`, 'i').test(text));

function checkCopy(where, text) {
  for (const word of findBanned(text)) fail(where, `banned word "${word}"`);
  for (const pattern of BAIT) if (pattern.test(text)) fail(where, `engagement bait (${pattern})`);
  if (/https?:\/\//i.test(text)) fail(where, 'contains a raw URL; use {link} and the "link" field');
}

/** Width and height straight from the PNG header. */
function pngSize(path) {
  const header = readFileSync(path).subarray(0, 24);
  if (header.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function checkEntry(date) {
  const file = join(QUEUE, `${date}.json`);
  const where = `queue/${date}.json`;
  let entry;
  try {
    entry = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(where, `unreadable JSON (${error.message})`);
    return null;
  }

  if (entry.date !== date) fail(where, `date field is ${entry.date}`);
  if (!TYPES.includes(entry.type)) fail(where, `type must be one of ${TYPES.join(', ')}`);
  if (typeof entry.cta !== 'boolean') fail(where, 'cta must be true or false');

  const { linkedin = '', facebook = '' } = entry;
  const linkLength = entry.link ? entry.link.length + UTM_ALLOWANCE : 0;
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

  if (entry.link !== null && entry.link !== undefined) {
    let url;
    try {
      url = new URL(entry.link);
    } catch {
      fail(where, 'link is not a valid URL');
    }
    if (url && url.protocol !== 'https:') fail(where, 'link must be https');
    if (url && [...url.searchParams.keys()].some((key) => key.startsWith('utm_'))) {
      fail(where, 'link must not carry utm_ tags; the Worker adds them per platform');
    }
  } else if (/\{link\}/.test(linkedin + facebook)) {
    fail(where, 'uses {link} but link is null');
  }

  if (entry.cta && entry.link !== CTA_URL) fail(where, `CTA posts must link to ${CTA_URL}`);
  if (entry.cta && !/free AI visibility check/i.test(linkedin + facebook)) fail(where, 'CTA posts must name the free AI visibility check');
  if (!entry.cta && /free AI visibility check/i.test(linkedin + facebook)) fail(where, 'mentions the free check but cta is false');

  if (entry.type === 'news') {
    const sources = entry.sources ?? [];
    if (!sources.length || !sources.every((source) => /^https:\/\//.test(source))) fail(where, 'news posts need https sources');
    if (!entry.link || !sources.includes(entry.link)) fail(where, 'news posts must link to their primary source');
  }

  if (!entry.card?.kicker || !entry.card?.headline) fail(where, 'card.kicker and card.headline required');
  else checkCopy(`${where} card`, `${entry.card.kicker} ${entry.card.headline}`);

  if (entry.image !== `agents/social/images/${date}.png`) fail(where, `image must be agents/social/images/${date}.png`);
  const imagePath = join(ROOT, entry.image ?? '');
  if (!existsSync(imagePath)) fail(where, 'image file missing');
  else {
    const size = pngSize(imagePath);
    if (!size || size.width !== 1080 || size.height !== 1080) fail(where, 'image must be a 1080x1080 PNG');
  }

  return entry;
}

function checkBlog(slug) {
  const file = join(BLOG, `${slug}.md`);
  const where = `blog/${slug}.md`;
  if (!existsSync(file)) return fail(where, 'missing');

  const source = readFileSync(file, 'utf8');
  const body = source.replace(/^---[\s\S]*?---/, '');
  const prose = body.split(/^#{1,4}\s+Sources\s*$/im)[0];
  const words = prose.split(/\s+/).filter(Boolean).length;

  if (words < 800 || words > 1200) fail(where, `${words} words before Sources; needs 800–1,200`);
  if (!/^#{2,3}\s+Sources\s*$/im.test(body)) fail(where, 'needs a "## Sources" section');
  if (!/^#{2,3}\s+Sources[\s\S]*\]\(https:\/\//im.test(body)) fail(where, 'Sources section needs linked sources');
  if (!/free AI visibility check/i.test(prose.slice(-900))) fail(where, 'must end with the free AI visibility check CTA');
  for (const word of findBanned(body)) fail(where, `banned word "${word}"`);
  for (const quote of body.match(/["“][^"”]+["”]/g) ?? []) {
    if (quote.split(/\s+/).length > 15) fail(where, `quote over 15 words: ${quote.slice(0, 60)}…`);
  }
}

const week = process.argv[process.argv.indexOf('--week') + 1];
if (!/^\d{4}-\d{2}-\d{2}$/.test(week ?? '') || new Date(`${week}T00:00:00Z`).getUTCDay() !== 1) {
  console.error('Usage: node agents/social/validate-queue.mjs --week <Monday YYYY-MM-DD>');
  process.exit(2);
}

const markerPath = join(QUEUE, `week-${week}.json`);
const marker = existsSync(markerPath) ? JSON.parse(readFileSync(markerPath, 'utf8')) : null;
if (!marker) fail(`queue/week-${week}.json`, 'week marker missing');

const dates = Array.from({ length: 8 }, (_, index) => addDays(week, index));
const present = new Set(readdirSync(QUEUE));
const entries = dates.filter((date) => present.has(`${date}.json`)).map(checkEntry).filter(Boolean);

for (const date of marker?.dates ?? []) if (!present.has(`${date}.json`)) fail(`queue/week-${week}.json`, `lists ${date} but the file is missing`);
// Monday–Sunday; the 8th (buffer) day counts toward next week.
const ctaCount = entries.filter((entry) => entry.date < addDays(week, 7) && entry.cta).length;
if (ctaCount > MAX_CTA_PER_WEEK) fail('week', `${ctaCount} CTA posts; max ${MAX_CTA_PER_WEEK}`);
if (marker?.blog) checkBlog(marker.blog);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n${errors.map((error) => `  - ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ week ${week}: ${entries.length} entries${marker?.blog ? `, blog ${marker.blog}` : ''} passed`);
