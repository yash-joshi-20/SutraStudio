# SUTRA STUDIOS — CANONICAL SERVICE CATALOG & PRICING BASELINE

This document is the **definitive blueprint and pricing baseline** for Sutra Studios across all public surfaces, client workspaces, admin controls, order intake, payment processing, and database schemas.

---

## 1. Studio Overview & Tech Stack Verification

- **Repository Root**: `d:\SutraStudio`
- **Application Framework**: Next.js 16.3.8 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS 4
- **Animation & UI**: Framer Motion 13.4, GSAP 3.15, Lucide React, Custom Warm Ivory Design Tokens (`#FAF9F5`, `#FFFDF9`, `#0F172A`, `#D4A35A`, `#5C3A1E`, `#EADFCB`)
- **Data & Auth**: Firebase Client SDK 11.10 (Auth + Cloud Firestore) + Firebase Admin SDK 13.10. Strictly zero SQL databases.
- **Media & Asset Vault**: Google Drive API (OAuth Refresh Token, isolated per-client folders, streaming via authenticated proxy).
- **Payment Engine**: Zero-commission UPI QR payment flow (Merchant VPA: `yashjoshi7355-1@okicici`, Payee: Yash Joshi) with UTR submission, duplicate prevention, and admin verification ledger.
- **Workflow Automation**: Internal n8n webhook automation and creative render pipelines. **Strictly concealed from public marketing**.

---

## 2. Core Business Rules & Pricing Directives

1. **Price Ceiling**: Every listed price must be **at or below ₹20,000**.
2. **Complex Projects**: High-scope web applications, enterprise software, or multi-faceted rollouts must either have clearly limited starter scope or require **Request a Quote**.
3. **Consolidated Single Source of Truth**: There must be **ONE** canonical service and pricing catalog. All components, pages, APIs, and forms import from this catalog. Competing price lists are strictly forbidden.
4. **Public Positioning**: The homepage features main service categories, starting rates ("From ₹X"), and spotlights the flagship monthly retainer. Detailed specifications reside on dedicated service detail views or the `/pricing` page.
5. **No Public Automation Promo**: Discipline 12 (Workflow Automation) is an internal engine and must **NOT** be promoted as a public client-facing service unless explicitly requested and approved.
6. **Server-Side Recalculation**: Prices and totals must never be trusted from client inputs. Server recalculates amounts based on the canonical catalog.
7. **Immutable Order Snapshots**: Once an order or draft snapshot is locked, confirmed, or paid, its historical pricing record remains immutable.
8. **Brand Integrity**: SUTRA STUDIO logo assets, warm ivory aesthetic, 21 canonical route URLs, and working features remain preserved.

---

## 3. Approved Monthly Retainer Packages (30-Day Active Pipeline)

| Package Name | Price (INR) | Duration | Scope & Deliverables | Fulfillment & Operations |
| :--- | :--- | :--- | :--- | :--- |
| **Starter Trend** | **₹9,999** | 30 Days | • **15 Images + 15 Short Videos**<br>• Trend research & prompt tailoring<br>• Captions & hashtags included<br>• Private Drive Vault delivery<br>• 1 consolidated revision round | Alternating or bi-daily asset drops delivered into client vault. 48h turnaround SLA. |
| **Growth Trend** | **₹14,999** | 30 Days | • **20 Images + 20 Short Videos**<br>• Daily trending-topic research<br>• Brand relevance review & custom prompts<br>• Editorial calendar & caption sets<br>• Priority queue & 1 revision round | Steady cadence (5 assets/week) across 30 days. 24–48h turnaround SLA. |
| **Daily Trend Creator** *(Flagship / Featured)* | **₹19,999** | 30 Days | • **30 Images + 30 Short Videos** (1 image + 1 short video delivered per day)<br>• Daily trending-topic research & brand alignment<br>• Custom prompts & 4K production<br>• Complete captions, hashtags & content calendar<br>• Studio QA & organized private folder delivery<br>• 1 consolidated revision round per deliverable | **Daily Active Queue**: 1 custom image + 1 commercial video/reel delivered every single day into client media library. |

---

## 4. Approved Standalone Deliverable Packs (Single-Order Commissions)

| Service Discipline | Deliverable Pack | Base Price (INR) | Included Deliverables & Scope | Turnaround SLA | Revisions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Commercial Visual Imagery** | 3x 4K Master Pack | **₹2,499** | 3x Photorealistic 4K renders, multi-angle staging, full commercial license | 24–48 Hours | 2 Rounds |
| **Commercial Visual Imagery** | 5x 4K Master Pack | **₹3,999** | 5x Photorealistic 4K renders, lifestyle ambient context, hero passes | 24–48 Hours | 2 Rounds |
| **Cinematic Motion Reel** | Single Master Reel (10–15s) | **₹3,999** | 1x 10–15s Master Video Ad, sound design, vertical 9:16 format | 48 Hours | 2 Rounds |
| **Cinematic Motion Reel** | Dual Reel Pack (15–30s) | **₹6,999** | 2x 15–30s Cinematic Video Ads, voiceover sync, dual aspect ratios (9:16 + 16:9) | 48–72 Hours | 2 Rounds |
| **Product 3D Modeling & CGI** | 3D Product Starter | **₹4,999** | 1x Precision 3D CAD/Product model, 4K PBR textures, GLTF/GLB web embed | 48–72 Hours | 2 Rounds |
| **360° Virtual Tour & VR** | Virtual Tour Starter | **₹7,999** | 2–3 Interconnected 360° panoramic spatial nodes, web viewer embed | 3–4 Days | 2 Rounds |
| **Interior Architecture** | Concept Staging Suite | **₹9,999** | 4K Interior render suite (Day/Evening), layout & material palette | 3–5 Days | 2 Rounds |
| **Window Design & Facades** | Architectural Facade Pass | **₹6,499** | Exterior perspective visualization, architectural elevation profile | 48–72 Hours | 2 Rounds |
| **Digital Marketing** | 30-Day Content Blueprint | **₹7,999** | 30-Day editorial calendar, copywriting deck (hooks, captions, hashtags) | 3–5 Days | 2 Rounds |
| **Meta Ads Launcher** | Creative Ad Pack | **₹6,999** | 5 High-converting ad creatives (1:1 + 9:16), 3 copy angles, audience blueprint | 48 Hours | 2 Rounds |
| **Website Development** | Starter Launch (Up to 3 Pages) | **₹14,999** | Fast Next.js 16 responsive website (Home, About, Contact), SEO & deployment *(Complex: Request Quote)* | 5–7 Days | 2 Rounds |
| **Web App Development** | SaaS / Portal MVP Starter | **₹19,999** | Full-stack client portal or MVP app, Firebase auth & role control *(Complex: Request Quote)* | 7–14 Days | 2 Rounds |
| **Mobile App Setup** | App Prototype Starter | **₹18,499** | React Native Expo prototype / initial build setup *(Complex: Request Quote)* | 10–14 Days | 2 Rounds |
| **Workflow Automation** | *Internal Only* | *Not Public* | *Internal background engine; hidden from public catalog* | N/A | N/A |

---

## 5. Security & Verification Directives

- Zero secrets on client; API keys and tokens remain server-side only.
- Missing credentials are logged in `MISSING_KEYS.md` by variable name only.
- When an external integration is unconfigured, system returns a structured graceful status without generating fake data or mock deliveries.
- All 21 canonical routes must remain accessible and functional.
