import { faqs } from './faq';
import { seoAeoPricing } from './pricing';

const sharedFaqIds = [11, 12, 13];

export const seoAeo = {
  hero: {
    eyebrow: 'Service · SEO & AEO',
    title: 'SEO & Answer Engine Optimization',
    intro:
      'We make websites easy for search engines and AI assistants to crawl, understand, and cite, so the right people find you on Google, ChatGPT, Perplexity, and Google AI Overviews.',
  },

  problem: {
    title: 'Great sites still go unseen.',
    subtitle:
      'Search is no longer just ten blue links. More people get answers straight from AI assistants, and those tools can only recommend what they can read and trust.',
    items: [
      {
        title: 'Invisible to crawlers',
        description:
          'Many modern sites render content with JavaScript only. AI crawlers often do not run JavaScript, so they see an empty page.',
      },
      {
        title: 'Unclear meaning',
        description:
          'Without structured data and clear headings, search engines have to guess what you offer, who you serve, and where you work.',
      },
      {
        title: 'No direct answers',
        description:
          'Answer engines quote content that responds to real questions plainly. Vague marketing copy rarely gets cited.',
      },
    ],
  },

  services: {
    title: 'What we do.',
    subtitle: 'Hands-on technical and content work, implemented in your codebase or CMS.',
    items: [
      {
        title: 'Technical SEO',
        description:
          'Crawlability, prerendering, Core Web Vitals, canonical URLs, redirects, sitemaps, robots rules, and indexation fixes.',
      },
      {
        title: 'On-page SEO',
        description:
          'Page titles, meta descriptions, heading structure, internal linking, image alt text, and copy aligned to search intent.',
      },
      {
        title: 'Schema & structured data',
        description:
          'Valid JSON-LD for your organization, services, FAQs, articles, products, and breadcrumbs, so search engines understand each page.',
      },
      {
        title: 'Answer Engine Optimization',
        description:
          'Content and markup shaped for ChatGPT, Perplexity, and Google AI Overviews: direct answers, entity clarity, llms.txt, and crawler access.',
      },
    ],
  },

  process: {
    title: 'How it works.',
    items: [
      {
        title: 'Audit',
        description:
          'We review rendering, crawl access, metadata, structured data, speed, and content against the questions your customers ask.',
      },
      {
        title: 'Prioritize',
        description:
          'You get a clear, ranked list of fixes, ordered by impact and effort, with no jargon-heavy report padding.',
      },
      {
        title: 'Implement',
        description:
          'We ship the fixes directly: code, templates, schema, and content updates, tested before release.',
      },
      {
        title: 'Monitor',
        description:
          'We check indexation and Search Console data after launch and adjust as search engines and AI tools pick up the changes.',
      },
    ],
  },

  deliverables: {
    title: 'What you receive.',
    items: [
      {
        title: 'Technical audit',
        description: 'A written audit of crawl, render, speed, and indexation issues with prioritized fixes.',
      },
      {
        title: 'Implemented fixes',
        description: 'Changes made in your site, not just recommended: metadata, prerendering, redirects, and more.',
      },
      {
        title: 'Validated schema',
        description: 'JSON-LD markup for each key page type, tested against Google’s structured data requirements.',
      },
      {
        title: 'AI crawler readiness',
        description: 'robots.txt rules, a sitemap, and an llms.txt file so AI assistants can find and summarize your site.',
      },
    ],
  },

  pricing: {
    title: 'Pricing.',
    subtitle: 'Start with a one-time foundation, then keep improving with an ongoing plan.',
    items: [
      {
        title: `Foundation · $${seoAeoPricing.foundation} one-time`,
        description:
          'Technical audit and fixes, structured data, on-page optimization for up to 10 pages, Search Console and Google Business Profile setup, AI crawler access, and a before/after AI visibility report. Delivered in 2–3 weeks.',
      },
      {
        title: `Ongoing · from $${seoAeoPricing.monthly}/month`,
        description:
          'Every month: 2 SEO-optimized pages or articles, schema and on-page updates for new content, technical health check and fixes, and a report on Google rankings, traffic and AI citations (ChatGPT, Perplexity, AI Overviews). Cancel anytime.',
      },
    ],
  },

  faqs: [
    ...faqs.filter((faq) => sharedFaqIds.includes(faq.id)),
    {
      id: 101,
      question: 'How long until SEO and AEO changes show results?',
      answer:
        'Technical fixes are usually picked up within days to weeks, depending on how often search engines and AI crawlers revisit your site. Ranking and citation changes take longer and depend on competition and content, so we do not promise specific positions or timelines.',
    },
    {
      id: 102,
      question: 'Do you guarantee rankings or AI citations?',
      answer:
        'No. Nobody can honestly guarantee rankings or citations, because search engines and AI assistants control their own results. We guarantee the work: a site that is technically sound, clearly structured, and easy for those systems to read.',
    },
  ],

  schema: {
    offers: [
      { name: 'SEO & AEO Foundation', price: seoAeoPricing.foundation, currency: seoAeoPricing.currency },
      {
        name: 'Ongoing SEO & AEO',
        price: seoAeoPricing.monthly,
        currency: seoAeoPricing.currency,
        perMonth: true,
      },
    ],
    name: 'SEO & AEO Services',
    serviceType: 'Search Engine Optimization and Answer Engine Optimization',
    description:
      'Technical SEO, on-page SEO, schema and structured data, and Answer Engine Optimization for ChatGPT, Perplexity, and Google AI Overviews.',
  },

  cta: {
    title: 'Ready to be found and cited?',
    text: 'Tell us about your site and goals. We will reply with a short assessment and next steps.',
  },
};
