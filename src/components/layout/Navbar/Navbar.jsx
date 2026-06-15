import { useEffect, useRef, useState } from 'react';
import { NavbarLogo } from './components/NavbarLogo';
import { NavbarPill } from './components/NavbarPill';
import { NavbarCTA } from './components/NavbarCTA';
import { NavbarDrawer } from './components/NavbarDrawer';
import { cn } from '../../../utils/cn';
import './Navbar.css';

const MOBILE_NAV_QUERY = '(max-width: 899px)';

const CONTRAST_SECTION_SELECTORS = [
  '.tools-brand-section',
  '.services-section-khalil',
  '#services',
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);

  const navRef = useRef(null);
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
    let frameId = null;

    const getContrastSections = () =>
      CONTRAST_SECTION_SELECTORS.flatMap((selector) =>
        Array.from(document.querySelectorAll(selector))
      ).filter(Boolean);

    const updateContrast = () => {
      frameId = null;

      const navRect = navRef.current?.getBoundingClientRect();

      /*
        We check the point where the fixed logo/CTA visually sit.
        If that point is over Tools or Services, navbar side elements turn black.
        Otherwise they stay white.
      */
      const sampleY = navRect
        ? navRect.top + Math.min(navRect.height * 0.55, 56)
        : 56;

      const isOverContrastSection = getContrastSections().some((section) => {
        const rect = section.getBoundingClientRect();

        return rect.top <= sampleY && rect.bottom >= sampleY;
      });

      setContrast(isOverContrastSection);
    };

    const requestContrastUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateContrast);
    };

    requestContrastUpdate();

    window.addEventListener('scroll', requestContrastUpdate, { passive: true });
    window.addEventListener('resize', requestContrastUpdate);
    window.addEventListener('orientationchange', requestContrastUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestContrastUpdate);
      window.removeEventListener('resize', requestContrastUpdate);
      window.removeEventListener('orientationchange', requestContrastUpdate);
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
        ref={navRef}
        className={cn(
          'navbar',
          scrolled && 'scrolled',
          menuOpen && 'menu-open',
          contrast && 'surface-contrast'
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