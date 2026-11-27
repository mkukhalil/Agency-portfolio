import { motion } from 'framer-motion';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { FADE_IN } from '../../../lib/animations';
import { pricingPlans } from '../../../data/pricing';
import PricingCard from './PricingCard';
import './Pricing.css';

const Pricing = () => {
  return (
    <section id="pricing" className="section pricing-section-khalil">
      <div className="pricing-inner">
        <SectionHeading
          className="pricing-header"
          title="Simple pricing for serious digital products."
        />

        <div className="pricing-grid-khalil">
          <div className="pricing-plans-grid">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>

          <motion.div
            className="pricing-bottom-grid"
            variants={FADE_IN}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={{ delay: 0.2 }}
          >
            <Card className="pricing-note pricing-note-large">
              <h4 className="pricing-note-title">Need clarity first?</h4>
              <p>
                Start with a discovery sprint from <strong>$100–$200</strong>. We’ll help
                you define features, screens, database structure, API flow, timeline,
                and a realistic project estimate before development starts.
              </p>
            </Card>

            <Card className="pricing-note pricing-note-large">
              <h4 className="pricing-note-title">Start focused, grow in phases</h4>
              <p>
                Final pricing depends on scope, features, integrations, and timeline.
                Every project can be delivered in phases so you can launch the most
                important version first and improve from there.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
