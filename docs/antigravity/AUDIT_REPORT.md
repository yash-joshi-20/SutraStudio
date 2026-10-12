# SUTRA STUDIOS — COMPREHENSIVE ARCHITECTURAL & CATALOG AUDIT REPORT

**Date of Audit**: 2026-10-12  
**Audit Stage**: STEP 00 — Dedicated Technical Audit  
**Active Branch**: `feat/sutra-catalog-pricing-ui` (switched safely from `main`)  
**Lead Engineer**: AI Senior Software Engineer  
**Repository Root**: `d:\SutraStudio`  
**Status**: AUDIT COMPLETE (Zero application code modified)

---

## 1. Executive Summary & Audit Context

Sutra Studios is currently in **development / demo mode**, providing creative technology and architectural visualization through on-demand disciplines and 30-day continuous creative pipelines. The core objective of this initiative is to reconcile **competing service catalogs and price lists** into **ONE canonical source of truth** adhering to the following strict business constraints:

1. **Flagship Monthly Retainer**: **Daily Trend Creator** at **₹19,999 for 30 days** (30 images + 30 short videos, 1 of each per day, daily trending-topic research, brand relevance review, customized prompts, production, captions/hashtags, content calendar, quality checks, organized delivery into Google Drive Vault, and 1 consolidated revision round per deliverable).
2. **Additional Retainer Tiers**:
   - **Starter Trend**: **₹9,999 for 30 days** (15 images + 15 short videos).
   - **Growth Trend**: **₹14,999 for 30 days** (20 images + 20 short videos).
3. **Hard Price Ceiling**: Every listed service, deliverable pack, and subscription tier must be **at or below ₹20,000**.
4. **Complex Projects**: High-scope deliverables (Full Web Applications, SaaS Dashboards, Enterprise Mobile Builds) must feature a clearly defined starter scope or require **Request a Quote**.
5. **Workflow Automation Discipline**: Workflow automation is strictly an **internal operational engine** (n8n, webhook pipelines) and must **NOT** be publicly promoted as a service on the homepage, public services catalog, or pricing page.
6. **Zero Client Trust on Pricing**: Prices and totals must never be trusted from client inputs. The server must recompute order totals from canonical catalog rates.
7. **Snapshot Immutability**: Historical confirmed, draft-locked, or paid order price snapshots must remain strictly immutable.
8. **Brand & Architectural Preservation**: Warm-ivory visual identity (`#FAF9F5`, `#FFFDF9`, `#0F172A`, `#D4A35A`, `#5C3A1E`, `#EADFCB`), vector logo suite, all existing URL routes, and non-SQL Firebase/Google Drive architecture must be preserved.

---

## 2. Git & Working Tree Verification

- **Default Branch**: `main`
- **Current Active Branch**: `feat/sutra-catalog-pricing-ui`
- **Working Tree State**: Clean; zero uncommitted modifications to existing code. Untracked documentation files isolated within `docs/antigravity/`.
- **Branch Protection Policy**: No reset, rebase, destructive migration, or overwrite of existing developer work.

---

## 3. Complete Route & Entry Point Inventory

The project comprises **43 Page Routes** and **67 API Endpoints** under Next.js 16 App Router:

### A. Public Atelier Pages (17 Pages)
- `/`: Main Studio Landing Page (Hero, Showcases, Services Grid, Process, Pricing Preview, FAQ, CTA)
- `/landing`: Alternative Studio Presentation
- `/services`: Comprehensive 12-Service Catalog with category filters and detail modals
- `/studio`: Studio Philosophy, Indian Sacred Geometry, Craftsmanship & Technology
- `/projects`: Curated Portfolio & Case Studies
- `/pricing`: Transparent Studio Investment (Per-project packages, 30-Day Retainers, FAQ)
- `/about`: Studio Leadership Story & Heritage
- `/contact`: Client Discovery Intake & Creative Briefing
- `/ai-agent`: Interactive Studio Concierge Overview
- `/chatbot-demo`: Interactive Client AI Demo Experience
- `/mobile-app`: Mobile App Showcase & Download Gate
- `/orders/confirm`: Dedicated Draft Order & Link Confirmation Workspace
- `/offline`: Service Worker Offline Fallback View
- `/privacy`: Privacy Policy & Data Governance
- `/terms`: Client Terms of Service & Commercial Usage Rights
- `/cancellation-refund`: Cancellation, Refund & Dispute Policies
- `/thank-you`: Post-Submission Intake Confirmation

### B. Client Portal & Workspace (11 Pages)
- `/login`: Secure Client & Admin Authentication Portal
- `/register`: Client Onboarding & Registration
- `/dashboard`: Client Workspace & Active Quota Tracking
- `/client-dashboard`: Alternate Client Analytics View
- `/client-form`: Dynamic Project Onboarding Intake
- `/orders`: Multi-Step Order Intake Wizard & Deliverable Approval Hub
- `/projects-client`: Deliverable Review, File Vault & Version History
- `/media`: Google Drive Media Vault Gallery & 3D/Video Previews
- `/chat`: Conversational Sutra AI Studio Assistant & Art Director Channel
- `/invoices`: Invoices, Receipts & Monthly Subscription Billing
- `/profile`: Client Organization Profile, Security & API Settings

### C. Admin Command Workspace (15 Pages)
- `/admin`: Centralized Executive Command Center (Operations Hub, Client Directory, Approvals, Chat Takeover, Site Control)
- `/admin/login`: Dedicated Admin Authentication Portal
- `/admin/orders`: Operations Order Management & Deliverable Staging Hub
- `/admin/ad-desk`: Automated Ad Creative Generation Desk
- `/admin/brand-guide`: Studio Brand Identity & Token Reference
- `/admin/chatbot`: Studio AI Prompt & Conversation Inspector
- `/admin/cms`: Content Management & Editorial Publishing
- `/admin/guidelines`: Studio Production Guidelines Deck
- `/admin/inquiries`: Lead & Inquiry CRM Pipeline
- `/admin/integrations`: Integration Health & Missing-Key Registry Monitor
- `/admin/knowledge-base`: Studio RAG Knowledge Base Editor
- `/admin/leads`: Prospect Lead Capture & Scoring
- `/admin/marketing`: Multi-Channel Marketing Dispatcher
- `/admin/outreach`: Client Outreach & Campaign Manager
- `/admin/provider-router`: Multimodal AI Provider Routing Matrix
- `/admin/reviews`: Deliverable Review & Approval Queue
- `/admin/submissions`: Client Brief Submissions Review

### D. Canonical & Internal API Endpoints (67 Handlers)
- **Authentication & Sessions**: `/api/auth/session`, `/api/auth/admin-login`, `/api/auth/client-login`, `/api/auth/logout`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/resend-verification`, `/api/auth/change-email`, `/api/auth/change-password`
- **Orders & Deliverables**: `/api/orders`, `/api/orders/drafts`, `/api/orders/drafts/confirm`, `/api/orders/status`, `/api/orders/review`, `/api/orders/deliver`, `/api/orders/cancel`, `/api/orders/comments`
- **Payments & Billing**: `/api/payments/create`, `/api/payments/submit-utr`, `/api/payments/verify`, `/api/payment/verify`, `/api/payments/refund`, `/api/payments/renew`, `/api/payments/extend-period`, `/api/payments/cancel-subscription`
- **Admin Management**: `/api/admin/catalog`, `/api/admin/clients`, `/api/admin/deliverables`, `/api/admin/inquiries`, `/api/admin/integrations`, `/api/admin/kpis`, `/api/admin/payments/pending`, `/api/admin/payments/verify`, `/api/admin/payments/reject`, `/api/admin/settings`, `/api/admin/storage-usage`, `/api/admin/ai-console`, `/api/admin/brand-profiles/sync`, `/api/admin/notification-settings`, `/api/admin/health/drive`
- **Google Drive Vault**: `/api/drive/files`, `/api/drive/folders`, `/api/drive/upload/token`, `/api/drive/upload/session`, `/api/drive/upload/complete`, `/api/drive/file/[fileId]`, `/api/drive/file/[fileId]/share`, `/api/drive/folder/[folderId]`, `/api/drive/validate-link`, `/api/drive/archive`
- **AI & Workflow Execution**: `/api/workflows`, `/api/chat`, `/api/chatbot`, `/api/n8n/dispatch`, `/api/n8n/orders`, `/api/n8n/subscriptions`, `/api/n8n/retry`, `/api/n8n/webhook`, `/api/daily-engine`, `/api/meta-ads/campaigns`, `/api/meta-ads/connect`
- **CRM, Inbound & Webhooks**: `/api/inquiries`, `/api/leads`, `/api/custom-projects`, `/api/quotes`, `/api/coupons`, `/api/inbound/webhook`, `/api/inbound/whatsapp`, `/api/inbound/email`, `/api/inbound/meta`, `/api/cron/agency-daily-promo`, `/api/cron/notifications`, `/api/cron/retainer-dispatch`, `/api/cron/retention`

### E. Query String Entry Points
- `/orders?service=[slug]` (e.g. `image-creation`, `video-creation`): Prefills service discipline in order wizard.
- `/orders?package=[id]` (e.g. `daily-trend-creator`, `standalone-image-5x`): Prefills package tier.
- `/orders?amount=[number]&ref=[code]`: Triggers direct payment modal for custom client quote.
- `/orders/confirm?orderId=[id]&token=[token]`: Loads verified draft order for client review & payment.
- `utm_source`, `utm_medium`, `utm_campaign`, `ref`: Captured and persisted into `sessionStorage` for attribution.

---

## 4. Discrepancy Matrix: Competing Catalogs Across the Codebase

The audit inspected **7 distinct catalog declarations** across the codebase and identified serious discrepancies in naming, pricing, and package quotas:

| Location | Services Declared | Retainer Plans Declared | Retainer Pricing | Standalone / Commission Pricing | Critical Discrepancies & Issues |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. `src/config/services.ts`** | 12 Services | None | N/A | Image: ₹2,499 (Header says ₹499)<br>Video: ₹4,999 (Header says ₹1,499)<br>3D: ₹2,499<br>360: ₹4,999 | Inconsistent header comments vs objects; Publicly exposes Discipline 12 (Workflow Automation) |
| **2. `src/config/packages.ts`** | N/A | 30-Day Growth<br>6-Month Growth | 30-Day: ₹9,999<br>6-Month: ₹53,999 | Standalone Image: ₹2,499<br>Standalone Video: ₹4,999<br>Commission Starter: ₹1,999<br>Commission Growth: ₹4,999 | 6-Month Plan at ₹53,999 violates ₹20,000 ceiling; Missing Daily Trend Creator (₹19,999) and Growth Trend (₹14,999) |
| **3. `src/config/pricing.ts`** | N/A | Re-exports `packages.ts` | ₹9,999 / ₹53,999 | Re-exports `packages.ts` | Inherits all discrepancies from `packages.ts` |
| **4. `src/data/servicesData.ts`** | Re-exports `services.ts` | None | N/A | Re-exports `services.ts` | Wrapper around `services.ts` |
| **5. `src/lib/services/catalogData.ts`** | 12 Services (SEED) | Enterprise Atelier<br>Starter Retainer<br>Growth Retainer | Enterprise: ₹59,999<br>Starter: ₹14,999<br>Growth: ₹29,999 | Image: ₹2,499<br>3D: ₹2,499<br>Web Dev: ₹9,999<br>Web App: ₹19,999<br>AI Auto: ₹4,999 | **Major Violation**: Plans at ₹59,999 and ₹29,999 violate ₹20,000 ceiling. Unlinked from `packages.ts` |
| **6. `MasterOrderForm.tsx`** | 6 Intake Services | Starter Creative<br>Studio Growth<br>Autonomous Retainer<br>Enterprise Retainer | Autonomous: ₹9,999<br>Enterprise: ₹24,999 | Starter Pack: ₹1,999<br>Studio Growth: ₹4,999<br>Visuals: ₹1,499<br>Product 3D: ₹2,499 | Private hardcoded list! Completely disconnected from canonical configs. Enterprise at ₹24,999 exceeds ceiling. |
| **7. `src/app/api/orders/route.ts`** | Uses `catalogData.ts` | Uses `catalogData.ts` | Validates against `SEED_CATALOG_PLANS` | Validates against `SEED_CATALOG_SERVICES` | If planId not found in `SEED_CATALOG_PLANS`, falls back to client `totalAmount`! |

---

## 5. End-to-End Service & Order Lifecycle Trace

```text
[User / Visitor]
       │
       ▼ (Selects Service or Retainer Plan)
[/, /services, /pricing] ──(query params: ?service= or ?package=)──► [/orders]
                                                                          │
                                                                          ▼ (Intake Brief & Uploads)
                                                                 [MasterOrderForm]
                                                                          │
                                                                          ▼ (POST payload)
                                                                 [/api/orders]
                                                                          │
                                        ┌─────────────────────────────────┴─────────────────────────────────┐
                                        ▼                                                                   ▼
                          [Lookup Canonical Item / Plan]                                      [Calculate Verified Total]
                                        │                                                                   │
                                        └─────────────────────────────────┬─────────────────────────────────┘
                                                                          ▼
                                                         [Save to OrdersStore & Firestore]
                                                            (Status: pending_payment)
                                                                          │
                                                                          ▼ (Presents Dynamic UPI QR)
                                                                   [PaymentModal]
                                                               (VPA: yashjoshi7355-1@okicici)
                                                                          │
                                                                          ▼ (Client submits UTR)
                                                              [/api/payments/submit-utr]
                                                            (Status: awaiting_confirmation)
                                                                          │
                                                                          ▼ (Admin reviews UTR)
                                                            [/api/admin/payments/verify]
                                                                (Status: paid, in_production)
                                                                          │
                                                                          ▼ (Generates Tax Receipt)
                                                                [/invoices & OrderReceipt]
                                                                          │
                                                                          ▼ (Fulfillment & Staging)
                                                                [Google Drive Vault]
                                                        (/Clients/{clientId}_{name}/Deliverables)
                                                                          │
                                                                          ▼ (Admin marks 'final')
                                                                [Client Deliverable Ready]
                                                                          │
                                                                          ▼ (Authenticated Stream)
                                                                [/api/drive/file/[fileId]]
```

### Key Trace Findings:
1. **Price Validation Hole**: In `api/orders/route.ts` (lines 488–505), when a client submits `planId` from `MasterOrderForm` (e.g. `autonomous-growth-retainer` or `daily-trend-creator`), the server checks `OFFICIAL_PLANS[planId]`. Because `OFFICIAL_PLANS` was populated from `SEED_CATALOG_PLANS` (which only contained `enterprise-atelier`, `studio-starter`, and `studio-growth`), the server fails the lookup and takes:
   ```ts
   const customMonthlyAmount = Number(packagePayload.price || body.totalAmount || body.amount || 14999);
   calculatedTotal = customMonthlyAmount;
   ```
   This means **the server trusted the client-submitted price** whenever the plan ID wasn't in the legacy seed list!
2. **Payment UTR Verification**: `PaymentsStore.isUtrUsed(utrNumber)` correctly prevents UTR reuse.
3. **Drive Link Concealment**: `/api/drive/file/[fileId]` correctly proxies media files without leaking raw Google Drive URLs to client browsers.

---

## 6. Public Promotion of Workflow Automation Audit

- **Current State**: Discipline 12 is publicly presented as "Workflow Automation" (in `services.ts`, `catalogData.ts`) and "AI Automation" (in `SERVICES_AND_PRICING_GUIDE.md`). In `src/app/(public)/services/page.tsx`, the category filter tabs explicitly include `"Automation"`.
- **Policy Violation**: Business Rule #9 states: *"Do not publicly promote workflow automation as a service unless explicitly approved. Preserve required internal automation."*
- **Remediation**:
  1. Remove `"Automation"` tab from the public category filter in `src/app/(public)/services/page.tsx`.
  2. Flag Discipline 12 as `isPublic: false` in canonical catalog definitions.
  3. Keep `/api/workflows` and internal n8n render dispatches fully intact for studio operations.

---

## 7. Firebase, Security Rules & Integration Audit

### A. Firebase Client SDK
- Configured safely via `NEXT_PUBLIC_*` variables in `src/lib/firebase/client.ts`.
- Pure Authentication and Firestore only. Zero Firebase Storage and zero Cloud Functions.

### B. Firebase Admin SDK
- Configured in `src/lib/firebase/admin.ts`.
- Enforces `server-only`. Throws `NotConfiguredError` instead of mocking a fake database.

### C. Firestore Security Rules (`firestore.rules`)
- **Deny by default** pattern strictly observed.
- Role-Based Access Control enforced exclusively via custom claims (`request.auth.token.role == 'admin'`).
- Money fields (`amountPaise`, `totalRupees`, `paid`, `paymentStatus`) are write-protected against client manipulation.
- Multi-tenant data isolation: clients can only query documents matching `clientId == request.auth.uid`.

### D. External Integrations & Missing-Key Registry
Per the strict names-only security rule, missing variables are recorded without values:
- `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN` (Drive Vault)
- `RESEND_API_KEY`, `SENDGRID_API_KEY` (Email)
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (Web Push)
- `N8N_API_KEY` (Automation)
- `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN` (Meta Ads)
- `CRON_SECRET`, `TOKEN_ENCRYPTION_KEY` (Administrative security)

**Live testing status for these 7 services is marked BLOCKED**. Development/demo mode remains functional with mock/fallback pathways.

---

## 8. Verification & Test Suite Results

| Test Harness | Command | Outcome | Details |
| :--- | :--- | :--- | :--- |
| **TypeScript Compiler** | `npm run typecheck` | **PASS (100%)** | 0 type errors across all files |
| **Environment Protection** | `npm run test:env` | **PASS (19/19)** | Zero secrets tracked or committed, .gitignore clean |
| **Security Acceptance** | `npm run test:security` | **PASS (59/59)** | Role isolation, UTR validation, proxy streaming verified |
| **ESLint Check** | `npx eslint --quiet` | **1 PRE-EXISTING ERROR** | `src/app/api/admin/marketing/publish/route.ts:26:5`: `prefer-const` |

---

## 9. Prioritized Remediation Strategy (Steps 01 – 10)

1. **Step 01: Canonical Catalog Consolidation**
   - Create single source of truth in `src/config/services.ts` and `src/config/packages.ts`.
   - Align `src/lib/services/catalogData.ts`, `src/config/pricing.ts`, and `src/data/servicesData.ts`.
   - Remove private hardcoded catalogs from `MasterOrderForm.tsx`.
   - Cap all prices at or below ₹20,000.
2. **Step 02: Server-Side Price Integrity**
   - Enforce server recalculation in `/api/orders` from canonical IDs.
   - Eliminate client-provided price fallback.
   - Ensure confirmed order price snapshots remain immutable.
3. **Step 03: Homepage Catalog & Pricing Alignment**
   - Align `HomeClient.tsx` categories, starting rates, and flagship Daily Trend Creator (₹19,999).
4. **Step 04: Public Services Catalog & Details**
   - Update `src/app/(public)/services/page.tsx`.
   - Hide "Automation" from public filters and service listings.
5. **Step 05: Public Pricing Page Alignment**
   - Update `src/app/(public)/pricing/page.tsx` with Retainer Tiers (Starter ₹9,999, Growth ₹14,999, Daily Trend Creator ₹19,999) and Per-Project packs.
6. **Step 06: Client Dashboard & Quotas**
   - Update `src/app/(client)/dashboard/page.tsx` to display active 30-day package quotas accurately.
7. **Step 07: Client Order Wizard**
   - Refactor `MasterOrderForm.tsx` to read canonical catalog.
8. **Step 08: Checkout & Payment Flow**
   - Audit UPI QR payment modal and `/orders/confirm` draft flow.
9. **Step 09: Admin Dashboard & Order Management**
   - Ensure `/admin/orders` and `AdminClient.tsx` display canonical services and prices.
10. **Step 10: Final Comprehensive QA & Reports**
    - Run all test suites, fix the pre-existing lint error, and generate `QA_REPORT.md`.

---

## 10. Audit Sign-Off

The comprehensive audit is **complete and verified**. The application code and database remain untouched. Ready for implementation beginning with Step 01.
