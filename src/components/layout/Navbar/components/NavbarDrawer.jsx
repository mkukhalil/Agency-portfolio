import { SOCIAL_LINKS } from '../../../../data/navigation';
import { cn } from '../../../../utils/cn';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    desc: 'Back to top',
    target: 'top',
  },
  {
    id: 'projects',
    label: 'Projects',
    desc: 'Selected work',
    target: 'projects',
  },
  {
    id: 'services',
    label: 'Our Services',
    desc: 'Tools and services',
    target: 'tools',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    desc: 'Project packages',
    target: 'pricing',
  },
];

const getScrollBehavior = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
};

const getNavbarOffset = () => {
  const navbar = document.querySelector('.navbar');

  if (!navbar) return 88;

  return navbar.getBoundingClientRect().height + 16;
};

const cleanUrlHash = () => {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`
  );
};

const scrollToTarget = (target, onClose) => {
  if (target === 'top') {
    window.scrollTo({
      top: 0,
      behavior: getScrollBehavior(),
    });

    cleanUrlHash();
    onClose();
    return;
  }

  const section = document.getElementById(target);

  if (!section) {
    onClose();
    return;
  }

  const targetTop =
    section.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

  window.scrollTo({
    top: targetTop,
    behavior: getScrollBehavior(),
  });

  cleanUrlHash();
  onClose();
};

export const NavbarDrawer = ({ isOpen, onClose }) => {
  return (
    <>
      <button
        type="button"
        className={cn('nav-drawer-overlay', isOpen && 'open')}
        aria-label="Close navigation menu"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <aside
        id="mobile-navigation"
        className={cn('nav-drawer', isOpen && 'open')}
        aria-hidden={!isOpen}
        aria-label="Mobile navigation"
        aria-modal="true"
        role="dialog"
      >
        <div className="nav-drawer-inner">
          <div className="nav-drawer-top">
            <div>
              <p className="nav-drawer-kicker">Studio Menu</p>
              <h2 className="nav-drawer-brand">NUKT</h2>
            </div>

            <button
              type="button"
              className="nav-drawer-close"
              aria-label="Close menu"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="nav-drawer-status">
            <span className="status-dot" aria-hidden />
            <span>Open for selected projects</span>
          </div>

          <button
            type="button"
            className="nav-drawer-cta"
            onClick={() => scrollToTarget('contact', onClose)}
          >
            Start a project
          </button>

          <div className="nav-drawer-links" aria-label="Page sections">
            {NAV_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="nav-drawer-link"
                onClick={() => scrollToTarget(item.target, onClose)}
              >
                <span className="nav-drawer-link-index">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="nav-drawer-link-copy">
                  <span className="nav-drawer-link-label">{item.label}</span>
                  <span className="nav-drawer-link-desc">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="nav-drawer-footer">
            <p className="nav-drawer-label">Socials</p>

            <div className="nav-drawer-socials">
              {SOCIAL_LINKS.filter((social) => social.name !== 'The X').map(
                (social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="nav-drawer-social-link"
                  >
                    {social.name}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};