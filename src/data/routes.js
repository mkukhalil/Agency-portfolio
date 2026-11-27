import { caseStudies } from './caseStudies';
import { servicePaths } from './servicePages';

/** Every indexable URL. Drives prerendering and the sitemap. */
export const staticRoutes = ['/', ...servicePaths, '/terms', '/privacy'];

export const caseStudyRoutes = caseStudies.map((study) => `/work/${study.slug}`);

export const routes = [...staticRoutes, ...caseStudyRoutes];
