# Sutra Studio: Product Requirements Document (PRD)

> Derived from: the Sutra Studio brand sheet, the website/app mockup sheet, the "Select Studio Capability" screenshot, and the updated Firebase + Google Drive technical stack. Anything not visible in those references is marked **TO BE CONFIRMED**. No pages have been invented beyond what the mockups show.

## 1. Overview

Sutra Studio is an AI-powered creative and digital studio ("Ideas, Design, Development, Growth") that sells 12 specialized services to modern businesses: image, video, 3D, 360 view, interior design, window design, digital marketing, Meta ads, website, web app, mobile app and AI automation.

The product has three connected surfaces:

1. **Public marketing website** that explains the studio, shows work, and drives visitors to "Get Started".
2. **Client portal (web + mobile app)** where a signed-in client creates orders, tracks projects, chats with the AI assistant, and gets their files.
3. **Admin dashboard** (Firebase-secured) where the studio team manages leads, services, projects, files, content and users.

Brand idea: **"Tradition Meets Technology"** (lotus-S logo, saffron gold on warm cream, premium and calm).

## 2. Goals & Success Metrics

**Business goals**
- Turn visitors into leads and orders (Get Started, Order Creation).
- Present the 12 services as one coherent studio rather than 12 separate vendors.
- Let clients self-serve: place orders, follow progress, access deliverables, pay invoices.
- Give the team one place to manage leads, content and files.
- Route each AI-chat request to the correct per-service workflow (n8n).

**Success looks like** (targets TO BE CONFIRMED)
- Visitors reach the Services page and start an order without help.
- A client can complete a 4-step order in one sitting on web or mobile.
- Admin can publish a project, answer a lead, and upload a file without developer help.
- Home stats shown in the mockup (500+ projects, 200+ clients, 12 services, 24/7 AI support) are backed by real, editable values in Website Content.

## 3. Target Audience

- **Business owners and marketing teams** needing visuals, video, websites or apps quickly.
- **Real estate, interior and architecture clients** (3D, 360 view, interior and window design).
- **Existing clients** returning to track orders, download media, and pay invoices.
- **Studio admins/staff** handling incoming leads and delivery.

## 4. Scope

### In Scope
**Public website:** Home, Services, Studio, Projects, Pricing, About, Contact (navigation shown in mockups), Get Started entry.
**Client portal (web):** Dashboard, My Orders, My Projects, Media Library, AI Chat, Invoices, Profile, Support, Order Creation flow.
**Mobile app (React Native/Expo):** Splash/Welcome with Google and Email sign-in, Home, Orders, AI Chat, Projects, More.
**Admin dashboard:** Overview, Lead Management, Services, Projects/Portfolio, Media/Files, Testimonials, FAQs, Website Content, User/Admin Management, Settings.
**Platform:** Firebase Auth + roles, Firestore data, Google Drive file storage, n8n service workflows behind AI chat.

### Out of Scope (this version)
- Any page or route not in the mockups or the existing codebase.
- Replacing or deleting any existing MySQL data (to be documented and migrated later, not removed).
- Using Google Drive as a database.
- Heavy 3D/glow effects on the interface (see design system).
- Payment gateway selection **TO BE CONFIRMED** (Invoices and "Pending Payment" appear in the dashboard, provider not shown).

## 5. Page-by-Page Requirements

### 5.1 Public website

| Page | Purpose | Key content / features | Primary action |
|---|---|---|---|
| **Home** | Explain the studio and convert | Header (Services, Studio, Projects, Pricing, About, Contact + "Get Started"); hero "Tradition Meets Technology" with Explore Services and Watch Demo; stats row (500+ Projects Delivered, 200+ Happy Clients, 12 Creative Services, 24/7 AI Support); "Why Sutra Studio" three cards (Creative + Technical Expertise, AI-Powered Efficiency, Business-Focused Solutions); Our Services grid of 12; Featured Work with filter chips (All, Image, Video, 3D, Interior, Website, App, Marketing) and video/360 badges; closing CTA band "Ready to Transform Your Ideas?" with Get Started and Talk to AI Assistant | Explore Services / Get Started |
| **Services** | Show all 12 services | Title "Our Services", "12 powerful creative and digital services", category tabs (All, Creative, Design, Development, Marketing, Automation), service cards with image, name, short tagline | Open a service / Get Started |
| **Studio, Projects, Pricing, About, Contact** | Present in navigation | Layouts not provided in mockups. Build from existing codebase; content **TO BE CONFIRMED** | Contact / Get Started |

**The 12 services (name, tagline, starting price shown in the capability screen)**

| Service | Tagline | From |
|---|---|---|
| Image Creation | Product, Ads, Mockups | $250 |
| Video Creation | Ads, Reels, Editing | $450 |
| 3D Modeling | Products, Spaces | $500 |
| 360 View | Virtual Tours | $600 |
| Interior Design | Spaces, Renderings | $650 |
| Window Design | Frames, Elevations | $350 |
| Digital Marketing | Strategy, Content | $800 |
| Meta Ads Launcher | Campaigns, Ad Creatives | $750 |
| Website Development | Landing Pages, Websites | $1,200 |
| Web App Development | Dashboards, Portals | $2,400 |
| Mobile App Setup | Android & iOS Apps | $2,800 |
| AI Automation | n8n, Workflows, Integrations | $950 |

Prices are from the supplied screenshot; keep them editable in Services Management (currency and tax display **TO BE CONFIRMED**).

### 5.2 Client portal (web)

| Screen | Purpose | Key content | Primary action |
|---|---|---|---|
| **Dashboard** | Overview of the client's work | Sidebar (Dashboard, My Orders, My Projects, Media Library, AI Chat, Invoices, Profile, Support); KPI cards: Total Orders, In Progress, Completed, Pending Payment; "My Recent Orders" list with thumbnail, service, order ID (e.g. #PRO-001), status chip (In Progress, Completed, In Review) | Open an order / New Order |
| **Order Creation** | Place a new order | 4-step stepper: Service, Details, References, Confirm; step 1 is a grid of the 12 services; Cancel and Next | Next / Confirm |
| **AI Chat** | Describe a need in plain words | "SUTRA AI, Your Creative Assistant" greeting; capability list; quick prompts (Create a product image, Make a 10 sec video, Design an interior, Build a website); message input | Send message |
| **My Orders / My Projects / Media Library / Invoices / Profile / Support** | Listed in sidebar | Detailed layouts not provided: **TO BE CONFIRMED** | per screen |

### 5.3 Mobile app (React Native / Expo)

| Screen | Content |
|---|---|
| **Splash / Welcome** | Logo, "Welcome, Creative Solutions for Modern Businesses", Sign in with Google, Sign in with Email, "Don't have an account? Sign up" |
| **Home** | Greeting ("Good Morning, [name]"), notification bell, avatar; quick cards New Order, AI Chat, My Projects, Media Library; Our Services row (View All); Recent Projects (View All) with status chips (In Progress, Completed); bottom tabs: Home, Orders, AI Chat, Projects, More |

### 5.4 Admin dashboard (modules): separate app

The admin portal is a **separate app and address** that clients cannot see or reach: no links to it anywhere on the website, client portal or mobile app; only staff roles can sign in; `/admin` is a 404 on the public site. The current admin dashboard is not working and must be fixed first.


1. **Dashboard Overview:** total, new, active and completed leads; recent activity; important notifications.
2. **Lead Management:** view, search, filter; status; details; contact info; service requested; notes; created and last-updated dates.
3. **Services Management:** add, edit, delete/deactivate; description; images; ordering.
4. **Projects / Portfolio:** add, edit; category; description; images; documents; publish/unpublish.
5. **Media / File Management:** upload, view, search, organize; link files to projects, services or leads; stored in Google Drive.
6. **Testimonials:** add, edit, delete, publish/unpublish.
7. **FAQs:** add, edit, delete, reorder.
8. **Website Content:** homepage, about, services, portfolio, contact information.
9. **User / Admin Management:** admin users, roles, permissions, access control.
10. **Settings:** website, contact, social links, integrations, Google Drive configuration, Firebase configuration.

The dashboard must be protected by authentication and role-based access control.

## 6. User Flows

1. **Visitor to lead:** Home, Explore Services, Services page, service card, Get Started, sign-up/sign-in, Order Creation. Contact form submissions create a lead in Firestore.
2. **Order creation:** Select Service (1 of 12), Details, References (upload files, stored in Google Drive), Confirm, order appears on Dashboard as In Review.
3. **AI chat to workflow:** client describes need, AI classifies the service, request is routed to that service's isolated n8n workflow (image, video, interior, 3D, 360, website, app, marketing, social), result or follow-up questions return in chat.
4. **Delivery:** admin uploads deliverable to the client's Drive folder, status moves to Completed, client sees it in Media Library.
5. **Invoice:** order with pending payment appears in Invoices; payment provider **TO BE CONFIRMED**.
6. **Admin lead handling:** new lead notification, admin reviews, updates status, adds notes, converts to client/order.

## 7. Content & Assets Needed

- Logo set (horizontal, vertical, dark, white, monochrome, app icon, favicon, social icon, monogram, watermarks) from the brand sheet, delivered as SVG/PNG.
- Real portfolio imagery and video per service (mockups use placeholders).
- Real stats, testimonials, FAQs, pricing details and legal pages.
- Studio, Projects, Pricing, About, Contact page copy.
- Demo video for "Watch Demo".
- Per-service order forms (the "Details" step fields differ by service): **TO BE CONFIRMED**.

## 8. Non-Functional Requirements

- **Performance:** fast first load; lazy-load portfolio media; video thumbnails with poster images.
- **Responsive:** mobile-first web; native mobile app for clients.
- **Accessibility:** WCAG AA contrast on gold-on-cream, visible focus, reduced-motion support.
- **SEO:** titles, meta, Open Graph, sitemap for public pages only; portal and admin are noindex.
- **Security:** authenticated, role-based admin; Drive credentials server-side only; file type/size validation.
- **Reliability:** logging, error handling, backups (see TRD).

## 9. Open Questions

- Payment provider and currency/tax handling for Invoices.
- Content and layout for Studio, Projects, Pricing, About, Contact, My Orders, My Projects, Media Library, Invoices, Profile, Support.
- Exact "Details" form fields for each of the 12 services.
- Roles list for admin (e.g. Super Admin, Editor, Support) and permission matrix.
- Whether the public site and client portal share one Next.js app and domain, or portal lives on a subdomain.
- Existing codebase details (routes, existing MySQL data) to be audited before migration.
- Per-client Drive folder naming and retention policy.
