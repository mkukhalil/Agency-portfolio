export const CONTACT_MODAL_EVENT = 'open-contact-modal';
export const CONTACT_TRIGGER_SELECTOR = 'a[href="#contact"], [data-contact-trigger]';

export const openContactModal = (event) => {
  event?.preventDefault?.();
  window.dispatchEvent(new Event(CONTACT_MODAL_EVENT));
};
