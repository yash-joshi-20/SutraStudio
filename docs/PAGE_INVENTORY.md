# PAGE_INVENTORY.md - Exact Route Inventory for SutraStudio

This inventory lists every verified page and route in the SutraStudio application.
**Rule**: Existing page count is strictly preserved. No arbitrary pages added or deleted.

---

## 1. Marketing / Public Surface

| Route | Page Name | Primary Purpose | Responsive Behavior |
|---|---|---|---|
| `/` | **Home** | Brand introduction, hero, 12 services, why partner, portfolio showcase, CTA band | Full-bleed hero, 6-col → 2-col service grid, responsive portfolio |
| `/services` | **Services** | 12 interactive service cards, category tabs, workflow triggers | Filter chips horizontally scrollable on mobile; responsive 3-col → 1-col cards |
| `/studio` | **Studio** | Craftsmanship philosophy, creative technology approach, team & process | Editorial multi-column narrative, timeline flow |
| `/projects` | **Projects** | Portfolio gallery with video & 360° modal viewers, category filters | 4-col masonry-style grid → 2-col tablet → 1-col mobile |
| `/pricing` | **Pricing** | Transparent tier packages & starting estimates for all 12 services | 3-tier card layout, responsive comparison table |
| `/about` | **About** | Studio heritage, mission, trust statistics (500+ projects, 200+ clients) | Visual split hero, stats grid, credibility block |
| `/contact` | **Contact** | Structured inquiry form, business type selection, direct AI chat entry | Split layout (form left, studio contact info right) stacking on mobile |

---

## 2. Authentication Surface

| Route | Page Name | Primary Purpose | Responsive Behavior |
|---|---|---|---|
| `/login` | **Sign In / Sign Up** | Firebase Auth (Google Sign-In, Email/Password), role-based redirect | Centered card (max-w-md), full-width on mobile |

---

## 3. Client Portal Surface (Protected)

| Route | Page Name | Primary Purpose | Responsive Behavior |
|---|---|---|---|
| `/dashboard` | **Client Dashboard** | KPI tiles, recent orders list, zero-data empty state, quick action tiles | Responsive sidebar → mobile drawer; 4-card KPI grid → 2x2 → 1-col |
| `/orders` | **Orders & Wizard** | 4-step interactive order creation wizard + active orders list | Stepper indicator, service tile selector, form inputs, status list |
| `/projects-client` | **My Projects** | Client project progress, milestone timelines, approval actions | Project card list with progress bars and deliverable badges |
| `/media` | **Media Library** | Google Drive asset manager (images, videos, 3D, docs) | Thumbnail grid with filter chips, search, and download actions |
| `/chat` | **AI & Admin Chat** | Sutra AI Assistant with suggestion chips + human admin handover | Full-height chat interface, auto-scrolling message list, input bar |
| `/invoices` | **Invoices & Billing**| Payment history, invoices, status badges, payment methods | Tabular data desktop → card list mobile |
| `/profile` | **Client Profile** | Business details, logo upload, brand notes, account settings | Form grid with upload zones |

---

## 4. Admin Surface (Protected)

| Route | Page Name | Primary Purpose | Responsive Behavior |
|---|---|---|---|
| `/admin` | **Admin Dashboard** | Client directory, incoming leads, order tracking, AI conversation monitor, audit logs | Dense dashboard layout, data tables with horizontal scroll on mobile |

---

## 5. API Route Inventory

| Route | Method | Purpose | Auth Required |
|---|---|---|---|
| `/api/auth/session` | GET, POST | User session management and custom claim check | No / Token |
| `/api/chat` | POST | AI workflow classification & real-time chat responses | Yes |
| `/api/orders` | GET, POST | Fetch client orders or create a new order | Yes |
| `/api/inquiries` | POST | Submit public contact/lead inquiry | No |
| `/api/workflows` | POST | Trigger isolated service workflow runs | Yes (Admin/Client) |
