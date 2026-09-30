# Sutra Studio — Build Playbook

## 0. Audit First (before any build)

The existing project was not available in this chat. Do this in **Claude Code inside the repo**, using your master prompt:
1. Inspect framework, routes/pages, components, APIs, Firebase config, Drive integration, payments, n8n, env vars, and any MySQL schema.
2. Read `SUTRA_STUDIO_UI_MASTER_PROMPT_PACK.zip` (MASTER_PROMPT, STEP_01–30, SVG references).
3. Generate `/docs`: PRD, TRD, API_INVENTORY, ENVIRONMENT_VARIABLES, REQUIREMENT_TRACEABILITY, PAGE_INVENTORY, IMPLEMENTATION_ROADMAP, DATABASE_MIGRATION_MAP, PROJECT_AUDIT.
4. Do **not** modify code, data, MySQL, or APIs until you approve. Preserve existing page count/routes.

The steps below assume a fresh build of the target architecture; adapt them to what the audit finds.

Companion to `PRD.md`, `TRD.md` and `design-system.md`. Follow in order.

## 1. Prerequisites

- Node.js 20+ LTS, pnpm (or npm), Git
- Accounts: Vercel (or existing host), **Firebase project (Auth, Firestore)**, **Google Cloud (Drive API + OAuth/service account)**, n8n instance, AI provider keys, payment gateway (existing), Sentry (optional)
- Domain + DNS access
- Brand assets exported as SVG: horizontal, vertical, monogram, mono black/white, watermark
- Fonts: Playfair Display + Inter (via `next/font`)

## 2. Project Setup

```bash
pnpm create next-app@latest sutra-studio --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd sutra-studio
pnpm add gsap @gsap/react framer-motion lenis lucide-react clsx tailwind-merge class-variance-authority
pnpm add react-hook-form zod @hookform/resolvers @tanstack/react-query
pnpm add firebase firebase-admin googleapis ai
pnpm add -D @firebase/rules-unit-testing firebase-tools
pnpm add three @react-three/fiber @react-three/drei   # 3D viewer, load lazily
pnpm dlx shadcn@latest init
```

**Folder structure** (see TRD §3): `src/app/(marketing)`, `(auth)`, `(portal)`, `api`; `src/components/{layout,brand,sections,ui,media,portal,motion}`; `src/lib/{firebase,drive,ai,workflows,validators}`.

**Design tokens** — extend Tailwind (`tailwind.config.ts` or `@theme` in CSS for v4):

```ts
colors: {
  saffron: '#D4A35A',
  brown:   '#5C3A1E',
  ink:     '#0F172A',
  sand:    '#F8F5EF',
  cream:   '#FFFDF9',
  line:    '#EADFCB',
},
fontFamily: { display: ['var(--font-playfair)'], sans: ['var(--font-inter)'] },
borderRadius: { card: '20px' },
boxShadow: { warm: '0 8px 30px rgba(92,58,30,0.08)' },
```

Register GSAP plugins once in a client util: `gsap.registerPlugin(ScrollTrigger, useGSAP)`.

## 3. Build Order

1. **Foundation** — fonts, tokens, globals (`bg-sand text-ink`), `Logo` component, `Button`, `Chip`, `Card`, `Navbar`, `Footer`, `Reveal` (Framer), `PageTransition`.
2. **Firebase** — create project, enable Auth (Google + email), create Firestore collections per TRD §6, write and deploy security rules, add emulator rules tests (client A cannot read client B), seed services/packages.
3. **Marketing pages (static first, no animation):** Home → Services → Projects → Pricing → About → Studio → Contact (form → `/api/inquiries` → Firestore `inquiries` + email notification, TBC provider).
4. **Auth** — Firebase Google + email sign-in, server-side ID-token verification, role custom claims, route guards, `users/{uid}` auto-create with empty workspace.
5. **Portal shell** — sidebar/topbar, Dashboard (KPI tiles + recent orders).
6. **Order wizard** — 4 steps with RHF + Zod; uploads to `references` bucket; creates `orders` row; confirmation email.
7. **Orders, Projects, Media Library, Invoices, Profile, Support** pages.
8. **Drive integration** — server-side Drive client, per-client folder creation, upload/download proxy with authorization, `assets` metadata in Firestore.
8b. **AI chat** — provider abstraction, classifier → workflow selector, isolated workflows with `workflowRuns` state, suggestion chips, admin visibility of threads.
9. **Animation pass** — GSAP hero timeline, parallax, stat counters, CTA drift, 360° scrub; Framer layout animations for filters, wizard, modals. Add reduced-motion fallbacks.
10. **Admin-lite** — update order status/upload deliverables (role-gated).
11. **Performance pass** — image optimization, lazy 3D/video, bundle analysis.
12. **QA pass** and **Deployment**.
13. *(Phase 2)* Expo mobile app reusing Firebase + the same API + shared Zod schemas.

## 4. Page-by-Page Build Notes

- **Home:** Hero = serif H1 with gold-gradient "Tradition" (`bg-clip-text`), arched photo with play card, stats strip (GSAP count-up), 12-card ServiceGrid, WhyPartner trio, FeaturedWork with `layoutId` filter chips, dark CTA band. *Gotcha:* split text for GSAP without breaking gradient clip — apply gradient on inner spans.
- **Services:** category tabs filter client-side; cards link to `/orders/new?service=slug` (redirect to sign-in if logged out, then resume).
- **Projects:** video cards use poster + lazy `<video>`; 360° cards open `Viewer360` modal. Prefer image-sequence scrubber for reliability.
- **Pricing/About/Studio:** content-driven; build from MDX or a `content/` folder until CMS is chosen.
- **Contact:** Turnstile + Zod; success state with Framer fade.
- **Dashboard:** server-fetch KPIs with a single grouped query; status pills from one mapping util.
- **Order wizard:** persist draft in URL/`sessionStorage` per step; keyboard accessible icon-tile radio group; `AnimatePresence` for step slide.
- **AI chat:** use `useChat`; autoscroll; persist threads; rate-limit per user.
- **Media Library:** signed URLs, virtualized grid if large, bulk download later.
- **Animation hygiene:** wrap GSAP in `useGSAP({ scope })`; never animate a property Framer also controls; call `ScrollTrigger.refresh()` after images/fonts load; if using Lenis, sync via `lenis.on('scroll', ScrollTrigger.update)`.

## 5. Testing & QA Checklist

- **Responsive:** 360, 390, 768, 1024, 1280, 1536+.
- **Flows:** visitor → Get Started → sign up → complete wizard → order appears on dashboard; inquiry form → email received; AI chat → draft order; download deliverable; RLS (client A cannot read client B's documents or Drive files).
- **Performance:** Lighthouse mobile ≥ 85, LCP < 2.5s, CLS < 0.1; check bundle size of GSAP/three chunks.
- **Accessibility:** keyboard-only pass, focus rings, contrast (gold usage), `prefers-reduced-motion`, alt text.
- **Cross-browser:** Chrome, Safari (iOS), Firefox, Edge; verify `backdrop-filter`, video autoplay, `background-clip:text`.

## 6. Deployment Steps

1. Push to GitHub; import repo in Vercel.
2. Set env vars (TRD §7) for Preview and Production.
3. Deploy Firestore rules/indexes to the production Firebase project; set authorized domains and Google OAuth redirect URLs; verify Drive API credentials.
4. Verify n8n webhook secrets and payment webhook signature validation.
5. Deploy `main`; attach domain.
6. **Post-deploy checks:** forms send, images/videos load, OAuth works, OG previews render, sitemap/robots reachable, Sentry receiving events, Firestore rules verified on prod.

## 7. Future Enhancements

- Expo mobile app (Home, Orders, AI Chat, Projects, More)
- In-portal payments and automated invoices
- Team accounts and roles per client
- Full admin/CRM and order assignment
- Multi-language support
- Live project comments/annotations on deliverables
- CMS (Sanity/Payload) for portfolio and pricing
