---
name: design-principles
description: Custom design principles for Rituality Platform - Sophistication & Trust direction with warm cream backgrounds and professional depth. Maintains brand consistency while applying enterprise-grade craft.
---

# Rituality Platform Design System

Build interfaces for Rituality Platform with sophisticated craftsmanship, intentional depth, and consistent brand identity. This skill enforces design decisions specific to Rituality's wellness/rituality context while maintaining professional polish.

## Design Direction

**Personality**: Sophistication & Trust with Warm Approachability
- **Foundation**: Warm cream backgrounds (#fbf5ef) for approachability
- **Cards**: Pure white (#ffffff) with layered shadows for professional depth
- **Text**: Dark gray hierarchy (#333333 → #666666 → #999999)
- **Primary**: Black (#000000) for decisive actions and CTAs
- **Inspiration**: Stripe's depth, Notion's warmth, Linear's precision

**Emotional Job**: Trust + Calm + Professionalism
- Users need to feel safe sharing personal wellness data
- Interface should feel calming and intentional
- Professional polish builds confidence in the platform

---

## Color Foundation

**Backgrounds**:
```css
--background-primary: #fbf5ef;  /* Warm cream - main background */
--background-card: #ffffff;     /* Pure white - cards/sections */
--background-secondary: #fafafa; /* Slight tint - elevated surfaces */
```

**Text Hierarchy**:
```css
--text-primary: #333333;   /* Main content */
--text-secondary: #666666; /* Supporting text */
--text-tertiary: #999999;  /* Subtle labels */
--text-inverse: #ffffff;   /* On dark backgrounds */
```

**Semantic Colors** (use for meaning only, not decoration):
```css
--success: #10b981; /* Completed rituals, achievements */
--warning: #f59e0b; /* Reminders, streaks at risk */
--error: #ef4444;   /* Missed rituals, errors */
--info: #3b82f6;    /* Help, information */
```

**Border**:
```css
--border: #cccccc;  /* Subtle definition */
--border-focus: #000000; /* Black for focus states */
```

---

## Core Craft Principles

### The 4px Grid
All spacing uses 4px base grid:
- `4px` - Micro spacing (icon gaps, tight padding)
- `8px` - Tight spacing (within components)
- `12px` - Standard spacing (between related elements)
- `16px` - Comfortable spacing (card padding, section gaps)
- `24px` - Generous spacing (between sections)
- `32px` - Major separation (large gaps)

**Always use multiples of 4px.**

### Symmetrical Padding
**TLBR must match.** If top is 16px, all sides are 16px.
```css
/* Good */
padding: 16px;

/* Acceptable (horizontal needs more room) */
padding: 12px 16px;

/* Bad */
padding: 24px 16px 12px 16px;
```

### Border Radius System
Sharp-to-soft approach for sophistication:
- **4px** - Small elements (tags, badges, small buttons)
- **8px** - Standard elements (buttons, inputs, cards)
- **12px** - Larger elements (modals, large cards)
- **16px+** - Avoid (too round for sophisticated aesthetic)

### Depth Strategy - Layered Shadows
Match sophistication direction with layered shadows:

**Standard Card** (subtle lift):
```css
box-shadow:
  0 0 0 0.5px rgba(0, 0, 0, 0.05),
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 2px 4px rgba(0, 0, 0, 0.03),
  0 4px 8px rgba(0, 0, 0, 0.02);
```

**Elevated** (hover, modals):
```css
box-shadow:
  0 0 0 0.5px rgba(0, 0, 0, 0.06),
  0 2px 4px rgba(0, 0, 0, 0.05),
  0 4px 8px rgba(0, 0, 0, 0.04),
  0 8px 16px rgba(0, 0, 0, 0.03);
```

**Borders as fallback** (dense interfaces):
```css
border: 0.5px solid rgba(0, 0, 0, 0.08);
```

Choose ONE approach per screen and commit.

### Typography Hierarchy
**Font Stack**: Inter (system fonts for performance)

**Headings**: 600 weight, tight letter-spacing (-0.02em)
```css
font-size: 24px;
font-weight: 600;
letter-spacing: -0.02em;
```

**Body**: 400-500 weight, standard tracking
```css
font-size: 14px;
font-weight: 400;
line-height: 1.5;
```

**Labels**: 500 weight, uppercase for emphasis
```css
font-size: 12px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.05em;
```

**Scale**: 11px, 12px, 13px, 14px (base), 16px, 18px, 24px, 32px

### Monospace for Data
Use monospace for:
- Ritual IDs
- Timestamps
- Streak counts
- Time durations
- Any tabular data

```css
font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
font-variant-numeric: tabular-nums;
```

**Why**: Mono signals "this is data" and enables columnar alignment.

### Iconography
Use **Lucide React** (already installed).
- Icons clarify, not decorate
- If removing an icon loses no meaning → remove it
- Give standalone icons presence with background containers

### Animation
- **150ms** for micro-interactions (hover, focus)
- **200-250ms** for larger transitions (modals, panels)
- **Easing**: `cubic-bezier(0.25, 1, 0.5, 1)`
- No spring/bouncy effects

### Color Usage
**Gray builds structure. Color communicates meaning.**

Use color ONLY for:
- Status (success, warning, error, info)
- Interactive states (hover, active, focus)
- Actions (primary buttons, links)
- Data visualization (charts, metrics)

**Never use color decoratively.**

### Contrast Hierarchy
Four-level system:
1. **Foreground** (#333333) - Primary content
2. **Secondary** (#666666) - Supporting text
3. **Muted** (#999999) - Subtle labels, timestamps
4. **Faint** (rgba(0,0,0,0.3)) - Borders, dividers

Use all four consistently.

---

## Component Patterns

### Buttons
- **Height**: 36px (medium), 32px (small), 40px (large)
- **Padding**: 0 16px (symmetrical)
- **Border radius**: 8px (standard), 4px (small)
- **Variants**:
  - **Primary**: Black background, white text, elevated shadow
  - **Secondary**: White background, black text, border
  - **Ghost**: Transparent background, black text, no border

### Cards
- **Background**: #ffffff
- **Padding**: 16px or 24px (symmetrical)
- **Border radius**: 8px (standard)
- **Shadow**: Standard card shadow
- **Border**: 0.5px solid rgba(0,0,0,0.08) (optional)

### Inputs
- **Height**: 36px or 40px
- **Padding**: 8px 12px
- **Border radius**: 8px
- **Border**: 0.5px solid #cccccc
- **Focus**: 2px solid #000000 outline, offset 2px
- **Background**: #ffffff

### Modals
- **Background**: #ffffff
- **Padding**: 24px (generous)
- **Border radius**: 12px (slightly softer)
- **Shadow**: Elevated shadow
- **Max width**: 480px (standard), 640px (wide)

---

## Anti-Patterns

### Never Do This
- ❌ Dramatic drop shadows (`0 25px 50px...`)
- ❌ Large border radius (16px+) on small elements
- ❌ Asymmetric padding without clear reason
- ❌ Pure white cards on colored backgrounds
- ❌ Thick borders (2px+) for decoration
- ❌ Excessive spacing (margins > 48px between sections)
- ❌ Spring/bouncy animations
- ❌ Gradients for decoration
- ❌ Multiple accent colors in one interface
- ❌ Using color just to "add interest"

### Always Question
- "Did I think about what Rituality needs, or did I default?"
- "Does this element feel crafted and intentional?"
- "Is my depth strategy consistent?"
- "Are all elements on the 4px grid?"
- "Am I using color for meaning or decoration?"
- "Would removing this icon lose meaning?"

---

## Design Tokens Reference

All tokens defined in: `apps/frontend/src/assets/styles/index.css`

**Spacing**: `--spacing-0` through `--spacing-24` (4px increments)
**Colors**: `--color-text-primary`, `--color-background-primary`, etc.
**Shadows**: `--shadow-sm` through `--shadow-2xl`
**Typography**: `--font-size-xs` through `--font-size-4xl`
**Border radius**: `--radius-sm` (4px) through `--radius-full`

---

## Accessibility

- **Focus states**: 2px solid #000000 outline, offset 2px
- **Color contrast**: WCAG AA minimum (4.5:1 for body text)
- **Touch targets**: Minimum 44px × 44px
- **Semantic HTML**: Use proper elements (button, input, label)
- **Screen readers**: Proper aria-labels for interactive elements

---

## Responsive Design

- **Mobile**: Stack vertically, reduce padding to 12-16px
- **Tablet**: Moderate density, maintain 16-24px padding
- **Desktop**: Full layouts, generous spacing (24-32px)

**Container queries** preferred over media queries when possible.

---

## Usage

When building UI for Rituality Platform:

1. **Check existing patterns** in `.design-engineer/system.md` (if exists)
2. **Apply craft principles** from this file
3. **Use design tokens** from index.css
4. **Validate** spacing (4px grid), padding (symmetrical), colors (meaningful)
5. **Test** responsive behavior and accessibility

**Example command**:
```
"Build a ritual tracking card using rituality-design skill"
```

This will apply all Rituality-specific patterns while maintaining craft principles.

---

## Standard

Every Rituality interface should look designed by a team that obsesses over details. Not generic — *crafted*. The warm cream background establishes calm, white cards provide professional structure, and layered shadows add sophistication.

The goal: Wellness-focused products can be both warm AND professional. Users should feel safe sharing data while enjoying a beautiful, intentional experience.
