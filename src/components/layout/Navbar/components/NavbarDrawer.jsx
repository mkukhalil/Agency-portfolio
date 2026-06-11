import { SOCIAL_LINKS } from '../../../../data/navigation';
import { cn } from '../../../../utils/cn';

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
          <a href="#contact" className="nav-drawer-cta" onClick={onClose}>Get in touch</a>
          <p className="nav-drawer-label">Explore</p>
          <a href="#hero" onClick={onClose}>Home</a>
          <a href="#gradient-visible" onClick={onClose}>Pricing</a>
          <a href="#how-we-work" onClick={onClose}>How we work</a>
          <p className="nav-drawer-label nav-drawer-label-social">Socials</p>
          {SOCIAL_LINKS.filter(s => s.name !== 'The X').map(social => (
            <a key={social.name} href={social.href} target="_blank" rel="noreferrer noopener">{social.name}</a>
          ))}
        </div>
      </aside>
    </>
  );
};
