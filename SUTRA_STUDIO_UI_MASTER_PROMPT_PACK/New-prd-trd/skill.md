# Sutra Studio: Build Playbook (skill.md)

A step-by-step playbook for building Sutra Studio. It follows `PRD.md` (what), `TRD.md` (how) and `design-system.md` (look). This is a plain document, not a Claude Skill file.

Rules for the whole build:
- **Preserve existing pages and routes** in the current codebase. Do not invent pages beyond the PRD and mockups.
- Apply changes directly to the existing code; do not rewrite unrelated parts.
- Keep the UI clean, premium and light. Minimal animation.
- Anything unknown stays marked **TO BE CONFIRMED** until the owner decides.
- Firebase = auth + dashboard backend + data. Google Drive = files only.

## 1. Prerequisites

**Accounts / services**
- Firebase project per environment (dev, staging, prod): Authentication (Google + Email/Password), Firestore, Admin SDK service account.
- Google Cloud project with the Drive API enabled; Drive auth method chosen (Shared Drive + service account, or OAuth refresh token). **TO BE CONFIRMED**
- Root Drive folder "Sutra Studio" created; its ID saved as `GOOGLE_DRIVE_FOLDER_ID`.
- n8n instance with one workflow per service (image, video, interior, 3D, 360, website, app, marketing, social).
- Hosting account (**TO BE CONFIRMED**, Vercel is the natural fit) and domain.
- Expo account for the mobile app (EAS builds).

**Local tooling**
- Node.js LTS, pnpm or npm, Git, Firebase CLI (emulators), Expo CLI.

## 2. Project Setup

1. Audit the existing codebase first: list routes, API routes, components and any MySQL usage. Record them (API inventory, page inventory) before changing anything.
2. If starting the Next.js app fresh:
   ```bash
   npx create-next-app@latest sutra-studio --typescript --tailwind --app --eslint
   cd sutra-studio
   npm i firebase firebase-admin googleapis zod framer-motion gsap
   ```
3. Folder structure:
   ```
   /app
     /(public)        home, services, studio, projects, pricing, about, contact
     /(portal)        dashboard, orders, projects, media, chat, invoices, profile, support, order/new
   (admin portal is NOT part of this app: separate app/host `admin.<domain>`, see Admin Separation below)
     /api             files, chat, webhooks
   /components        ui, marketing, portal, admin
   /lib               firebase, drive, n8n, permissions, validation, logger, errors
   /styles
   /types
   ```
4. Install design tokens: copy the Tailwind token block from `design-system.md` section 9 into `tailwind.config.ts`; load **Inter only** via `next/font` (no serif font).
5. Create `.env.local` from `.env.example` (variables in `TRD.md` section 9). Never commit real values.
6. Start Firebase emulators for Auth and Firestore for local development.

## 2b. Admin Separation (hard rule)

- Create the admin portal as a **separate Next.js app** (own repo folder or monorepo app, own deployment/host, own session cookie). Shared code only via a shared package.
- The public/client app has **no admin routes or links**; `/admin` returns 404. Admin is `noindex`, no public sign-up, staff accounts created by `superAdmin` only; client accounts are rejected with a generic error.
- Admin app structure: `/login`, `/` (overview), `/leads`, `/orders` (approvals), `/clients`, `/services`, `/plans`, `/projects`, `/media`, `/testimonials`, `/faqs`, `/content`, `/meta-ads`, `/workflow-runs`, `/users`, `/settings`, `/audit-log`.
- **First task:** the existing admin dashboard is broken. Reproduce, find the root cause (session/role guard, Firestore rules, env vars, queries, indexes), fix it, and verify per role before building anything new.

## 3. Build Order

Build in this order; finish and review each step before moving on.

1. **Foundation:** layout, tokens, fonts, global styles, Header, Footer, Button, Card, Chip, Input, Toast, Skeleton, EmptyState.
2. **Public pages (static first):** Home, Services, then Studio, Projects, Pricing, About, Contact using existing routes. Use placeholder content only where assets are missing, and mark it.
3. **Firebase Auth:** sign-in/up (Google + Email), session cookie, middleware route protection, role claims, `permissions.ts` map.
4. **Firestore data layer:** typed access in `lib/firebase/db.ts`, security rules, emulator tests.
5. **Lead capture:** contact form + "Get Started" create `leads` with validation and spam protection.
6. **Drive integration:** `lib/drive/*` (folders, upload, stream), `POST /api/files/upload`, `GET /api/files/[id]`, `files` metadata records.
7. **Admin dashboard modules** (in this order): Overview, Lead Management, Services, Projects/Portfolio, Media/Files, Testimonials, FAQs, Website Content, User/Admin Management, Settings. Wire public pages to read this content with ISR revalidation on publish.
8. **Client portal:** Dashboard, Order Creation (4 steps), My Orders, My Projects, Media Library, Invoices, Profile, Support.
9. **AI Chat + n8n:** `/api/chat` classifies the requested service, calls the matching isolated n8n webhook, stores messages, handles errors and retries.
10. **Mobile app (Expo):** Welcome/sign-in, Home, Orders, AI Chat, Projects, More; reuse Firebase project and server APIs.
11. **Interactive polish (last):** hero parallax, stat counters (GSAP), page/list transitions (Framer Motion), 360 viewer, video modals. Respect `prefers-reduced-motion`.
12. **Performance pass:** image optimization, lazy loading, code splitting, poster images.
13. **Security pass:** run the admin and file-access tests in section 5.
14. **QA pass, then deployment.**

## 4. Page-by-Page Build Notes

| Page / screen | Components needed | Notes |
|---|---|---|
| **Home** | Header, Hero (play button), StatsRow, WhyCards, ServiceGrid, FilterChips, ProjectCard, CTABand, Footer | Stats and featured work come from Website Content and Projects. Watch Demo opens a video modal. Heading: serif, "Tradition" gold-brown, "Technology" charcoal |
| **Services** | CategoryTabs (All, Creative, Design, Development, Marketing, Automation), ServiceCard grid | Category tabs filter client-side; cards driven by `services` collection; keep order from admin |
| **Studio / Projects / Pricing / About / Contact** | Existing components | Layouts not in mockups. Build from existing code; content **TO BE CONFIRMED** |
| **Client Dashboard** | Sidebar, KpiCard x4, OrderRow list | KPI counts computed from `orders`; status chips use design tokens |
| **Order Creation** | Stepper, ServicePicker (12 cards with "From $X"), details form per service, FileUploader, Confirm summary | Step 3 uploads go to `/Clients/{client}/References`; per-service Details fields **TO BE CONFIRMED** |
| **AI Chat** | ChatWindow, QuickPrompt chips, input | Streaming if supported by n8n; show recoverable error state |
| **Mobile Welcome** | Logo, Google/Email buttons | Firebase Auth with Google sign-in; deep link back to app |
| **Mobile Home** | QuickActionCard x4, ServiceRow, ProjectCard, BottomTabs | Greeting uses the signed-in user's name |
| **Admin modules** | DataTable, filters, forms, FileUploader, role-gated routes | Every action checks permission server-side and writes an audit log |

**Tricky details to flag early**
- `FIREBASE_PRIVATE_KEY` newline handling in env.
- Drive service accounts have no quota in personal My Drive; confirm Shared Drive vs OAuth before building uploads.
- Large video/3D uploads need resumable, streamed uploads with progress.
- Public portfolio media must not expose private Drive links; serve through a controlled route.
- Keep `noindex` on portal and admin.

## 5. Testing & QA Checklist

**Responsive:** 360, 390, 768, 1024, 1280, 1536 widths; no horizontal scroll; 44px touch targets.

**Key flows to click through**
- Visitor: Home, Services, Get Started, sign-up, Order Creation, confirmation.
- Contact form creates a lead; admin sees it and changes status.
- Client uploads a reference file; it lands in the right Drive folder; Firestore `files` record exists.
- Admin uploads a deliverable; client sees it in Media Library.
- AI chat routes a "make a 10 sec video" request to the video workflow.
- Publishing a project updates the public site.

**Firebase:** sign-in methods, session expiry/revoke, role claims, Firestore rules tests (allow and deny per role) via emulator.

**Google Drive:** upload (small/large), type and size rejection, download/view allowed for owner and authorized staff, blocked for others, missing-file handling.

**Admin security:** unauthenticated redirect, role escalation attempts, IDOR (another client's order/file), XSS/CSRF/injection, no secrets in client bundles, security headers present.

**Accessibility and performance:** keyboard navigation, contrast, reduced motion; Lighthouse targets **TO BE CONFIRMED**.

## 6. Deployment Steps

1. Set environment variables in the hosting provider (Firebase Admin, public Firebase config, Drive, n8n).
2. Deploy Firestore rules and indexes (`firebase deploy --only firestore`).
3. Create the first `superAdmin` user and assign the custom claim via a one-time script.
4. Deploy the Next.js app (production branch pipeline).
5. Build and submit the mobile app with Expo EAS (store listing assets, privacy policy).
6. Configure domain, HTTPS, security headers, and ISR revalidation hooks.

**Post-deploy checks**
- Contact form sends and creates a lead.
- Google and Email sign-in work on web and mobile.
- Images and videos load; Drive file proxy works; no private Drive links exposed.
- Admin dashboard blocked for non-admins.
- n8n webhooks reachable and secured.
- Backups/exports scheduled; logging and error monitoring active.

## 7. Future Enhancements

Items out of scope for this version, to revisit later:
- Payment gateway integration and automated invoicing (provider **TO BE CONFIRMED**).
- Migration of any legacy MySQL data into Firestore (documented first, never deleted).
- Additional AI workflows beyond the nine isolated service routes.
- Advanced analytics dashboard, client reviews, referral program.
- Separate NestJS/Node backend only if heavy processing requires it.
- Multi-language support.
