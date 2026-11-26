import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { FADE_UP } from '../../../lib/animations';
import '../../../pages/legal/Legal.css';
import './PageHero.css';

/**
 * Inner-page hero. Shares the legal pages' atmosphere (glow, scale, rhythm)
 * so every secondary page reads as part of the same system.
 */
const PageHero = ({ eyebrow, title, intro, backTo = '/', backLabel = 'Back to home', children }) => (
  <header className="legal-page page-hero">
    <div className="legal-shell">
      <motion.div
        className="legal-hero"
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        custom={{ y: 18 }}
      >
        <Link className="legal-back" to={backTo}>
          ← {backLabel}
        </Link>

        {eyebrow && <p className="page-hero-eyebrow">{eyebrow}</p>}
        <h1 className="legal-title">{title}</h1>
        {intro && <p className="legal-intro">{intro}</p>}
        {children}
      </motion.div>
    </div>
  </header>
);

export default PageHero;
