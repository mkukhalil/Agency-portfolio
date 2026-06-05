import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '../../ui/Container';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './About.css';

const About = () => {
  return (
    <Container as="section" id="how-we-work" className="section">
      <div className="about-content">
        <h2 className="about-text">
          I craft design that turns ambitious ideas into products people trust.
        </h2>

        <motion.div
          className="about-footer"
          variants={FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={{ delay: 0.5 }}
        >
          <p className="about-subtext about-subtext-primary">
            <strong>About Khalil.</strong>
            {' '}
            I am a designer and frontend developer who treats every project like its own product. I go deep into structure, users, and interaction details before shaping a single screen.
            {' '}
            <strong>The result: digital experiences that do not just look sharp, they perform.</strong>
          </p>
          <p className="about-subtext">
            I design intuitive interfaces for web and mobile products, from first wireframe to development-ready frontend.
          </p>

        </motion.div>


      </div>
    </Container>
  );
};

export default About;
