import { SITE, notFoundMeta, pageMeta } from '../data/seo';
import { getCaseStudy } from '../data/caseStudies';
import { BLOG_PATH, getPost } from '../data/blog';

const CASE_STUDY_PATH = /^\/work\/([^/]+)$/;
const BLOG_POST_PATH = /^\/blog\/([^/]+)$/;

const normalizePath = (pathname) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

const caseStudyMeta = (slug) => {
  const study = getCaseStudy(slug);
  if (!study) return null;

  return {
    title: `${study.title} – Case Study | Nukt`,
    description: study.summary,
    noindex: study.noindex,
    breadcrumb: study.title,
  };
};

const blogPostMeta = (slug) => {
  const post = getPost(slug);
  if (!post) return null;

  return {
    title: `${post.title} | Nukt`,
    description: post.description,
    noindex: post.draft,
    breadcrumb: post.title,
    parents: [{ name: pageMeta[BLOG_PATH].breadcrumb, path: BLOG_PATH }],
    lastmod: post.updated,
    article: { headline: post.title, datePublished: post.date, dateModified: post.updated },
  };
};

const resolveMeta = (path) => {
  if (pageMeta[path]) return pageMeta[path];

  const caseStudySlug = path.match(CASE_STUDY_PATH)?.[1];
  if (caseStudySlug) return caseStudyMeta(caseStudySlug);

  const postSlug = path.match(BLOG_POST_PATH)?.[1];
  if (postSlug) return blogPostMeta(postSlug);

  return null;
};

/** Full head metadata for a pathname; unknown paths get noindex 404 meta. */
export function getPageMeta(pathname) {
  const path = normalizePath(pathname);
  const meta = resolveMeta(path);

  if (!meta) return { ...notFoundMeta, path, canonical: null, image: `${SITE.url}${SITE.image}` };

  return {
    ...meta,
    path,
    canonical: `${SITE.url}${path === '/' ? '/' : path}`,
    image: `${SITE.url}${SITE.image}`,
  };
}
