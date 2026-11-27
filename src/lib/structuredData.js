import { SITE } from '../data/seo';
import { publishedTestimonials } from '../data/testimonials';

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const MIN_RATINGS_FOR_AGGREGATE = 2;

const review = (testimonial) => ({
  '@type': 'Review',
  reviewBody: testimonial.quote,
  author: {
    '@type': 'Person',
    name: testimonial.name,
    ...(testimonial.role && { jobTitle: testimonial.role }),
    ...(testimonial.company && { worksFor: { '@type': 'Organization', name: testimonial.company } }),
  },
  ...(testimonial.rating && {
    reviewRating: { '@type': 'Rating', ratingValue: testimonial.rating, bestRating: 5, worstRating: 1 },
  }),
});

/** Published testimonials only; AggregateRating needs at least two real ratings. */
const reviewData = () => {
  if (!publishedTestimonials.length) return {};

  const ratings = publishedTestimonials.map((t) => t.rating).filter(Boolean);
  const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;

  return {
    review: publishedTestimonials.map(review),
    ...(ratings.length >= MIN_RATINGS_FOR_AGGREGATE && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(average.toFixed(1)),
        reviewCount: ratings.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
};

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
  ...reviewData(),
});

/** schema.org Offer; monthly offers carry a per-month unit price. */
const offer = ({ name, price, currency, perMonth }) => ({
  '@type': 'Offer',
  name,
  price: String(price),
  priceCurrency: currency,
  ...(perMonth && {
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(price),
      priceCurrency: currency,
      unitCode: 'MON',
    },
  }),
});

const service = (meta, schema) => ({
  '@type': 'Service',
  name: schema.name,
  serviceType: schema.serviceType,
  description: schema.description,
  url: meta.canonical,
  provider: { '@id': ORGANIZATION_ID },
  areaServed: 'Worldwide',
  ...(schema.offers && { offers: schema.offers.map(offer) }),
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
