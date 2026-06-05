# AGENTS.md

# Project Identity

This project is a high-fidelity recreation of the visual experience and interaction philosophy of midu.design.

The goal is NOT:
- a redesign
- a reinterpretation
- a creative variation

The goal IS:
- cinematic editorial feel
- premium interaction quality
- precise spacing rhythm
- typography-driven hierarchy
- restrained motion
- maintainable frontend architecture

The codebase must feel:
- elegant
- scalable
- production-quality
- consistent

---

# Tech Stack

Core stack:
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lenis

Styling strategy:
- Tailwind for layout/utilities
- CSS Modules for complex visuals/effects
- CSS variables for design tokens

Avoid introducing:
- styled-components
- SCSS
- Chakra UI
- Material UI
- multiple animation libraries
- random utility libraries

---

# Core Engineering Principles

Always prioritize:
1. Readability
2. Maintainability
3. Reusability
4. Consistency
5. Performance

NOT cleverness.

---

# Clone Accuracy Rules

Preserve:
- layout rhythm
- typography proportions
- cinematic spacing
- motion timing
- smooth scrolling feel
- visual restraint
- gradient atmosphere
- interaction quality

Do NOT:
- redesign sections unnecessarily
- simplify important visuals
- change typography hierarchy
- introduce random colors
- introduce random effects

---

# Hero Section Rules

The hero section is a critical identity component.

Requirements:
- preserve layered cinematic gradient feel
- preserve masking behavior
- preserve typography impact
- preserve smooth depth
- preserve visual atmosphere

Do NOT:
- flatten gradients
- remove masking layers
- replace cinematic effects with generic gradients

---

# Architecture Rules

Use this structure:

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

# Component Rules

Components MUST:
- have single responsibility
- remain modular
- remain reusable
- use semantic HTML
- support accessibility
- support responsive behavior

Components SHOULD:
- remain under 150 lines when possible

Components MUST NOT:
- contain duplicated logic
- contain duplicated styles
- contain excessive inline styles
- hardcode repeated magic values

---

# Styling Rules

Use:
- Tailwind for layout and spacing
- CSS Modules for advanced effects
- CSS variables for tokens

Avoid:
- huge global CSS files
- deeply nested selectors
- excessive specificity
- duplicated utility patterns

---

# Tailwind Rules

Prefer:
- reusable utility patterns
- semantic component extraction
- spacing consistency
- typography consistency

Avoid:
- arbitrary values unless necessary
- giant unreadable class strings
- repeated utility combinations

If utility combinations repeat:
extract components.

---

# CSS Module Rules

Use CSS Modules ONLY for:
- gradients
- masking
- overlays
- pseudo-elements
- shader layers
- advanced hover effects
- complex visual compositions

Avoid putting layout logic into CSS modules.

---

# Animation Rules

Motion philosophy:
- restrained
- cinematic
- premium
- smooth

Allowed:
- fade-up
- fade-in
- stagger
- opacity transitions
- subtle translateY
- marquee

Avoid:
- playful motion
- random springs
- excessive parallax
- animation spam
- exaggerated transforms

---

# Performance Rules

Always:
- remove dead code
- remove unused dependencies
- optimize renders
- lazy load heavy sections if needed

Avoid:
- unnecessary observers
- unnecessary state
- unnecessary re-renders
- heavy libraries unless justified

---

# Naming Conventions

Components:
PascalCase

Hooks:
camelCase with use prefix

Utilities:
camelCase

CSS Modules:
ComponentName.module.css

---

# Before Writing Code

Always:
1. Analyze existing structure
2. Detect duplication
3. Reuse abstractions
4. Preserve visual consistency
5. Preserve spacing consistency
6. Preserve typography consistency

Never introduce:
- new spacing systems
- new animation systems
- new color systems
- new typography systems

---

# Refactoring Rules

Refactoring should:
- preserve visuals
- improve maintainability
- improve readability
- improve scalability
- remove duplication

Do NOT rewrite entire sections unless necessary.

Small controlled refactors only.

---

# Expected Output Quality

Generated code must:
- feel production-ready
- feel handcrafted
- avoid AI-generated code smells
- remain understandable for other developers

Code quality is part of design quality.