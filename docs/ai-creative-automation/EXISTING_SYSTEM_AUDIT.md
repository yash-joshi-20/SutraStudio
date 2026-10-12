# Sutra Studio — Existing System & Workflow Audit
**Document Version:** 1.0.0  
**Audit Date:** October 2026  
**Auditor:** Principal AI Automation Architect  
**Branch:** `feature/creative-automation-master-system`

---

## 1. Executive Summary

This audit assesses the current state of Sutra Studio's codebase, data layer, AI workflows, media asset registries, admin controls, and external integrations to prepare the repository for upgrading into a dynamic, multi-client **AI Creative Automation Platform**.

Per strict architectural constraints:
- **No creative media (images, videos, 3D, 360° panoramas) are generated during setup.**
- The existing Next.js App Router architecture, Firebase Authentication, Cloud Firestore rules, Google Drive proxy, and client isolation are preserved without disruption.
- The existing branding, authentic ₹99–₹19,999 pricing ceiling, and official logo remain untouched.

---

## 2. Source Code & Architecture Inventory

| Layer | Implementation Details | Status |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript strict mode | Fully Working |
| **Styling & Design Tokens** | Tailwind CSS v4, Warm Ivory (`#FAF9F5`), Deep Teak (`#5C3A1E`), Muted Gold/Brass (`#A98B57`), Charcoal Slate (`#171717`) | Fully Working |
| **Authentication** | Firebase Auth (Client & Admin SDKs) with session cookies & role guards (`admin`, `client`) | Fully Working |
| **Database** | Google Cloud Firestore (multi-tenant collections: `users`, `orders`, `inquiries`, `brandKits`, `auditLogs`) | Fully Working |
| **Storage & Drive Proxy** | Google Drive API with local streaming proxy `/api/drive/file/[fileId]` | Fully Working |
| **Media Registry** | `src/lib/config/videoRegistry.ts` (10 cataloged video assets with prompts & ratios) | Fully Working |
| **Admin Portal** | `src/app/admin/*` with sidebar navigation (`PortalSidebar`), KPI tiles, order management, ad desk | Fully Working |
| **Client Portal** | `src/app/dashboard/*`, `src/app/orders/*`, `src/app/projects-client/*`, `src/app/media/*` | Fully Working |
| **AI Knowledge Console** | `src/lib/services/aiKnowledgeService.ts`, RAG catalog retrieval, feedback loop | Fully Working |
| **AI Provider Routing** | `src/lib/ai/providerRouter.ts`, `src/lib/services/aiPipeline.ts` (multi-tier provider fallback) | Partially Implemented |
| **n8n Workflow Engine** | `src/lib/services/n8nService.ts`, webhook dispatchers for order processing | Partially Implemented |
| **Creative Automation Studio** | Dynamic 14-step workflow engine, versioned prompt library, keyword registry | **New Module (This Upgrade)** |

---

## 3. Feature Breakdown by Operational Status

### 1. Fully Working Features
- **Client & Admin Authentication:** Email/password & Google login with role synchronization, server session verification via `requireAdmin()` and `requireAuth()`.
- **Order & Service Catalog:** Canonical 15-service catalog ranging from ₹99 to ₹19,999 with upfront/split payment modes and Razorpay webhook verification.
- **Client Workspace & Media Vault:** Secure client file upload directly to Google Drive with mime-type checking and Firestore metadata tracking.
- **Video & Portfolio Registry:** Structured metadata defining video formats (MP4/WebM), durations, aspect ratios (16:9, 9:16), and prompt tags.
- **RAG & Chat Knowledge Base:** Vector/catalog search providing grounded studio answers to concierge chat users.
- **Agency Guidelines & Admin Tools:** Ad copy desk, brand profile guide, outreach email templates, and meta ads manager.

### 2. Partially Implemented Features
- **AI Pipeline (`src/lib/services/aiPipeline.ts`):** Defined types for `TrendResult`, `PromptTemplate`, `GeneratedOutput`, and `ProviderConfig`, with mocked outputs when provider API keys are unset.
- **Provider Router (`src/lib/ai/providerRouter.ts`):** Daily spend caps, token counters, and fallback logic designed for OpenAI/Gemini/Anthropic with Firestore sync.
- **n8n Automation Service (`src/lib/services/n8nService.ts`):** Webhook dispatcher for order status changes and client notifications. Needs visual step management.

### 3. Placeholder or Demo Elements
- **Client Demo Showcase Projects:** Synthetic sample records in initial mocks (now replaced by authentic studio showcase items in client-facing views).
- **External Video Previews:** Several video entries in `videoRegistry.ts` point to fallback showcase loops pending client-specific render pipelines.

### 4. Not Implemented (Target of this Upgrade)
- **Centralized Master Prompt Library:** Categorized into Educational Reels, UI Demonstrations, Marketing, Cinematic Shots, and 3D/360° Walkthroughs with negative constraints and versioning.
- **Searchable Creative Keyword & Technique Library:** Cinematic, motion graphics, educational, interior/3D, and marketing keyword dictionary.
- **Live Capability Registry:** Auto-detecting and reporting status for Gemini, BFL FLUX, Kling, Runway, ElevenLabs, Tripo3D, FFmpeg, Remotion, and Blender.
- **Configurable 14-Step Automation Engine:** Step-by-step pipeline from brand intake to trend research, brief, script, storyboard, tool selection, job queuing, validation, human approval, and delivery.
- **Admin Creative Automation Studio UI:** Dedicated module in the Admin portal (`/admin/creative-automation`) exposing the visual workflow builder, job queue, and prompt manager.
- **Multi-Client Brand Profile Engine:** Isolated client profiles with tailored brand kits, tone guidelines, approved prompts, and review histories.

### 5. Blocked by Missing API Credentials
The following third-party generative providers are supported via fallback architecture but require customer-provided API credentials for live generation:
- `KLING_API_KEY` (Kling AI high-fidelity video)
- `RUNWAY_API_KEY` (Runway Gen-3 Alpha video)
- `BFL_API_KEY` (Black Forest Labs FLUX image models)
- `ELEVENLABS_API_KEY` (Multilingual voice synthesis)
- `TRIPO3D_API_KEY` (Automated 3D mesh reconstruction)
- `SERPAPI_API_KEY` (Live Google Trends scraping — fallback: Gemini-assisted trend synthesis)

---

## 4. Reusability Strategy

To maintain codebase cleanliness and eliminate code duplication:
1. **Re-use `requireAdmin()` and `guarded()`** from `@/lib/auth/session` and `@/lib/api/response` for all creative automation endpoints.
2. **Extend `aiPipeline.ts`** types into a modular `src/lib/creative-automation/` package.
3. **Connect with `PortalSidebar.tsx`** so administrators have one-click access to the new studio module.
4. **Leverage Firestore** for persisting workflow templates, brand profiles, and creative jobs.

---

## 5. Architectural Safeguards
- **Zero Media Generation:** No images, videos, audio, or 3D assets are rendered during this setup phase.
- **Client Isolation:** Brand profiles and creative jobs are partitioned by `clientUid` with strict role checks.
- **Human Approval Gates:** Mandatory admin/client review states before outputs can be marked as approved or published.
