import { SITE, notFoundMeta, pageMeta } from '../data/seo';
import { getCaseStudy } from '../data/caseStudies';

const CASE_STUDY_PATH = /^\/work\/([^/]+)$/;

const normalizePath = (pathname) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

const resolveMeta = (path) => {
  if (pageMeta[path]) return pageMeta[path];

  const slug = path.match(CASE_STUDY_PATH)?.[1];
  const study = slug && getCaseStudy(slug);

  if (study) {
    return {
      title: `${study.title} – Case Study | Nukt`,
      description: study.summary,
      noindex: study.noindex,
      breadcrumb: [{ name: 'Work', path: '/#projects' }, { name: study.title }],
    };
  }

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
