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