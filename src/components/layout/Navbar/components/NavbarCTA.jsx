import { Sparkle } from 'lucide-react';
import { cn } from '../../../../utils/cn';

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

const scrollToContact = () => {
  const section = document.getElementById('contact');

  if (!section) return;

  const targetTop =
    section.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

  window.scrollTo({
    top: targetTop,
    behavior: getScrollBehavior(),
  });

  cleanUrlHash();
};

export const NavbarCTA = ({ contrast, onClick }) => {
  const handleClick = () => {
    scrollToContact();
    onClick?.();
  };

  return (
    <div className="nav-right">
      <button
        type="button"
        className={cn('nav-cta', contrast && 'contrast')}
        onClick={handleClick}
      >
        <Sparkle className="nav-cta-icon" aria-hidden />
        Get in touch
      </button>
    </div>
  );
};