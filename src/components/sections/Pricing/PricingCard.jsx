import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';

/** One plan from pricing.js. Used by the home pricing grid and service pages. */
const PricingCard = ({ plan, index = 0 }) => (
  <Card
    as={motion.article}
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
      {plan.cta}
    </Button>
  </Card>
);

export default PricingCard;
