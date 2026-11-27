import { motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { FADE_UP } from '../../../lib/animations';
import './ToolsTicker.css';

import { tools } from '../../../data/tools';

const REVEAL = {
  variants: FADE_UP,
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
};

/**
 * One h2 ("Our tools & your product.") split around the decorative icon row,
 * so the heading outline stays clean while the layout keeps its two lines.
 */
const ToolsTicker = () => (
  <section id="tools" className="tools-brand-section" aria-labelledby="tools-heading">
    <Container className="tools-brand-inner">
      <h2 id="tools-heading" className="tools-heading-area">
        <motion.span
          className="tools-brand-heading tools-brand-heading-top"
          {...REVEAL}
          custom={{ y: 18 }}
        >
          Our tools &amp;
        </motion.span>{' '}
        <motion.span
          className="tools-icons-row"
          aria-hidden="true"
          {...REVEAL}
          custom={{ delay: 0.08, y: 16 }}
        >
          {tools.map((tool) => (
            <span key={tool.slug} className="tools-marquee-item" title={tool.label}>
              <span className="tools-marquee-icon-wrap">
                <img
                  className="tools-marquee-icon"
                  src={tool.icon}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </span>
          ))}
        </motion.span>{' '}
        <motion.span
          className="tools-brand-heading tools-brand-heading-bottom"
          {...REVEAL}
          custom={{ delay: 0.14, y: 18 }}
        >
          your product.
        </motion.span>
      </h2>

      {/* Empty by design: its top margin sets the section's closing space. */}
      <div className="tools-copy-block" aria-hidden="true" />
    </Container>
  </section>
);

export default ToolsTicker;
