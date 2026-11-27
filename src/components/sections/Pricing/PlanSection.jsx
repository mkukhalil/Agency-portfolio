import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import PricingCard from './PricingCard';
import { getPricingPlan } from '../../../data/pricing';
import '../DetailSection/DetailSection.css';
import './Pricing.css';

/** A service page's pricing: the matching plan card from pricing.js, plus a short note. */
const PlanSection = ({ id = 'pricing', title, subtitle, planId, note }) => {
  const plan = getPricingPlan(planId);

  if (!plan) return null;

  return (
    <Container as="section" id={id} className="section-tight plan-section">
      <SectionHeading className="detail-heading" title={title} subtitle={subtitle} custom={{ y: 18 }} />

      <div className="plan-section-body">
        <div className="plan-section-card">
          <PricingCard plan={plan} />
        </div>

        {note && <p className="plan-section-note">{note}</p>}
      </div>
    </Container>
  );
};

export default PlanSection;
