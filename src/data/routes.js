import { caseStudies } from './caseStudies';
import { servicePaths } from './servicePages';
import { BLOG_PATH, getPostPath, posts } from './blog';

/** Every indexable URL. Drives prerendering and the sitemap. */
export const staticRoutes = ['/', ...servicePaths, BLOG_PATH, '/terms', '/privacy'];

export const caseStudyRoutes = caseStudies.map((study) => `/work/${study.slug}`);

export const blogRoutes = posts.map((post) => getPostPath(post.slug));

export const routes = [...staticRoutes, ...blogRoutes, ...caseStudyRoutes];
