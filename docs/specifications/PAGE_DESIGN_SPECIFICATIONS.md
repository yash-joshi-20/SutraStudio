# PAGE_DESIGN_SPECIFICATIONS.md — SutraStudio Complete Route Design Specifications

This document defines the exact visual layout, component hierarchy, design tokens, and responsive behavior for **EVERY** route in the SutraStudio application.
**Hard Rule**: Exactly 21 routes (16 web pages + 5 API endpoints) are preserved. Zero pages added, zero pages removed.

---

## 1. Global Visual & Layout Foundation

Across all pages:
- **Global Background**: Warm Sand `#F8F5EF` / Warm Ivory `#FAF9F5`
- **Surface Panels & Cards**: Lotus Cream `#FFFDF9` or Pure White `#FFFFFF`
- **Border Tokens**: Warm Sandstone `1px solid #EADFCB` (Light subtle: `#F4EFE6`)
- **Primary Typography**: Playfair Display (Headings, Display, Quotes) & Inter (Body, Inputs, Navigation, Meta)
- **Primary Accents**: Saffron Gold `#D4A35A` (Hover `#B98A3E`), Deep Brown `#5C3A1E` (Buttons & Active States)
- **Status Indicators**: Progress (`#C2761A`), Completed (`#2E7D4F`), Review (`#3B6FB6`), Pending (`#B45309`), Error (`#B42318`)
- **Header**: Global sticky `Navbar.tsx` (Lotus cream with blur, horizontal logo, desktop nav with active indicator, mobile drawer)
- **Footer**: Global editorial 6-column `Footer.tsx` with consultation banner and watermark lotus
- **Mobile Bottom Bar**: `MobileBottomNav.tsx` fixed bottom bar for mobile viewports (`< 768px`)

---

## 2. Page-Specific Design Specifications

---

### PAGE 01: `/` — Studio Landing Page (Home)
- **Purpose**: High-impact brand introduction, 6-pillar creative services showcase, curated case study gallery, customer testimonials, and quick project starter.
- **Header / Footer**: Global sticky Navbar + Editorial 6-column Footer.
- **Section Breakdown**:
  1. **Hero Banner**:
     - *Desktop (1280px+)*: 12-column grid. Left 7 cols: Eyebrow badge ("IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH"), Display H1 "Tradition Meets Technology" in Playfair Display (64px), subhead (18px), dual CTAs ("Explore Services", "Watch Demo"), 4-stat metrics strip. Right 5 cols: Multi-layered floating lotus emblem canvas with interactive gold gradient ring.
     - *Tablet (768px)*: Stacked vertical, centered typography, 4-stat strip in 2x2 grid.
     - *Mobile (375px)*: Display H1 (36px), full-width CTA buttons, 2x2 stats.
  2. **12-Service Feature Matrix**:
     - *Desktop*: 3-column grid of interactive `ServiceCard` components with gold icon headers and deliverable tags.
     - *Tablet*: 2-column grid.
     - *Mobile*: 1-column responsive stacked cards.
  3. **Curated Portfolio Showcase**:
     - Horizontal tab switcher (`All`, `Image`, `Video`, `3D`, `Interior`, `Website`, `App`, `Marketing`).
     - 4-column responsive grid with hover zoom and modal video trigger.
  4. **Why Sutra Studio Band**: 3 editorial cards highlighting Traditional Aesthetic Principles, Enterprise AI Precision, and Google Drive Vault integration.
  5. **Pre-Footer CTA Strip**: Warm ivory rounded container with direct order initiation.

---

### PAGE 02: `/services` — Creative Services Catalog
- **Purpose**: Exhaustive catalog of SutraStudio's 6 creative pillars and 12 service deliverables with transparent capabilities, turnaround estimates, and instant workflow launch.
- **Layout Grid**:
  - *Desktop*: Sticky category sidebar navigation (Left 3 cols) + Service detail cards (Right 9 cols).
  - *Tablet / Mobile*: Horizontal category pill switcher + stacked full-width service cards.
- **Tokens & Components**:
  - `Badge` with turnaround times (e.g. `24-48 Hours`, `3-5 Days`).
  - `Button` with "Order Deliverable" launching `/orders?service={id}`.
  - Deliverable deliverables checklist with green checkmark accents.

---

### PAGE 03: `/studio` — Heritage, Craftsmanship & Technology
- **Purpose**: Editorial exploration of the studio's philosophical roots, balancing Indian cultural symmetry with modern AI automation.
- **Layout Grid**:
  - *Desktop*: Single-column editorial layout with alternating 2-column media-text stories, geometric timeline, and core values grid.
  - *Tablet / Mobile*: Fluid single-column with responsive typography scaling (H2 32px → 24px).
- **Tokens & Components**:
  - Playfair italic pull-quotes with gold quote marks.
  - Clean hairline timeline with lotus node badges.

---

### PAGE 04: `/projects` — Curated Portfolio & Case Studies
- **Purpose**: High-fidelity gallery showcasing completed deliverables across 3D, Interior, Web, and Video domains.
- **Layout Grid**:
  - *Desktop*: Filter bar at top + 3-column fluid masonry card layout with tag chips.
  - *Tablet*: 2-column grid.
  - *Mobile*: 1-column card stack with horizontal swipeable filter pills.
- **Interactive States**:
  - Modal viewer for video playback and 360° pan preview.
  - Deliverable specification sheet drawer.

---

### PAGE 05: `/pricing` — Transparent Tiered Packages
- **Purpose**: Transparent investment packages (Essential, Studio Pro, Bespoke Enterprise) and à la carte deliverable estimator.
- **Layout Grid**:
  - *Desktop*: 3-tier card container. Middle tier ("Studio Pro") highlighted with saffron gold border and "Most Selected" badge.
  - *Tablet*: 3 stacked cards with highlighted borders.
  - *Mobile*: 1-column swipeable cards + full-width CTA buttons.
- **Tokens & Components**:
  - Feature comparison matrix table with checkmark icons.
  - Instant FAQ accordion list.

---

### PAGE 06: `/about` — Studio Heritage & Leadership
- **Purpose**: Founder narrative, studio pedigree, and trust credentials (500+ projects completed, 200+ enterprise clients).
- **Layout Grid**:
  - *Desktop*: Split hero (Executive portrait right, narrative left) + 4-column credibility metric counter.
  - *Tablet / Mobile*: Single column stacked narrative with metric tiles.

---

### PAGE 07: `/contact` — Client Discovery & Inquiry Desk
- **Purpose**: Structured client consultation intake with automatic routing to n8n CRM webhooks.
- **Layout Grid**:
  - *Desktop*: 2-column split (Left: Studio hours, location, direct email; Right: Multi-field inquiry form with service checkboxes).
  - *Tablet / Mobile*: Form stacked above contact details with full touch-friendly inputs.
- **Components**: `Input`, `Select`, `Textarea`, `Button` with loading spinner.

---

### PAGE 08: `/login` — Secure Authentication Surface
- **Purpose**: Firebase Authentication for clients and administrators with Google One-Click and email/password fallback.
- **Layout Grid**:
  - Full-viewport centered layout with subtle lotus watermark background.
  - Card: Max-width 440px, rounded-3xl, border `#EADFCB`, background `#FFFDF9`.
  - Brand header: Centered stacked logo (`SutraLogo variant="vertical"`).
  - One-click Google button + email input + quick role switcher demo helper.

---

### PAGE 09: `/dashboard` — Client Command Center
- **Purpose**: Central hub for authenticated clients displaying active orders, deliverable progress, storage quota, and recent activity.
- **Layout Grid**:
  - *Desktop*: Two-pane layout with persistent `PortalSidebar.tsx` (w-64) + fluid content area.
  - *Tablet / Mobile*: Top header with mobile drawer + single-column KPI metric cards (Total Orders, In Progress, Ready for Review, Completed).
- **Components**:
  - `StatsCard` with trend indicators.
  - `DeliverableTable` with status pills and download action triggers.

---

### PAGE 10: `/orders` — Multi-Step Order Creation Wizard
- **Purpose**: 4-step guided project commissioning pipeline (1. Service Selection, 2. Brief & Specifications, 3. Assets & Google Drive links, 4. Review & Confirmation).
- **Layout Grid**:
  - Horizontal numbered step progress bar with gold active node.
  - Step 1: Grid of 12 service selection tiles.
  - Step 2: Dynamic fields based on chosen deliverable type.
  - Step 3: Google Drive file link input and asset specifications.
  - Step 4: Cost summary card and "Submit Order" button.

---

### PAGE 11: `/projects-client` — Deliverable Review & File Vault
- **Purpose**: Dedicated deliverable inspection interface with version history, client approval button, revision request form, and Google Drive links.
- **Layout Grid**:
  - Filter tabs: `All`, `In Progress`, `Pending Approval`, `Completed`.
  - Project cards featuring preview thumbnails, version tags (`v1.2`), and "Approve Deliverable" primary button.

---

### PAGE 12: `/media` — Google Drive Asset Library
- **Purpose**: Centralized digital asset vault with Google Drive sync for raw images, 4K videos, 3D glTF models, and PDFs.
- **Layout Grid**:
  - Search and filter bar (by file type: Images, Video, 3D, Documents).
  - 4-column responsive asset grid with thumbnail previews, file size indicators, and direct download links.

---

### PAGE 13: `/chat` — Sutra AI Assistant & Studio Support
- **Purpose**: Real-time streaming creative technology assistant capable of answering deliverable specs, generating order briefs, and offering human studio handover.
- **Layout Grid**:
  - Full-height conversational interface (screen-minus-nav height).
  - Left pane (desktop): Conversation history and suggested creative prompt chips.
  - Right main pane: Auto-scrolling message bubbles (User bubble: `#5C3A1E`, Assistant bubble: `#FFFDF9` with `#EADFCB` border).
  - Sticky bottom input field with send icon and attachment trigger.

---

### PAGE 14: `/invoices` — Billing & Financial Records
- **Purpose**: Client financial records, milestone invoices, payment receipts, and download links.
- **Layout Grid**:
  - *Desktop*: Clean tabular invoice register (Invoice ID, Date, Service, Amount, Status Badge, PDF Download).
  - *Tablet / Mobile*: Card list with prominent amount and status badges.

---

### PAGE 15: `/profile` — Organization & Account Settings
- **Purpose**: Client business profile, brand guidelines upload, notification preferences, team members, and API access keys.
- **Layout Grid**:
  - Tabbed interface: `Organization Details`, `Brand Assets`, `Team Members`, `Security`.
  - Form panels with `Input`, `Avatar`, and `Button`.

---

### PAGE 16: `/admin` — Studio Operations Command Center
- **Purpose**: Comprehensive administrative workspace for studio directors to manage incoming orders, review queues, client directories, and n8n webhook triggers.
- **Layout Grid**:
  - Dual navigation: Master portal sidebar + admin utility bar.
  - 4 Operational Modules:
    1. *Orders Queue*: Status dropdown updater, priority badges, assigned artist tag.
    2. *Inquiry Inbox*: Public contact form submissions with quick email dispatch.
    3. *n8n AI Workflows*: Manual trigger cards for automated render and notification pipelines.
    4. *System Health*: Firebase connection status and Google Drive sync indicators.

---

## 3. Backend API Route Specifications (5 Routes)

1. `/api/auth/session` (GET, POST): Client session state, cookie verification, and role resolution.
2. `/api/orders` (GET, POST): Order listing, pagination, and submission to Firestore.
3. `/api/chat` (POST): AI assistant completion stream with deliverable context.
4. `/api/workflows` (POST): Secure webhook dispatch to studio n8n automation instances.
5. `/api/inquiries` (POST): Lead capture from public `/contact` form with email alert dispatch.
