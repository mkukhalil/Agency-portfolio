# Design System

# Color Palette

Background:
#050505

Surface:
#0A0A0A

Primary Text:
#F5F5F5

Secondary Text:
#A1A1AA

Border:
rgba(255,255,255,0.1)

---

# Gradient Philosophy

Gradients should feel:
- cinematic
- layered
- atmospheric
- soft

Avoid:
- neon cyberpunk gradients
- rainbow gradients
- oversaturated glow

Preferred tones:
- warm reds
- orange highlights
- soft pink transitions
- transparent layering

---

# Typography

Primary Sans:
Switzer

Accent Serif:
Instrument Serif

---

# Typography Scale

display-xl
display-lg
heading-xl
heading-lg
body-lg
body
caption

---

# Spacing Scale

Allowed spacing values:

4
8
12
16
24
32
48
64
96
128

Avoid random spacing values.

---

# Border Radius

sm: 8px
md: 16px
lg: 24px
xl: 32px

---

# Shadows

Shadows should remain subtle.

Avoid:
- strong glow
- hard shadows
- cartoon-like depth

---

# Motion Philosophy

Motion should:
- guide attention
- feel invisible
- feel smooth
- feel premium

Motion should NOT:
- dominate the interface
- distract users
- feel playful

---

# Layout Philosophy

Layouts should:
- breathe
- prioritize whitespace
- avoid clutter
- maintain strong rhythm

---

# Interaction Philosophy

Interactions should feel:
- responsive
- subtle
- polished

Avoid:
- exaggerated hover states
- excessive transitions
---

# CSS Architecture

Global styles are split into small purpose-based layers. Keep reusable rules in these files and keep component CSS only for section-specific visuals.

```txt
src/styles/
  tokens.css       design variables: colors, spacing, radius, motion, z-index
  fonts.css        font-face declarations only
  base.css         reset, element defaults, base document behavior
  typography.css   global heading/body text rules and text helpers
  layout.css       site-container, section, stack, cluster, grid helpers
  components.css   reusable primitives: buttons, badges, cards, section headings
  utilities.css    small single-purpose helpers and focus states
  motion.css       Lenis and reduced-motion behavior
```

Rules:
- Add new colors, spacing, radius values, and transition timings to `tokens.css` first.
- Reuse `.site-container`, `.section`, `.cta-button`, `.badge`, `.card-primitive`, and `.full-width` before creating new component-specific classes.
- Keep Hero, Navbar, Contact modal, and decorative section effects in their own CSS files because they have unique visual behavior.
- Do not create one large `global.css`; use the layered files above.
- After CSS changes, run `npm run lint` and `npm run build` before pushing.

---

# Component CSS Naming Rule

For section-specific CSS, use a section prefix instead of broad generic names.

Good:
```css
.projects-header {}
.projects-subtitle {}
.project-label {}
.pricing-card-features {}
.pricing-feature-icon {}
```

Avoid inside component CSS:
```css
.section-header {}
.section-subtitle {}
.label {}
.amount {}
.period {}
.card-features {}
.feature-icon {}
```

Reason: component CSS files are imported globally by Vite, so broad class names can silently affect other sections. Reusable global classes should live in `src/styles/` and component-specific classes should be clearly prefixed.
