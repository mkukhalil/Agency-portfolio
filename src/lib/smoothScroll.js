/**
 * Holds the active Lenis instance so programmatic scrolls can go through it.
 * Calling window.scrollTo while Lenis runs makes the two fight: the page holds
 * still, then jumps once the native animation ends.
 */
let activeLenis = null;

export const setActiveLenis = (lenis) => {
  activeLenis = lenis;
};

/** Scrolls to an absolute Y position, smoothly when allowed. */
export const scrollToY = (top, behavior) => {
  if (activeLenis) {
    activeLenis.scrollTo(top, { immediate: behavior !== 'smooth' });
    return;
  }

  window.scrollTo({ top, behavior });
};
