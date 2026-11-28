import blogIndex from 'virtual:blog-index';
import { stripFrontmatter } from '../lib/blog/frontmatter';

/** Post bodies are separate chunks, loaded only on their own page. */
const sources = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default' });
const sourcePromises = new Map();

export const BLOG_PATH = '/blog';
export const LATEST_POST_COUNT = 3;

export const posts = blogIndex.filter((post) => import.meta.env.DEV || !post.draft);

export const getPost = (slug) => posts.find((post) => post.slug === slug);

export const getPostPath = (slug) => `${BLOG_PATH}/${slug}`;

export const latestPosts = posts.slice(0, LATEST_POST_COUNT);

/** Cached promise of a post's markdown body, suitable for React's use(). */
export function getPostBody(slug) {
  if (!sourcePromises.has(slug)) {
    const load = sources[`../content/blog/${slug}.md`];
    sourcePromises.set(slug, load ? load().then(stripFrontmatter) : Promise.resolve(''));
  }

  return sourcePromises.get(slug);
}

export const formatPostDate = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
