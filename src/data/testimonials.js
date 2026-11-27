/**
 * Client testimonials. Only entries with `published: true` render on the site
 * or appear in Review JSON-LD.
 *
 * Publish an entry only when it is a real quote from a real, named person who
 * agreed to be quoted. Never invent names, roles, or quotes.
 *
 * Shape: { id, quote, name, role, company, projectId, avatar?, rating?, published }
 * - projectId links to an entry in projects.js (optional)
 * - avatar is an imported image URL (optional; initials are used otherwise)
 * - rating is the client's own 1–5 score (optional). Only real ratings: they feed
 *   AggregateRating, which is emitted once two or more published entries have one.
 */
export const testimonials = [
  {
    id: 5,
    quote:
      'The Nukt team was very professional with their work. They did technical SEO and AEO for my website, and it really increased my interaction and impressions.',
    name: 'Gaurav Kapoor',
    role: 'Founder',
    company: 'Brand Scaling',
    projectId: 5,
    published: true,
  },
  {
    id: 6,
    quote:
      "We're very impressed with the Nukt team's work. Our website was invisible to people on Google, and they helped us get found. They're still handling our SEO and AEO.",
    name: 'Abdullah',
    role: 'Operations Manager',
    company: 'Islamabad Best Furniture',
    projectId: 6,
    published: true,
  },
  {
    id: 1,
    quote:
      'We needed the website to explain our automation services in a simple way. The final result felt clean, organized, and much easier to present to potential clients.',
    name: 'Khalil',
    role: 'Founder',
    company: 'Fluix Automation',
    projectId: 2,
    published: true,
  },
  {
    id: 4,
    quote:
      'The POS system made daily billing and product management easier for our shop. It was built around the way we actually work, not just as a generic system.',
    name: 'Sohail Anwar',
    role: 'Owner',
    company: 'Sohail Traders',
    projectId: 3,
    published: true,
  },
  {
    id: 2,
    quote:
      'The work was handled with patience and clear communication. Small details were adjusted properly, and the site started to look more trustworthy and professional.',
    // TODO: real name, role, and company. Previously labelled "Visa consultancy website".
    name: null,
    role: null,
    company: null,
    projectId: 1,
    published: false,
  },
];

export const publishedTestimonials = testimonials.filter((testimonial) => testimonial.published);
