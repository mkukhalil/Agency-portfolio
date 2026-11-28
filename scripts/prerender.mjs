/**
 * Postbuild: renders every route to static HTML so crawlers that do not run
 * JavaScript (most AI crawlers) receive full page content.
 *
 * Expects `vite build` (client → dist) and `vite build --ssr` (server → dist/.ssr).
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = resolve('dist');
const SSR_DIR = join(DIST, '.ssr');
const ROOT_MARKER = '<div id="root"></div>';
const HEAD_MARKER = '<!--app-head-->';

const { render, routes, getPageMeta, renderHeadHtml } = await import(pathToFileURL(join(SSR_DIR, 'entry-server.js')).href);
const template = await readFile(join(DIST, 'index.html'), 'utf8');

for (const marker of [ROOT_MARKER, HEAD_MARKER]) {
  if (!template.includes(marker)) throw new Error(`Template is missing ${marker}`);
}

// "/a/b" → "a/b.html" so Cloudflare Pages serves it without a trailing-slash redirect.
const outputPathFor = (route) => (route === '/' ? 'index.html' : `${route.slice(1)}.html`);

const writePage = async (url, file) => {
  const appHtml = await render(url);
  const html = template
    .replace(HEAD_MARKER, renderHeadHtml(getPageMeta(url)))
    .replace(ROOT_MARKER, `<div id="root">${appHtml}</div>`);
  const target = join(DIST, file);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`  prerendered ${url} → ${file}`);
};

for (const route of routes) {
  await writePage(route, outputPathFor(route));
}

await writePage('/404', '404.html');

// Sitemap: every indexable route, using the same canonical URLs as the pages.
const sitemapUrls = routes
  .map((route) => getPageMeta(route))
  .filter((meta) => meta.canonical && !meta.noindex)
  .map((meta) => `  <url><loc>${meta.canonical}</loc>${meta.lastmod ? `<lastmod>${meta.lastmod}</lastmod>` : ''}</url>`);

await writeFile(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`,
);
console.log(`  sitemap.xml with ${sitemapUrls.length} URLs`);

await rm(SSR_DIR, { recursive: true, force: true });
