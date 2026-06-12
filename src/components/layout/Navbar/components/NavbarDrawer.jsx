import { SOCIAL_LINKS } from '../../../../data/navigation';
import { cn } from '../../../../utils/cn';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    target: 'top',
  },
  {
    id: 'projects',
    label: 'Projects',
    target: 'projects',
  },
  {
    id: 'services',
    label: 'Our Services',
    target: 'tools',
  },
  {
    id: 'pricing',
    label: 'Pricing',
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
      <div
        className={cn('nav-drawer-overlay', isOpen && 'open')}
        aria-hidden={!isOpen}
        onClick={onClose}
      />

      <aside
        id="mobile-navigation"
        className={cn('nav-drawer', isOpen && 'open')}
        aria-hidden={!isOpen}
        aria-label="Mobile navigation"
      >
        <div className="nav-drawer-inner">
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="Close menu"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="nav-drawer-cta"
            onClick={() => scrollToTarget('contact', onClose)}
          >
            Get in touch
          </button>

          <p className="nav-drawer-label">Explore</p>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-drawer-link"
              onClick={() => scrollToTarget(item.target, onClose)}
            >
              {item.label}
            </button>
          ))}

          <p className="nav-drawer-label nav-drawer-label-social">Socials</p>

          {SOCIAL_LINKS.filter((social) => social.name !== 'The X').map(
            (social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.name}
              </a>
            )
          )}
        </div>
      </aside>
    </>
  );
};