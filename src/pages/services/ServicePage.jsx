import { ArrowRight } from 'lucide-react';
import PageHero from '../../components/layout/PageHero/PageHero';
import DetailSection from '../../components/sections/DetailSection/DetailSection';
import PageCta from '../../components/sections/PageCta/PageCta';
import FAQ from '../../components/sections/FAQ/FAQ';
import Projects from '../../components/sections/Projects/Projects';
import PlanSection from '../../components/sections/Pricing/PlanSection';
import { Button } from '../../components/ui/Button';
import { openContactModal } from '../../utils/contact';

/**
 * Shared template for every /services/* page. Content lives in src/data;
 * optional sections (design) render only when the page defines them.
 */
const ServicePage = ({ content }) => {
  const { hero, problem, services, design, process, deliverables, work, pricing, faqs, faqTitle, cta } =
    content;

  return (
    <main>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} intro={hero.intro}>
        <div className="page-hero-actions">
          <Button as="a" href="#contact" onClick={openContactModal}>
            {hero.ctaLabel}
            <ArrowRight size={18} aria-hidden />
          </Button>
        </div>
      </PageHero>

      <DetailSection id="problem" {...problem} />
      <DetailSection id="what-we-do" {...services} />
      {design && <DetailSection id="design" {...design} />}
      <DetailSection id="process" {...process} numbered />
      <DetailSection id="deliverables" {...deliverables} />
      <Projects id="work" title={work.title} subtitle={work.subtitle} service={work.service} />
      {pricing.planId ? <PlanSection {...pricing} /> : <DetailSection id="pricing" {...pricing} />}
      <FAQ items={faqs} title={faqTitle} />
      <PageCta {...cta} />
    </main>
  );
};

export default ServicePage;
