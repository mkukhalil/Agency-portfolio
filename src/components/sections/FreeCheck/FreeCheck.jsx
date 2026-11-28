import { ArrowRight } from 'lucide-react';
import DetailSection from '../DetailSection/DetailSection';
import { Button } from '../../ui/Button';
import { openContactModal } from '../../../utils/contact';

/** Lead-magnet offer: detail cards plus a CTA that opens the contact modal prefilled. */
const FreeCheck = ({ title, subtitle, items, ctaLabel, preset }) => (
  <DetailSection id="free-ai-visibility-check" title={title} subtitle={subtitle} items={items}>
    <div className="detail-action">
      <Button as="a" href="#contact" onClick={(event) => openContactModal(event, preset)}>
        {ctaLabel}
        <ArrowRight size={18} aria-hidden />
      </Button>
    </div>
  </DetailSection>
);

export default FreeCheck;
