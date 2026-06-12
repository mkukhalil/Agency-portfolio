import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './Footer.css';

const scrollToSection = (event, targetId) => {
  event.preventDefault();

  if (targetId === 'top') {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}`
    );

    return;
  }

  const section = document.getElementById(targetId);

  if (!section) return;

  const targetTop = section.getBoundingClientRect().top + window.scrollY - 88;

  window.scrollTo({
    top: targetTop,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  });

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`
  );
};

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
            Design, development, and business software for ambitious digital
            products.
          </h2>

          <div className="footer-links-container">
            <Button
              as="a"
              href="mailto:contact@nukt.agency"
              className="footer-cta-button"
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
                  onClick={(event) => scrollToSection(event, 'top')}
                >
                  Home
                </a>

                <a
                  href="#projects"
                  className="footer-link"
                  onClick={(event) => scrollToSection(event, 'projects')}
                >
                  Projects
                </a>

                <a
                  href="#tools"
                  className="footer-link"
                  onClick={(event) => scrollToSection(event, 'tools')}
                >
                  Services
                </a>

                <a
                  href="#pricing"
                  className="footer-link"
                  onClick={(event) => scrollToSection(event, 'pricing')}
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

                <a href="mailto:contact@nukt.agency" className="footer-link">
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