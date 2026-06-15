import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import { aboutCapabilities, aboutStats } from '../../../data/about';
import './About.css';

const About = () => {
  return (
    <section id="about" className="section about-section">
      <div className="about-container">
        <div className="about-content">
          <motion.div
            className="about-eyebrow"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={{ y: 18 }}
          >
            About the studio
          </motion.div>

          <motion.h2
            className="about-text"
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={{ delay: 0.05, y: 24 }}
          >
            A small full-stack studio building clean websites, dashboards, and
            business systems.
          </motion.h2>

          <div className="about-grid">
            <motion.div
              className="about-copy-card"
              variants={FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={{ delay: 0.12, y: 24 }}
            >
              <p className="about-subtext about-subtext-primary">
                We help businesses turn ideas into useful digital products,
                from service websites and landing pages to CRM tools, POS
                systems, dashboards, APIs, and custom web applications.
              </p>

              <p className="about-subtext">
                Because we are small, clients work directly with the people
                building the product. That means clear communication, practical
                decisions, and faster execution without unnecessary agency
                layers.
              </p>

              <a href="#contact" className="about-link">
                Start a project
                <ArrowUpRight className="about-link-icon" aria-hidden />
              </a>
            </motion.div>

            <motion.div
              className="about-side"
              variants={FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={{ delay: 0.18, y: 24 }}
            >
              <Card className="about-stats-card">
                {aboutStats.map((stat) => (
                  <div key={stat.label} className="about-stat">
                    <span>{stat.value}</span>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </Card>

              <Card className="about-capabilities-card">
                <p className="about-card-label">What we build</p>

                <div className="about-capabilities">
                  {aboutCapabilities.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
