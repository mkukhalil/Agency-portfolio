import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FADE_UP, FADE_IN, VIEWPORT_CONFIG } from '../../../lib/animations';
import { pricingPlans } from '../../../data/pricing';
import './Pricing.css';

const Pricing = () => {
  return (
    <section id="pricing" className="section pricing-section-khalil">
      <div className="pricing-inner">
        <SectionHeading
          className="pricing-header"
          title="Choose what fits your project. From websites to business systems."
        />

        <div className="pricing-grid-khalil">
          <div className="pricing-plans-grid">
            {pricingPlans.map((plan, index) => (
              <Card
                as={motion.article}
                key={plan.id}
                className={`pricing-card pricing-tier ${plan.highlighted ? 'highlighted' : ''}`}
                variants={FADE_UP}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={{ delay: index * 0.08, y: 24 }}
              >
                <div className="pricing-card-top pricing-card-top-compact">
                  <p className="plan-tier-label">{plan.label}</p>

                  <div className="plan-price">
                    <span className="plan-price-amount">{plan.price}</span>
                    <span className="plan-price-period">{plan.period}</span>
                  </div>

                  <p className="plan-desc">{plan.description}</p>
                </div>

                <div className="pricing-card-features">
                  <p className="pricing-includes-label">What’s included:</p>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check className="pricing-feature-icon" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  as="a"
                  href="#contact"
                  className={`full-width ${plan.highlighted ? 'pricing-highlighted-btn' : ''}`}
                >
                  Discuss this project
                </Button>
              </Card>
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
                Start with a discovery sprint from <strong>$100–$200</strong>. I’ll help
                you define features, screens, database structure, API flow, timeline,
                and a realistic project estimate.
              </p>
            </Card>

            <Card className="pricing-note pricing-note-large">
              <h4 className="pricing-note-title">Final price depends on scope</h4>
              <p>
                Pricing changes based on features, timeline, integrations, number of
                screens, backend complexity, and deployment requirements.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
