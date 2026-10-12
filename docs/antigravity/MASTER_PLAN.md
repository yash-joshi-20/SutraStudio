# SUTRA STUDIO — MASTER WEBSITE TRANSFORMATION PLAN

**Date**: 2026-10-13  
**Active Branch**: `feature/master-website-transformation`  
**Default Branch**: `main`  
**Baseline Documents**:
- Audit Report: [AUDIT_REPORT.md](file:///d:/SutraStudio/docs/antigravity/AUDIT_REPORT.md)
- Asset Inventory: [ASSET_INVENTORY.md](file:///d:/SutraStudio/docs/antigravity/ASSET_INVENTORY.md)
- Progress Log: [PROGRESS_LOG.md](file:///d:/SutraStudio/docs/antigravity/PROGRESS_LOG.md)
- Portfolio Content Audit: [PORTFOLIO_CONTENT_AUDIT.md](file:///d:/SutraStudio/docs/antigravity/PORTFOLIO_CONTENT_AUDIT.md)

---

## 1. Master Phase Execution Roadmap

| Phase | Phase Title | Core Objectives | Status | Verification Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | **Comprehensive Audit (Non-Destructive)** | Full inspection of codebase, 44 routes, assets, canonical catalogs, chatbot, WhatsApp status, Firebase, orders, and responsive states. | **COMPLETED** | `AUDIT_REPORT.md`, `ASSET_INVENTORY.md`, zero code modifications |
| **Phase 1** | **Shared Foundations** | Consolidate brand tokens (`#FAF9F5`, `#FFFDF9`, `#5C3A1E`, `#D4A35A`), central catalog bindings, unified FAQ knowledge schema, and shared UI primitives. | **READY TO PROCEED** | `npm run test:catalog`, `typecheck` (0 errors) |
| **Phase 2** | **Visual Redesign & Client Experience** | Refine responsive header, homepage hero (outcome-focused), premier portfolio showcase, service cards, pricing tiers, and "Our Approach" trust section. | **QUEUED** | Responsive layout review across 320px–1440px viewports |
| **Phase 3** | **Chatbot & WhatsApp Multi-Channel FAQ** | Unify floating assistant with canonical service catalog and 11 approved FAQ topics. Document missing WhatsApp Cloud API keys cleanly. | **QUEUED** | Chatbot FAQ test query suite & mock verification |
| **Phase 4** | **Dashboards & Project Workflow** | Audit Client Dashboard and Admin Hub for mobile responsiveness, milestone tracking, and customer-friendly project file labels. | **QUEUED** | `npm run test:security`, role-guard checks |
| **Phase 5** | **Original Media & Motion Enhancements** | Optimize Three.js 3D Logo presentation with reduced-motion fallback, studio showreel modal, and verified client case studies. | **QUEUED** | WebGL context fallback & reduced-motion test |
| **Phase 6** | **QA, Regression & Final Delivery** | Execute full test suites (`test:catalog`, `test:orders`, `test:security`, `test:responsive`, `typecheck`). Generate `QA_REPORT.md` & `FINAL_CHANGELOG.md`. | **QUEUED** | 100% test pass rate, merge to `main` |

---

## 2. Phase 0 Detailed Audit Findings Summary

1. **Architecture & Routes**: 44 Page routes and 67 API handlers running cleanly on Next.js 16 App Router. Zero broken imports or missing layout files.
2. **Pricing Integrity**: Single canonical pricing system established in `src/config/services.ts`, `packages.ts`, and `pricing.ts`. Server recalculation blocks client price tampering. Hard ₹20,000 price ceiling enforced.
3. **Genuine Brand & Portfolio Assets**:
   - Brand Emblem: Authentic high-res lotus symbol (`public/brand/sutra-symbol.png`) and monogram (`public/brand/sutra-monogram.png`).
   - Client Deliverables: 6 verified projects (Viva Live Better, Shri Ram Tech, Yash Joshi QA, Crème d'Or, Koenigsegg Velocity, Vitrine Salon) + Sutra Studio Atelier live flagship.
   - Studio Concepts: Clearly classified and labeled to prevent misrepresentation.
4. **Purged Inaccurate Marketing Claims**: Removed fake testimonials ("Vana Luxury Living"), fake star ratings, unsupported asset counts ("500+ Assets"), and blanket turnaround promises ("24–48h SLA").
5. **Chatbot & WhatsApp FAQ**: Floating chat active and wired to RAG knowledge services. 11 core customer FAQ topics mapped. WhatsApp Cloud API operating in graceful mock/sandbox fallback mode due to unconfigured Meta environment variables (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`).
6. **Responsiveness**: Verified layout scaling across 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px widths with zero horizontal overflow.
