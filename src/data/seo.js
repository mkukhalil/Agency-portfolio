export const SITE = {
  url: 'https://nukt.agency',
  name: 'Nukt Agency',
  shortName: 'Nukt',
  locale: 'en_US',
  // TODO: replace with a 1200×630 social preview image.
  image: '/nukt.png',
};

export const defaultMeta = {
  title: 'Nukt Agency – Web Design, Development & SEO/AEO',
  description:
    'Nukt is a design, full-stack development, and SEO & AEO agency building fast websites and web apps that rank on Google and get cited by AI search.',
};

/** Static per-route metadata. Case studies derive theirs from caseStudies.js. */
export const pageMeta = {
  '/': defaultMeta,
  '/services/seo-aeo': {
    title: 'SEO & AEO Services – Answer Engine Optimization | Nukt',
    description:
      'Technical SEO, on-page SEO, schema markup, and Answer Engine Optimization so your site ranks on Google and gets cited by ChatGPT, Perplexity, and AI Overviews.',
    breadcrumb: [{ name: 'Services', path: '/#services' }, { name: 'SEO & AEO' }],
  },
  '/terms': {
    title: 'Terms and Conditions | Nukt',
    description: 'The terms that apply when you use the Nukt website or work with Nukt on a project.',
    breadcrumb: [{ name: 'Terms and Conditions' }],
  },
  '/privacy': {
    title: 'Privacy Policy | Nukt',
    description: 'How Nukt collects, uses, and protects information when you visit our website or work with us.',
    breadcrumb: [{ name: 'Privacy Policy' }],
  },
};

export const notFoundMeta = {
  title: 'Page not found | Nukt',
  description: 'The page you are looking for does not exist or has moved.',
  noindex: true,
};
