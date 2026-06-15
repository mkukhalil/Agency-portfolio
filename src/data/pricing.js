export const pricingPlans = [
  {
    id: 1,
    label: 'Starter Website',
    price: '$300',
    period: 'starting from',
    description:
      'For landing pages, portfolios, business websites, and service websites that need a clean, professional online presence.',
    features: [
      'Responsive landing page or business website',
      'Modern UI with clean sections and strong CTA',
      'Contact form and basic lead capture setup',
      'Basic SEO structure and performance cleanup',
      'Deployment support',
    ],
  },
  {
    id: 2,
    label: 'Full-Stack App',
    price: '$900',
    period: 'starting from',
    highlighted: true,
    description:
      'For dashboards, platforms, authentication systems, APIs, databases, and complete web applications.',
    features: [
      'React frontend and Laravel backend',
      'Database structure and REST API development',
      'Authentication and protected routes',
      'Dashboard or admin panel interface',
      'Deployment and production-ready handoff',
    ],
  },
  {
    id: 3,
    label: 'Business System',
    price: '$1500',
    period: 'starting from',
    description:
      'For custom CRM, POS, inventory, billing, reporting, sales, and internal business workflow systems.',
    features: [
      'Custom CRM, POS, or internal business tool',
      'Sales, inventory, billing, or customer modules',
      'Admin dashboard and role-based workflows',
      'Reports, filters, records, and business logic',
      'Built around your exact business process',
    ],
  },
];
