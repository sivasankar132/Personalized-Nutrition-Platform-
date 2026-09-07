---
name: Clinical Clarity
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-margin: 24px
  gutter: 20px
---

## Brand & Style

This design system is built on the principles of precision, transparency, and calm. It targets a health-conscious demographic that values data-driven insights without the anxiety often associated with clinical environments. 

The aesthetic is **Modern Minimalist with Glassmorphic accents**. It utilizes a "White-plus" philosophy—where the interface is dominated by pure white and soft greys to maximize perceived "air" and focus. Depth is communicated through translucency and layered surfaces rather than heavy color blocking, creating a sense of sophisticated, premium technology that feels both sterile and welcoming.

## Colors

The palette is anchored by a medical-grade **Teal (Primary)**, chosen for its balance between the trust of blue and the vitality of green. 

- **Primary & Secondary:** Used sparingly for actions, active states, and data highlights.
- **Surface Palette:** A range of ultra-light cool greys (`#F8FAFC` to `#E2E8F0`) provides the foundation for card backgrounds and subtle borders.
- **Functional Colors:** Status indicators (Green, Amber, Red) follow standard medical conventions for "Good," "Moderate," and "Low/Critical" ranges. These should always be used alongside textual labels to ensure accessibility.
- **Glassmorphism:** Translucent surfaces use a white base with 70% opacity and a high saturation backdrop-blur (20px-40px).

## Typography

The design system exclusively uses **Inter** to maintain a systematic, highly legible, and utilitarian feel. 

- **Weight Usage:** Use `600` (Semibold) for primary headings and important labels. `400` (Regular) is reserved for all body copy and descriptions to maintain a light visual weight.
- **Rhythm:** Scale is handled through a tight typographic scale to keep information dense but readable.
- **Labels:** Small labels (`label-md`) utilize uppercase styling and increased letter spacing to distinguish metadata from body content.

## Layout & Spacing

The system employs a **Fluid Grid** with a strict 8px baseline rhythm. 

- **Desktop:** 12-column grid with 24px gutters and wide side margins to center content.
- **Mobile:** 4-column grid with 16px gutters and 24px horizontal margins.
- **Hierarchy:** Use large padding (`xl`) between major sections (e.g., Vitamin Profile vs. Food Timeline) to prevent cognitive overload. Cards should utilize internal padding of `md` (24px) to ensure content does not feel cramped against the rounded corners.

## Elevation & Depth

Visual hierarchy is established through a **Tonal & Glass Layering** model:

1.  **Level 0 (Background):** Pure white or `#F8FAFC`.
2.  **Level 1 (Cards):** White background with a 1px border (`#F1F5F9`) and a very soft, diffused shadow (`0 10px 30px rgba(0,0,0,0.03)`).
3.  **Level 2 (Overlays/Glass):** Surfaces that "float" over content (like bottom sheets or navigation) use the `surface_glass` variable with a `backdrop-filter: blur(20px)`.
4.  **Borders:** Subtle borders are preferred over heavy shadows to define boundaries, maintaining the "medical" precision of the interface.

## Shapes

The design system uses a **Hyper-Rounded (2XL)** approach to soften the clinical nature of the data.

- **Primary Cards:** Use `rounded-xl` (24px on desktop, 16px on mobile) for a friendly, modern look.
- **Buttons & Inputs:** Use `rounded-lg` (16px) to maintain consistency with the card language.
- **Chips & Status Pills:** Full-round (pill-shaped) to clearly distinguish them as interactive or status elements.

## Components

### Buttons
- **Primary:** Solid teal (`#0D9488`) with white text. No gradients.
- **Secondary:** Ghost style with a 1px border (`#E2E8F0`) and teal text.
- **Icon Buttons:** Circular with a soft glass background.

### Cards
- Standard containers for all dashboard modules. They must include a 1px border. If the card contains critical data (e.g., "Nutrition Gaps"), the border can subtly tint to match the status color (e.g., a faint red border for low fiber).

### Input Fields
- Outlined style with `body-md` text. The border shifts from grey to teal on focus. Backgrounds should be slightly off-white (`#F8FAFC`) to recede into the layout.

### Data Visualization
- **Status Dots:** Small 8px circles using the status color palette.
- **Progress Bars:** Thin (4px - 6px) tracks with rounded caps. Use primary colors for general progress and status colors for health-specific benchmarks.

### Glassmorphic Bottom Navigation
- Fixed at the bottom of mobile screens, using a blur effect to show content scrolling behind it, providing a sense of depth and premium finish.