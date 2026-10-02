# DESIGN-SYSTEM.md — SutraStudio Visual Identity & Token Specifications

## 1. Brand Visual Identity & Official Logo Suite

The SUTRA STUDIO logo system expresses traditional Indian sacred geometry (the stylized Lotus 'S' emblem) combined with refined modern typography.

### Official Vector SVG Suite (Synchronized under `/public/brand/` and `/public/brand/LOGO/`)

| Variant | SVG Asset Path | Primary Usage |
| :--- | :--- | :--- |
| **Primary Horizontal** | `/brand/sutra-logo-horizontal.svg` | Main public and app header navigation |
| **Primary Vertical** | `/brand/sutra-logo-vertical.svg` | Stacked emblem + title for splash and cover sheets |
| **Sacred Lotus Mark** | `/brand/sutra-mark.svg` | Standalone geometric icon / logo badge |
| **Monogram Emblem** | `/brand/sutra-monogram.svg` | Interlaced golden monogram for compact cards |
| **Application Icon** | `/brand/sutra-app-icon.svg` | iOS & Android 512×512 squircle container |
| **Favicon Icon** | `/brand/sutra-favicon.svg` | Browser tab 64×64 optimized icon |
| **Social Media Icon** | `/brand/sutra-social-icon.svg` | Circular avatar for digital channels |
| **Horizontal Dark** | `/brand/sutra-logo-horizontal-dark.svg` | White typography on dark surfaces |
| **Horizontal Black** | `/brand/sutra-logo-horizontal-black.svg` | Ink black typography on light surfaces |
| **Monochrome Black** | `/brand/sutra-logo-monochrome-black.svg`| 100% black `#171717` for single-color print |
| **Monochrome White** | `/brand/sutra-logo-monochrome-white.svg`| 100% white `#FFFFFF` for video lower-thirds & 3D |
| **Watermark Light** | `/brand/watermark_light.svg` | 18% opacity gold for card backgrounds |
| **Watermark Dark** | `/brand/watermark_dark.svg` | 12% opacity white for dark CTA surfaces |

---

## 2. Master Color Palette & Design Tokens

| Token | CSS Variable | Hex Code | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Warm Sand** | `--background` | `#F8F5EF` | Global body parchment canvas |
| **Lotus Cream / Ivory** | `--surface` | `#FFFDF9` | Elevated card surfaces, modals, client workspaces |
| **Charcoal Black** | `--foreground` | `#0F172A` | Primary typography, headlines, high-contrast text |
| **Saffron Gold** | `--saffron` / `--primary` | `#D4A35A` | Brand accent, active badges, selected card borders |
| **Deep Brown** | `--brown` / `--secondary` | `#5C3A1E` | Primary action buttons, active navigation pills, luxury grounding |
| **Sandstone Border** | `--border` / `--line` | `#EADFCB` | Subtle panel dividers, card borders |
| **Muted Slate** | `--muted` | `#64748B` | Secondary body text, timestamps, captions |
| **Soft Gold Tint** | `--color-primary-soft` | `#FBF3E4` | Selected card fill, chip hover states |
| **Success Emerald** | `--color-success` | `#2E9E6B` | Completed status indicators |
| **Warning Amber** | `--color-warning` | `#D98A1F` | In Progress / In Review status chips |
| **Danger Coral** | `--color-danger` | `#C2410C` | Form errors, payment alerts |

---

## 3. Typography Hierarchy

* **Headings & Body Typography**: **Inter** (with fallback `system-ui`, `-apple-system`, `sans-serif`) across all UI elements, headings, and tabular data.
* **Brand Artwork Lettering**: Retained inside the official vector logo SVG files.
* **Hero Heading**: `Tradition` in Saffron Gold/Deep Brown (`#5C3A1E`), `Meets Technology` in Charcoal (`#0F172A`).
* **Tagline Lockup**: `IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH` with uppercase wide tracking (`0.2em`).

---

## 4. UI Layout & Component Rules

* **Buttons**:
  * *Primary*: Deep Brown fill (`#5C3A1E`), cream text, full pill radius, trailing arrow (`Get Started →`).
  * *Secondary*: Saffron Gold fill (`#D4A35A`) with dark/white text.
  * *Ghost / Outline*: Cream fill, thin sandstone border (`#EADFCB`).
* **Cards**: Radius `16px`, border 1px `#EADFCB`, background `#FFFDF9`, subtle warm shadow `0 4px 20px rgba(92,58,30,0.06)`.
* **Motion & Animations**:
  * Subtle and purposeful; 200–300ms easing (`cubic-bezier(0.22, 1, 0.36, 1)`).
  * Framer Motion for modals, drawers, and stepper steps.
  * Respects `prefers-reduced-motion: reduce` across all animated components.
