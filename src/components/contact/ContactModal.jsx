import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import ContactForm from './ContactForm';
import ContactModalInfo from './ContactModalInfo';
import { useContactModal } from './useContactModal';
import './ContactModal.css';

const ContactModal = () => {
  const contactModal = useContactModal();

  return (
    <AnimatePresence>
      {contactModal.isOpen && (
        <motion.div
          className="contact-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onClick={contactModal.closeModal}
        >
          <motion.div
            className="contact-modal"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <button
              className="contact-modal-close"
              type="button"
              onClick={contactModal.closeModal}
              aria-label="Close contact form"
            >
              <X size={18} />
            </button>

            <div className="contact-modal-grid">
              <ContactModalInfo />
              <ContactForm {...contactModal} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
