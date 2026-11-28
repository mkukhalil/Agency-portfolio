/**
 * Prints the "Run context" appended to daily-prompt.md. Claude cannot read
 * src/data or list the queue, so everything it needs is assembled here.
 *
 *   node agents/social/build-context.mjs --today 2026-12-04 --dates 2026-12-04,2026-12-05,2026-12-06 [--blog]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addDays, weekdayOf } from './worker/src/time.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const QUEUE = join(ROOT, 'agents/social/queue');
const BLOG = join(ROOT, 'src/content/blog');
const FACT_FILES = ['src/data/services.js', 'src/data/pricing.js', 'src/data/projects.js', 'src/data/testimonials.js', 'public/llms.txt'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const today = option('--today');
const dates = option('--dates').split(',');
const blogDay = args.includes('--blog');

const readDay = (date) => {
  const file = join(QUEUE, `${date}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

const postLine = (date, post) =>
  `- ${date} [${post.type}${post.cta ? ', CTA' : ''}] ${post.card?.headline ?? ''} | ${post.linkedin.split('\n')[0]}`;

const last = (days) => Array.from({ length: days }, (_, index) => addDays(today, index - days)).filter((date) => readDay(date));

const recentPosts = last(30).flatMap((date) => readDay(date).posts.map((post) => postLine(date, post)));
const rollingPosts = last(6).flatMap((date) => readDay(date).posts);
const used = {
  cta: rollingPosts.filter((post) => post.cta).length,
  showcase: rollingPosts.filter((post) => post.type === 'showcase').length,
  blog: rollingPosts.filter((post) => post.type === 'blog').length,
};

const blogPosts = readdirSync(BLOG)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const title = readFileSync(join(BLOG, file), 'utf8').match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
    const date = readFileSync(join(BLOG, file), 'utf8').match(/^date:\s*["']?(\S+?)["']?\s*$/m)?.[1] ?? '';
    return { slug: file.replace(/\.md$/, ''), title, date };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

const dateLines = dates.map((date) => {
  const weekend = [0, 6].includes(weekdayOf(date));
  return `- ${date} (${DAY_NAMES[weekdayOf(date)]})${weekend ? ': weekend, evergreen only (tip, question, checklist), no news, at most 1 post' : ''}`;
});

const fence = '```';
const facts = FACT_FILES.map((path) => `### ${path}\n${fence}\n${readFileSync(join(ROOT, path), 'utf8').trim()}\n${fence}`);

console.log(`
## Run context

- Today: ${today} (${DAY_NAMES[weekdayOf(today)]})
- Write one queue file for each of these dates:
${dateLines.join('\n')}
- Weekly blog post: ${blogDay ? 'REQUIRED today: this ISO week has no blog post yet (this is the first successful run of the week, or an earlier attempt failed).' : 'not today: this week already has its blog post. Do not write one.'}

### Rolling 7-day mix (limits apply to every 7-day window)

Already used in the 6 days before today: ${used.cta} of 2 CTA posts, ${used.showcase} of 1 project showcase, ${used.blog} of 1 blog teaser.

### Posts from the last 30 days
${recentPosts.length ? recentPosts.join('\n') : '(none)'}

### Existing blog posts (newest first: slug, date, title)
${blogPosts.length ? blogPosts.map((post) => `- ${post.slug}, ${post.date}: ${post.title}`).join('\n') : '(none)'}

## Repo facts (the only source for claims about Nukt and its clients)

${facts.join('\n\n')}
`);
