# Animation Guidelines

# Philosophy

Animations should feel:
- cinematic
- smooth
- restrained
- intentional

Animation exists to support hierarchy and flow.

---

# Allowed Motion Patterns

- fade-in
- fade-up
- stagger reveal
- opacity transitions
- subtle translateY
- marquee motion

---

# Avoid

- exaggerated scaling
- playful bouncing
- excessive rotations
- random spring configs
- animation spam
- excessive parallax

---

# Timing

Preferred duration:
0.4s - 1s

Preferred easing:
easeOut
custom smooth cubic-bezier

Avoid abrupt motion.

---

# Scroll Motion

Scroll animations should:
- feel natural
- avoid excessive triggering
- avoid jitter

Use IntersectionObserver carefully.

---

# Framer Motion Rules

Reuse shared variants.

Shared variants belong in:
src/lib/animations.js

Avoid duplicating motion objects across files.

---

# Performance

Prefer:
- transform
- opacity

Avoid:
- layout thrashing
- expensive filters during animation