const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getContactFormValidity = (formData) => ({
  isValidName: formData.name.trim().length >= 2,
  isValidEmail: EMAIL_PATTERN.test(formData.email),
  isValidCompany: formData.company.trim().length >= 2,
  isValidMessage: formData.message.trim().length >= 10,
});

export const getContactFieldClass = (isValid, hasSubmitted, isRequired = true) => {
  if (isValid) return 'is-valid';
  if (hasSubmitted && isRequired) return 'is-invalid';
  return '';
};

export const validateContactForm = (formData) => {
  if (!formData.name.trim()) return 'Please enter your name.';

  if (formData.name.trim().length < 2) {
    return 'Please enter a valid name.';
  }

  if (!formData.email.trim()) return 'Please enter your email address.';

  if (!EMAIL_PATTERN.test(formData.email)) {
    return 'Please enter a valid email address.';
  }

  if (formData.message.trim().length < 10) {
    return 'Please add a few more details about your project.';
  }

  return '';
};
