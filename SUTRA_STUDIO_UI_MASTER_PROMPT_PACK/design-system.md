# Sutra Studio — Design System

**Reference source:** Derived from the two uploaded images (brand sheet + website/portal/app mockups). Hex values for the five brand colors are printed on the brand sheet. Everything else (gradients, state colors, type sizes, spacing) is an approximation read from the mockups.

## 1. Brand Tone

- **Feel:** warm, premium, crafted — "Tradition Meets Technology."
- **Motifs:** lotus + stylised "S" monogram, faint lotus/jaali line-pattern watermarks, arched doorways, warm interior photography.
- **Avoid:** cold blues/neon "AI" aesthetics, glow effects, heavy gradients, heavy drop shadows, cluttered stock photography, decorative noise, pure white/pure black surfaces.
- **Light UI rule (from master prompt):** default to white/cream/sand surfaces; gold gradient only on the logo/wordmark and at most one hero accent. The dark CTA band in the mockup is optional — prefer a light or very restrained variant.

## 2. Color Palette

| Token | Name | Hex | Use |
|---|---|---|---|
| `saffron` (primary) | Saffron Gold | `#D4A35A` | Logo, accents, icons, primary gradient start, focus rings |
| `brown` (secondary) | Deep Brown | `#5C3A1E` | Primary buttons ("Get Started"), gradient end, headings accents |
| `ink` (text) | Charcoal Black | `#0F172A` | Body/heading text, dark sections, app icon background |
| `sand` (background) | Warm Sand | `#F8F5EF` | Page background, section bands |
| `cream` (surface) | Lotus Cream | `#FFFDF9` | Cards, nav, inputs |

**Derived (approximate)**
- Gold gradient (logo/wordmark/headline accent): `linear-gradient(135deg, #E2B872 0%, #D4A35A 45%, #8A5A2B 100%)`
- Muted text: `#64748B` (on sand/cream)
- Border: `#EADFCB` (1px, cream cards)
- Dark band (CTA/footers): `#0F172A` → `#1B1410` with gold lotus watermark at ~8% opacity
- Status: In Progress `#C2761A` (amber), Completed `#2E7D4F`, In Review `#3B6FB6`, Pending `#B45309`, Error `#B42318`
- Hover: primary button `#4A2E17`; link/accent hover `#B98A3E`

> Check contrast: Saffron `#D4A35A` on cream is ~2.3:1 — use it for large display text/icons only; body-size text must be `ink` or `brown`.

## 3. Typography

- **Display / headings:** *Playfair Display* (serif). Hero headline mixes gold-gradient words ("Tradition") with charcoal words ("Meets Technology").
- **Body / UI:** *Inter* (or Geist Sans).
- **Eyebrow / taglines:** Inter, uppercase, letter-spacing `0.2–0.3em`, 11–12px (e.g., "IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH").

| Style | Font | Size (desktop / mobile) | Weight | Line-height |
|---|---|---|---|---|
| Display / Hero H1 | Playfair | 72 / 44 | 600 | 1.05 |
| H2 | Playfair | 40 / 30 | 600 | 1.15 |
| H3 | Playfair | 28 / 22 | 600 | 1.25 |
| H4 | Inter | 18 / 16 | 600 | 1.35 |
| Body | Inter | 16 / 15 | 400 | 1.6 |
| Small / caption | Inter | 13 | 400–500 | 1.5 |
| Eyebrow | Inter | 12 | 500 | 1.4 |

## 4. Spacing & Layout

- **Base unit:** 4px; scale 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- **Container:** max-width 1200px (1280 for wide grids), side padding 24 (mobile) / 48 (desktop).
- **Breakpoints:** sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536.
- **Section rhythm:** 96–128px vertical padding desktop, 64 mobile.
- **Grids:** services 6-col desktop → 3 (tablet) → 2 (mobile); "Why" trio 3-col; portfolio 4-col masonry-ish → 2.
- **Radius:** cards 16–20px, buttons 999px (pill) for CTAs / 12px for portal, app icon 22%.
- **Shadow:** soft, warm — `0 8px 30px rgba(92,58,30,0.08)`.

## 5. Components

- **Buttons**
  - *Primary:* brown `#5C3A1E` bg (or gold→brown gradient), cream text, pill, trailing arrow icon. Hover: darker brown + arrow nudges 4px. Disabled: 40% opacity.
  - *Secondary:* cream bg, 1px `#EADFCB` border, ink text, optional leading icon (Watch Demo). Hover: border turns saffron.
  - *On dark:* gold gradient fill with ink text; ghost variant with 1px gold-tinted border.
- **Navbar:** cream, 72px, logo left, links (Services, Studio, Projects, Pricing, About, Contact), Get Started pill right. Mobile: sheet menu with Framer slide-in.
- **Service card:** cream, 1px border, image/3D-render thumbnail top, title + muted sub-label ("Product, Ads, Mockups"), circular arrow bottom-right. Hover: lift 4px, image scale 1.04.
- **Filter chips:** pill; active = brown fill + cream text; inactive = cream with border.
- **Portfolio card:** 4:5 image, rounded 16, overlay badges (play button, "360°"), hover reveals title.
- **Stat block:** large numeral (Playfair, brown) + small muted label; divided by hairlines.
- **Dark CTA band:** charcoal→brown gradient, gold lotus art bottom-left, centered serif headline, two buttons.
- **Portal shell:** left sidebar (logo, nav items with icons, active item = sand bg + brown text), top bar with search/notifications/avatar.
- **KPI tile:** cream card, big number (color-coded: ink, amber, green, red) + label.
- **Status pill:** small rounded pill with dot — colors per status token.
- **Order wizard:** numbered stepper (gold active circle), icon-tile grid (2×6 → 2-col mobile), sticky footer with Cancel / Next.
- **AI chat:** assistant bubble on sand with gold avatar, suggestion chips, pill input with attach/emoji and brown circular send button.
- **Forms/inputs:** cream bg, 1px border, radius 12, focus ring 2px saffron at 40% opacity, error text `#B42318`.
- **Logo lockups:** horizontal (primary), vertical, monogram, monochrome black/white, watermark (light/dark). Min horizontal width 120px; clear space = height of the lotus "S" diamond.

## 6. Motion & Interaction

- **Character:** minimal, calm, slow-in/slow-out — no bounce, no glow, no flashy effects. Motion supports hierarchy only.
- **Easing:** GSAP `power3.out` / `expo.out`; Framer `[0.22, 1, 0.36, 1]`.
- **Durations:** micro 150–200ms · UI 300–400ms · section reveals 700–900ms · stagger 60–90ms.
- **GSAP:** hero headline line-by-line reveal with gold shimmer sweep; parallax on hero arch image and lotus watermarks; stat counters on scroll; pinned/scrubbed 360° showcase; CTA band background drift.
- **Framer Motion:** page/route fades, nav sheet, filter-chip `layoutId` pill, portfolio grid reorder, wizard step slide, modal/drawer, card hover/tap.
- **Reduced motion:** disable parallax/scrub and counters, swap to 150ms fades.

## 7. Imagery & Iconography

- **Photography/renders:** warm-lit interiors, arches, villas at dusk, luxury product shots with golden rim light; consistent warm color grade.
- **Patterns:** fine gold line lotus/jaali at 5–10% opacity as backgrounds.
- **Icons:** Lucide, 1.5px outline, rendered in brown/saffron inside 48–56px soft-cream rounded tiles (as in the services and app icon grids).

## 8. Accessibility Notes

- Body text ≥ 4.5:1; gold-on-cream for decorative/large text only.
- Visible 2px focus ring (saffron + offset) on all interactive elements.
- Hit targets ≥ 44px on mobile.
- Videos: no autoplay with sound; provide captions and pause control.
- Every animation has a reduced-motion fallback; icons paired with text labels.
