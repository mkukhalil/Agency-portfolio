import { MENU_ITEMS, SOCIAL_LINKS } from '../../../../data/navigation';
import { cn } from '../../../../utils/cn';

export const NavbarPill = ({ isOpen, setOpen, menuRef }) => {
  return (
    <div
      ref={menuRef}
      className={cn('nav-menu-shell', isOpen && 'open')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div 
        className="nav-pill" 
        role="button" 
        tabIndex={0} 
        aria-expanded={isOpen} 
        aria-controls="site-menu" 
        onClick={() => setOpen((o) => !o)}
      >
        <div className="nav-pill-left">
          <span className="nav-pill-icon" aria-hidden>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="nav-pill-text">Menu</span>
        </div>
        <div className="nav-pill-right">
          <span className="nav-pill-availability-inline">
            2/5 <span className="nav-pill-availability-sub">slots for May</span>
          </span>
        </div>
      </div>

      <div id="site-menu" className="nav-menu-panel" aria-hidden={!isOpen}>
        <div className="menu-panel-header">
          <div className="menu-panel-brand">Midu</div>
        </div>

        <div className="menu-items">
          {MENU_ITEMS.map((item) => (
            <a key={item.id} className="menu-item" href={item.href} onClick={() => setOpen(false)}>
              <div className="menu-thumb" aria-hidden />
              <div className="menu-item-text">
                <div className="menu-item-label">{item.label}</div>
                <div className="menu-item-desc">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="menu-panel-footer">
          <div className="menu-panel-section-label">Social media</div>
          {SOCIAL_LINKS.map(social => (
            <a key={social.name} href={social.href} target="_blank" rel="noreferrer noopener">{social.name}</a>
          ))}
        </div>
      </div>
    </div>
  );
};
