# SUTRA STUDIO — GLOBAL PRICING & BRANDING AUDIT

**Date**: 2026-10-12  
**Branch**: `feature/canonical-pricing-ui-consistency`  
**Status**: COMPLETED & VERIFIED  

---

## 1. Executive Summary

This audit consolidates, standardizes, and verifies pricing, service terminology, and brand messaging across all Sutra Studio touchpoints. Redundant and cluttering hero pricing chips have been removed, professional terminology has replaced overly technical jargon, and all active surfaces (Homepage, Services, Pricing, Orders, Dashboards, Webhooks, and AI Chatbot) now consume or reflect the canonical catalog.

All pricing strictly adheres to the approved baseline capped at **≤ ₹20,000**.

---

## 2. Hero Section Pricing Removal Audit

| Section / Component | Previous State | Updated State | Status |
| :--- | :--- | :--- | :--- |
| **Homepage Hero Disciplines** (`HomeClient.tsx`) | Displayed `price: "From ₹..."` chips on category cards (e.g., "From ₹99", "From ₹199", "From ₹4,999") | Price chips removed. Clean professional domain labels with `verified: true` badge | **RESOLVED** |
| **Hero Selector Buttons** (`HomeClient.tsx`) | Included inline starting price pills | Clean discipline titles without prices | **RESOLVED** |
| **Hero Primary CTA** (`HomeClient.tsx`) | `Start Commission (From ₹99)` | Refined dual CTAs: `Start a Project` & `Explore Services` | **RESOLVED** |
| **Hero Spotlight Card Badge** (`HomeClient.tsx`) | Displayed active category starting price | Replaced with luxury quality badge: `Studio Verified` | **RESOLVED** |
| **Brand Tone** | Price-heavy retail marketplace appearance | Premium creative technology atelier | **RESOLVED** |

---

## 3. Standardized Professional Service Names

| Previous / Technical Name | Standardized Professional Name | Category | Canonical Starting Rate |
| :--- | :--- | :--- | :--- |
| Commercial Visual Imagery | **Commercial & Product Image Creation** | Creative | ₹99 (Single) / ₹249 (3-Pack) |
| Cinematic Motion Reel | **Promotional Video & Reel Production** | Creative | ₹199 (10s) / ₹499 (Promo Reel) |
| Spatial 3D Asset Model | **3D Product Modeling & Visualization** | Design | ₹999 (Render) / ₹2,999 (Model) |
| 360° Spherical Panoramic Tour | **360° Virtual Tours** | Design | ₹2,999 (Supplied) / ₹7,999 (Local capture) |
| Interior Architecture & Spatial Staging | **Interior 3D Visualization** | Design | ₹1,499 (Per View) / ₹4,999 (Room Starter) |
| Window & Facade Architectural Design | **Exterior 3D Visualization** | Design | ₹1,999 (Per View) |
| Digital Marketing & Growth Strategy | **AI-Powered Digital Marketing** | Marketing | ₹999 (Content Calendar) / ₹1,499 (Research) |
| Meta Ads Campaign Launcher | **Meta Ads Campaign Management** | Marketing | ₹4,999 / month (Ad spend excluded) |
| High-Performance Website Development | **Website Design & Development** | Development | ₹4,999 (Landing) / ₹14,999 (Business Web) |
| Web Application & Client Portal | **Web Application & Client Portal MVP** | Development | ₹19,999 (Prototype / MVP Scope) |
| Cross-Platform Mobile Application | **Mobile App UI Prototype** | Development | ₹9,999 (UI Prototype) |
| Workflow Automation | **Workflow Automation & AI Integration** | Automation | Internal Operational Engine (Hidden) |

---

## 4. Canonical Monthly Content Packages (≤ ₹20,000)

| Package Name | Monthly Rate | Scope & Deliverables | Revisions & SLA |
| :--- | :--- | :--- | :--- |
| **Starter Trend** | **₹9,999** / 30 days | 15 branded images + 15 short videos, trend topic research, custom prompts, post captions & hashtags, Google Drive Vault delivery | 1 consolidated revision round, 48h SLA drops |
| **Growth Trend** | **₹14,999** / 30 days | 20 branded images + 20 short videos (15-30s), daily trend research, 30-day content calendar, high-converting captions/hooks, Drive Vault staging | 1 consolidated revision round, 24–48h SLA |
| **Daily Trend Creator** *(Flagship)* | **₹19,999** / 30 days | 30 branded images + 30 short videos (1 delivered daily), daily trend research, brand relevance review, custom prompt engineering, captions/hashtags, Drive Vault staging | 1 consolidated revision round per deliverable, Daily active delivery pipeline |

*Strict Scope Guardrails*: AI-assisted & edited short-form content. Ad spend, live studio shoots, actors, influencers, premium stock, or physical production are explicitly excluded.

---

## 5. Single Source of Truth & Surface Synchronization

The following surfaces now strictly resolve to canonical catalog definitions:
1. **Homepage** (`src/app/HomeClient.tsx`): Hero pricing removed; featured retainers and service cards read canonical data.
2. **Pricing Page** (`src/app/(public)/pricing/page.tsx`): Retainer tabs (Starter, Growth, Daily), standalone packs, and single-service grids show canonical rates.
3. **Services Listing** (`src/app/(public)/services/page.tsx` & `src/components/services/ServiceCard.tsx`): Displays professional titles and canonical prices with direct modal/intake links.
4. **Order Form** (`src/components/orders/MasterOrderForm.tsx`): Intake services and packages match canonical titles and baseline pricing.
5. **Contact Page** (`src/app/(public)/contact/page.tsx`): Budget selection tiers aligned with ≤ ₹20,000 pricing structure.
6. **AI Chatbot Concierge** (`src/lib/services/ragLlmService.ts` & `src/lib/ai/llm.ts`): Knowledge bases, master prompt, and fallback synthesizers (English, Gujarati, Hindi) synchronized to canonical rates.
7. **Inbound Webhook & Meta Integrations** (`src/app/api/inbound/webhook/route.ts` & `src/app/api/admin/brand-profiles/sync/route.ts`): System prompts and brand descriptions aligned.
8. **Admin Brand Guide** (`src/app/admin/brand-guide/page.tsx`): Quick replies, catalog exports, and social descriptions updated.
9. **Server Order Validation** (`src/app/api/orders/route.ts`): Server re-calculates all totals against canonical catalog data, rejecting any client price tampering.

---

## 6. Verification & Automated Test Outcomes

- **`npm run test:catalog`**: 125/125 PASSED (100%)
- **`npm run test:orders`**: 48/48 PASSED (100%)
- **`npm run test:security`**: 59/59 PASSED (100%)
- **`npm run typecheck`**: 0 errors (100% clean)
