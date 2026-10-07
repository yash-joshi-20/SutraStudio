# Sutra Studio — Data Analysis & System Architecture Audit

**Target Branch:** `version-3`  
**Architecture Guardrails:** Pure Firebase + Cloud Vault, Warm Ivory Luxury Design System (`#FAF9F5`, `#FFFDF9`, `#5C3A1E`, `#D4A35A`), WCAG AA Accessibility, Zero-Regression Contract.

---

## 1. Executive Summary & Audit Baseline

A deep inspection of the repository was conducted before making modifications:
- **Build & Types:** `tsc --noEmit` compiles with **0 type errors**.
- **Secret Protection:** `npm run test:env` passes **19/19 checks** (zero secret leaks, strict .gitignore adherence).
- **Core Design System:** Follows [DESIGN-SYSTEM.md](file:///d:/SutraStudio/docs/ai/DESIGN-SYSTEM.md) with warm sand canvas, saffron gold accents, and deep brown grounding.

---

## 2. Module-by-Module Data Analysis

### Module 1: Luxury Mobile-First UI, Branding & Rebranding

| Component / Area | Existing State & Bottlenecks | Target Solution |
| :--- | :--- | :--- |
| **Navbar & Logo** (`components/layout/Navbar.tsx`) | Logo rendered via `SutraLogo` with variable heights (`h-9 sm:h-10`) causing squishing or blurriness on mobile viewports. | Standardize logo container with `h-10 sm:h-11 md:h-12 w-auto object-contain transition-all duration-300`, warm luxury backdrop blur (`backdrop-blur-md bg-[#FFFDF9]/95 border-b border-[#EADFCB]`), and clean vertical centering. |
| **Mobile Bottom Nav** (`components/layout/MobileBottomNav.tsx`) | Touch target min-height is currently `44px` with dynamic padding. | Elevate to strict **48x48px** touch target bounding boxes (`min-h-[48px] min-w-[48px] touch-target`) and apply `pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]` for iOS home indicator safety. |
| **Adaptive Tables** (`dashboard/page.tsx` & `admin/AdminClient.tsx`) | Admin order list uses raw `<table min-w-[960px]>` causing horizontal overflow-x on small screens; dashboard uses basic card rows. | Implement dual-rendering pattern: **Desktop (`md+`)** renders high-density tabular grid with sticky header and status pills; **Mobile (`<md`)** auto-transforms rows into elevated luxury **Card Stack Components** displaying Order ID, Service Badge, Created Date, Status Pill, and Action Buttons with zero truncation. |
| **Adaptive Modals** (`components/ui/Modal.tsx`) | Modal currently renders centered on desktop with partial drag-sheet on mobile. | Enforce strict responsive dual-state: **Mobile (`<sm`)** anchored bottom sheet (`fixed inset-x-0 bottom-0 rounded-t-3xl max-h-[92vh] overflow-y-auto z-50 p-6`), **Desktop (`sm+`)** centered luxury dialog (`sm:rounded-2xl sm:max-w-xl mx-auto`), with fluid full-width buttons (`w-full sm:w-auto`). |
| **Vault Rebranding** (`media/page.tsx` & across app) | Over 90 legacy references to "Google Drive" and "Google Drive Vault"; `media/page.tsx` contains client upload modal. | 1. Globally rebrand to **"Sutra Cloud Vault"** and **"Encrypted Brand Vault"**.<br>2. Restructure media grid to feature strictly 3 action triggers: **[Preview 4K]**, **[Download Master]**, and **[Share Link]**.<br>3. Completely remove client-side upload controls from the media vault (uploads strictly reserved for orders and revisions). |

---

### Module 2: Central Pricing Configuration (`src/config/pricing.ts`)

#### Inconsistencies Discovered in Existing Codebase
- `src/app/(public)/pricing/page.tsx`: Shows Starter at ₹3,499 project / ₹5,999 monthly; Growth at ₹7,999 project / ₹12,999 monthly; Bespoke at ₹14,999 project / ₹19,999 monthly with "Same-day" turnaround.
- `src/data/servicesData.ts`: Image Creation at ₹5,499, Video at ₹7,999, 3D at ₹9,499, 360 at ₹11,999.
- `src/lib/types/plans.ts`: Retainer tiers at ₹5,999, ₹12,999, ₹19,999.
- `src/lib/services/catalogData.ts`: Retainers at ₹5,999, ₹12,999.

#### Centralized Canonical Schema (`src/config/pricing.ts`)
```typescript
export interface ProjectTier {
  id: string;
  name: string;
  price: number | 'custom';
  formattedPrice: string;
  turnaround: string;
  tagline: string;
  deliverables: string[];
  popular?: boolean;
}

export interface RetainerTier {
  id: string;
  name: string;
  priceMonthly: number;
  formattedPrice: string;
  turnaround: string; // "Daily Active Queue"
  deliverables: string[];
}
```

1. **Per-Project Commissions:**
   - **Starter Creative:** ₹3,499 (Turnaround: 48 Hours | Up to 5x Photorealistic 4K Renders, 1x 10-Second Commercial Video Ad, Full Commercial License, 2 Revision Rounds).
   - **Studio Growth (Most Popular):** ₹7,999 (Turnaround: 24-72 Hours | 15x High-Resolution 3D & Product Renders, 3x 15-Second Video Ads with AI Voiceover, Interactive 360° Space Tour, 3x Meta Ads Creative Variations, Dedicated Lead).
   - **Bespoke Enterprise:** "Custom Quote / Inquire for Enterprise" (routes to custom proposal modal, removing static ₹14,999 and same-day turnaround).
2. **Monthly Studio Retainer (30-Day Autonomous Campaign Engine):**
   - **Autonomous Growth Retainer:** ₹14,999/month (Turnaround: **"Daily Active Queue"**).
   - Deliverables:
     - Daily 1x 4K Brand Image / Graphic (30 Assets/month)
     - Daily 1x Commercial Video Reel / Short (30 Assets/month)
     - Dedicated 3D Asset Modeling & Spatial Renders
     - Interactive 360° Virtual Panoramic Tour
     - Interior / Spatial Visualizations
     - Meta Ads Creative Variation Pack
     - Private Cloud Media Vault with auto-sync

---

### Module 3: Smart Dynamic Onboarding Form (`components/orders/MasterOrderForm.tsx`)

Current state: `src/components/orders/MasterOrderForm.tsx` does not exist; order creation is scattered across an inline wizard in `orders/page.tsx`.

#### Target Architecture:
- **Universal Base Inputs (Always visible):**
  - Full Name, Business Email, WhatsApp Number
  - Brand Name, Industry/Niche, Website/Instagram Handle
  - Brand Logo Upload (Vector SVG or Transparent PNG)
- **Conditional Service-Specific Accordions (Dynamically revealed based on selected service):**
  1. **Meta Ads Launcher & Digital Marketing:**
     - Target Geo / Cities (or All India)
     - Target Audience Demographics & Age Bracket
     - Destination URL (E-commerce landing page or WhatsApp Business link)
     - Core Promotional Offer / Angle (e.g. "Flat 20% Off", "Free Consultation")
     - Daily Ad Budget allocation (disclaimed as paid directly to Meta)
     - Meta Business Manager / Partner ID input with inline tooltip for partner access delegation
  2. **3D Modeling, 360 View & Interior/Window Design:**
     - Multi-angle reference photo uploads (Front, Side, Top) OR Room Walkthrough Video
     - Approximate Physical Dimensions / Space Scale notes
  3. **Web & App Development:**
     - Domain status (Own Domain / Need Setup)
     - 2-3 Benchmark / Reference Website URLs
  4. **Monthly Retainer (30-Day Engine):**
     - Primary 30-Day Goals (Direct Sales, Brand Awareness, Lead Gen)
     - Priority products/features to highlight throughout the month

---

### Module 4: Frictionless Zero-Fee Payment Modal (`components/checkout/PaymentModal.tsx`)

#### Target Architecture:
- **Dual Payment Presentation:**
  - High-resolution container for Studio UPI QR Code (`/brand/gpay-qr.png`) with clean vector QR fallback.
  - Textual UPI ID (`yashj9428-1@oksbi` or env configured) with one-tap **[Copy UPI ID]** and copied feedback.
  - Mobile UPI Deep-Link Intent button: *"Tap to Open in GPay / PhonePe / Paytm"* targeting `upi://pay?pa={UPI_ID}&pn=SutraStudio&am={amount}&cu=INR&tn={orderId}`.
- **Proof Submission Fields:**
  - 12-digit **UPI UTR / Transaction Reference Number** with regex validation (`^\d{12}$`).
  - Image receipt upload control for payment screenshot.
- **Direct WhatsApp Confirmation Fallback:**
  - Button: **"Confirm & Send Screenshot via WhatsApp"**
  - Encoded WhatsApp URL: `https://wa.me/{WHATSAPP_NUMBER}?text={ENCODED_MESSAGE}`
  - Pre-filled message: `"Hello Sutra Studio, I have placed Order #{orderId} for {packageName} (₹{amount}). My UPI UTR is {utr}."`
- **Post-Submission:** Sends payload to `/api/orders` with status `pending_verification`.

---

### Module 5: Unified Backend Dispatcher API (`app/api/orders/route.ts`)

#### Standardized Universal Schema:
```typescript
export interface UniversalOrderPayload {
  orderId: string;
  sourceChannel: 'ai_tool' | 'direct_order' | 'pricing_package' | 'whatsapp' | 'email';
  client: { name: string; email: string; phone: string; brandName: string };
  package: { tierId: string; name: string; price: number; billingCycle: 'project' | 'monthly' };
  serviceDetails: {
    metaAds?: { targetGeo: string; destinationUrl: string; offer: string; dailyBudget: number };
    spatial3D?: { referenceAssetUrls: string[]; dimensions?: string };
    monthlyEngine?: { goals: string };
  };
  payment: { method: 'UPI_GPAY'; utr?: string; screenshotUrl?: string; status: 'pending_verification' };
  createdAt: string;
}
```

Dispatches to:
1. Firestore Order record with status `pending_verification`
2. n8n Autonomous Workflow Engine webhook
3. Admin notification queue

---

## 3. Implementation Phasing Plan

1. **Step 1 — Central Pricing Truth:** Create `src/config/pricing.ts` and update all pricing references (`pricing/page.tsx`, `services/page.tsx`, `HomeClient.tsx`, `catalogData.ts`, `servicesData.ts`, `plans.ts`).
2. **Step 2 — Mobile & Rebranding Polish:** Refactor `Navbar.tsx`, `MobileBottomNav.tsx`, `Modal.tsx`, `media/page.tsx` (rebrand to Sutra Cloud Vault, add 3 triggers, strip upload modal).
3. **Step 3 — Adaptive Data Tables:** Refactor table views in `app/(client)/dashboard/page.tsx` and `app/admin/AdminClient.tsx` with mobile card stacks.
4. **Step 4 — Master Order Form Component:** Build `src/components/orders/MasterOrderForm.tsx` with universal inputs and conditional service accordions.
5. **Step 5 — Frictionless Checkout Modal:** Build `src/components/checkout/PaymentModal.tsx` with UPI QR, UTR verification, WhatsApp fallback.
6. **Step 6 — Backend Order Dispatcher:** Refactor `app/api/orders/route.ts` to support `UniversalOrderPayload`.
7. **Step 7 — Verification & Testing:** Run TypeScript check, test suites, and audit.
