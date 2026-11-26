/**
 * Case studies rendered at /work/:slug and listed in the sitemap.
 * Only add real, approved projects. Never invent clients, quotes, or metrics.
 *
 * Drafts render only in development (`npm run dev`). The DEV check is
 * statically replaced at build time, so drafts are stripped from production:
 * never prerendered, indexed, bundled, or reachable on the live site.
 */
const published = [];

const placeholderDraft = {
  // TODO-PLACEHOLDER: replace every field with a real, approved project,
  // then move it into `published`. Do not publish this entry as-is.
  slug: 'todo-placeholder',
  title: 'TODO-PLACEHOLDER Project',
  industry: 'TODO-PLACEHOLDER industry',
  summary: 'TODO-PLACEHOLDER: one or two sentences on what was built and for whom.',
  services: ['TODO-PLACEHOLDER service'],
  sections: [
    {
      title: 'Challenge',
      description: 'TODO-PLACEHOLDER: the problem the client had before the project.',
    },
    {
      title: 'Approach',
      description: 'TODO-PLACEHOLDER: what we designed and built, and the key decisions.',
    },
    {
      title: 'Outcome',
      description:
        'TODO-PLACEHOLDER: the result. Only include metrics the client has confirmed and approved for publication.',
    },
  ],
};

const drafts = import.meta.env.DEV ? [placeholderDraft] : [];

export const caseStudies = [...published, ...drafts];

export const getCaseStudy = (slug) => caseStudies.find((study) => study.slug === slug);
