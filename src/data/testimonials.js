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
    id: 1,
    quote:
      'We needed the website to explain our automation services in a simple way. The final result felt clean, organized, and much easier to present to potential clients.',
    // TODO: real name and role of the person at Fluix Automation who gave this quote.
    name: null,
    role: null,
    company: 'Fluix Automation',
    projectId: 2,
    published: false,
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
  {
    id: 3,
    quote:
      'The dashboard was structured in a practical way. It made the data easier to manage and gave the project a cleaner direction compared to where it started.',
    // TODO: verify the source. projects.js describes the CRM as self-built, so this
    // may not be a client quote. Do not publish unless a real client said it.
    name: null,
    role: null,
    company: null,
    projectId: 4,
    published: false,
  },
  {
    id: 4,
    quote:
      'The POS system made daily billing and product management easier for our shop. It was built around the way we actually work, not just as a generic system.',
    // TODO: real name of the Sohail Traders owner who gave this quote.
    name: null,
    role: 'Business owner',
    company: 'Sohail Traders',
    projectId: 3,
    published: false,
  },
];

export const publishedTestimonials = testimonials.filter((testimonial) => testimonial.published);
