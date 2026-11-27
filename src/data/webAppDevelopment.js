/** /services/web-app-development. Facts only: everything here is stated elsewhere on the site. */
export const webAppDevelopment = {
  hero: {
    eyebrow: 'Service · Full-Stack Web Apps',
    title: 'Full-Stack Web App Development',
    intro:
      'Dashboards, portals, and platforms built end to end: a React frontend, a Laravel backend, REST APIs, authentication, and a structured database, designed and delivered by one small team.',
    ctaLabel: 'Plan your web app',
  },

  problem: {
    title: 'When a website is not enough.',
    subtitle:
      'Some ideas need logins, records, and workflows, not just pages. Building them across several freelancers or agency layers slows decisions and leaves gaps between frontend and backend.',
    items: [
      {
        title: 'Disconnected parts',
        description:
          'The interface, API, and database are built by different people, so changes in one break another.',
      },
      {
        title: 'No clear scope',
        description:
          'Features grow without a plan for screens, data structure, or API flow, and the timeline slips.',
      },
      {
        title: 'Hard to grow',
        description:
          'Inconsistent screens and one-off code make every new feature slower to add than the last.',
      },
    ],
  },

  services: {
    title: 'What we do.',
    subtitle: 'Frontend, backend, and database handled together, so every part fits.',
    items: [
      {
        title: 'React frontend',
        description:
          'Responsive interfaces built with React and Tailwind CSS: dashboards, admin panels, forms, records, and filters.',
      },
      {
        title: 'Laravel backend & APIs',
        description:
          'Business logic and REST API development in Laravel and PHP, structured so the frontend and future integrations can rely on it.',
      },
      {
        title: 'Databases & auth',
        description:
          'MySQL or PostgreSQL database design, authentication, and protected routes so the right people see the right data.',
      },
      {
        title: 'Deployment',
        description:
          'Frontend, backend, and database deployed and checked for production, with a clean handoff.',
      },
    ],
  },

  design: {
    title: 'Interfaces & design systems.',
    subtitle:
      'Web apps are used every day, so the interface matters as much as the code behind it. We design the system, not just the screens.',
    items: [
      {
        title: 'Product flows',
        description:
          'We map how each user moves through the app, from sign-in to their daily tasks, before designing screens.',
      },
      {
        title: 'Interface systems',
        description:
          'High-fidelity screens in Figma, shaped around clarity and daily use rather than decoration.',
      },
      {
        title: 'Design systems',
        description:
          'Reusable components, layout rules, and interaction patterns that keep the product consistent as it grows.',
      },
    ],
  },

  process: {
    title: 'How it works.',
    items: [
      {
        title: 'Discovery',
        description:
          'We define features, screens, database structure, API flow, and timeline, then agree a realistic estimate.',
      },
      {
        title: 'Design',
        description:
          'We design the key flows and screens and confirm them with you before development starts.',
      },
      {
        title: 'Milestones',
        description:
          'The app is built in milestones. You review each one, and feedback is organized so decisions are documented.',
      },
      {
        title: 'Launch',
        description:
          'We deploy to production, run final checks, and hand over the app ready for real users.',
      },
    ],
  },

  deliverables: {
    title: 'What you receive.',
    items: [
      {
        title: 'Working application',
        description: 'A React frontend and Laravel backend with your core workflows: forms, records, and filters.',
      },
      {
        title: 'Database & API',
        description: 'A structured database and REST API built around your data and future integrations.',
      },
      {
        title: 'Secure access',
        description: 'Authentication and protected routes, with a dashboard or admin panel to manage the app.',
      },
      {
        title: 'Production handoff',
        description: 'Deployment and a production-ready handoff, so you can run and extend the app.',
      },
    ],
  },

  work: {
    service: 'web-app-development',
    title: 'Recent web apps.',
    subtitle: 'Full-stack platforms and dashboards we have designed and built.',
  },

  pricing: {
    title: 'Pricing.',
    subtitle: 'A clear starting point. The final price depends on features, integrations, and timeline.',
    planId: 'full-stack-app',
    note: 'Every app can be delivered in phases: launch the most important version first and improve from there. A discovery sprint from $100–$200 defines scope before development starts.',
  },

  faqTitle: 'Web app development questions',

  faqs: [
    {
      id: 301,
      question: 'What technologies do you build web apps with?',
      answer:
        'Our main stack is React and Vite on the frontend, Laravel and PHP on the backend, and MySQL or PostgreSQL for the database, with Tailwind CSS for styling. We deploy to platforms like Vercel and Cloudflare Pages.',
    },
    {
      id: 302,
      question: 'How long does a full-stack web app take?',
      answer:
        'It depends on features, screens, and integrations. A full-stack app takes longer than a website and is broken into milestones once the scope is clear, so you see progress at each stage.',
    },
    {
      id: 303,
      question: 'Can you continue an app someone else started?',
      answer:
        'Yes. We can review an existing codebase, fix UI issues, add features, connect APIs, clean up backend logic, or continue development from its current stage.',
    },
    {
      id: 304,
      question: 'Do you design the interface too?',
      answer:
        'Yes. We plan the product flows and design the screens before building, and we can create a design system of reusable components so the app stays consistent as it grows.',
    },
  ],

  cta: {
    title: 'Have an app in mind?',
    text: 'Tell us what it needs to do and who will use it. We will help you shape the scope, timeline, and a realistic estimate.',
  },

  schema: {
    name: 'Full-Stack Web App Development',
    serviceType: 'Web application development',
    description:
      'Dashboards, portals, and platforms with a React frontend, Laravel backend, REST APIs, authentication, and a structured database.',
    planId: 'full-stack-app',
  },
};
