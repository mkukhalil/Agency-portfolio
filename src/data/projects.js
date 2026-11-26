import fluixAutomationImage from '../assets/projects/fluix-automation.webp';
import visaBridgeThumbnail from '../assets/projects/visabridge-thumbnail.webp';
import crmThumbnail from '../assets/projects/crm-thumbnail.webp';
import posThumbnail from '../assets/projects/pos-thumbnail.webp';
import brandScalingThumbnail from '../assets/projects/brand-scaling.webp';
import islamabadFurnitureThumbnail from '../assets/projects/islamabad-best-furniture.webp';
import rboAccountingThumbnail from '../assets/projects/rbo-accounting.webp';
import qualifiedLeadsXThumbnail from '../assets/projects/qualifiedleadsx.webp';
import sevenFigureStudioThumbnail from '../assets/projects/seven-figure-studio.webp';

/** Filter options for the work grid; `id` matches each project's `category`. */
export const projectCategories = [
  { id: 'all', label: 'All' },
  { id: 'development', label: 'Development' },
  { id: 'seo', label: 'SEO & AEO' },
];

export const projects = [
  {
    id: 1,
    category: 'development',
    title: 'VisaBridge',
    tags: 'Immigration Platform · Full Stack Website',
    description:
      'A full-stack platform that helps users compare country options, understand visa pathway signals, and make smarter study, work, or immigration decisions before spending money.',
    labels: ['Full Stack', 'Landing Page', 'User Assessment'],
    link: 'https://visabridge.com/',
    cta: 'Visit Website',
    accent: 'yellow',
    image: visaBridgeThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 2,
    category: 'development',
    title: 'Fluix Automation',
    tags: 'AI Automation · Full Stack Website',
    description:
      'A full-stack business website built for Fluix Automation to showcase AI automation services and drive demo bookings.',
    labels: ['Full Stack', 'Business Website', 'Lead Generation'],
    link: 'https://fluix-site.vercel.app/',
    cta: 'Visit Website',
    accent: 'orange',
    image: fluixAutomationImage,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 3,
    category: 'development',
    title: 'Sohail Traders POS',
    tags: 'POS System · Full Stack Business App',
    description:
      'A point-of-sale system built for Sohail Traders to manage products, sales, billing, and day-to-day business operations through a structured and easy-to-use interface.',
    labels: ['Client Project', 'POS System', 'Business Tool'],
    link: 'https://www.awesomescreenshot.com/video/49162174?key=1f5fe03fef191f9cc9dac0857c20b49e',
    cta: 'Check Demo of POS',
    accent: 'pink',
    image: posThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 4,
    category: 'development',
    title: 'Custom CRM System',
    tags: 'CRM · Dashboard · Full Stack App',
    description:
      'A self-built CRM system designed to manage leads, customers, tasks, and business workflows through a clean dashboard interface and structured backend logic.',
    labels: ['Full Stack', 'CRM Dashboard', 'Business Tool'],
    link: 'https://www.awesomescreenshot.com/video/49031420?key=d1d07fe5d9c20877930880d952d969ea',
    cta: 'Check Demo of CRM',
    accent: 'red',
    image: crmThumbnail,
    imageWidth: 1401,
    imageHeight: 1024,
  },
  {
    id: 5,
    category: 'seo',
    title: 'Brand Scaling',
    tags: 'DTC Ecommerce Agency · Technical SEO & AEO',
    description:
      'End-to-end technical SEO and Answer Engine Optimization for a New York DTC ecommerce agency — turning a React single-page app into a 252-page prerendered search asset with JSON-LD entity architecture and digital PR.',
    labels: ['Technical SEO', 'AEO / GEO', 'Schema'],
    link: 'https://www.brandscalinghacks.com',
    cta: 'Visit Website',
    accent: 'yellow',
    image: brandScalingThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 6,
    category: 'seo',
    title: 'Islamabad Best Furniture',
    tags: 'Furniture Retail · Full-Stack SEO & AEO',
    description:
      'Technical SEO, AEO optimization, automated structured data and a hyper-local guides blog, built on Next.js, TypeScript, Prisma and PostgreSQL.',
    labels: ['Full Stack', 'AEO / GEO', 'Local SEO'],
    link: 'https://islamabadbestfurniture.com',
    cta: 'Visit Website',
    accent: 'orange',
    image: islamabadFurnitureThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 7,
    category: 'seo',
    title: 'RBO Accounting & Audit',
    tags: 'Accounting Firm, UAE · Technical SEO',
    description:
      'Business website for an FTA-registered accounting, audit and tax consultancy in Ajman Free Zone, with SEO-structured pages and metadata optimization.',
    labels: ['Technical SEO', 'On-Page SEO', 'Business Website'],
    link: 'https://www.rboaccounting.ae/',
    cta: 'Visit Website',
    accent: 'pink',
    image: rboAccountingThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 8,
    category: 'seo',
    title: 'QualifiedLeadsX',
    tags: 'Lead Generation Agency · SEO & Web Development',
    description:
      'Agency website for a done-for-you lead generation and appointment-setting agency, built with a clear conversion hierarchy and structured SEO metadata.',
    labels: ['On-Page SEO', 'Technical SEO', 'Lead Generation'],
    link: 'https://www.qualifiedleadsx.com',
    cta: 'Visit Website',
    accent: 'red',
    image: qualifiedLeadsXThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
  {
    id: 9,
    category: 'seo',
    title: 'Seven Figure Studio',
    tags: 'UGC Content Agency · SEO & Performance',
    description:
      'Website for a UGC agency producing video ads, AI UGC and VSLs, built for fast load times and a clean on-page SEO structure.',
    labels: ['On-Page SEO', 'Performance', 'Agency Website'],
    link: 'https://sevenfigurestudio.us',
    cta: 'Visit Website',
    accent: 'yellow',
    image: sevenFigureStudioThumbnail,
    imageWidth: 1254,
    imageHeight: 1254,
  },
];
