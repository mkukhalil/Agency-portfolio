import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './Trust.css';

import { testimonials } from '../../../data/testimonials';

const Trust = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!testimonials.length) return undefined;

    const intervalId = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const activeTestimonial = testimonials[activeIndex];

  if (!activeTestimonial) return null;

  return (
    <Container as="section" id="trust" className="section trust-section container">
      <div className="trust-layout">
        <SectionHeading
          className="trust-header"
          title={
            <>
              A team  you can trust.{' '}
              <span>Real projects. Reliable delivery.</span>
            </>
          }
        />

        <div className="trust-cards" role="list">
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
              <div className="stat-label">
                Trusted with real business projects.
              </div>
              <p>Websites, CRM tools, POS systems, and full-stack platforms.</p>
            </div>
          </Card>

          <Card
            as={motion.figure}
            className="testimonial-card"
            role="listitem"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={{ delay: 0.14, y: 18 }}
          >
            <div className="testimonial-dots" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                className="testimonial-slide"
                initial={{ opacity: 0, x: 36, filter: 'blur(5px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -36, filter: 'blur(5px)' }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <blockquote className="testimonial-quote">
                  {activeTestimonial.quote}
                </blockquote>

                <figcaption className="testimonial-author">
                  <span className="testimonial-avatar" aria-hidden>
                    K
                  </span>

                  <span className="testimonial-author-text">
                    <span className="testimonial-name">
                      {activeTestimonial.name}
                    </span>
                    <span className="testimonial-role">
                      {activeTestimonial.role}
                    </span>
                  </span>

                  <span className="testimonial-logo">Khalil</span>
                </figcaption>
              </motion.div>
            </AnimatePresence>

            <div className="testimonial-nav" aria-label="Testimonial slides">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  className={`testimonial-dot ${index === activeIndex ? 'active' : ''}`}
                  aria-label={`Show testimonial ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Trust;