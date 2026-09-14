---
name: Modern Dark SaaS
colors:
  surface: '#0c1322'
  surface-dim: '#0c1322'
  surface-bright: '#323949'
  surface-container-lowest: '#070e1d'
  surface-container-low: '#141b2b'
  surface-container: '#191f2f'
  surface-container-high: '#232a3a'
  surface-container-highest: '#2e3545'
  on-surface: '#dce2f7'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dce2f7'
  inverse-on-surface: '#293040'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0c1322'
  on-background: '#dce2f7'
  surface-variant: '#2e3545'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system establishes a high-performance, focused environment tailored for modern product management, technical operations, and workflow analytics. The emotional tone is authoritative, sleek, and ambiently technical—prioritizing extreme signal over noise.

Targeted at developers, founders, and product teams handling dense telemetry and complex task trees, the design style merges precision minimalism with subtle dark glassmorphism. Crisp structural boundaries, controlled contrast ratios, and concentrated pops of electric violet and blue keep users oriented without visual fatigue over long operational sessions.

## Colors

The palette leverages a deep charcoal/navy canvas foundation with distinct surface tiers:
- Canvas base: `#0B0F17` provides a pitch-black void feel with slight cool blue undertones.
- Surface levels: Card base sits at `#111827`, elevated controls at `#1F2937`, and hovered surfaces at `#374151`.
- Primary violet (`#8B5CF6`, hover `#7C3AED`): Reserved for primary calls to action, active navigation states, and pivotal indicators.
- Secondary technical blue (`#3B82F6`): Used for interactive links, progress indicators, and informative metrics.
- Semantic signals: Emerald (`#10B981`) for completed/healthy states, Amber (`#F59E0B`) for warnings/medium priority, and Rose (`#EF4444`) for high-urgency badges.
- Text hierarchy: High-emphasis pure white (`#F9FAFB`), medium-emphasis slate (`#9CA3AF`), and muted metadata (`#6B7280`).

## Typography

Inter serves across all typographical levels to ensure unified, neutral legibility across dense dashboard matrices, tables, and nested menus.

- Numerical readability: Activate tabular figures (`font-feature-settings: 'tnum' on, 'cv05' on`) for metric counters, financial amounts, and time-stamped tables to prevent visual jitter during data updates.
- Vertical density: Line heights are kept tight (1.2 to 1.4) to maximize data density per viewport while maintaining clear baseline separation.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system paired with a fixed 240px collateral navigation sidebar:
- Content density: The grid utilizes compact 16px to 20px gutters to preserve screen real estate for nested data tables and analytical charts.
- Outer canvas: Insets adjust from 16px (`1rem`) on mobile viewports up to 24px (`1.5rem`) on high-resolution widescreen monitors.
- Spacing rhythm: Spacing increments strictly adhere to 4px sub-units (4px, 8px, 12px, 20px, 28px) to align form controls, chips, and table headers to a predictable cadence.

## Elevation & Depth

Depth is established primarily through tonal layering and razor-thin boundary lines rather than heavy drop shadows:

- Structural borders: All containers, stat cards, and panels feature a crisp 1px outline using `rgba(255, 255, 255, 0.08)` to clearly separate dark-on-dark surfaces.
- Ambient glow: Drop shadows are dark and diffuse, tinted slightly with violet on interactive states:
  - Base cards: `0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.24)`
  - Elevated flyouts & dropdowns: `0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.5)`
  - Primary button hover: `0 0 16px rgba(139, 92, 246, 0.35)`
- Frosted overlays: Sticky headers, command palettes, and modals apply `backdrop-filter: blur(12px)` over `rgba(11, 15, 23, 0.85)`.

## Shapes

The geometric framework favors modern, balanced curves:
- Cards, data widgets, and primary surfaces use a radius of 10px to 12px (`0.625rem`–`0.75rem`), balancing modern softness with high-density architectural alignment.
- Buttons, inputs, and list rows maintain an 8px (`0.5rem`) border radius.
- Status badges, user avatars, and tab pills adopt full circular radii (`rounded-full`) for quick visual scanning.

## Components

### Buttons
- **Primary:** Background `#8B5CF6`, hover `#7C3AED`, color `#FFFFFF`, border `1px solid rgba(255,255,255,0.1)`. Height: 36px (compact) or 40px (default). Radius: 8px.
- **Secondary / Ghost:** Background `rgba(255,255,255,0.04)`, border `1px solid rgba(255,255,255,0.08)`, color `#F9FAFB`. Hover background `rgba(255,255,255,0.08)`.

### Cards & Panels
- Background `#111827`, border `1px solid rgba(255,255,255,0.08)`, radius 12px, padding 20px (`space-lg`). Internal widgets divide subsections with `1px solid rgba(255,255,255,0.05)`.

### Inputs & Search Bars
- Background `#0B0F17`, border `1px solid rgba(255,255,255,0.12)`, text `#F9FAFB`, placeholder `#6B7280`. Focused state features border `#8B5CF6` accompanied by a `0 0 0 1px #8B5CF6` ring. Includes shortcut badge (`⌘K`) in muted monospace.

### Data Tables & Lists
- Row height: 44px to 48px. Header labels set in `label-sm` uppercase with `#6B7280`. Alternating row hover: `rgba(255, 255, 255, 0.02)`. Dividers: `1px solid rgba(255,255,255,0.05)`.

### Chips & Badges
- Compact pill design: Height 22px, padding `2px 8px`, typography `label-sm`.
- In-progress / Violet: Background `rgba(139,92,246,0.15)`, text `#A78BFA`, border `1px solid rgba(139,92,246,0.3)`.
- Completed / Green: Background `rgba(16,185,129,0.12)`, text `#34D399`, border `1px solid rgba(16,185,129,0.25)`.
- High priority / Red: Dot indicator `#EF4444` paired with `#F87171` text.

### Checkboxes & Selectors
- Checkbox: 16x16px, radius 4px, border `1px solid rgba(255,255,255,0.2)`. Selected state fills with `#8B5CF6` featuring a centered white check vector.