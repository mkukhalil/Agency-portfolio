import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Container } from '../../ui/Container';
import { SectionHeading } from '../../ui/SectionHeading';
import { FADE_UP, VIEWPORT_CONFIG } from '../../../lib/animations';
import './FAQ.css';

import { faqs } from '../../../data/faq';

const FAQItem = ({ faq, isOpen, toggleOpen }) => {
  const answerId = `faq-answer-${faq.id}`;
  const buttonId = `faq-button-${faq.id}`;

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button
        id={buttonId}
        type="button"
        className="faq-question"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={toggleOpen}
      >
        <span>{faq.question}</span>
        <span className="faq-icon">
          {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="faq-answer-container"
          >
            <div className="faq-answer">{faq.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <Container as="section" className="section container">
      <SectionHeading
        className="faq-header"
        title="Frequently Asked Questions"
      />

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            variants={FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={{ delay: index * 0.05 }}
          >
            <FAQItem
              faq={faq}
              isOpen={openId === faq.id}
              toggleOpen={() => toggleOpen(faq.id)}
            />
          </motion.div>
        ))}
      </div>
    </Container>
  );
};

export default FAQ;
