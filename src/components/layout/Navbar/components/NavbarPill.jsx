import { PRIMARY_NAV_ITEMS } from '../../../../data/navigation';
import { scrollToTarget } from '../../../../utils/scroll';
import { cn } from '../../../../utils/cn';

export const NavbarPill = ({ isOpen, setOpen, menuRef, isMobileNav }) => {
  const closeMenu = () => {
    setOpen(false);
  };

  const openDesktopMenu = (event) => {
    if (isMobileNav) return;
    if (event.pointerType && event.pointerType !== 'mouse') return;

    setOpen(true);
  };

  const closeDesktopMenu = (event) => {
    if (isMobileNav) return;
    if (event.pointerType && event.pointerType !== 'mouse') return;

    setOpen(false);
  };

  const handleBlur = (event) => {
    if (isMobileNav) return;

    const nextFocusedElement = event.relatedTarget;

    if (!event.currentTarget.contains(nextFocusedElement)) {
      setOpen(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className={cn('nav-menu-shell', isOpen && 'open')}
      onPointerEnter={openDesktopMenu}
      onPointerLeave={closeDesktopMenu}
      onFocusCapture={() => {
        if (!isMobileNav) setOpen(true);
      }}
      onBlurCapture={handleBlur}
    >
      <button
        type="button"
        className="nav-pill"
        aria-expanded={isOpen}
        aria-controls={isMobileNav ? 'mobile-navigation' : 'site-menu'}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((open) => !open)}
      >
        <span className="nav-pill-left">
          <span className="nav-pill-icon" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </span>

          <span className="nav-pill-labelStack" aria-hidden="true">
            <span className="nav-pill-text nav-pill-text--menu">Menu</span>
            <span className="nav-pill-text nav-pill-text--brand">NUKT</span>
          </span>
        </span>

        <span className="nav-pill-right">
          <span className="nav-pill-availability-inline">
            Open <span className="nav-pill-availability-sub">for projects</span>
          </span>
        </span>
      </button>

      {!isMobileNav && (
        <div id="site-menu" className="nav-menu-panel" aria-hidden={!isOpen}>
          <div className="menu-panel-header">
            <span className="menu-panel-kicker">Navigate</span>
            <span className="menu-panel-brand">NUKT</span>
          </div>

          <div className="menu-items">
            {PRIMARY_NAV_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="menu-item"
                onClick={() => scrollToTarget(item.target, { onComplete: closeMenu })}
              >
                <span className="menu-item-index">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="menu-item-copy">
                  <span className="menu-item-label">{item.label}</span>
                  <span className="menu-item-desc">{item.desktopDesc}</span>
                </span>

                <span className="menu-item-arrow" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </div>


        </div>
      )}
    </div>
  );
};