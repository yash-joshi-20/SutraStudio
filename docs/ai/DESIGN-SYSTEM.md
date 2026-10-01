# DESIGN-SYSTEM.md — SutraStudio Visual Identity & Token Specifications

## 1. Brand Visual Identity & Logo System

The SUTRA STUDIO logo system expresses traditional Indian geometry and symmetry through a modern digital lens.

### Approved Vector Logo Variants (All in `/public/brand/`)
1. **Primary Horizontal** (`logo_horizontal_primary.svg`):
   - Lotus 'S' Emblem with radial gold gradient (`#E2B872` → `#D4A35A` → `#8A5A2B`).
   - Title: `SUTRA STUDIO` in Playfair Display Bold 38px, color `#0F172A`, letter-spacing 4px.
   - Tagline: `IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH` in Inter Medium 9px, color `#64748B`, letter-spacing 3.2px.
2. **Horizontal Dark Background** (`logo_horizontal_dark_bg.svg`):
   - Built for dark slate surfaces or presentations (`#0F172A`).
   - Gold gradient emblem, pure white typography (`#FFFFFF`), light slate tagline (`#94A3B8`).
3. **Horizontal Pure White Background** (`logo_horizontal_white_bg.svg`):
   - Solid charcoal emblem (`#0F172A`), solid charcoal typography.
4. **Primary Vertical / Stacked** (`logo_vertical_primary.svg`):
   - Centered Lotus 'S' above Playfair serif title and tracking tagline. Ideal for splash screens, mobile headers, and letterheads.
5. **Standalone Monogram / Emblem** (`logo_monogram.svg` & `sutra_symbol.svg`):
   - Pure vector Lotus 'S' with top and bottom diamond accents without text (100×100 viewBox).
6. **Application Icon** (`app_icon.svg`):
   - iOS/Android 512×512 squircle (`rx="112"`, 22% radius), `#0F172A` background, centered gold emblem.
7. **Social Avatar** (`social_icon.svg`):
   - Circular avatar for Twitter/X, LinkedIn, Instagram, and GitHub profiles.
8. **Browser Favicon** (`favicon.svg`):
   - Light cream background (`#FFFDF9`), 1px warm border (`#EADFCB`), gold Lotus emblem.
9. **Monochrome Print Black** (`logo_monochrome_black.svg`):
   - 100% black `#171717` horizontal lockup for single-color print, laser engraving, and packaging.
10. **Monochrome Video White** (`logo_monochrome_white.svg`):
    - 100% pure white `#FFFFFF` for video lower-thirds, dark overlays, and 3D renders.
11. **Watermark Light** (`watermark_light.svg`):
    - Low opacity gold (`rgba(212, 163, 90, 0.18)`) for background motifs and subtle texture.
12. **Watermark Dark** (`watermark_dark.svg`):
    - Low opacity white (`rgba(255, 255, 255, 0.12)`) for dark card surfaces.

---

## 2. Color Palette & Semantic Tokens

| Token | CSS Variable | Hex / Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Warm Sand Background** | `--background` | `#F8F5EF` | Global body background |
| **Warm Ivory** | `--surface` | `#FAF9F5` / `#FFFDF9` | Card surfaces, modals, navbars |
| **Surface Pure White** | `--surface-card` | `#FFFFFF` | Form inputs, popovers, elevated cards |
| **Charcoal Black** | `--foreground` | `#0F172A` | Primary typography, headers, high contrast |
| **Muted Slate** | `--muted` | `#64748B` | Secondary body text, captions, subtitles |
| **Warm Sandstone Border** | `--border` | `#EADFCB` | Subtle panel borders, dividers |
| **Saffron Gold** | `--saffron` | `#D4A35A` | Brand accent, badges, gradient highlights |
| **Saffron Hover** | `--saffron-hover`| `#B98A3E` | Interactive hover states |
| **Deep Brown Ground** | `--brown` | `#5C3A1E` | Primary buttons, active tabs, dark accents |
| **Deep Brown Hover** | `--brown-hover` | `#4A2E17` | Button hover states |

---

## 3. Typography Scale & Hierarchy

- **Display & Headings**: `Playfair Display`, serif, Georgia, serif
  - `h1`: 48px – 64px, font-weight 700, letter-spacing -0.02em
  - `h2`: 32px – 40px, font-weight 600, letter-spacing -0.01em
  - `h3`: 24px – 28px, font-weight 600
- **Body & Interface**: `Inter`, system-ui, -apple-system, sans-serif
  - `body-lg`: 18px / 1.6, font-weight 400
  - `body-base`: 16px / 1.5, font-weight 400
  - `body-sm`: 14px / 1.4, font-weight 500
  - `caption`: 11px – 12px, font-weight 600, uppercase, tracking 0.15em

---

## 4. Component Rules
- **Buttons**: Rounded-xl (12px), transition 200ms ease, focus-visible ring in `#D4A35A`.
- **Cards**: Border 1px `#EADFCB`, background `#FFFDF9`, subtle warm shadow `0 8px 30px rgba(92, 58, 30, 0.07)`.
- **No Neon / Cyberpunk**: Avoid bright green, cyan glows, heavy drop-shadows, or cluttered cards.
- **Accessibility**: All text meets WCAG AA contrast ratio (> 4.5:1 for body text).
