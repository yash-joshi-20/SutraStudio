# SUTRA STUDIO DESIGN SYSTEM & DESIGN TOKENS
### Canonical Token Specifications — Web, Mobile, and Brand Applications

---

## 1. Color Palette Tokens

The SUTRA STUDIO color palette embodies an Indian heritage aesthetic translated into an ultra-clean, modern digital atelier. It balances warm ivory and cream backgrounds with rich charcoal typography, parchment borders, and restrained brass/gold accents.

### Primitive & Semantic Color Tokens

```css
:root {
  /* Brand Core Tokens */
  --sutra-gold: #D4A35A;          /* Primary Accent: Muted Indian Brass / Gold */
  --sutra-gold-light: #F2CB7E;    /* Highlight Gold: Shimmer & Gradients */
  --sutra-gold-dark: #8E5316;     /* Deep Gold / Bronze */
  --sutra-brown: #5C3A1E;         /* Deep Walnut / Earthy Structural Accent */
  
  /* Background & Surface Tokens (Light Theme Only) */
  --sutra-cream: #FFFDF9;         /* Elevated Surface: Card & Modal Background */
  --sutra-sand: #FAF9F5;          /* Base Canvas: Page Background */
  --sutra-parchment: #F5F2EB;     /* Secondary Surface: Table Headers & Badges */
  
  /* Typography & Text Tokens */
  --sutra-charcoal: #0F172A;      /* Primary Typography: Deep Slate Charcoal */
  --sutra-charcoal-muted: #171717;/* Editorial Header Charcoal */
  --sutra-slate: #475569;         /* Secondary Text: Subtitles & Labels */
  --sutra-muted: #64748B;         /* Tertiary Text: Metadata & Timestamps */
  
  /* Border & Stroke Tokens */
  --sutra-border: #EADFCB;        /* Default Card & Container Border */
  --sutra-border-subtle: #E5E1D8; /* Divider & Hairline Stroke */
  --sutra-border-focus: #D4A35A;  /* Active State & Focus Ring */

  /* Functional & Status Tokens */
  --sutra-status-success: #15803D; /* Approved / Completed */
  --sutra-status-warning: #B45309; /* In Review / Pending */
  --sutra-status-error: #B91C1C;   /* Needs Revision / Rejected */
  --sutra-status-info: #0369A1;    /* Draft / Dispatched */
}
```

---

## 2. Typography Hierarchy Tokens

SUTRA STUDIO utilizes an editorial serif for titles paired with a clean geometric sans-serif for numerical metrics, data tables, and body copy.

```css
:root {
  /* Font Families */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px - Badges, micro-labels */
  --text-sm: 0.875rem;   /* 14px - Body copy, data table values */
  --text-base: 1rem;     /* 16px - Standard paragraphs, inputs */
  --text-lg: 1.125rem;   /* 18px - Card subheadings, prominent body */
  --text-xl: 1.25rem;    /* 20px - Section subheads, modal titles */
  --text-2xl: 1.5rem;    /* 24px - Section headers */
  --text-3xl: 1.875rem;  /* 30px - Page titles, KPI counters */
  --text-4xl: 2.25rem;   /* 36px - Hero subheadlines */
  --text-5xl: 3rem;      /* 48px - Primary editorial headlines */
  --text-6xl: 3.75rem;   /* 60px - Display hero titles */

  /* Font Weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.05em;
  --tracking-widest: 0.15em; /* Used for uppercase labels & subtitles */
}
```

---

## 3. Spacing & Spatial System

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
}
```

---

## 4. Border Radii & Elevation Tokens

```css
:root {
  /* Border Radii */
  --radius-sm: 0.375rem; /* 6px - Pills, tags */
  --radius-md: 0.5rem;   /* 8px - Form inputs, buttons */
  --radius-lg: 0.75rem;  /* 12px - Medium cards, dialogs */
  --radius-xl: 1rem;     /* 16px - Large feature cards */
  --radius-2xl: 1.5rem;  /* 24px - Hero containers */
  --radius-full: 9999px; /* Badges, avatar rings */

  /* Elevation (Restrained Soft Shadows) */
  --shadow-subtle: 0 1px 3px rgba(15, 23, 42, 0.04);
  --shadow-card: 0 4px 12px -2px rgba(92, 58, 30, 0.05);
  --shadow-hover: 0 10px 25px -5px rgba(92, 58, 30, 0.08);
  --shadow-modal: 0 20px 40px -10px rgba(15, 23, 42, 0.12);
}
```

---

## 5. Responsive Breakpoint Standards

- **Mobile (sm)**: `375px` to `639px` (Single-column vertical stack, collapsible drawer)
- **Tablet (md)**: `640px` to `1023px` (2-column grids, condensed sidebar)
- **Desktop (lg)**: `1024px` to `1279px` (Persistent navigation, multi-column dashboard)
- **Large Desktop (xl)**: `1280px+` (Max container `1280px` centered, 12-col grids)
