import { readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseFrontmatter } from '../src/lib/blog/frontmatter.js';

const VIRTUAL_ID = 'virtual:blog-index';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const BLOG_DIR = resolve('src/content/blog');
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 220;

const readPost = (file) => {
  const slug = basename(file, '.md');
  const { data, body } = parseFrontmatter(readFileSync(join(BLOG_DIR, file), 'utf8'));
  const problems = [
    !SLUG.test(slug) && 'file name must be a lowercase-hyphenated slug',
    !data.title && 'missing title',
    !data.description && 'missing description',
    !DATE.test(data.date ?? '') && 'date must be YYYY-MM-DD',
    data.updated && !DATE.test(data.updated) && 'updated must be YYYY-MM-DD',
  ].filter(Boolean);

  if (problems.length) throw new Error(`Blog post ${file}: ${problems.join('; ')}`);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    updated: data.updated || data.date,
    draft: data.draft === 'true',
    readingMinutes: Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE)),
  };
};

/**
 * Exposes post metadata (no bodies) as `virtual:blog-index`, newest first, so
 * listings stay small; bodies load per post via import.meta.glob.
 * Invalid frontmatter fails the build.
 */
export function blogPlugin() {
  return {
    name: 'nukt-blog-index',
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return undefined;

      this.addWatchFile(BLOG_DIR);
      const posts = readdirSync(BLOG_DIR)
        .filter((file) => file.endsWith('.md'))
        .map(readPost)
        .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

      return `export default ${JSON.stringify(posts)};`;
    },
    handleHotUpdate({ file, server }) {
      if (!resolve(file).startsWith(BLOG_DIR)) return;
      const module = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) server.moduleGraph.invalidateModule(module);
    },
  };
}
