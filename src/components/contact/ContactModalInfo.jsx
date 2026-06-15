import { CheckCircle2, Mail } from 'lucide-react';

const CONTACT_POINTS = [
  'Professional websites, dashboards, and web apps',
  'Clean UI, scalable code, and reliable delivery',
  'Response usually within 24 hours',
];

const ContactModalInfo = () => (
  <aside className="contact-modal-info">
    <div className="contact-modal-info-top">
      <span className="contact-modal-eyebrow">Start a project</span>

      <h2 id="contact-modal-title">Tell us what you are building.</h2>

      <p>
        Share a few details and we will get back to you with clear next steps,
        practical suggestions, and an honest estimate.
      </p>
    </div>

    <div className="contact-modal-points">
      {CONTACT_POINTS.map((point) => (
        <div key={point}>
          <CheckCircle2 size={17} />
          <span>{point}</span>
        </div>
      ))}
    </div>

    <div className="contact-modal-email">
      <Mail size={17} />
      <div>
        <small>Prefer email?</small>
        <a href="mailto:contact.nukt@gmail.com">contact.nukt@gmail.com</a>
      </div>
    </div>
  </aside>
);

export default ContactModalInfo;
