import { CheckCircle2 } from 'lucide-react';

const ContactSuccess = ({ onClose }) => (
  <div className="contact-success">
    <CheckCircle2 size={44} />

    <h3>Message received.</h3>

    <p>Thanks for reaching out. We will review your details and reply soon.</p>

    <button type="button" onClick={onClose}>
      Close
    </button>
  </div>
);

export default ContactSuccess;
