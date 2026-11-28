import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import { openContactModal } from '../../../utils/contact';
import './PageCta.css';

/** Closing call-to-action that opens the shared contact modal, optionally prefilled. */
const PageCta = ({ title, text, label = 'Start a project', preset }) => (
  <Container as="section" className="section-tight">
    <motion.div
      className="surface-card page-cta"
      variants={FADE_UP}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      custom={{ y: 24 }}
    >
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      <Button as="a" href="#contact" onClick={(event) => openContactModal(event, preset)}>
        {label}
        <ArrowRight size={18} aria-hidden />
      </Button>
    </motion.div>
  </Container>
);

export default PageCta;
