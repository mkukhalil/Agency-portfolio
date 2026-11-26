/** SEO & AEO prices, shared by the pricing card, FAQ, service page, and JSON-LD. */
export const seoAeoPricing = {
  currency: 'USD',
  foundation: 699,
  monthly: 599,
};

export const pricingPlans = [
  {
    id: 'starter-website',
    label: 'Starter Website',
    price: '$399',
    period: 'starting from',
    description:
      'For service businesses, portfolios, agencies, and startups that need a clean, responsive website that builds trust and captures leads.',
    features: [
      'Responsive landing page or business website',
      'Modern UI with clean sections and strong CTA',
      'Contact form and basic lead capture setup',
      'Mobile, tablet, and desktop optimization',
      'SEO-ready foundation (meta tags, sitemap, schema)',
      'Deployment support and launch handoff',
    ],
    cta: 'Discuss this project',
    highlighted: false,
  },
  {
    id: 'full-stack-app',
    label: 'Full-Stack Web App',
    price: '$1,199',
    period: 'starting from',
    description:
      'For businesses that need more than a website: dashboards, portals, authentication, APIs, databases, and complete web app workflows.',
    features: [
      'React frontend and Laravel backend',
      'Database structure and REST API development',
      'Authentication and protected routes',
      'Dashboard or admin panel interface',
      'Forms, records, filters, and core workflows',
      'Deployment and production-ready handoff',
    ],
    cta: 'Start your web app',
    highlighted: true,
  },
  {
    id: 'business-system',
    label: 'Business System',
    price: '$2,499',
    period: 'starting from',
    description:
      'For businesses that want to replace manual work with a custom CRM, POS, inventory, billing, reporting, or internal workflow system.',
    features: [
      'Custom CRM, POS, or internal business tool',
      'Sales, inventory, billing, or customer modules',
      'Admin dashboard and role-based workflows',
      'Reports, filters, records, and business logic',
      'Workflow planning and phased development',
      'Built around your exact business process',
    ],
    cta: 'Plan this system',
    highlighted: false,
  },
  {
    id: 'seo-aeo-foundation',
    label: 'SEO & AEO Foundation',
    price: `$${seoAeoPricing.foundation}`,
    period: 'one-time',
    description:
      `Get found on Google and cited by AI search. Ongoing SEO & AEO from $${seoAeoPricing.monthly}/month.`,
    features: [
      'Technical SEO audit and fixes',
      'Schema / structured data',
      'On-page optimization (up to 10 pages)',
      'Search Console, sitemap & Google Business Profile setup',
      'AI crawler access & llms.txt',
      'Before/after AI visibility report',
      'Delivered in 2–3 weeks',
    ],
    cta: 'Get your SEO audit',
    highlighted: false,
  },
];
