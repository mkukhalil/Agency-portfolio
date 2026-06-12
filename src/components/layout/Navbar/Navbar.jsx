import { useEffect, useRef, useState } from 'react';
import { NavbarLogo } from './components/NavbarLogo';
import { NavbarPill } from './components/NavbarPill';
import { NavbarCTA } from './components/NavbarCTA';
import { NavbarDrawer } from './components/NavbarDrawer';
import { cn } from '../../../utils/cn';
import './Navbar.css';

const MOBILE_NAV_QUERY = '(max-width: 899px)';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);

  const menuRef = useRef(null);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_QUERY);

    const updateNavMode = () => {
      setIsMobileNav(mediaQuery.matches);
      setMenuOpen(false);
    };

    updateNavMode();
    mediaQuery.addEventListener('change', updateNavMode);

    return () => {
      mediaQuery.removeEventListener('change', updateNavMode);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const target = document.querySelector('.tools-brand-section');

    if (!target) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setContrast(entry.isIntersecting);
        });
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (isMobileNav) return;

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileNav]);

  useEffect(() => {
    if (!isMobileNav || !menuOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileNav, menuOpen]);

  return (
    <>
      <nav
        className={cn(
          'navbar',
          scrolled && 'scrolled',
          menuOpen && 'menu-open'
        )}
        aria-label="Primary navigation"
      >
        <div className="navbar-container">
          <div className="nav-row">
            <div className="nav-col nav-col--left">
              <NavbarLogo contrast={contrast} onClick={closeMenu} />
            </div>

            <div className="nav-col nav-col--center">
              <NavbarPill
                isOpen={menuOpen}
                setOpen={setMenuOpen}
                menuRef={menuRef}
                isMobileNav={isMobileNav}
              />
            </div>

            <div className="nav-col nav-col--right">
              <NavbarCTA contrast={contrast} onClick={closeMenu} />
            </div>
          </div>
        </div>
      </nav>

      <NavbarDrawer isOpen={isMobileNav && menuOpen} onClose={closeMenu} />
    </>
  );
};

export default Navbar;