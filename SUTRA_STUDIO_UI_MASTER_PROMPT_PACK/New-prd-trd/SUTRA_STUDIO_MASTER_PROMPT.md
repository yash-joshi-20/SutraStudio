# SUTRA STUDIO: MASTER BUILD PROMPT (PRD + TRD + DESIGN)

Paste this whole file into your AI coding tool (Claude Code, Cursor, etc.) together with the brand sheet and mockup images. Everything below is **mandatory**. Where something is not stated, mark it **TO BE CONFIRMED** instead of inventing it.

---

## 0. HOW YOU (THE AI) MUST WORK

1. **Apply changes on top of the existing Sutra Studio codebase and existing UI.** Do not rebuild from scratch, do not redesign unrelated screens, do not delete existing pages, routes, data or MySQL tables. The existing UI stays visually the same; this prompt adds features, roles, flows, responsiveness and motion on top of it.
2. **Step 1: audit first.** Before coding, list existing routes, components, API routes, Firebase usage, n8n integration points and any MySQL usage. Reply with a short change plan (files to add, files to modify). Then build.
3. **Follow the design system in Section 9 and the motion rules in Section 10 forcefully.** If an instruction conflicts with a library default, the instruction wins.
4. If your tool has a frontend-design skill or UI component MCP, use it to build premium components, then restyle them strictly to the Sutra tokens.
5. Show only the changed files/sections with exact locations. No abstract standalone examples.
6. Never put secrets in client code. Never expose internal tooling names to clients (Section 5).
7. **The admin portal is a separate app that clients never see (Section 2.1), and the broken admin dashboard must be fixed first (Section 2.2).**
8. **Use the supplied logo files exactly as they are (Section 9, Logos). Never redraw, recolor or re-typeset the logo.**

---

## 1. PRODUCT SUMMARY

Sutra Studio is an AI-powered creative and digital studio selling **12 services**: Image Creation, Video Creation, 3D Modeling, 360 View, Interior Design, Window Design, Digital Marketing, Meta Ads Launcher, Website Development, Web App Development, Mobile App Setup, AI Automation.

Surfaces (all fully responsive, and the **mobile app (React Native / Expo) mirrors the same features**):
- Public website: **Home, Services, Pricing** (plus existing pages kept as they are)
- **Client Portal** (after login)
- **Admin Portal** (after login, role-based)

Business model: clients buy **monthly packages (plans)** or **individual services**, talk to the **Sutra AI** assistant to describe what they need, and receive finished work **only after admin approval**.

Tagline and brand idea: "Ideas, Design, Development, Growth" / "Tradition Meets Technology".

---

## 2. ROLES AND ACCESS (ROLE-BASED CONTROL)

Roles (final matrix **TO BE CONFIRMED**): `superAdmin`, `admin`, `editor`, `support`, `metaAdsManager`, `client`.

- **Admin has full control** over everything: clients, orders, approvals, plans, services, content, files, Meta Ads, users, settings.
- Each role gets explicit permissions (e.g. `orders.approve`, `plans.write`, `metaads.run`, `users.manage`, `files.upload`, `content.write`, `settings.manage`). Map roles to permissions in one config file.
- Enforce in 3 places: route middleware, server actions/API (server-side check every time), Firestore rules.
- Clients can only see their own data.
- After login a client goes to `/dashboard` on the client site. Staff sign in only on the separate admin app (Section 2.1).

### 2.1 ADMIN PORTAL IS A SEPARATE APP (HARD RULE)

The admin portal is **completely separate** from the client website and client portal. Clients must not know it exists.

- **Separate deployment and address:** run it as its own Next.js app on its own host (for example `admin.<domain>`, exact host **TO BE CONFIRMED**). It is **not** a route inside the public website. Remove any `/admin` route from the public/client app; on the public host `/admin` and `/admin/*` return a plain **404**.
- **No links anywhere:** no link, button, menu item, sitemap entry, robots entry, comment, API response or error message on the public site, client portal or mobile app may reference the admin portal. Admin app is `noindex, nofollow` and excluded from the sitemap.
- **Separate login:** its own login page and its own session cookie name. Only users with a staff role (`superAdmin`, `admin`, `editor`, `support`, `metaAdsManager`) can sign in. **No public sign-up** for admin; staff accounts are created or invited only by a `superAdmin`.
- **Clients can never enter:** a `client` account that tries the admin login gets the same generic "Invalid credentials" as a wrong password (no hint that the portal exists). Staff accounts are also blocked from the client login.
- **Server-side enforcement:** every admin page, server action and API route verifies the Firebase session AND a staff role on the server. Firestore rules for staff-only collections check the role claim. Never rely on hidden UI.
- Recommended hardening: 2-step verification for staff, optional IP allowlist, short session lifetime, audit log of every login and admin action.
- Shared code (types, permissions config, Firebase/Drive service modules) may live in a shared package; the **apps, deployments and sessions stay separate**.

### 2.2 ADMIN DASHBOARD CURRENTLY NOT WORKING: FIX FIRST

The existing admin dashboard does not work. **Before adding any new feature:**
1. Reproduce the failure and capture the exact error (browser console, network tab, server logs).
2. Find the root cause. Check, in this order: login/session creation, role claim and middleware guard (redirect loops), Firestore security rules (permission-denied), missing or malformed env vars (especially `FIREBASE_PRIVATE_KEY` newlines), Firebase Admin initialisation, collection names/queries that do not match the data, missing indexes, and client/server component or hydration errors.
3. Fix the root cause in the existing code (no workaround that bypasses auth or rules).
4. Report what was wrong, which files changed, and how you verified the dashboard now loads for each staff role and is blocked for clients.


---

## 3. PAGES AND HEADERS

### 3.1 Headers (keep both MINIMAL)

**Before login (public header):** Logo, Services, Pricing, "More" (opens existing pages: Studio, Projects, About, Contact), Log in, **Get Started** (primary button). Sticky; shrinks and gains a soft border on scroll.

**After login (app header):** Logo, notification bell, avatar menu (Profile, Plan & Billing, Support, Log out). Primary navigation lives in the **sidebar** (web) or **bottom tabs** (mobile). No marketing links after login. The first screen after login is the **Dashboard**.

### 3.2 Public pages
- **Home:** hero ("Tradition Meets Technology"), stats row, Why Sutra Studio, Our Services (12), Featured Work with filter chips, CTA band. All editable from admin Website Content.
- **Services:** all 12 services, category tabs (All, Creative, Design, Development, Marketing, Automation), "From $X" starting prices, each opens a service detail and "Get Started".
- **Pricing:** monthly **packages** (plans) plus a per-service "From" price table, FAQ, and CTA. Plans are loaded from the database and edited in admin (Section 6.2). Do not hardcode plan names, prices or quotas; seed placeholder plans only and mark them **TO BE CONFIRMED**.

### 3.3 Client Portal (after login)
Dashboard (KPI cards: Total Orders, In Progress, Completed, Pending Payment; recent orders), New Order (4-step: Service, Details, References, Confirm), My Orders and order detail, My Projects, Media Library, **Sutra AI chat**, Plan & Billing / Invoices, **Meta Ads** (connect and status), Profile, Support.

### 3.4 Admin Portal (separate app, see Section 2.1; not part of the public website)
Overview, Clients, Leads, **Orders and Approvals queue**, Services, **Plans / Packages**, Projects / Portfolio, Media / Files, Testimonials, FAQs, Website Content, **Meta Ads**, Workflow Runs (admin-only), Users and Roles, Settings, Audit Log.

Preserve all existing routes. Add only the routes this prompt requires.

---

## 4. PACKAGES, SERVICES AND CHAT (CLIENT SIDE)

- A client can **subscribe to a monthly plan**, **order individual services** (one-time, "From $X"), or both.
- Plans bundle services with monthly allowances (for example "X images, Y videos per month"; real values **TO BE CONFIRMED**). Usage is tracked per month and shown in the Dashboard (remaining allowance, renewal date).
- Before running any order, server checks: active plan/allowance or paid one-time order. If not covered, show upgrade/pay options.
- **Sutra AI chat:** the client describes the need in plain words. The AI asks only for missing details, creates an order draft, shows a summary, and on client confirmation submits it. The client sees friendly progress updates only.
- Payment provider for plans and invoices: **TO BE CONFIRMED**. Build behind a `payments` service module so the provider can be swapped.

---

## 5. CORE FLOW: ORDER, HIDDEN WORKFLOW, ADMIN APPROVAL, DELIVERY

The **n8n workflows are already running and their APIs already exist. Reuse them.** The client must **never know** about the workflows, models, prompts or automation tooling (white-label).

### 5.1 Flow
1. Client submits an order (form or AI chat).
2. Server validates, checks plan/payment, creates the order, stores reference files in Drive.
3. Server calls the matching **per-service workflow** (isolated per service: image, video, interior, 3D, 360, website, app, marketing, social). Server-side only, with a secret.
4. Workflow writes draft outputs to Drive **staging** folder (`_Drafts`, admin-only) and calls back a signed webhook on our server.
5. Order moves to **Awaiting Admin Approval**. Admin sees the drafts in the Approvals queue and can **Approve**, **Edit then Approve**, or **Reject / Request regeneration** (re-triggers the workflow, with an internal note).
6. On **Approve**: outputs are moved/copied to the client's `Deliverables` folder, order becomes Completed, client gets in-app + push/email notification.
7. Client can **view, download (single or zip) and share** the deliverables. Sharing uses **our own expiring, revocable share links** (never raw Drive links).

### 5.2 Statuses
Internal: `submitted`, `queued`, `workflow_running`, `awaiting_approval`, `revision_requested`, `approved`, `delivered`, `failed`.
Client sees only: **In Review**, **In Progress**, **Completed** (and a generic "We're on it" for failures). Mapping: `submitted/awaiting_approval/revision_requested` shows In Review, `queued/workflow_running` shows In Progress, `approved/delivered` shows Completed. Failures notify admin only.

### 5.3 White-label rules (hard rules)
- The words n8n, workflow, webhook, node, LLM, model names, prompt, agent must **never appear** in client UI, client API responses, page source, network responses, emails or error messages.
- Workflow URLs, IDs, run logs, prompts and secrets exist only on the server and in the admin-only **Workflow Runs** view.
- Draft outputs are never reachable by clients before approval (Firestore rules + server checks + separate Drive folder).
- Client errors are generic and friendly; details go to server logs.

---

## 6. META ADS LAUNCHER

### 6.1 Client side
- Client opens **Meta Ads** in the portal and connects their Facebook assets (Page, Ad Account, optional Pixel) through the **official Meta authorization flow** (Facebook Login for Business / Business Manager access). **Never collect Facebook passwords.** If the client provides IDs manually, they request partner access to Sutra Studio through Business Manager.
- Client can see connection status, campaign status and a simplified, read-only results summary.

### 6.2 Admin side
- Admin with `metaads.run` (role `metaAdsManager`, `admin`, `superAdmin`) can create and launch campaigns **for a client** from the admin panel, using the client's connected assets, through the existing Meta Ads workflow.
- Ad creatives (images/video) come from the client's approved deliverables by default, following the same approval route as other outputs.
- Controls: budget caps, spend limit confirmation, explicit "Confirm launch" step, pause/stop, full audit log.
- Meta policy compliance: no misleading claims or restricted wording.

### 6.3 Security
- Meta tokens are encrypted at rest and stored server-side only (never readable by clients or by roles without permission). Rules deny all client access to the token store.

---

## 7. DATA ARCHITECTURE (TRD)

**Rule:** Firebase = auth + application data. Google Drive = heavy files. Never use Drive as a database. Connect them with stable Drive file IDs.

### 7.1 Firebase (Auth + Firestore)
- Auth: Google and Email/Password; server-verified sessions (httpOnly secure cookies); custom claims for role.
- Collections (adapt to existing): `users`, `clients`, `leads`, `plans`, `subscriptions`, `usage`, `orders`, `orderOutputs`, `approvals`, `workflowRuns` (admin-only), `metaConnections` (server-only, encrypted tokens), `metaCampaigns`, `chats`, `messages`, `notifications`, `invoices`, `services`, `projects`, `files`, `testimonials`, `faqs`, `siteContent`, `settings`, `auditLogs`.
- Security rules: default deny; clients read/write only their own records; admin collections need role + permission; public read only for published content; `workflowRuns`, `metaConnections`, `auditLogs` never readable by clients.

### 7.2 Google Drive (images, videos, large files)
```
/Sutra Studio
  /Website (Services, Portfolio, Images, Videos, Marketing, Documents)
  /Clients
    /{clientId}_{name}
      /References
      /Orders/{orderCode}/_Drafts        (admin-only staging)
      /Deliverables                      (client-visible after approval)
      /MetaAds
      /Invoices
  /Uploads
```
- Drive credentials server-side only; env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID`, plus workflow base URL and webhook secret (server-only), Meta app credentials, and encryption key for tokens.
- Drive auth method (Shared Drive + service account vs OAuth refresh token): **TO BE CONFIRMED**.
- Files are served through an authorized server route (session + permission check), streamed or via short-lived URLs. The browser never gets Drive credentials.
- Upload flow: validate type and size, verify Firebase session, verify permission, upload to the correct folder (resumable for large media), save `driveFileId` + metadata in `files`, return the reference, write audit log.

### 7.3 Stack
Next.js (App Router) + TypeScript, Tailwind CSS, Server Actions/API routes (separate Node/NestJS only if truly needed), Firebase, Google Drive API, existing n8n workflows (server-side), React Native/Expo for mobile. Hosting **TO BE CONFIRMED**.

### 7.4 Quality
Typed error classes, retries with backoff for Drive/workflow calls, structured logs, audit logs for admin actions, Firestore export backups, emulator tests for rules, upload/download tests, admin security tests (including IDOR checks).

---

## 8. RESPONSIVE WEB AND MOBILE APP PARITY

- Website is **mobile-first and fully responsive** (360, 390, 768, 1024, 1280, 1536). No horizontal scroll. Touch targets at least 44px. Safe-area padding on mobile.
- The **Expo mobile app** has the same capabilities for clients: sign-in (Google/Email), Home, Orders, New Order, Sutra AI chat, Projects, Media Library, Plan & Billing, Meta Ads connect/status, notifications (push), download and share.
- Same Firebase project, same server APIs, same roles and statuses. No logic duplicated in a way that can drift.
- Mobile layout: bottom tabs (Home, Orders, AI Chat, Projects, More). Admin portal is web-first and responsive; admin on mobile is allowed for approvals and notifications.

---

## 9. DESIGN SYSTEM (MANDATORY, FOLLOW STRICTLY)

**Tone:** premium, calm, warm. Light UI by default. Dark only for logo-on-dark, media overlays and the closing CTA band. No neon, no heavy glow, no loud gradients on UI surfaces (gradients only inside the logo artwork).

**Colors:** Saffron Gold `#D4A35A` (primary accent), Deep Brown `#5C3A1E` (primary buttons, secondary), Charcoal Black `#0F172A` (text), Warm Sand `#F8F5EF` (page background), Lotus Cream `#FFFDF9` (cards, surfaces). Derived (confirm): muted `#64748B`, border `#EFE3CE`, soft gold `#FBF3E4`, success `#2E9E6B`, warning `#D98A1F`, danger `#C2410C`. Use Deep Brown for small gold-family text to keep AA contrast.

**Typography:** use ONE normal, clean sans-serif everywhere: **Inter** (fallback Geist Sans, then system-ui). Do **not** use Playfair Display or any serif/decorative font for headings, hero, buttons or body. Headings use Inter weight 600-700 with slightly tight letter-spacing. (Only the logo artwork keeps its own lettering, because it is an image/SVG.) H1 56-64px desktop / 36-40px mobile; H2 36-40px; body 16px/1.6; eyebrow labels uppercase with letter-spacing. Tagline lockup: `IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH`.

**Layout:** 4px base spacing; container max about 1200-1280px; radius cards 16px, inputs 12px, buttons and chips pill; very soft warm shadow `0 4px 20px rgba(92,58,30,0.06)`.

**Components (reuse the existing ones, restyle if needed):** pill primary button (Deep Brown fill, cream text, trailing arrow), gold secondary, outline/ghost; minimal header; sidebar with soft gold active state; service card (image, name, tagline, arrow) and capability card (centered text, gold "From $X", selected = gold border + soft gold fill); project card with play/360 badge; KPI card; order row with status chip; stepper; chat window with logo avatar, quick prompts, round gold send button; data tables with search/filter/sort/pagination; toasts, skeletons, empty states.

**Logos (use exactly):** use the files in the supplied `logo/` folder: `sutra-logo-horizontal`, `sutra-logo-vertical`, `sutra-mark`, `sutra-monogram`, `sutra-logo-horizontal-dark` (on dark), `sutra-logo-horizontal-black`, `sutra-logo-monochrome-black`, `sutra-logo-monochrome-white` (video/dark), `sutra-app-icon`, `sutra-social-icon`, `sutra-favicon`. Prefer the `svg/` versions on web; use `png-transparent/` (@4x) where SVG is unsuitable. Header: horizontal logo on light, white monochrome on dark. Mobile splash/welcome: vertical logo. Favicon and app icon: the supplied icon files. Do not type the wordmark in a font, do not stretch, recolor or add effects.

**Imagery:** warm golden-hour architecture/interiors, isometric illustrated service thumbnails on cream, thin rounded line icons in gold/brown, faint lotus/mandala line art at low opacity. Use the full logo set (horizontal, vertical, dark, white, mono, app icon, favicon, social icon, monogram, watermarks).

---

## 10. MOTION AND ANIMATION (MANDATORY FOR PREMIUM LOOK)

Use **Motion (Framer Motion)** for component transitions and **GSAP + ScrollTrigger** for scroll storytelling; optional **Lenis** for smooth scrolling on public pages. Animations must feel premium, calm and precise, never flashy.

**Public pages (Home, Services, Pricing)**
- Hero: headline reveals line by line (masked slide-up), subtext and buttons fade-up in sequence, hero image has gentle parallax, lotus watermark drifts slowly.
- Stats: count-up when they enter the viewport.
- Service cards: staggered reveal (60-80ms stagger), soft lift on hover with image zoom 1.03.
- Featured Work: scroll-linked reveal; on desktop an optional pinned horizontal scroll; on mobile a normal swipe carousel.
- Pricing: plan cards rise in sequence; highlighted plan has a subtle gold border shimmer once on enter; billing toggle (if any) animates smoothly.
- Header: shrink + blur-free border fade on scroll; smooth anchor scrolling.
- CTA band: lotus mark parallax, button hover fill sweep.
- Page transitions: short fade/slide between routes.

**Portals (functional motion only)**
- Layout/list transitions (Motion `layout`), AnimatePresence for modals, drawers, stepper steps (slide 24px + fade), toast spring, chat message spring-in, skeleton shimmer, KPI count-up on first load, status chip color transitions, button press feedback.

**Rules**
- Animate only `transform` and `opacity`; keep 60fps. Duration 300-700ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`, stagger 60-80ms.
- Load GSAP/ScrollTrigger only on pages that use them (code split). No continuous looping animation except skeleton and very slow watermark drift.
- Mobile: reduce parallax, no pinning, simpler reveals. Mobile app uses Reanimated-style subtle transitions.
- Respect `prefers-reduced-motion` everywhere (disable parallax, count-up and pinning; keep opacity fades).
- No heavy glow, no big blur effects, no layout shift from animation.

---

## 11. SECURITY CHECKLIST (SUMMARY)

Authentication on all protected routes; server-side permission checks on every action; role claims; Firestore rules default deny; input validation (Zod) and file validation; sanitized filenames; CSRF protection; rate limiting and bot protection on forms, auth and chat; encrypted Meta tokens; signed, verified workflow callbacks (HMAC); admin and portal `noindex`; security headers (CSP, HSTS, X-Frame-Options); audit logs for approvals, uploads, role changes, settings and Meta launches; no secrets in client bundles or Git.

---

## 12. BUILD ORDER

1. Audit existing code and send the change plan.
1a. **Fix the broken admin dashboard (Section 2.2) and split the admin portal into its own app (Section 2.1).**
1b. Replace logos with the supplied files and switch all fonts to Inter.
2. Tokens, fonts, base components and responsive layout fixes (keep existing UI).
3. Two headers (before/after login) and routing/middleware by role.
4. Firebase Auth, roles, rules.
5. Plans, subscriptions, usage and Pricing page (data-driven).
6. Orders, 4-step creation, Sutra AI chat creating drafts.
7. Server-side workflow connector and signed callback, staging folder, status mapping, white-label guard.
8. Admin Approvals queue (approve, edit, reject/regenerate) and delivery to client (download, share links, notifications).
9. Drive upload/stream layer and Media Library.
10. Meta Ads connect (client) and launcher (admin) with caps and audit log.
11. Remaining admin modules (Clients, Leads, Services, Plans, Projects, Media, Testimonials, FAQs, Content, Users, Settings, Audit Log).
12. Motion layer (Section 10), then Expo mobile app parity.
13. Performance, accessibility and security tests, then deployment.

---

## 13. ACCEPTANCE CHECKLIST

- [ ] Existing UI and routes preserved; changes applied on top of existing code.
- [ ] Admin portal is a separate app/host; `/admin` is a 404 on the public site; no admin link anywhere; clients cannot log in to it; admin dashboard loads and works for every staff role.
- [ ] Only Inter is used (no serif); logos match the supplied files exactly.
- [ ] Site and portals fully responsive; mobile app has the same client features.
- [ ] Two minimal headers; dashboard is the first screen after login.
- [ ] Client can buy plans or individual services and chat with Sutra AI.
- [ ] No mention or leak of workflows/models anywhere on the client side (UI, source, network, emails).
- [ ] Outputs reach clients only after admin approval; download and share work; share links expire and can be revoked.
- [ ] Meta Ads: client connects assets safely, admin launches campaigns with role permission, caps and audit log.
- [ ] Small data in Firebase, images/videos in Google Drive, linked by file IDs; no Drive credentials on the client.
- [ ] Design tokens, fonts and components match Section 9; motion matches Section 10 and respects reduced motion.
- [ ] Role-based control verified (including IDOR tests); admin has full control.

---

## 14. OPEN QUESTIONS (DO NOT INVENT, ASK OR MARK TO BE CONFIRMED)

- Plan tiers, prices, monthly allowances; payment provider and currency/tax.
- Final role and permission matrix.
- Meta authorization approach (OAuth flow vs partner access) and spend-limit policy.
- Workflow callback contract per service (payload, output file naming).
- Drive auth method (Shared Drive vs OAuth), file size and type limits.
- Notification providers (push, email).
- Share link policy (expiry, password, watermark).
- Content for Studio, Projects, About, Contact and exact order "Details" fields per service.
