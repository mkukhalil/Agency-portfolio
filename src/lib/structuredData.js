import { SITE } from '../data/seo';

const ORGANIZATION_ID = `${SITE.url}/#organization`;

const organization = () => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE.name,
  alternateName: SITE.shortName,
  url: `${SITE.url}/`,
  logo: `${SITE.url}${SITE.logo}`,
  email: SITE.email,
  description:
    'Design, full-stack development, and SEO & AEO agency building websites, web apps, and business software.',
  // TODO: add sameAs with the real LinkedIn / Behance / GitHub / X profile URLs.
});

const service = (meta, schema) => ({
  '@type': 'Service',
  name: schema.name,
  serviceType: schema.serviceType,
  description: schema.description,
  url: meta.canonical,
  provider: { '@id': ORGANIZATION_ID },
  areaServed: 'Worldwide',
});

const faqPage = (meta, faqs) => ({
  '@type': 'FAQPage',
  url: meta.canonical,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});

const breadcrumbList = (meta) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
    { '@type': 'ListItem', position: 2, name: meta.breadcrumb, item: meta.canonical },
  ],
});

/** JSON-LD graph for a resolved page: Organization always, the rest when relevant. */
export function getStructuredData(meta) {
  const graph = [organization()];

  if (meta.canonical) {
    if (meta.service) graph.push(service(meta, meta.service));
    if (meta.faqs?.length) graph.push(faqPage(meta, meta.faqs));
    if (meta.breadcrumb) graph.push(breadcrumbList(meta));
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON safe to inline inside a <script> element. */
export const serializeJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
