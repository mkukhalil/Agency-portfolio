import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

        <span className="faq-icon" aria-hidden>
          <ChevronDown size={18} strokeWidth={2.4} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
    <section id="faq" className="section faq-section">
      <div className="faq-container">
        <motion.div
          className="faq-heading-wrap"
          variants={FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={{ y: 18 }}
        >
          <h2 className="faq-title">Frequently Asked Questions</h2>
        </motion.div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              variants={FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={{ delay: index * 0.035, y: 18 }}
            >
              <FAQItem
                faq={faq}
                isOpen={openId === faq.id}
                toggleOpen={() => toggleOpen(faq.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;