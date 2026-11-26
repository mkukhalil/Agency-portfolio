import { caseStudies } from './caseStudies';

/** Every indexable URL. Drives prerendering and the sitemap. */
export const staticRoutes = ['/', '/services/seo-aeo', '/terms', '/privacy'];

export const caseStudyRoutes = caseStudies.map((study) => `/work/${study.slug}`);

export const routes = [...staticRoutes, ...caseStudyRoutes];
