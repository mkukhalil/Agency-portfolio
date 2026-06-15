import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONTACT_MODAL_EVENT, CONTACT_TRIGGER_SELECTOR } from '../../utils/contact';
import { INITIAL_FORM } from './contact.constants';
import {
  getContactFieldClass,
  getContactFormValidity,
  validateContactForm,
} from './contact.validation';


export const useContactModal = () => {
  const formRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fieldValidity = useMemo(() => getContactFormValidity(formData), [formData]);

  const getFieldClass = useCallback(
    (isValid, isRequired = true) =>
      getContactFieldClass(isValid, hasSubmitted, isRequired),
    [hasSubmitted]
  );

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const toggleDropdown = useCallback((dropdownName) => {
    setOpenDropdown((current) => (current === dropdownName ? null : dropdownName));
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setOpenDropdown(null);
    setStatus('idle');
    setError('');
    setHasSubmitted(false);
  }, []);

  const closeModal = useCallback(() => {
    if (status === 'loading') return;

    setIsOpen(false);
    setOpenDropdown(null);
  }, [status]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
  }, []);

  const handleSelectChange = useCallback(
    (field, value) => {
      updateField(field, value);
      setOpenDropdown(null);
    },
    [updateField]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setHasSubmitted(true);

      const validationError = validateContactForm(formData);

      if (validationError) {
        setError(validationError);
        return;
      }

      setStatus('loading');
      setError('');
      setOpenDropdown(null);

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Something went wrong. Please try again.');
        }

        setStatus('success');
        setFormData(INITIAL_FORM);
        setHasSubmitted(false);
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Message could not be sent. Please try again.');
      }
    },
    [formData]
  );

  useEffect(() => {
    const handleCustomOpen = () => openModal();

    const handleContactClick = (event) => {
      const trigger = event.target.closest(CONTACT_TRIGGER_SELECTOR);

      if (!trigger) return;

      event.preventDefault();
      openModal();
    };

    window.addEventListener(CONTACT_MODAL_EVENT, handleCustomOpen);
    document.addEventListener('click', handleContactClick);

    return () => {
      window.removeEventListener(CONTACT_MODAL_EVENT, handleCustomOpen);
      document.removeEventListener('click', handleContactClick);
    };
  }, [openModal]);

  useEffect(() => {
    if (!isOpen) return undefined;

    requestAnimationFrame(() => {
      formRef.current?.scrollTo({ top: 0 });
    });

    const scrollY = window.scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.classList.add('contact-modal-open');
    document.body.classList.add('contact-modal-open');

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.classList.remove('contact-modal-open');
      document.body.classList.remove('contact-modal-open');

      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeModal, isOpen]);

  return {
    formRef,
    isOpen,
    openDropdown,
    formData,
    status,
    error,
    fieldValidity,
    getFieldClass,
    openModal,
    closeModal,
    closeDropdown,
    toggleDropdown,
    updateField,
    handleSelectChange,
    handleSubmit,
  };
};
