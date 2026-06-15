import { PRIMARY_NAV_ITEMS } from '../../../../data/navigation';
import { scrollToTarget } from '../../../../utils/scroll';
import { cn } from '../../../../utils/cn';

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

          <button
            type="button"
            className="nav-drawer-cta"
            onClick={() => scrollToTarget('contact', { onComplete: onClose })}
          >
            Start a project
          </button>

          <div className="nav-drawer-links" aria-label="Page sections">
            {PRIMARY_NAV_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="nav-drawer-link"
                onClick={() => scrollToTarget(item.target, { onComplete: onClose })}
              >
                <span className="nav-drawer-link-index">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="nav-drawer-link-copy">
                  <span className="nav-drawer-link-label">{item.label}</span>
                  <span className="nav-drawer-link-desc">{item.mobileDesc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};