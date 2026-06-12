import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { SOCIAL_LINKS } from '../../../data/navigation';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="contact" className="footer section container">
      <Container>
        <p className="footer-location">Available worldwide</p>
        <motion.div
          className="footer-content"
          variants={FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={{ y: 30 }}
        >
          <h2 className="footer-title">
            Sharp interfaces and clean frontend for ambitious digital products.
          </h2>

          <div className="footer-links-container">
            <Button as="a" href="mailto:hello@khalil.studio" className="footer-cta-button">
              Get in touch
              <ArrowRight className="footer-cta-icon" aria-hidden />
            </Button>

            <div className="footer-columns">
              <div className="footer-col">
                <p className="footer-col-label">Explore</p>
                <a href="#hero" className="footer-link">Home</a>
                <a href="#pricing" className="footer-link">Pricing</a>
                <a href="#services" className="footer-link">Services</a>
              </div>
              <div className="footer-col">
                <p className="footer-col-label">Socials</p>
                {SOCIAL_LINKS.filter(s => s.name !== 'The X').map(social => (
                  <a key={social.name} href={social.href} className="footer-link" target="_blank" rel="noreferrer noopener">{social.name}</a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="footer-bottom">
          <p>
            {new Date().getFullYear()}
            {' '}
            Nukt , All rights reserved
          </p>
          <div className="footer-legal">
            <a href="mailto:hello@khalil.studio?subject=Project%20terms">Terms</a>
            <a href="mailto:hello@khalil.studio?subject=Privacy%20request">Privacy policy</a>
          </div>
        </div>
      </Container>
      <div className="footer-brand" aria-hidden>NUKT</div>
    </footer>
  );
};

export default Footer;
