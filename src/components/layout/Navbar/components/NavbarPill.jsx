import { SOCIAL_LINKS } from '../../../../data/navigation';
import { cn } from '../../../../utils/cn';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    desc: 'Back to the top',
    target: 'top',
  },
  {
    id: 'projects',
    label: 'Projects',
    desc: 'Selected work and builds',
    target: 'projects',
  },
  {
    id: 'services',
    label: 'Our Services',
    desc: 'What we design and build',
    target: 'tools',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    desc: 'Plans and project options',
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

const scrollToTarget = (target, closeMenu) => {
  if (target === 'top') {
    window.scrollTo({
      top: 0,
      behavior: getScrollBehavior(),
    });

    cleanUrlHash();
    closeMenu();
    return;
  }

  const section = document.getElementById(target);

  if (!section) {
    closeMenu();
    return;
  }

  const targetTop =
    section.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

  window.scrollTo({
    top: targetTop,
    behavior: getScrollBehavior(),
  });

  cleanUrlHash();
  closeMenu();
};

export const NavbarPill = ({ isOpen, setOpen, menuRef }) => {
  const closeMenu = () => setOpen(false);

  return (
    <div
      ref={menuRef}
      className={cn('nav-menu-shell', isOpen && 'open')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="nav-pill"
        aria-expanded={isOpen}
        aria-controls="site-menu"
        onClick={() => setOpen((open) => !open)}
      >
        <span className="nav-pill-left">
          <span className="nav-pill-icon" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </span>

          <span className="nav-pill-text">Menu</span>
        </span>

        <span className="nav-pill-right">
          <span className="nav-pill-availability-inline">
            2/5 <span className="nav-pill-availability-sub">slots for May</span>
          </span>
        </span>
      </button>

      <div id="site-menu" className="nav-menu-panel" aria-hidden={!isOpen}>
        <div className="menu-panel-header">
          <div className="menu-panel-brand">NUKT</div>
        </div>

        <div className="menu-items">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="menu-item"
              onClick={() => scrollToTarget(item.target, closeMenu)}
            >
              <div className="menu-thumb" aria-hidden />

              <div className="menu-item-text">
                <div className="menu-item-label">{item.label}</div>
                <div className="menu-item-desc">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="menu-panel-footer">
          <div className="menu-panel-section-label">Social media</div>

          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};