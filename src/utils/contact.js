export const CONTACT_MODAL_EVENT = 'open-contact-modal';
export const CONTACT_TRIGGER_SELECTOR = 'a[href="#contact"], [data-contact-trigger]';

/**
 * Opens the shared contact modal. `preset` optionally prefills empty fields,
 * e.g. { projectType, message } for a specific offer.
 */
export const openContactModal = (event, preset) => {
  event?.preventDefault?.();
  window.dispatchEvent(new CustomEvent(CONTACT_MODAL_EVENT, { detail: preset }));
};
