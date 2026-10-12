# SUTRA STUDIOS — MASTER IMPLEMENTATION PLAN

## Active Branch & Environment
- **Branch**: `feat/sutra-catalog-pricing-ui`
- **Default Branch**: `main`
- **Environment**: Development / Demo Mode (Mock fallbacks active for unconfigured external services)
- **Baseline Document**: [README.md](file:///d:/SutraStudio/docs/antigravity/README.md)
- **Audit Findings**: [AUDIT_REPORT.md](file:///d:/SutraStudio/docs/antigravity/AUDIT_REPORT.md)
- **QA Verification Report**: [QA_REPORT.md](file:///d:/SutraStudio/docs/antigravity/QA_REPORT.md)

---

## Execution Framework & Sequential Step Matrix

| Step | Title | Target Scope | Status | Verification Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Step 00** | **Architecture & Catalog Audit** | Full inspection of all services, pricing lists, discrepancies, routes, and security posture. Generate `AUDIT_REPORT.md`. | **COMPLETED** | `docs/antigravity/AUDIT_REPORT.md` generated, 0 code regressions, clean git status |
| **Step 01** | **Canonical Catalog Consolidation** | Reconcile `src/config/services.ts`, `packages.ts`, `pricing.ts`, `servicesData.ts`, `catalogData.ts`. Establish single source of truth for services & plans. Remove competing price lists. | **COMPLETED** | `npm run test:catalog` (125/125 PASS), `npm run typecheck` (0 errors) |
| **Step 02** | **Server-Side Pricing Integrity** | `/api/orders` & `/api/plans` server recalculation, block client tampering, immutable confirmed order snapshots. | **COMPLETED** | `npm run test:orders` (48/48 PASS), price spoofing & tamper rejection verified |
| **Step 03** | **Homepage Catalog & Pricing Alignment** | Align `HomeClient.tsx` with canonical categories, starting rates, and flagship Daily Trend Creator (₹19,999). | **COMPLETED** | `node scripts/test-homepage-pricing-ui.mjs` (20/20 PASS), `npm run typecheck` |
| **Step 04** | **Public Services Catalog & Details** | Update `src/app/(public)/services/page.tsx`, remove public automation promotion, align starter rates and modal specs. | **COMPLETED** | `npm run test:services` (28/28 PASS), deep-link & rewrite check |
| **Step 05** | **Public Pricing Page Alignment** | Update `src/app/(public)/pricing/page.tsx` with Retainer Tiers (Starter ₹9,999, Growth ₹14,999, Daily Trend Creator ₹19,999) and Per-Project packs. | **COMPLETED** | Tab separation, scope exclusions, CTA parameter verification |
| **Step 06** | **Client Dashboard & Quota Tracking** | Update `src/app/(client)/dashboard/page.tsx` to reflect active 30-day packages and commission scopes accurately. | **COMPLETED** | `npm run test:client-ownership` (10/10 PASS), paid-order gating verified |
| **Step 07** | **Client Order Wizard Reconciliation** | Update `MasterOrderForm.tsx` & `src/app/(client)/orders/page.tsx` to remove legacy hardcoded catalogs and use canonical catalog. | **COMPLETED** | Canonical catalog bindings, multi-step intake validation, `test:orders` PASS |
| **Step 08** | **Checkout & Payment Engine Alignment** | Verify UPI QR payments, draft confirmation `/orders/confirm`, amount display, UTR validation, zero client-trust rules. | **COMPLETED** | `npm run test:payments` (41/41 PASS), zero client amount trust |
| **Step 09** | **Admin Dashboard & Catalog Controls** | Update `src/app/admin/orders/page.tsx` and `AdminClient.tsx` to support canonical services, plans, and order displays. | **COMPLETED** | `npm run test:admin-catalog` (13/13 PASS), audit logs & ceiling enforcement |
| **Step 10** | **Comprehensive QA & Delivery** | Full regression run (`test:env`, `test:security`, `test:responsive`, `typecheck`, `lint`), route check, and generate `QA_REPORT.md`. | **COMPLETED** | `docs/antigravity/QA_REPORT.md`, 76/76 route & pricing assertions PASS, 0 errors |
| **Step 11** | **Global Pricing, Branding & UI Consistency Fix** | Remove pricing from hero sections, standardize professional service names, align chatbot knowledge & local fallback synthesizers, update budget options. | **COMPLETED** | `PRICING_AUDIT.md`, `test:catalog` (125/125 PASS), `test:orders` (48/48 PASS), `typecheck` (0 errors) |
| **Step 12** | **Master Client Experience & Central Pricing System** | Remove developer jargon across customer UI, unify knowledge bases (`aiKnowledgeService`, `ragLlmService`), audit WhatsApp Cloud API limitations, document central pricing. | **COMPLETED** | `docs/antigravity/CLIENT_LANGUAGE_AUDIT.md`, `test:catalog` PASS, `test:orders` PASS, `test:security` PASS |

---

## Step 00 to Step 12 Milestones Summary

- **Step 00 — Audit**: Completed with exhaustive 10-section audit report [AUDIT_REPORT.md](file:///d:/SutraStudio/docs/antigravity/AUDIT_REPORT.md).
- **Step 01 — Catalog**: Completed with single canonical source in `services.ts`, `packages.ts`, and `pricing.ts`. 125/125 unit tests passed.
- **Step 02 — Server Pricing**: Implemented authoritative server pricing calculation in `src/app/api/orders/route.ts` and `src/app/api/account/orders/repeat/route.ts`. Tampered totals rejected with HTTP 400.
- **Step 03 & 05 — Public UI**: Homepage and Pricing page aligned with 3 monthly retainers (Starter ₹9,999, Growth ₹14,999, Daily Trend Creator ₹19,999) and per-project packs.
- **Step 04 — Services Catalog**: Services page updated with 10 studio domains, 5-step daily production pipeline modal, and workflow automation concealed.
- **Step 06 — Client Portal**: Dashboard, Invoices, Orders, and Media Vault aligned with canonical packages, quota counters, and deliverable download gating.
- **Step 07 — Order Wizard**: MasterOrderForm bound directly to canonical catalog with exact turnaround and delivery specs.
- **Step 08 — UPI QR Payments**: Authenticated payment modal locked to authoritative order totals. UTR submission recorded as `pending_verification` (never auto-paid).
- **Step 09 — Admin Controls**: Admin catalog controls enforce strict ₹20,000 ceiling, INR currency, and audit logging.
- **Step 10 — QA Verification**: All tests passed: `npm run typecheck` (0 errors), `npx eslint --quiet` (0 errors), `test:catalog` (125/125), `test:orders` (48/48), `test:payments` (41/41), `test:responsive` (44/44), `test:services` (28/28), `test:security` (59/59), `test:env` (19/19), `test:admin-catalog` (13/13), `test:client-ownership` (10/10), `test:integrations` (40/40), and comprehensive route QA (76/76).
- **Step 11 — Global Consistency & Hero Cleanup**: Hero section starting prices removed. Service terminology standardized to professional names (*Commercial & Product Image Creation*, *Promotional Video & Reel Production*, *3D Product Modeling & Visualization*, etc.). AI chatbot knowledge bases & fallback synthesizers synchronized with canonical rates. Tested and verified.
- **Step 12 — Master Client Experience & Central Pricing System**: Eradicated internal developer jargon, model names, and prompt engineering references across the client-facing website and services catalog. Synchronized `aiKnowledgeService` and `ragLlmService` with canonical pricing and studio copy. Audited WhatsApp Cloud API integration and documented real-world mock/sandbox fallback status honestly in [CLIENT_LANGUAGE_AUDIT.md](file:///d:/SutraStudio/docs/antigravity/CLIENT_LANGUAGE_AUDIT.md). All test suites verified.
