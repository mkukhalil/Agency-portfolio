/**
 * Case studies rendered at /work/:slug and listed in the sitemap.
 * Only add real, approved projects. Never invent clients, quotes, or metrics.
 */
export const caseStudies = [];

export const getCaseStudy = (slug) => caseStudies.find((study) => study.slug === slug);
