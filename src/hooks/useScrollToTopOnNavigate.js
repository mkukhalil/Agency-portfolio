import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Resets scroll on route changes, or jumps to the hash target when present. */
export function useScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;

    if (target) {
      target.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);
}
