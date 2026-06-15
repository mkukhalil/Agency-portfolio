import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    Loader2,
    Mail,
    X,
} from 'lucide-react';
import './ContactModal.css';

const INITIAL_FORM = {
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: '',
};

const PROJECT_TYPES = [
    'Website / Landing Page',
    'Web App / SaaS',
    'E-commerce',
    'UI/UX Design',
    'Maintenance / Redesign',
    'Custom Software',
    'Not sure yet',
];

const BUDGETS = [
    'Under $500',
    '$500 - $1,500',
    '$1,500 - $3,000',
    '$3,000+',
    'Need guidance',
];

const TIMELINES = ['ASAP', '2 - 4 weeks', '1 - 2 months', 'Flexible'];

const CustomSelect = ({
    label,
    value,
    placeholder,
    options,
    isOpen,
    onToggle,
    onClose,
    onChange,
}) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                onClose();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <div className={`contact-field contact-select ${value ? 'is-valid' : ''}`} ref={dropdownRef}>
            <span>{label}</span>

            <button
                type="button"
                className={`contact-select-button ${!value ? 'is-placeholder' : ''} ${isOpen ? 'is-open' : ''
                    }`}
                onClick={onToggle}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{value || placeholder}</span>
                <ChevronDown size={17} className="contact-select-icon" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="contact-select-menu"
                        role="listbox"
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                role="option"
                                aria-selected={value === option}
                                className={`contact-select-option ${value === option ? 'is-selected' : ''
                                    }`}
                                onClick={() => onChange(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ContactModal = () => {
    const formRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const isValidName = formData.name.trim().length >= 2;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isValidCompany = formData.company.trim().length >= 2;
    const isValidMessage = formData.message.trim().length >= 10;

    const getFieldClass = (isValid, isRequired = true) => {
        if (isValid) return 'is-valid';
        if (hasSubmitted && isRequired) return 'is-invalid';
        return '';
    };

    const openModal = () => {
        setIsOpen(true);
        setOpenDropdown(null);
        setStatus('idle');
        setError('');
        setHasSubmitted(false);
    };

    const closeModal = () => {
        if (status === 'loading') return;

        setIsOpen(false);
        setOpenDropdown(null);
    };

    useEffect(() => {
        const handleCustomOpen = () => openModal();

        const handleContactClick = (event) => {
            const trigger = event.target.closest(
                'a[href="#contact"], [data-contact-trigger]'
            );

            if (!trigger) return;

            event.preventDefault();
            openModal();
        };

        window.addEventListener('open-contact-modal', handleCustomOpen);
        document.addEventListener('click', handleContactClick);

        return () => {
            window.removeEventListener('open-contact-modal', handleCustomOpen);
            document.removeEventListener('click', handleContactClick);
        };
    }, []);

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
            if (event.key === 'Escape' && status !== 'loading') {
                setIsOpen(false);
                setOpenDropdown(null);
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, status]);

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setError('');
    };

    const handleSelectChange = (field, value) => {
        updateField(field, value);
        setOpenDropdown(null);
    };

    const validateForm = () => {
        if (!formData.name.trim()) return 'Please enter your name.';

        if (formData.name.trim().length < 2) {
            return 'Please enter a valid name.';
        }

        if (!formData.email.trim()) return 'Please enter your email address.';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return 'Please enter a valid email address.';
        }

        if (formData.message.trim().length < 10) {
            return 'Please add a few more details about your project.';
        }

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setHasSubmitted(true);

        const validationError = validateForm();

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
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="contact-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="presentation"
                    onClick={closeModal}
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
                            onClick={closeModal}
                            aria-label="Close contact form"
                        >
                            <X size={18} />
                        </button>

                        <div className="contact-modal-grid">
                            <aside className="contact-modal-info">
                                <div className="contact-modal-info-top">
                                    <span className="contact-modal-eyebrow">Start a project</span>

                                    <h2 id="contact-modal-title">
                                        Tell us what you are building.
                                    </h2>

                                    <p>
                                        Share a few details and we will get back to you with clear
                                        next steps, practical suggestions, and an honest estimate.
                                    </p>
                                </div>

                                <div className="contact-modal-points">
                                    <div>
                                        <CheckCircle2 size={17} />
                                        <span>Professional websites, dashboards, and web apps</span>
                                    </div>

                                    <div>
                                        <CheckCircle2 size={17} />
                                        <span>Clean UI, scalable code, and reliable delivery</span>
                                    </div>

                                    <div>
                                        <CheckCircle2 size={17} />
                                        <span>Response usually within 24 hours</span>
                                    </div>
                                </div>

                                <div className="contact-modal-email">
                                    <Mail size={17} />
                                    <div>
                                        <small>Prefer email?</small>
                                        <a href="mailto:contact.nukt@gmail.com">
                                            contact.nukt@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </aside>

                            <form className="contact-form" onSubmit={handleSubmit} ref={formRef}>
                                {status === 'success' ? (
                                    <div className="contact-success">
                                        <CheckCircle2 size={44} />

                                        <h3>Message received.</h3>

                                        <p>
                                            Thanks for reaching out. We will review your details and
                                            reply soon.
                                        </p>

                                        <button type="button" onClick={closeModal}>
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="contact-form-row">
                                            <label className={getFieldClass(isValidName)}>
                                                <span>Name *</span>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(event) =>
                                                        updateField('name', event.target.value)
                                                    }
                                                    placeholder="Your name"
                                                    autoComplete="name"
                                                />
                                            </label>

                                            <label className={getFieldClass(isValidEmail)}>
                                                <span>Work email *</span>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(event) =>
                                                        updateField('email', event.target.value)
                                                    }
                                                    placeholder="you@company.com"
                                                    autoComplete="email"
                                                />
                                            </label>
                                        </div>

                                        <label className={isValidCompany ? 'is-valid' : ''}>
                                            <span>Company / Brand</span>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(event) =>
                                                    updateField('company', event.target.value)
                                                }
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
                                                onToggle={() =>
                                                    setOpenDropdown((current) =>
                                                        current === 'projectType' ? null : 'projectType'
                                                    )
                                                }
                                                onClose={() => setOpenDropdown(null)}
                                                onChange={(value) =>
                                                    handleSelectChange('projectType', value)
                                                }
                                            />

                                            <CustomSelect
                                                label="Estimated budget"
                                                value={formData.budget}
                                                placeholder="Select budget"
                                                options={BUDGETS}
                                                isOpen={openDropdown === 'budget'}
                                                onToggle={() =>
                                                    setOpenDropdown((current) =>
                                                        current === 'budget' ? null : 'budget'
                                                    )
                                                }
                                                onClose={() => setOpenDropdown(null)}
                                                onChange={(value) => handleSelectChange('budget', value)}
                                            />
                                        </div>

                                        <CustomSelect
                                            label="Timeline"
                                            value={formData.timeline}
                                            placeholder="Select timeline"
                                            options={TIMELINES}
                                            isOpen={openDropdown === 'timeline'}
                                            onToggle={() =>
                                                setOpenDropdown((current) =>
                                                    current === 'timeline' ? null : 'timeline'
                                                )
                                            }
                                            onClose={() => setOpenDropdown(null)}
                                            onChange={(value) => handleSelectChange('timeline', value)}
                                        />

                                        <label className={getFieldClass(isValidMessage)}>
                                            <span>Project details *</span>
                                            <textarea
                                                value={formData.message}
                                                onChange={(event) =>
                                                    updateField('message', event.target.value)
                                                }
                                                placeholder="Tell us about your idea, goals, required pages/features, or any reference websites."
                                                rows="5"
                                            />
                                        </label>

                                        {error && <p className="contact-form-error">{error}</p>}

                                        <button
                                            className="contact-submit"
                                            type="submit"
                                            disabled={status === 'loading'}
                                        >
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

                                        <p className="contact-form-note">
                                            No spam. No pressure. Just a clear reply about how we can
                                            help.
                                        </p>
                                    </>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;