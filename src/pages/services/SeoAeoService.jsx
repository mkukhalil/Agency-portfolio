import { ArrowRight } from 'lucide-react';
import PageHero from '../../components/layout/PageHero/PageHero';
import DetailSection from '../../components/sections/DetailSection/DetailSection';
import PageCta from '../../components/sections/PageCta/PageCta';
import FAQ from '../../components/sections/FAQ/FAQ';
import { Button } from '../../components/ui/Button';
import { openContactModal } from '../../utils/contact';
import { seoAeo } from '../../data/seoAeo';

const SeoAeoService = () => (
  <main>
    <PageHero {...seoAeo.hero}>
      <div className="page-hero-actions">
        <Button as="a" href="#contact" onClick={openContactModal}>
          Request an audit
          <ArrowRight size={18} aria-hidden />
        </Button>
      </div>
    </PageHero>

    <DetailSection id="problem" {...seoAeo.problem} />
    <DetailSection id="what-we-do" {...seoAeo.services} />
    <DetailSection id="process" {...seoAeo.process} numbered />
    <DetailSection id="deliverables" {...seoAeo.deliverables} />
    <DetailSection id="pricing" {...seoAeo.pricing} />
    <FAQ items={seoAeo.faqs} title="SEO & AEO questions" />
    <PageCta {...seoAeo.cta} />
  </main>
);

export default SeoAeoService;
