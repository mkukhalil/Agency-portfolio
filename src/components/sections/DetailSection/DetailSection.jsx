import { motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { Card } from '../../ui/Card';
import { SectionHeading } from '../../ui/SectionHeading';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './DetailSection.css';

/**
 * Titled grid of short content cards. `numbered` prefixes each card with its
 * step index, which turns the same layout into a process timeline.
 */
const DetailSection = ({ id, title, subtitle, items, numbered = false }) => (
  <Container as="section" id={id} className="section-tight detail-section">
    <SectionHeading className="detail-heading" title={title} subtitle={subtitle} custom={{ y: 18 }} />

    <div className="detail-grid">
      {items.map((item, index) => (
        <Card
          as={motion.article}
          key={item.title}
          className="surface-card detail-card"
          variants={FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={{ delay: index * 0.08, y: 18 }}
        >
          {numbered && <span className="detail-step">{String(index + 1).padStart(2, '0')}</span>}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </Card>
      ))}
    </div>
  </Container>
);

export default DetailSection;
