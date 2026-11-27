import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';

const ROTATE_MS = 5000;

const SLIDE_MOTION = {
  initial: { opacity: 0, x: 36, filter: 'blur(5px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const byline = ({ role, company }) => [role, company].filter(Boolean).join(', ');

const Avatar = ({ testimonial }) =>
  testimonial.avatar ? (
    <img className="testimonial-avatar" src={testimonial.avatar} alt="" width={46} height={46} />
  ) : (
    <span className="testimonial-avatar" aria-hidden>
      {testimonial.name.charAt(0)}
    </span>
  );

/**
 * Rotating testimonial card. Every slide is in the markup (inactive ones are
 * hidden) so all published quotes ship in prerendered HTML.
 */
const TestimonialCarousel = ({ testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length < 2) return undefined;

    const intervalId = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, ROTATE_MS);

    return () => clearInterval(intervalId);
  }, [testimonials.length]);

  return (
    <Card
      as={motion.div}
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

      {testimonials.map((testimonial, index) => {
        const isActive = index === activeIndex;
        const Slide = isActive ? motion.figure : 'figure';

        return (
          <Slide
            key={testimonial.id}
            className="testimonial-slide"
            hidden={!isActive}
            {...(isActive && SLIDE_MOTION)}
          >
            <blockquote className="testimonial-quote">{testimonial.quote}</blockquote>

            <figcaption className="testimonial-author">
              <Avatar testimonial={testimonial} />

              <span className="testimonial-author-text">
                <span className="testimonial-name">{testimonial.name}</span>
                <span className="testimonial-role">{byline(testimonial)}</span>
              </span>

              <span className="testimonial-logo">nukt</span>
            </figcaption>
          </Slide>
        );
      })}

      {testimonials.length > 1 && (
        <div className="testimonial-nav" aria-label="Testimonial slides">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              className={`testimonial-dot ${index === activeIndex ? 'active' : ''}`}
              aria-label={`Show testimonial ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TestimonialCarousel;
