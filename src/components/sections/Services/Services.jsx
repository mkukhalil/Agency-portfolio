import { motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { Card } from '../../ui/Card';
import { FADE_SIDE, VIEWPORT_CONFIG } from '../../../lib/animations';
import './Services.css';

import { services } from '../../../data/services';

const Services = () => {
  return (
    <Container as="section" id="services" className="section services-section-khalil">
      <div className="services-layout services-layout-single">
        <div className="services-list services-list-full">
          {services.map((service, index) => (
            <Card
              as={motion.div}
              key={service.id}
              className="service-item"
              variants={FADE_SIDE}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={{ delay: index * 0.12, duration: 0.5, x: -20 }}
            >
              <div className="service-item-head">
                <h3>{service.title}</h3>
              </div>
              <span className="service-info-pill">Info</span>
              <p>{service.description}</p>
              <span className="service-arrow" aria-hidden>↗</span>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Services;
