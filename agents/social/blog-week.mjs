/**
 * Weekly blog status. The blog is written on the first successful daily run
 * of each ISO week; any later run that week sees it as done.
 *
 *   node agents/social/blog-week.mjs --today 2026-12-08 [--root <dir>]
 *   → "needed"  or  "done <slug>"
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isoWeek } from './worker/src/time.js';

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Every blog post with its frontmatter date. */
export function readBlogDates(root = DEFAULT_ROOT) {
  const dir = join(root, 'src/content/blog');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      slug: file.replace(/\.md$/, ''),
      date: readFileSync(join(dir, file), 'utf8').match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1] ?? null,
    }));
}

export const blogsInWeek = (week, root) => readBlogDates(root).filter((post) => post.date && isoWeek(post.date) === week);

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const today = option('--today');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today ?? '')) {
    console.error('Usage: node agents/social/blog-week.mjs --today YYYY-MM-DD');
    process.exit(2);
  }
  const [existing] = blogsInWeek(isoWeek(today), option('--root') ?? DEFAULT_ROOT);
  console.log(existing ? `done ${existing.slug}` : 'needed');
}
