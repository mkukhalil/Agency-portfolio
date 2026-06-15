# Refactor Roadmap

# Goal

Transform the current vibe-coded project into:
- professional architecture
- maintainable systems
- scalable frontend structure
- premium code quality

while preserving the visual experience.

---

# Phase 1 — Foundation

- Add engineering documentation
- Add architecture rules
- Add design system rules
- Add animation rules
- Organize reference materials

---

# Phase 2 — Cleanup

- Remove dead dependencies
- Remove duplicate CSS
- Remove unused components
- Remove inconsistent naming
- Move reference files

No visual changes.

---

# Phase 3 — Systems

Create:
- spacing system
- typography system
- motion system
- layout primitives
- reusable UI primitives

---

# Phase 4 — Tailwind Migration

Gradually migrate:
- layout
- spacing
- responsiveness

Keep advanced effects in CSS Modules.

---

# Phase 5 — Component Refactor

Refactor:
- Navbar
- Hero
- About
- Projects
- Footer

One section at a time.

---

# Phase 6 — Performance

- optimize rendering
- optimize motion
- optimize bundle size
- lazy load heavy sections

---

# Phase 7 — Polish

- accessibility
- semantic HTML
- responsive consistency
- interaction refinement
---

# Completed Phase 4 — Performance-safe cleanup

Completed without changing the visual design or the contact email flow:
- Removed unused 3D/shader dependencies.
- Converted project screenshots from large PNG files to WebP.
- Resized the favicon image from a full 1024px PNG to a favicon-sized PNG.
- Added explicit dimensions and lazy loading to project preview images.
- Lazy-loaded Terms and Privacy pages.
- Dynamically imported Lenis smooth scrolling.
- Dynamically imported the sleep Lottie component only when needed.
- Added Cloudflare Pages `_headers` for long-term asset caching and basic security headers.
- Split Vite vendor chunks for better caching.
