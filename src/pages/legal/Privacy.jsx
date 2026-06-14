import { useEffect, useMemo, useState } from 'react';
import './Legal.css';

const privacySections = [
    {
        title: '1. Who We Are',
        body: [
            'Nukt is a global software design and development company. We provide website design, web application development, UI/UX design, dashboards, CRM systems, POS systems, automation tools, consulting, deployment, and support services.',
            'This Privacy Policy explains how we collect, use, store, protect, and share information when you visit our website, contact us, request a quote, become a client, or use our services.',
        ],
    },
    {
        title: '2. Information We Collect',
        body: [
            'We may collect information you provide directly, such as your name, email address, phone number, company name, project details, budget range, business requirements, messages, files, documents, billing details, and any other information you choose to share.',
            'We may also collect limited technical information such as IP address, browser type, device type, operating system, pages visited, approximate location, referring website, and website performance data.',
        ],
    },
    {
        title: '3. How We Use Information',
        list: [
            'Respond to inquiries and project requests.',
            'Understand project requirements and prepare proposals.',
            'Provide design, development, consulting, deployment, and support services.',
            'Manage client communication, invoices, payments, and project delivery.',
            'Improve our website, services, security, and user experience.',
            'Comply with legal, tax, accounting, contractual, or security obligations.',
        ],
    },
    {
        title: '4. Legal Basis for Processing',
        body: [
            'Depending on your location, we may process information based on consent, performance of a contract, steps taken before entering into a contract, compliance with legal obligations, legitimate business interests, or protection of rights and legal claims.',
        ],
    },
    {
        title: '5. Cookies and Analytics',
        body: [
            'Our website may use cookies or similar technologies to improve functionality, understand usage, measure performance, and improve the user experience.',
            'You can control or disable cookies through your browser settings. Some parts of the website may not function properly if cookies are disabled.',
        ],
    },
    {
        title: '6. How We Share Information',
        body: [
            'We do not sell personal information. We may share information only when necessary with:',
        ],
        list: [
            'Team members, contractors, or service providers helping us deliver services.',
            'Hosting providers, cloud platforms, email providers, analytics tools, payment processors, or project management tools.',
            'Legal, accounting, tax, or compliance advisors.',
            'Authorities or regulators when required by law.',
            'Another party if required to protect rights, safety, security, or legal claims.',
        ],
    },
    {
        title: '7. Client Data',
        body: [
            'During software projects, clients may provide access to business systems, test environments, user data, databases, API details, or internal materials.',
            'We use client data only to perform the agreed services. Clients are responsible for ensuring they have the necessary rights, permissions, notices, and legal basis to share any personal or business data with Nukt.',
        ],
    },
    {
        title: '8. International Data Transfers',
        body: [
            'Because Nukt works globally, information may be processed or stored in countries different from your own. These countries may have different data protection laws.',
            'Where required, we aim to use reasonable safeguards to protect information transferred internationally.',
        ],
    },
    {
        title: '9. Data Retention',
        body: [
            'We keep personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including project delivery, support, legal compliance, accounting, dispute resolution, and business recordkeeping.',
            'When information is no longer needed, we may delete, anonymize, or securely archive it.',
        ],
    },
    {
        title: '10. Security',
        body: [
            'We take reasonable technical and organizational measures to protect information from unauthorized access, loss, misuse, alteration, or disclosure.',
            'However, no online service, website, or digital system can be guaranteed to be completely secure. You are responsible for keeping your own accounts, passwords, credentials, and devices secure.',
        ],
    },
    {
        title: '11. Your Privacy Rights',
        body: [
            'Depending on your location, you may have rights regarding your personal information, including the right to:',
        ],
        list: [
            'Request access to the personal information we hold about you.',
            'Request correction or deletion of your information.',
            'Request restriction of processing or object to certain processing.',
            'Request a copy of your information in a portable format.',
            'Withdraw consent where processing is based on consent.',
            'Opt out of certain data sharing or marketing communications where applicable.',
        ],
    },
    {
        title: '12. Marketing Communications',
        body: [
            'If you choose to receive updates from us, we may send occasional business or service-related communications.',
            'You can unsubscribe or ask us to stop sending marketing messages at any time. We may still send important service, project, billing, or security-related messages when necessary.',
        ],
    },
    {
        title: '13. Third-Party Links',
        body: [
            'Our website may contain links to third-party websites, tools, or platforms. We are not responsible for the privacy practices, content, or security of third-party websites.',
            'You should review the privacy policies of any third-party services you use.',
        ],
    },
    {
        title: '14. Changes to This Policy',
        body: [
            'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised “Last updated” date.',
            'Continued use of our website or services after changes means you acknowledge the updated Privacy Policy.',
        ],
    },
];

const getScrollBehavior = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
};

const scrollToLegalSection = (id) => {
    const section = document.getElementById(id);

    if (!section) return;

    const navbarOffset = 110;
    const targetTop =
        section.getBoundingClientRect().top + window.scrollY - navbarOffset;

    window.scrollTo({
        top: targetTop,
        behavior: getScrollBehavior(),
    });
};

const Privacy = () => {
    const sectionIds = useMemo(
        () => privacySections.map((_, index) => `privacy-${index + 1}`),
        []
    );

    const [activeSection, setActiveSection] = useState(sectionIds[0]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry) {
                    setActiveSection(visibleEntry.target.id);
                }
            },
            {
                root: null,
                rootMargin: '-22% 0px -62% 0px',
                threshold: [0.15, 0.35, 0.55],
            }
        );

        sectionIds.forEach((id) => {
            const section = document.getElementById(id);

            if (section) {
                observer.observe(section);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sectionIds]);

    return (
        <main className="legal-page">
            <div className="legal-shell">
                <header className="legal-hero">
                    <a className="legal-back" href="/">
                        ← Back to home
                    </a>

                    <h1 className="legal-title">Privacy policy</h1>

                    <p className="legal-intro">
                        This policy explains how Nukt collects, uses, protects, and handles
                        information when you visit our website, contact us, or work with us.
                    </p>

                    <div className="legal-meta">
                        <span className="legal-pill">Last updated: June 2026</span>
                        <span className="legal-pill">Nukt · Global software studio</span>
                    </div>
                </header>

                <section className="legal-document">
                    <div className="legal-document-inner">
                        <aside className="legal-toc" aria-label="Privacy sections">
                            <p className="legal-toc-label">Privacy Policy</p>

                            <ol className="legal-toc-list">
                                {privacySections.map((section, index) => {
                                    const id = `privacy-${index + 1}`;
                                    const isActive = activeSection === id;

                                    return (
                                        <li key={section.title}>
                                            <button
                                                type="button"
                                                className={`legal-toc-link ${isActive ? 'active' : ''}`}
                                                onClick={() => scrollToLegalSection(id)}
                                            >
                                                {section.title}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                        </aside>

                        <article className="legal-content">
                            <h2 className="legal-company">Nukt Studio</h2>

                            {privacySections.map((section, index) => (
                                <section
                                    key={section.title}
                                    id={`privacy-${index + 1}`}
                                    className="legal-section"
                                >
                                    <h2>{section.title}</h2>

                                    {section.body?.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}

                                    {section.list && (
                                        <ul>
                                            {section.list.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            ))}

                            <section className="legal-contact">
                                <h2>Contact</h2>
                                <p>
                                    For privacy questions or data requests, contact Nukt at{' '}
                                    <a href="mailto:contact@nukt.agency">
                                        contact@nukt.agency
                                    </a>
                                    .
                                </p>
                            </section>

                            <p className="legal-disclaimer">
                                This page is provided for general business transparency and
                                should be reviewed by a qualified legal professional before
                                being used as a final privacy policy.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Privacy;