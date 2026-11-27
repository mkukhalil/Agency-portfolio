import { seoAeo } from './seoAeo';
import { webDesignDevelopment } from './webDesignDevelopment';
import { webAppDevelopment } from './webAppDevelopment';
import { customBusinessSystems } from './customBusinessSystems';

/** Content for each /services/:slug page. Slugs match the service cards. */
export const servicePages = {
  'web-design-development': webDesignDevelopment,
  'web-app-development': webAppDevelopment,
  'custom-crm-pos': customBusinessSystems,
  'seo-aeo': seoAeo,
};

export const servicePaths = Object.keys(servicePages).map((slug) => `/services/${slug}`);
