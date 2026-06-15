import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import { openContactModal } from '../../../utils/contact';
import { handleSectionLinkClick } from '../../../utils/scroll';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="contact" className="footer section site-container">
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
            Design, development, and business software for ambitious digital
            products.
          </h2>

          <div className="footer-links-container">
            <Button
              as="a"
              href="#contact"
              className="footer-cta-button"
              onClick={openContactModal}
            >
              Get in touch
              <ArrowRight className="footer-cta-icon" aria-hidden />
            </Button>

            <div className="footer-columns">
              <div className="footer-col">
                <p className="footer-col-label">Explore</p>

                <a
                  href="/"
                  className="footer-link"
                  onClick={(event) => handleSectionLinkClick(event, 'top')}
                >
                  Home
                </a>

                <a
                  href="#projects"
                  className="footer-link"
                  onClick={(event) => handleSectionLinkClick(event, 'projects')}
                >
                  Projects
                </a>

                <a
                  href="#tools"
                  className="footer-link"
                  onClick={(event) => handleSectionLinkClick(event, 'tools')}
                >
                  Services
                </a>

                <a
                  href="#pricing"
                  className="footer-link"
                  onClick={(event) => handleSectionLinkClick(event, 'pricing')}
                >
                  Pricing
                </a>
              </div>

              <div className="footer-col">
                <p className="footer-col-label">Company</p>

                <a href="/terms" className="footer-link">
                  Terms
                </a>

                <a href="/privacy" className="footer-link">
                  Privacy
                </a>

                <a
                  href="#contact"
                  className="footer-link"
                  onClick={openContactModal}
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="footer-bottom">
          <p>{new Date().getFullYear()} Nukt, All rights reserved</p>

          <div className="footer-legal">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy policy</a>
          </div>
        </div>
      </Container>

      <div className="footer-brand" aria-hidden>
        NUKT
      </div>
    </footer>
  );
};

export default Footer;
