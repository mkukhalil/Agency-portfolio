const DEFAULT_NAVBAR_OFFSET = 88;
const NAVBAR_OFFSET_GAP = 16;

export const getScrollBehavior = () => {
  if (typeof window === 'undefined') return 'auto';

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
};

export const getNavbarOffset = () => {
  if (typeof document === 'undefined') return DEFAULT_NAVBAR_OFFSET;

  const navbar = document.querySelector('.navbar');

  if (!navbar) return DEFAULT_NAVBAR_OFFSET;

  return navbar.getBoundingClientRect().height + NAVBAR_OFFSET_GAP;
};

export const cleanUrlHash = () => {
  if (typeof window === 'undefined') return;

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`
  );
};

export const scrollToTop = ({ onComplete } = {}) => {
  if (typeof window === 'undefined') return;

  window.scrollTo({
    top: 0,
    behavior: getScrollBehavior(),
  });

  cleanUrlHash();
  onComplete?.();
};

export const scrollToTarget = (target, { onComplete, offset = getNavbarOffset() } = {}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (target === 'top') {
    scrollToTop({ onComplete });
    return;
  }

  const section = document.getElementById(target);

  if (!section) {
    onComplete?.();
    return;
  }

  const targetTop = section.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: targetTop,
    behavior: getScrollBehavior(),
  });

  cleanUrlHash();
  onComplete?.();
};

export const handleSectionLinkClick = (event, target, options = {}) => {
  event.preventDefault();
  scrollToTarget(target, options);
};
