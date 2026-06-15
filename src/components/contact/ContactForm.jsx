import { ArrowRight, Loader2 } from 'lucide-react';
import { BUDGETS, PROJECT_TYPES, TIMELINES } from './contact.constants';
import ContactSuccess from './ContactSuccess';
import CustomSelect from './CustomSelect';

const ContactForm = ({
  formRef,
  formData,
  status,
  error,
  fieldValidity,
  openDropdown,
  getFieldClass,
  updateField,
  handleSelectChange,
  toggleDropdown,
  closeDropdown,
  handleSubmit,
  closeModal,
}) => (
  <form className="contact-form" onSubmit={handleSubmit} ref={formRef}>
    {status === 'success' ? (
      <ContactSuccess onClose={closeModal} />
    ) : (
      <>
        <div className="contact-form-row">
          <label className={getFieldClass(fieldValidity.isValidName)}>
            <span>Name *</span>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <label className={getFieldClass(fieldValidity.isValidEmail)}>
            <span>Work email *</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>
        </div>

        <label className={fieldValidity.isValidCompany ? 'is-valid' : ''}>
          <span>Company / Brand</span>
          <input
            type="text"
            value={formData.company}
            onChange={(event) => updateField('company', event.target.value)}
            placeholder="Company name"
            autoComplete="organization"
          />
        </label>

        <div className="contact-form-row">
          <CustomSelect
            label="Project type"
            value={formData.projectType}
            placeholder="Select project type"
            options={PROJECT_TYPES}
            isOpen={openDropdown === 'projectType'}
            onToggle={() => toggleDropdown('projectType')}
            onClose={closeDropdown}
            onChange={(value) => handleSelectChange('projectType', value)}
          />

          <CustomSelect
            label="Estimated budget"
            value={formData.budget}
            placeholder="Select budget"
            options={BUDGETS}
            isOpen={openDropdown === 'budget'}
            onToggle={() => toggleDropdown('budget')}
            onClose={closeDropdown}
            onChange={(value) => handleSelectChange('budget', value)}
          />
        </div>

        <CustomSelect
          label="Timeline"
          value={formData.timeline}
          placeholder="Select timeline"
          options={TIMELINES}
          isOpen={openDropdown === 'timeline'}
          onToggle={() => toggleDropdown('timeline')}
          onClose={closeDropdown}
          onChange={(value) => handleSelectChange('timeline', value)}
        />

        <label className={getFieldClass(fieldValidity.isValidMessage)}>
          <span>Project details *</span>
          <textarea
            value={formData.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder="Tell us about your idea, goals, required pages/features, or any reference websites."
            rows="5"
          />
        </label>

        {error && <p className="contact-form-error">{error}</p>}

        <button className="contact-submit" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              Sending message
              <Loader2 className="contact-loader" size={18} />
            </>
          ) : (
            <>
              Send project inquiry
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </>
    )}
  </form>
);

export default ContactForm;
