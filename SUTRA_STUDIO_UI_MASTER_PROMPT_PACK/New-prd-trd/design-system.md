# Sutra Studio: Design System

**Reference source:** derived from the Sutra Studio brand sheet (logo variants, color palette, header, splash, app icons, social preview) and the website/app mockup sheet (Home, Services, Client Dashboard, AI Chat, Order Creation, mobile Welcome and Home). The five brand colors below are the labelled values from the brand sheet. Other values (state colors, spacing scale, font sizes) are **approximations** read from the mockups and should be confirmed against the existing codebase.

## 1. Brand Tone

- **Feel:** premium, calm, warm. "Tradition Meets Technology": heritage craft (lotus motif, arches, warm stone) meeting modern AI.
- **Mode:** clean, **light** UI as the default. Dark is used only for the logo-on-dark variants, media overlays and the closing CTA band.
- **Avoid:** heavy glow, loud gradients, neon, stock-photo clutter, cold blue-tech look, busy animation. Gradient is acceptable only inside the logo artwork; UI surfaces stay flat.

## 2. Color Palette

| Token | Name | Hex | Use |
|---|---|---|---|
| `--color-primary` | Saffron Gold | `#D4A35A` | Primary accents, prices ("From $250"), icon strokes, selected card border, active tab |
| `--color-secondary` | Deep Brown | `#5C3A1E` | Primary buttons (Get Started), headings accent, CTA band background base |
| `--color-text` | Charcoal Black | `#0F172A` | Body and heading text, dark logo background |
| `--color-bg` | Warm Sand | `#F8F5EF` | Page background |
| `--color-surface` | Lotus Cream | `#FFFDF9` | Cards, panels, inputs, sidebar |

**Derived (approximate, confirm):**

| Token | Hex | Use |
|---|---|---|
| `--color-muted` | `#64748B` | Secondary text, taglines (e.g. "Product, Ads, Mockups") |
| `--color-border` | `#EFE3CE` | Card and input borders (soft gold-tinted) |
| `--color-primary-soft` | `#FBF3E4` | Selected card fill, chip hover |
| `--color-success` | `#2E9E6B` | Completed status text/chip |
| `--color-warning` | `#D98A1F` | In Progress / In Review chip |
| `--color-danger` | `#C2410C` | Errors, Pending Payment alert |
| `--color-info` | `#2B8FA3` | Neutral info chips (AI Chat icon tint) |

Gold-on-cream text must pass AA: use `--color-secondary` (`#5C3A1E`) for small gold-family text, and keep `--color-primary` for large text, icons and borders only.

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Everything: headings, hero, section titles, body, UI, navigation, labels | **Inter** (fallback Geist Sans, system-ui) | One normal, clean sans-serif. No serif or decorative fonts in the UI. Hero "Tradition Meets Technology": "Tradition" in gold-brown, "Technology" in charcoal. Only the logo artwork keeps its own lettering |

Suggested scale (approximate):

| Style | Size / weight | Font |
|---|---|---|
| H1 | 56-64px desktop, 36-40px mobile, 700, tight tracking | Inter |
| H2 | 36-40px, 600-700 | Inter |
| H3 | 20-24px, 600 | Inter |
| H4 | 16-18px, 600 | Inter |
| Body | 16px / 1.6 | Inter |
| Small / captions / eyebrow | 12-14px, uppercase + letter-spacing for eyebrows ("OUR SERVICES", "WHY SUTRA STUDIO", "FEATURED WORK") | Inter |
| Prices | 14px, 600, gold | Inter |

Tagline lockup uses wide letter-spacing with diamond separators: `IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH`.

## 4. Spacing & Layout

- **Base unit:** 4px; scale 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Containers:** max width about 1200-1280px, side padding 24px (16px on mobile).
- **Breakpoints (Tailwind):** `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- **Grids:** services grid 4 columns desktop / 2 tablet / 1-2 mobile (mockup shows 6 per row on wide screens for compact cards); featured work 4 across; capability picker 4x3.
- **Radius:** cards 16px, buttons pill (full), inputs 12px, chips pill, modals 20px, app icons 22%.
- **Shadows:** very soft, low opacity warm shadow (`0 4px 20px rgba(92,58,30,0.06)`); no heavy shadows.
- **Dashboard layout:** left sidebar (about 220px) + content area; stat cards in a row of 4.

## 5. Components

**Buttons**
- *Primary:* Deep Brown fill, cream text, pill, trailing arrow (e.g. "Get Started →"). Hover: slightly lighter brown; active: darker; disabled: 50% opacity.
- *Secondary (gold):* Saffron Gold fill with white/dark text ("Explore Services →", "Get Started" on dark CTA band).
- *Ghost / outline:* Cream fill, thin border, icon + label ("Watch Demo", "Talk to AI Assistant").
- Focus: 2px gold ring with offset.

**Navigation**
- Desktop header: logo left; links Services, Studio, Projects, Pricing, About, Contact; primary pill CTA "Get Started" right. Sticky, cream background with subtle border on scroll.
- Mobile: hamburger sheet; mobile app uses bottom tab bar (Home, Orders, AI Chat, Projects, More) with gold active state.
- Dashboard: left sidebar with icon + label, active item in soft gold fill.

**Cards**
- *Service card:* illustrated image top, name (semibold), tagline (muted), arrow bottom-right. Capability picker variant: centered text + gold price; selected state has gold border and soft gold fill.
- *Project card:* rounded image, optional play badge or "360" badge, hover reveals title.
- *"Why" card:* line icon in a soft gold circle, title, two-line description.
- *KPI card:* large number, small label (Total Orders, In Progress, Completed, Pending Payment).
- *Order row:* thumbnail, title, order code, status chip, chevron.

**Chips / status**
- Filter chips (All, Image, Video, 3D, Interior, Website, App, Marketing): active = Deep Brown fill with cream text; inactive = cream with border.
- Status: In Progress (warning tint), In Review (info/warning tint), Completed (success tint).

**Forms & inputs**
- Cream surface, 12px radius, soft gold border, gold focus ring, floating or top labels, inline error text in danger color.
- Stepper (Order Creation): numbered circles, current step filled brown, others outlined; Cancel (text) and Next (primary).

**AI Chat**
- Assistant bubble with logo avatar and "SUTRA AI, Your Creative Assistant" header; capability bullet list; quick-prompt chips; input with attach/emoji icons and a round gold send button.

**Special components**
- *Hero media with play button* over a warm architectural photo.
- *Stats row:* four numbers with muted labels separated by thin dividers.
- *CTA band:* dark brown/charcoal panel with lotus watermark, heading in Inter, gold primary button and outlined secondary.
- *360 viewer frame:* rounded card, "360" badge, drag hint, controls (see 360 module rules).
- *Logo watermark:* light/dark low-opacity lotus-S for media overlays.

## 6. Motion & Interaction

- **Minimal and purposeful.** Subtle fades and 8-16px translate on reveal, 200-300ms, ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`).
- Framer Motion: page and modal transitions, list reveals, stepper changes.
- GSAP: only for a small number of scroll-driven moments on public pages (hero parallax, optional counters on stats). No continuous looping animations.
- Hover: cards lift 2-4px with soft shadow; buttons shift tone.
- Always respect `prefers-reduced-motion` (disable parallax and counters).

## 7. Imagery & Iconography

- **Photography:** warm, golden-hour architecture and interiors, cream and wood tones, plants, arches; consistent warm color grade.
- **Service thumbnails:** 3D/isometric illustrated objects on a cream ground (as in the Services mockup).
- **Icons:** thin, rounded line icons in Saffron Gold or Deep Brown (image, video, cube, house, window, megaphone, ads, monitor, phone, automation).
- **Logo set (use the exact supplied files in `logo/`; never retype or recolor):** primary horizontal and vertical lockups; dark-background, white-background and monochrome (black/white for video) versions; app icon (black rounded square), favicon (cream), social icon (black circle), monogram (S), light/dark watermarks. Keep clear space equal to the lotus petal width; never recolor outside brand colors.
- **Patterns:** very faint mandala/lotus line art allowed as background texture at low opacity.

## 8. Accessibility Notes

- Contrast: body text on cream at least 4.5:1 (Charcoal on Lotus Cream passes); gold text only at large sizes or use Deep Brown.
- Visible keyboard focus on all interactive elements; logical tab order in stepper, sidebar, chat.
- Touch targets at least 44px (mobile app 44-48px), safe-area padding on mobile.
- Do not rely on color alone for status: chips include text labels.
- Alt text for portfolio media; captions or transcripts for demo video where possible.
- Reduced-motion fallback for all GSAP and Framer Motion animations.

## 9. Tailwind Token Starter

```ts
// tailwind.config.ts (excerpt)
extend: {
  colors: {
    primary: "#D4A35A",
    secondary: "#5C3A1E",
    ink: "#0F172A",
    sand: "#F8F5EF",
    cream: "#FFFDF9",
    line: "#EFE3CE",
    muted: "#64748B",
  },
  fontFamily: {
    sans: ["Inter", "Geist", "system-ui", "sans-serif"],
  },
  borderRadius: { card: "16px", input: "12px" },
  boxShadow: { soft: "0 4px 20px rgba(92,58,30,0.06)" },
}
```
