# SUTRA STUDIO — SERVICE CATALOG, SIMPLE PRICING & SPA NAVIGATION QA REPORT

## Overview
This document audits and confirms the full implementation of the **Service Catalog, Simple Pricing & SPA Navigation Fix** conforming to Next.js 16 App Router standards, warm-ivory design tokens, and server-side pricing integrity. Every price quoted below was machine-verified against the canonical catalog (`src/config/services.ts` / `src/config/packages.ts`) on 2026-10-13.

---

## 1. Step-by-Step Implementation Verification

### Step 1 — Homepage Pricing Removal
- **Homepage ([src/app/HomeClient.tsx](file:///d:/SutraStudio/src/app/HomeClient.tsx)):**
  - Dedicated pricing card matrix and package tiers removed from the homepage.
  - Service section ends with a clean CTA band routing to `/services` ("Read More: Full Services Catalog") and `/contact` ("Request a Quote" / "Talk to the Studio"). Zero `href="/pricing"` links remain on the homepage (Navbar, Footer and Mobile Bottom Nav included).
  - The `/pricing` reference page itself is preserved and unchanged.
  - Central backend pricing models in `@/config/services` kept intact.

### Step 2 — Customer-Centric Service Catalog Redesign
- **Services Catalog ([src/app/(public)/services/page.tsx](file:///d:/SutraStudio/src/app/%28public%29/services/page.tsx))** renders from the new presentation-only group catalog **[src/config/serviceGroups.ts](file:///d:/SutraStudio/src/config/serviceGroups.ts)** — 5 real buying-intent groups, zero stored prices:
  - **A. Logo & Brand Design**: Brand Identity Starter (`brand-identity-starter`).
  - **B. Advertising Images & Graphics**: Branded social images, basic template graphics, AI product creatives, banner/cover design, 5-slide carousels, image clean-up, caption copywriting (7 entries).
  - **C. Video & Reels**: 30s promotional reels, AI product reels, 10s template video edits (3 entries).
  - **D. 3D, Interior & 360°**: 3D models, renders from existing models, 10s animations, interior visualization views, single-room starter, floor plans, facade renders, 360° tours (9 entries).
  - **E. Website & Digital Services**: Landing page, 5-page business site, e-commerce, web/mobile app prototypes, content calendar, trend research, social media management, Meta Ads management, SEO (10 entries).
  - Only services the canonical catalog actually offers are listed; unknown group slugs are dropped at module load, so the grouping can never invent a deliverable or a price.

### Step 3 — Simple, Transparent Pricing
- **Single Source of Truth**: UI prices resolve from `@/config/services` / `@/config/packages` at render time. `serviceGroups.ts`, `ServicePurchasePanel.tsx`, the catalog cards and `MasterOrderForm.tsx` all hold **zero local price copies** — the MasterOrderForm intake option lists are derived from the canonical catalog at module load.
- **Verified Deliverables & Rates (canonical, machine-checked)**:
  - Basic Template Image — ₹99 each · Basic Image Pack (3) — ₹249
  - Branded Social Image — ₹199 each · Packs: 3 for ₹499 · 5 for ₹799 · 10 for ₹1,499
  - AI Product Creative — ₹299 each · Banner & Cover Design — ₹299 · Carousel (5 slides) — ₹499 · Caption & Hashtags — ₹99 · Product Image Cleanup — ₹199
  - Basic Template Video (≤10s) — ₹199 each · 3-edit pack — ₹499 · Promotional Reel (15–30s) — ₹499 · Reel packs: 3 for ₹1,299 · 5 for ₹1,999 · 10 for ₹3,499 · AI Product Reel — ₹799
  - Simple 3D Model — from ₹2,999 · 3D Render from Model — ₹999 each · 3D Animation (≤10s) — ₹4,999
  - Digital 360° Tour (supplied panoramas) — from ₹2,999 · Local 360° Capture + Tour — from ₹7,999
  - Basic Interior Visualization — ₹1,499 per view · Single-Room Starter — ₹4,999 · 3D Floor Plan — ₹1,499 · Facade/Elevation Render — ₹1,999 per view
  - Landing Page Starter — ₹4,999 · Business Website (≤5 pages) — ₹14,999 · Starter E-Commerce — ₹19,999 · Web App Prototype — ₹19,999 · Mobile App UI Prototype — ₹9,999
  - 30-Day Content Calendar — ₹999 · Trending-Topic Research — ₹1,499 · Social Media Management — ₹9,999/month · Meta Ads Management — ₹4,999/month · SEO Starter — ₹4,999/month
  - Monthly retainers: Daily Trend Creator ₹19,999/mo · Growth Trend ₹14,999/mo · Starter Trend ₹9,999/mo
- **Quantity semantics**: cards, detail pages and the order form offer 1/3/5(/10) pack options and a per-unit stepper; packs multiply by *number of packs* (`computeItemTotal`), the live total is always shown before checkout, and the `qty` deep-link (`/orders?...&qty=N`) is honoured end-to-end.
- **Server-side validation**: `POST /api/orders` resolves every submitted ID against the canonical catalog (`resolveCatalogItem`: packages → services → seed catalog), rejects unknown/inactive IDs, enforces integer quantity 1–100, recomputes `unitPrice × quantity` and rejects any client-stated total that deviates by > ₹0.01 (forged-price guard). Verified live: tampered `totalAmount: 1` → HTTP 400 "Security Error: Forged or tampered price detected".

### Step 4 — Clean Service Card Design
- Minimalist editorial design matching Sutra Studio warm-ivory tokens (`#FAF9F5`, `#FFFDF9`, `#5C3A1E`, `#D4A35A`); official logo/lotus marks unchanged.
- "Verified price" badge paired with an explicit price-kind label ("Starting at" / "Fixed price" / "Price per unit" / "Bundle price" / "Monthly").
- Clear "Studio Sample" watermark on all preview media.
- Scope, SLA turnaround, revision policy and inclusions clearly rendered; detail modal + direct Order CTAs with pre-filled service and quantity.

### Step 5 — Single-Page Application (SPA) Navigation
- **Shared chrome**: `Navbar`, `Footer` and `MobileBottomNav` now render once from `src/app/(public)/layout.tsx`; all 12 public pages + homepage were stripped of duplicate chrome imports (verified: exactly one `<header>`, one `<footer>`, one bottom nav in rendered HTML).
- **Full-page reload sources eliminated**: `window.location` navigation replaced with `router.replace`/`router.push` + `router.refresh()` in:
  - `src/lib/auth/authContext.tsx` (logout → `/login`)
  - `src/app/(auth)/login/page.tsx` (4 redirect sites: already-signed-in, email sign-in, register, Google sign-in)
  - `src/app/admin/login/page.tsx` (2 redirect sites)
  - `src/app/(client)/dashboard/page.tsx` (Repeat Order → `/orders?...`)
  - Sole exemption: `src/lib/sync/syncService.ts` notification-click handler runs outside the React tree (system notification entry point) and intentionally performs a top-level navigation.
- Browser history, back/forward (services modal keeps its `popstate`/`hashchange` deep-link handling), and protected client/admin routes all preserved.
- `MobileBottomNav` guest tabs restored to exactly 5 (Home · Services · Work · Contact · Sign In), each ≥ 44×44px.

### Step 6 — Dynamic Service Detail Pages
- One reusable server component: `src/app/(public)/services/[slug]/page.tsx` (async `params` per Next 16).
- `generateStaticParams` derives every active canonical slug; `generateMetadata` provides per-service titles.
- **404 contract verified live**: `/services/branded-image-pack-5` → 200 · `/services/basic-template-image` → 200 · `/services/not-a-real-service` → 404 · `/services/workflow-automation` (inactive) → 404 · legacy alias `/services/img-creation` → 307 redirect to canonical slug.
- Purchase panel shows verified price, quantity/pack options resolved to real canonical SKUs, live total, and an Order CTA carrying the SKU + quantity; specs (audience, formats, client inputs, 5-step process, exclusions, sample disclaimer) rendered from `getServiceDetailSpec`.
- The legacy `next.config.ts` rewrite `/services/:slug → /services?service=:slug` was **removed** so the real route serves it; `scripts/test-service-detail-routes.mjs` updated to assert the route file, `notFound()` and the rewrite's absence.
- `/sitemap.xml` now lists every active service detail URL.

### Step 7 — Preserved Architecture (Regression Check)
- Official Sutra Studio branding & Lotus symbol untouched.
- Firebase Auth, admin custom claims, route guards and Firestore multi-tenant isolation untouched (security acceptance suite 59/59).
- UPI QR payment flow intact: MasterOrderForm still posts canonical `serviceId`/`tierId` + `quantity` + stated total; `PaymentModal` amount = canonical `orderAmount`; UPI submit/verify/reject endpoints unchanged (payment suite 41/41).
- Google Drive streaming, media vault, portfolio, 3D/360° viewers untouched.
- **MasterOrderForm canonical fix**: intake service/package options and their prices are derived from the canonical catalog; deep-linked slugs (e.g. `/orders?service=branded-image-pack-5`) resolve to the canonical SKU instead of being silently coerced to `img-creation`; `package.tierId` now always equals the item actually being ordered (previously services-mode orders sent the retainer tier and could not pass the server price guard); one-time packs honour the quantity stepper; monthly retainers stay single subscriptions.

---

## 2. Verification & Build Results (executed, not asserted)

| Command | Result |
|---|---|
| `npm run typecheck` (tsc --noEmit) | **0 errors** |
| `npm run lint` | **0 errors** (1013 pre-existing warnings, all `no-explicit-any`/unused-var style) |
| `npm run test:catalog` | **125 / 125 passed** (canonical prices, aliases, currency, validators) |
| `npm run test:services` | **28 / 28 passed** (domains, specs, guardrails, deep-linking, `[slug]` route, CTAs, sample labels) |
| `npm run test:orders` (live dev server) | **48 / 48 passed** (retainer pricing, pack pricing, quantity multipliers, forged-price rejection, unknown/inactive ID rejection, idempotency, snapshot immutability) |
| `npm run test:responsive` (Playwright) | **44 / 44 passed** (320→1440px overflow, `/pricing` readability, `/services?service=image-creation` modal deep-link, 5 bottom-nav tabs, 44px touch targets, reduced-motion) |
| `npm run test:client-ownership` | **10 / 10 passed** (tenant isolation, protected route status codes) |
| `npm run test:admin-catalog` | **13 / 13 passed** (INR enforcement, audit logging, immutable order snapshots) |
| `npm run test:payments` | **41 / 41 passed** (UPI lifecycle, UTR single-use, tamper rejection) |
| `npm test` (typecheck + catalog + lint + env-protection + security acceptance) | **All passed** (security: 59/59) |
| `npm run build` (production) | **✓ Compiled successfully**, `/services` and `/services/[slug]` registered, `sitemap.xml` static |

Live route probes against the dev server: `/`, `/services`, `/services/<valid-slug>` → 200; `/services/<invalid>` & inactive → 404; alias slug → 307; `/sitemap.xml` → 200; `/orders` (guest) → 307 to `/login?returnTo=...` (auth gate preserved); `/login`, `/pricing` → 200. Homepage HTML: exactly 1 header, 1 footer, 1 bottom nav with exactly 5 guest tabs.

---

## 3. Notes & Known Behaviour
- `/orders` remains behind the client route guard; guests land on `/login?returnTo=/orders` and return to the prefilled order after sign-in (pre-existing protection, intentionally preserved).
- Dev-server order tests emit Firestore `RESOURCE_EXHAUSTED` and Drive-API-disabled warnings in this environment; both are pre-existing conditions handled by existing `try/catch` fallbacks — order creation still returns HTTP 200 and the pricing assertions are unaffected.
- The entire app renders its routes dynamically (`ƒ`) per the root segment configuration; `/services/[slug]` behaves identically and 404s invalid slugs at request time.
