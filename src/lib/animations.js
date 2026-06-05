/**
 * Shared Framer Motion animation variants for a consistent cinematic feel.
 * Motion Philosophy: Restrained, Cinematic, Premium, Smooth.
 * Preferred Easing: [0.22, 1, 0.36, 1] (Cubic Bezier)
 */

export const EASE_CUSTOM = [0.22, 1, 0.36, 1];

export const TRANSITION_SMOOTH = {
  duration: 0.6,
  ease: EASE_CUSTOM,
};

export const VIEWPORT_CONFIG = {
  once: true,
  margin: '-100px',
};

export const FADE_UP = {
  hidden: (custom = {}) => ({ 
    opacity: 0, 
    y: typeof custom.y === 'number' ? custom.y : 20 
  }),
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...TRANSITION_SMOOTH,
      ...custom,
    },
  }),
};

/**
 * Side reveal animation (defaults to from left)
 */
export const FADE_SIDE = {
  hidden: (custom = {}) => ({ 
    opacity: 0, 
    x: typeof custom.x === 'number' ? custom.x : -20 
  }),
  visible: (custom = {}) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...TRANSITION_SMOOTH,
      ...custom,
    },
  }),
};

export const FADE_IN = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'linear',
      ...custom,
    },
  }),
};

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: typeof custom.stagger === 'number' ? custom.stagger : 0.1,
      ...custom,
    },
  }),
};

/**
 * Standard section reveal animation
 */
export const SECTION_REVEAL = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE_CUSTOM,
    },
  },
};

/**
 * Subtle scale-in animation for cards or interactive elements
 */
export const SUBTLE_SCALE = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_CUSTOM,
    },
  },
};

/**
 * Smooth transition preset
 */
export const SMOOTH_TRANSITION = TRANSITION_SMOOTH;
