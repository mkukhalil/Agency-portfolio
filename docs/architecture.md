# Architecture

# Philosophy

This project follows:
- component-driven architecture
- design-system-first development
- reusable UI primitives
- minimal abstraction
- separation of concerns

The visual result should feel premium.
The codebase should feel equally premium.

---

# Folder Structure

src/
  components/
    ui/
    sections/
    layout/

  hooks/
  styles/
  utils/
  lib/
  data/

---

# Component Categories

## ui/

Reusable primitives.

Examples:
- Button
- Container
- Badge
- SectionHeading
- Reveal

---

## sections/

Page sections.

Examples:
- HeroSection
- AboutSection
- ProjectsSection

Sections should compose primitives.

---

## layout/

Structural layout components.

Examples:
- Navbar
- Footer
- MobileMenu

---

# Styling Architecture

Use:
- Tailwind for layout/utilities
- CSS Modules for complex visuals
- CSS variables for design tokens

Global CSS should ONLY contain:
- resets
- tokens
- typography setup
- utility layers

Avoid large section-specific global CSS.

---

# Animation Architecture

Shared animations belong in:

src/lib/animations.js

Do NOT duplicate motion variants across files.

---

# Data Architecture

Static content belongs in:

src/data/

Avoid hardcoded arrays inside components.

---

# Hooks

Custom hooks belong in:

src/hooks/

Examples:
- useLenis
- useReveal
- useClock

Keep hooks isolated and reusable.

---

# Utilities

Helpers belong in:

src/utils/

Examples:
- cn.js
- formatDate.js

Utilities must remain pure and reusable.

---

# Refactoring Philosophy

Refactor incrementally.

Do:
- preserve visuals
- improve systems
- improve naming
- remove duplication

Avoid:
- massive rewrites
- architecture overengineering

---

# Contact Modal Architecture

The contact modal is business-critical because it handles project inquiries and the Cloudflare `/api/contact` email flow.

Structure:

```txt
src/components/contact/
  ContactModal.jsx          modal shell and animation wrapper
  ContactForm.jsx           form markup and field composition
  ContactModalInfo.jsx      left-side informational panel
  ContactSuccess.jsx        success state UI
  CustomSelect.jsx          reusable custom dropdown field
  useContactModal.js        modal state, scroll lock, validation flow, submit flow
  contact.constants.js      form defaults and select options
  contact.validation.js     field validation and class helpers
  ContactModal.css          existing visual styles
```

Rules:
- Keep the `/api/contact` endpoint unchanged unless the Cloudflare function changes too.
- Keep contact trigger behavior centralized in `src/utils/contact.js`.
- Do not mix API submission logic into visual components.
- Do not change CSS class names during logic refactors unless the visual output is being intentionally tested.

---

# Performance Architecture

Performance changes should be applied in safe layers:

1. Remove unused packages before changing application logic.
2. Optimize static assets before changing layout or animation behavior.
3. Lazy-load non-critical pages and libraries without delaying business-critical actions.
4. Keep contact form submission and `/api/contact` unchanged.

Current performance rules:
- Project preview images use `.webp` assets with explicit `width`, `height`, `loading="lazy"`, and `decoding="async"`.
- Legal pages are route-level lazy chunks because they are not needed on the homepage.
- Lenis is dynamically imported after the homepage has mounted and is skipped for reduced-motion users and legal pages.
- The sleep Lottie package is dynamically imported only when the Pakistan availability state is night.
- Cloudflare Pages cache/security headers live in `public/_headers`.
- Vite vendor chunks are split for React, Framer Motion, icons, Lenis, and Lottie to improve browser caching and avoid one oversized bundle.
