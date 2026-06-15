import { useEffect, useMemo, useState } from 'react';
import './Legal.css';

const termsSections = [
    {
        title: '1. About Nukt',
        body: [
            'Nukt is a global software design and development company providing services including website design, web application development, UI/UX design, dashboards, CRM systems, POS systems, automation tools, API development, deployment support, and ongoing product support.',
            'In these Terms, “Nukt,” “we,” “our,” and “us” refer to Nukt. “Client,” “you,” and “your” refer to any person, business, organization, or representative using our website or engaging our services.',
        ],
    },
    {
        title: '2. Use of Our Website',
        body: [
            'You may use our website to learn about our services, view our work, contact us, request a quote, or communicate with our team.',
            'You agree not to misuse the website, attempt to disrupt it, copy its content without permission, use it for unlawful purposes, or attempt to gain unauthorized access to any system connected to Nukt.',
        ],
    },
    {
        title: '3. Services and Project Scope',
        body: [
            'Any service provided by Nukt will usually be defined through a written proposal, quotation, statement of work, email confirmation, contract, invoice, or other agreed project document.',
            'The agreed scope may include deliverables, timelines, milestones, pricing, revision limits, third-party tools, support period, and responsibilities of each party. Work outside the agreed scope may require a separate estimate or approval.',
        ],
    },
    {
        title: '4. Client Responsibilities',
        body: [
            'To complete a project successfully, you agree to provide accurate information, content, brand assets, credentials, feedback, approvals, and any other materials needed for the work.',
            'You are responsible for ensuring that any text, images, logos, files, data, or business information you provide is accurate, lawful, and does not violate third-party rights.',
        ],
    },
    {
        title: '5. Pricing, Payments, and Invoices',
        body: [
            'Project pricing will be agreed before work begins. Payments may be milestone-based, upfront, monthly, hourly, or otherwise agreed in writing.',
            'Unless otherwise agreed, work may not begin until the required initial payment has been received. Late payments may delay delivery, pause work, or affect access to support.',
        ],
    },
    {
        title: '6. Revisions and Change Requests',
        body: [
            'We aim to deliver high-quality work and reasonable refinements within the agreed scope.',
            'Any major design change, new feature, additional page, extra integration, or change in direction after approval may be treated as additional work.',
        ],
    },
    {
        title: '7. Timelines and Delivery',
        body: [
            'We make reasonable efforts to meet agreed timelines. Timelines may change due to delayed client feedback, unclear requirements, third-party issues, technical complexity, additional scope, or factors outside our control.',
            'Estimated timelines are not guaranteed unless specifically agreed in writing.',
        ],
    },
    {
        title: '8. Third-Party Services',
        body: [
            'Projects may use third-party platforms, libraries, APIs, hosting providers, payment gateways, analytics tools, authentication services, email providers, or domain registrars.',
            'Nukt is not responsible for downtime, pricing changes, policy changes, security issues, data loss, or service limitations caused by third-party providers.',
        ],
    },
    {
        title: '9. Intellectual Property',
        body: [
            'Unless otherwise agreed in writing, after full payment has been received, the client owns the final custom deliverables specifically created for the project.',
            'Nukt retains ownership of its pre-existing materials, internal tools, reusable code, frameworks, templates, workflows, know-how, libraries, and general technical knowledge used to create the project.',
        ],
    },
    {
        title: '10. Portfolio and Case Study Rights',
        body: [
            'Unless you request otherwise in writing, Nukt may display completed work, project names, screenshots, general project descriptions, and non-confidential outcomes in its portfolio, case studies, website, social media, or marketing material.',
            'We will not intentionally publish confidential business information, private credentials, sensitive data, or internal client materials.',
        ],
    },
    {
        title: '11. Confidentiality',
        body: [
            'Both parties may receive confidential information during a project. Each party agrees to take reasonable care to protect confidential information and not disclose it to unauthorized third parties.',
            'Confidential information does not include information that is already public, independently developed, lawfully received from another source, or required to be disclosed by law.',
        ],
    },
    {
        title: '12. Support and Maintenance',
        body: [
            'Support, bug fixing, maintenance, updates, monitoring, backups, or ongoing improvements are only included if agreed in the project scope or a separate support agreement.',
            'Nukt is not responsible for issues caused by unauthorized edits, third-party updates, hosting changes, plugin conflicts, expired services, client-side changes, or external system failures.',
        ],
    },
    {
        title: '13. No Guarantee of Business Results',
        body: [
            'We aim to create high-quality digital products, but we do not guarantee specific business outcomes such as sales, revenue, traffic, search rankings, user growth, investment, conversions, or profitability.',
            'Results depend on many factors outside our control, including market conditions, client operations, advertising, pricing, competition, product quality, and customer demand.',
        ],
    },
    {
        title: '14. Limitation of Liability',
        body: [
            'To the maximum extent permitted by law, Nukt will not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, business opportunities, goodwill, or service availability.',
            'Our total liability for any claim related to a project or service will not exceed the amount paid by the client to Nukt for the specific service giving rise to the claim.',
        ],
    },
    {
        title: '15. Termination',
        body: [
            'Either party may terminate a project according to the terms agreed in the proposal, contract, or written communication.',
            'If a project is terminated, the client is responsible for paying for work completed, time spent, approved milestones, third-party costs, and any non-refundable expenses incurred before termination.',
        ],
    },
    {
        title: '16. Governing Law',
        body: [
            'These Terms are governed by the laws of the applicable jurisdiction agreed with the client, unless otherwise required by law.',
            'Any dispute will first be handled through good-faith discussion. If unresolved, the dispute may be submitted to the courts or dispute resolution process applicable in the agreed jurisdiction.',
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

const Terms = () => {
    const sectionIds = useMemo(
        () => termsSections.map((_, index) => `terms-${index + 1}`),
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

                    <h1 className="legal-title">Terms and conditions</h1>

                    <p className="legal-intro">
                        Please review our terms and conditions before using our website,
                        requesting a proposal, or working with Nukt.
                    </p>

                    <div className="legal-meta">
                        <span className="legal-pill">Last updated: June 2026</span>
                        <span className="legal-pill">Nukt · Global software studio</span>
                    </div>
                </header>

                <section className="legal-document">
                    <div className="legal-document-inner">
                        <aside className="legal-toc" aria-label="Terms sections">
                            <p className="legal-toc-label">Legal Terms</p>

                            <ol className="legal-toc-list">
                                {termsSections.map((section, index) => {
                                    const id = `terms-${index + 1}`;
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

                            {termsSections.map((section, index) => (
                                <section
                                    key={section.title}
                                    id={`terms-${index + 1}`}
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
                                    For questions about these Terms, contact Nukt at{' '}
                                    <a href="mailto:contact.nukt@gmail.com">
                                        contact.nukt@gmail.com
                                    </a>
                                    .
                                </p>
                            </section>

                            <p className="legal-disclaimer">
                                This page is provided for general business transparency and
                                should be reviewed by a qualified legal professional before
                                being used as a final legal agreement.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Terms;