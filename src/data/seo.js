import { faqs } from './faq';
import { seoAeo } from './seoAeo';
import { webDesignDevelopment } from './webDesignDevelopment';
import { webAppDevelopment } from './webAppDevelopment';
import { customBusinessSystems } from './customBusinessSystems';

export const SITE = {
  url: 'https://nukt.agency',
  name: 'Nukt Agency',
  shortName: 'Nukt',
  locale: 'en_US',
  image: '/og-image.jpg',
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: 'Nukt — Web Development & SEO/AEO',
  logo: '/brand/nukt-app-icon-512.png',
  email: 'contact.nukt@gmail.com',
};

export const defaultMeta = {
  title: 'Nukt Agency – Web Design, Development & SEO/AEO',
  description:
    'Nukt is a design, full-stack development, and SEO & AEO agency building fast websites and web apps that rank on Google and get cited by AI search.',
};

/** Static per-route metadata. Case studies derive theirs from caseStudies.js. */
export const pageMeta = {
  '/': { ...defaultMeta, faqs },
  '/services/web-design-development': {
    title: 'Web Design & Development Services | Nukt',
    description:
      'Responsive business websites and landing pages, designed in Figma and built in React, with an SEO-ready foundation. Starting from $399.',
    breadcrumb: 'Web Design & Development',
    service: webDesignDevelopment.schema,
    faqs: webDesignDevelopment.faqs,
  },
  '/services/web-app-development': {
    title: 'Full-Stack Web App Development | Nukt',
    description:
      'Dashboards, portals, and platforms with a React frontend, Laravel backend, REST APIs, authentication, and a structured database. From $1,199.',
    breadcrumb: 'Full-Stack Web Apps',
    service: webAppDevelopment.schema,
    faqs: webAppDevelopment.faqs,
  },
  '/services/custom-crm-pos': {
    title: 'Custom CRM, POS & Business Systems | Nukt',
    description:
      'Custom CRM, POS, inventory, billing, and reporting systems built around how your business works and delivered in phases. From $2,499.',
    breadcrumb: 'Custom Business Systems',
    service: customBusinessSystems.schema,
    faqs: customBusinessSystems.faqs,
  },
  '/services/seo-aeo': {
    title: 'SEO & AEO Services – Answer Engine Optimization | Nukt',
    description:
      'Technical SEO, on-page SEO, schema markup, and Answer Engine Optimization so your site ranks on Google and gets cited by ChatGPT, Perplexity, and AI Overviews.',
    breadcrumb: 'SEO & AEO',
    service: seoAeo.schema,
    faqs: seoAeo.faqs,
  },
  '/terms': {
    title: 'Terms and Conditions | Nukt',
    description: 'The terms that apply when you use the Nukt website or work with Nukt on a project.',
    breadcrumb: 'Terms and Conditions',
  },
  '/privacy': {
    title: 'Privacy Policy | Nukt',
    description: 'How Nukt collects, uses, and protects information when you visit our website or work with us.',
    breadcrumb: 'Privacy Policy',
  },
};

export const notFoundMeta = {
  title: 'Page not found | Nukt',
  description: 'The page you are looking for does not exist or has moved.',
  noindex: true,
};
