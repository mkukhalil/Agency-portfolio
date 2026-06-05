import { useState, useEffect, useRef } from 'react';
import { NavbarLogo } from './components/NavbarLogo';
import { NavbarPill } from './components/NavbarPill';
import { NavbarCTA } from './components/NavbarCTA';
import { NavbarDrawer } from './components/NavbarDrawer';
import { cn } from '../../../utils/cn';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const menuRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Contrast detection (Intersection Observer)
  useEffect(() => {
    const target = document.querySelector('.tools-brand-section');
    if (!target) return undefined;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setContrast(entry.isIntersecting));
    }, { threshold: 0.15 });

    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  // Click outside and Escape key handlers
  useEffect(() => {
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <>
      <nav className={cn('navbar', scrolled && 'scrolled')}>
        <div className="navbar-container">
          <div className="nav-row">
            {/* Logo */}
            <div className="nav-col nav-col--left">
              <NavbarLogo
                contrast={contrast}
                onClick={() => setMenuOpen(false)}
              />
            </div>

            {/* Pill Menu (Desktop & Mobile trigger) */}
            <div className="nav-col nav-col--center">
              <NavbarPill
                isOpen={menuOpen}
                setOpen={setMenuOpen}
                menuRef={menuRef}
              />
            </div>

            {/* Desktop CTA */}
            <div className="nav-col nav-col--right">
              <NavbarCTA contrast={contrast} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <NavbarDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
};

export default Navbar;
