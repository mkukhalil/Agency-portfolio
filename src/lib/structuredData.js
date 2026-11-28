import { SITE } from '../data/seo';
import { SOCIAL_LINKS } from '../data/navigation';
import { publishedTestimonials } from '../data/testimonials';
import { getPricingPlan, PRICING_CURRENCY } from '../data/pricing';

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
  sameAs: SOCIAL_LINKS.map((link) => link.href),
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

/** A pricing.js plan as an Offer; its amount is a starting price. */
const planOffer = (plan) => ({
  '@type': 'Offer',
  name: plan.label,
  price: String(plan.amount),
  priceCurrency: PRICING_CURRENCY,
  priceSpecification: {
    '@type': 'PriceSpecification',
    minPrice: String(plan.amount),
    priceCurrency: PRICING_CURRENCY,
  },
});

const serviceOffers = (schema) => {
  if (schema.offers) return schema.offers.map(offer);
  const plan = schema.planId && getPricingPlan(schema.planId);
  return plan ? [planOffer(plan)] : undefined;
};

const service = (meta, schema) => ({
  '@type': 'Service',
  name: schema.name,
  serviceType: schema.serviceType,
  description: schema.description,
  url: meta.canonical,
  provider: { '@id': ORGANIZATION_ID },
  areaServed: 'Worldwide',
  ...(serviceOffers(schema) && { offers: serviceOffers(schema) }),
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

const breadcrumbList = (meta) => {
  const trail = [
    { name: 'Home', item: `${SITE.url}/` },
    ...(meta.parents ?? []).map((parent) => ({ name: parent.name, item: `${SITE.url}${parent.path}` })),
    { name: meta.breadcrumb, item: meta.canonical },
  ];

  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
  };
};

const article = (meta) => ({
  '@type': 'BlogPosting',
  headline: meta.article.headline,
  description: meta.description,
  datePublished: meta.article.datePublished,
  dateModified: meta.article.dateModified,
  url: meta.canonical,
  mainEntityOfPage: meta.canonical,
  image: meta.image,
  inLanguage: 'en',
  author: { '@id': ORGANIZATION_ID },
  publisher: { '@id': ORGANIZATION_ID },
});

/** JSON-LD graph for a resolved page: Organization always, the rest when relevant. */
export function getStructuredData(meta) {
  const graph = [organization()];

  if (meta.canonical) {
    if (meta.service) graph.push(service(meta, meta.service));
    if (meta.article) graph.push(article(meta));
    if (meta.faqs?.length) graph.push(faqPage(meta, meta.faqs));
    if (meta.breadcrumb) graph.push(breadcrumbList(meta));
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON safe to inline inside a <script> element. */
export const serializeJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
