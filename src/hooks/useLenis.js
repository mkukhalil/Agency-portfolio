import { useEffect } from 'react';

const LENIS_OPTIONS = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
};

/**
 * Smooth scrolling for the site shell. Lenis is loaded lazily and skipped
 * entirely when the user prefers reduced motion.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let cancelled = false;
    let frameId;
    let lenis;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis(LENIS_OPTIONS);

      const raf = (time) => {
        lenis.raf(time);
        frameId = requestAnimationFrame(raf);
      };

      frameId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      lenis?.destroy();
    };
  }, []);
}
