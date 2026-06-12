import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { FADE_UP } from '../../../lib/animations';
import './ToolsTicker.css';

import { tools } from '../../../data/tools';


const ToolsTicker = () => {
  return (
    <section id="tools"
      className="tools-brand-section"
      aria-labelledby="tools-heading-top tools-heading-bottom"
    >
      <Container className="tools-brand-inner">
        <div className="tools-heading-area">
          <motion.h2
            id="tools-heading-top"
            className="tools-brand-heading tools-brand-heading-top"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            custom={{ y: 18 }}
          >
            Our  tools &
          </motion.h2>

          <motion.div
            className="tools-icons-row"
            aria-label="Tools I use"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            custom={{ delay: 0.08, y: 16 }}
          >
            {tools.map((tool) => (
              <div key={tool.slug} className="tools-marquee-item" title={tool.label}>
                <div className="tools-marquee-icon-wrap">
                  <img
                    className="tools-marquee-icon"
                    src={tool.icon}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            ))}
          </motion.div>

          <motion.h2
            id="tools-heading-bottom"
            className="tools-brand-heading tools-brand-heading-bottom"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            custom={{ delay: 0.14, y: 18 }}
          >
            your product.
          </motion.h2>
        </div>

        <motion.div
          className="tools-copy-block"
          variants={FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          custom={{ delay: 0.18, y: 16 }}
        >
        </motion.div>
      </Container>
    </section>
  );
};

export default ToolsTicker;