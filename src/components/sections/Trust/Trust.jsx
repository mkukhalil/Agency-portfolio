import { motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import TestimonialCarousel from './TestimonialCarousel';
import { publishedTestimonials } from '../../../data/testimonials';
import './Trust.css';

const Trust = () => {
  const hasTestimonials = publishedTestimonials.length > 0;

  return (
    <Container as="section" id="trust" className="section trust-section">
      <div className="trust-layout">
        <SectionHeading
          className="trust-header"
          title={
            <>
              A team you can trust. <span>Real projects. Reliable delivery.</span>
            </>
          }
        />

        <div className={`trust-cards ${hasTestimonials ? '' : 'trust-cards-single'}`} role="list">
          <Card
            as={motion.div}
            className="trust-stats"
            role="listitem"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={{ delay: 0.08, y: 18 }}
          >
            <div className="quote-mark" aria-hidden>
              &rdquo;
            </div>

            <div className="trust-stat-content">
              <div className="stat-label">Trusted with real business projects.</div>
              <p>Websites, CRM tools, POS systems, and full-stack platforms.</p>
            </div>
          </Card>

          {hasTestimonials && <TestimonialCarousel testimonials={publishedTestimonials} />}
        </div>
      </div>
    </Container>
  );
};

export default Trust;
