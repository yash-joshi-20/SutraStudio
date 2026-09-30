# Sutra Studio — Product Requirements Document

> Derived from two uploaded reference images (brand sheet + website/portal/app mockups) and your master prompt. **The existing codebase and UI prompt pack were not available here**, so page lists and features below come from the mockups and are **TO BE CONFIRMED** against the real project. Existing pages/routes must be preserved — no new pages should be added beyond what already exists or is explicitly required.

## 1. Overview

**Sutra Studio** is an AI-powered creative, design, development and digital-marketing studio. Tagline: *Ideas ◆ Design ◆ Development ◆ Growth*. Hero message: **"Tradition Meets Technology."**

The product has three surfaces:
1. **Marketing website** — presents 12 services, featured work and trust signals, and converts visitors into clients.
2. **Client portal (web)** — signed-in clients place orders, track projects, chat with an AI assistant, browse their media library and view invoices.
3. **Mobile app (iOS/Android)** — a companion to the portal (Google/email sign-in, home, orders, AI chat, projects). *Assumption: the app is Phase 2; this PRD fully specs the website + portal and lists app screens for alignment.*

## 2. Goals & Success Metrics

**Business goals**
- Generate qualified leads via "Get Started" and "Talk to AI Assistant".
- Let clients self-serve orders for any of the 12 services through a guided flow.
- Showcase premium work (image, video, 3D, 360°, interior, web) with cinematic, warm visuals.
- Reduce manual support through 24/7 AI chat.

**Success looks like** (no targets were supplied — suggested starting points)
- Visitor → "Get Started" click rate; order-wizard completion rate.
- Share of orders placed via portal vs. manual inquiry.
- Median AI-chat first-response time; support tickets deflected.
- Lighthouse performance ≥ 85 on mobile despite rich media.

## 3. Target Audience

- **Modern businesses / founders / SMEs** needing creative + technical work in one place (product ads, renders, websites, Meta ads).
- **Real-estate, interior, architecture and luxury-product brands** (evidenced by villa, perfume, interior and window-design imagery).
- **Existing clients** returning to track orders, download media, pay invoices.

They arrive wanting: "Can this studio make what I need, is it credible, and how fast can I start?"

## 4. Scope

### In Scope
- Public site: Home, Services, Studio, Projects, Pricing, About, Contact.
- Auth (Google + email), client dashboard, 4-step order wizard, My Orders, My Projects, Media Library, AI Chat, Invoices, Profile, Support.
- Admin workspace with role-based access (clients, orders, conversations, services/packages, deliverables, integrations, activity/errors) — **exact existing admin pages TBC**.
- Brand system across web (light + dark footer/CTA bands).

### Out of Scope (this version)
- Native mobile apps (web portal is fully responsive; app is Phase 2).
- Changing the existing payment implementation (document first — TBC).
- New MySQL/PostgreSQL databases (Firebase is the target).
- Automatic social-media publishing without approval.
- Multi-user team accounts, white-labeling, marketplace for freelancers.
- Multi-language UI.

## 5. Page-by-Page Requirements

| Page | Purpose | Key content / features | Primary action |
|---|---|---|---|
| **Home** | Introduce brand + convert | Hero ("Tradition Meets Technology") with video/play card, stats strip (500+ Projects Delivered, 200+ Happy Clients, 12 Creative Services, 24/7 AI Support), service grid, "More Than a Tool — A Creative Partner" trio (Creative + Technical Expertise, AI-Powered Efficiency, Business-Focused Solutions), filterable "Our Latest Creations", dark CTA band | Explore Services / Get Started |
| **Services** | Browse all 12 services | Category filter (All, Creative, Design, Development, Marketing, Automation), image-led service cards | Open a service → start order |
| **Studio** | Show team, process, AI approach | Story, process steps, tools | Get Started |
| **Projects** | Portfolio | Filter chips (All, Image, Video, 3D, Interior, Website, App, Marketing), cards with play / 360° badges, detail modal or page | View project → Get Started |
| **Pricing** | Set expectations | Starting prices per service, packages *(pricing content not supplied)* | Get Started |
| **About** | Credibility | Mission, values, stats | Contact |
| **Contact** | Inquiry | Form, email/phone, AI assistant entry | Send inquiry |
| **Sign in / Sign up** | Access portal | Google, Email | Sign in |
| **Dashboard** | Overview | KPI tiles (Total, In Progress, Completed, Pending Payment), recent orders list with status pills | New order |
| **Order Creation** | Place order | Step 1 Service (12 icon tiles) → 2 Details → 3 References (uploads/links) → 4 Confirm | Next / Submit |
| **My Orders / My Projects** | Track work | List + detail, status timeline, deliverables, revisions | Open order |
| **Media Library** | Access assets | Images, videos, files grid, download | Download |
| **AI Chat** | Instant help | Greeting, capability summary, suggestion chips ("Create a product image", "Make a 10 sec video", "Design an interior", "Build a website"), message input | Send message |
| **Invoices / Profile / Support** | Account admin | Invoice list + status, profile settings, support ticket/chat | Pay / Contact support |

**The 12 services:** Image Creation, Video Creation, 3D Modeling, 360 View, Interior Design, Window Design, Digital Marketing, Meta Ads Launcher, Website Development, Web App Development, Mobile App Setup, AI Automation.

## 6. User Flows

1. **Visitor → client:** Home → Services → service card → Get Started → Sign up (Google/email) → Order wizard → Confirm → Dashboard.
2. **Order tracking:** Dashboard → My Orders → order detail → review deliverable → request revision / approve → Invoices.
3. **AI assist:** Any page → Talk to AI Assistant → chat → suggestion chip → pre-filled order wizard.
4. **Inquiry without account:** Contact → form → confirmation email.

## 7. Content & Assets Needed

- Final logo files (horizontal, vertical, monogram, monochrome, watermark) — designs exist in the brand sheet; need SVG exports.
- Portfolio media per category (images, looping video, 3D/360° assets) with titles and client-approved descriptions.
- Service descriptions, deliverables and turnaround for all 12 services.
- Pricing/packages, testimonials, real stats (500+/200+ are mockup figures — confirm).
- Hero video and lotus-pattern background art.
- AI assistant system prompt/knowledge base (services, pricing, FAQs).

## 8. Non-Functional Requirements

- **Performance:** Fast LCP despite heavy media — lazy-loaded video/3D, optimized images, animations never block first paint.
- **Responsive:** 360px → 1920px; portal usable on mobile.
- **Accessibility:** WCAG AA contrast (note gold-on-cream needs care), keyboard focus, `prefers-reduced-motion` honored for GSAP/Framer animations.
- **SEO:** Per-page metadata, OG images, sitemap, structured data for Organization/Service.
- **Security:** Authenticated portal, per-client data isolation, file-upload validation.

## 9. Open Questions

- Is the mobile app in scope now or Phase 2?
- Which pages, APIs and admin features already exist in the codebase?
- Does a MySQL database exist, and what schema/data?
- Payments: what gateway/UPI-QR flow exists today?
- Which AI provider powers the chat, and should it hand off to a human?
- Are the stats (500+, 200+) real, and are prices public?
- Who fulfils orders — internal admin panel needed now, or manual ops at launch?


## 10. Additional Requirements from Master Prompt

**Data & storage**
- Firebase (Auth, Firestore, security rules) is the application database; existing MySQL, if any, is documented and migrated later — never deleted during documentation.
- Google Drive stores large media under per-client folders (Profile, Brand, Documents, Images, Videos, 3D, Projects, Deliverables); Firestore stores metadata/references only.

**Client**
- Register/login (email + Google where configured); brand-new empty workspace with zero orders; view services/packages; place orders after login; view own orders/status; chat with admin and AI (same workspace where supported); upload business info, documents, logo, reference images; track progress; download deliverables.
- **A client must never access another client's profile, orders, messages, documents, images, videos, assets, payments or project data.**

**Admin**
- See new clients, profiles, orders, project status, conversations (incl. AI threads where authorized); message clients; manage services, packages, orders, deliverables, payment status, automation, AI workflows, integrations, client assets and Drive assets; view activity and errors. RBAC enforced server-side and in Firestore rules.

**AI chat**
- Flow: requirement understanding → business classification → service classification → workflow selection → execution → deliverable → client review → admin review → final delivery.
- Each service (image, video, interior, 3D, 360, website, app, marketing, social media, automation) is an isolated workflow; unrelated workflows are never triggered; low-confidence classification triggers a clarifying question.

**Marketing automation**
- Track content states separately: *AI-generated*, *human-approved*, *published*. Publishing is manual/approved by default. Trending research, planning, captions, voice-over, scheduling and reporting are **future/TBC** unless found in the existing project.

**UI/UX**
- Clean premium **light** UI, minimal animation, no excessive glow/gradients, responsive on desktop/tablet/mobile, accessible contrast.

**Mobile**
- React Native/Expo (TBC timing) sharing the same backend: auth, dashboard, orders, chat, AI chat, notifications, deliverables, profile, service browsing.

**States**
- Empty: new client sees "No orders yet" with a service-browsing CTA. Error: upload failed, AI unavailable, payment failed — each with retry. Success: order placed, deliverable ready, payment verified.

**Acceptance criteria (samples)**
- A new client sees zero orders and cannot read any other client's data (verified by Firestore emulator rules tests).
- An AI request for "video" starts only the video workflow.
- Uploaded files land in the correct client's Drive folder and only metadata is in Firestore.
- No secret appears in client bundles.

## 11. Requirement Status (summary)

| Area | Status |
|---|---|
| Client portal, order wizard, AI chat (per mockups) | TO BE CONFIRMED vs existing |
| Firebase as target DB | PROPOSED/TARGET |
| Google Drive media storage | TO BE CONFIRMED (existing integration) |
| Payments | TO BE CONFIRMED (document existing) |
| Social publishing/Meta automation | FUTURE / TBC |
| Mobile app | FUTURE / TBC |

Full matrices (`REQUIREMENT_TRACEABILITY.md`, `PAGE_INVENTORY.md`, `API_INVENTORY.md`, etc.) need the real codebase — see `skill.md` §0.
