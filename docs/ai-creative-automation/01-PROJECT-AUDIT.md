# SUTRA STUDIO — AI CREATIVE AUTOMATION ENGINE
## 01: Project Audit & Technical Infrastructure Analysis

**Audit Date**: 2026-10-13  
**Target Environment**: Next.js App Router (15+ / Turbopack), TypeScript, Firebase Admin / Firestore, Google Drive API, n8n Orchestration  
**Repository Branch**: `feature/ai-creative-automation-engine`  
**Atelier Standard**: Sutra Studio Warm Ivory (`#FAF9F5`), Dark Charcoal (`#171717`), Muted Brass (`#A98B57`)

---

## 1. Executive Summary

Sutra Studio is a creative technology and spatial engineering studio pairing classical Indian aesthetic heritage with high-throughput computational pipelines (3D spatial systems, commercial video shorts, 4K master product renders, and bespoke web platforms).

This audit evaluates the repository's current architecture to establish the baseline for the **AI Creative Automation Engine**, an end-to-end backend service and administrative control suite that converts creative briefs into executable image, video, 3D, and editorial workflows.

---

## 2. Architecture & Tech Stack Inventory

### 2.1 Core Framework & Runtime
- **Next.js App Router**: Next.js 15+ with Turbopack, React 19, Node.js runtime.
- **TypeScript**: Strict typechecking (`tsconfig.json`, `tsc --noEmit`).
- **Styling**: Vanilla CSS tokens in `globals.css` with Tailwind CSS utility classes; warm-ivory atelier design system.
- **Server Execution**: Edge middleware for light routing guards; Node.js server routes for Firebase Admin verification and API processing.

### 2.2 Identity & Role Isolation
- **Authentication Engine**: Firebase Authentication (Email/Password + Google Workspace OAuth).
- **Session Enforcement**: HTTP-only session cookies (`__session` for clients; `sutra_admin_session` for administrators with 12-hour expiration and 30-minute inactivity guard).
- **Custom Claims**: Role-based access control (`client`, `admin`, `superAdmin`).
- **Data Isolation**: Strict multi-tenant boundaries (`/api/orders`, `/api/files`, `/api/chat`). Clients can only view and access their own resources; administrative endpoints are strictly gated by `requireAdmin()`.

### 2.3 Storage & Persistence
- **Database**: Cloud Firestore via `firebase-admin` (Collections: `users`, `orders`, `profiles`, `generated_outputs`, `creative_jobs`, `audit_logs`). Zero SQL dependencies.
- **Media Vault**: Google Drive Enterprise Storage API (4-tier hierarchy: `Root > Clients > {ClientName}_{clientId} > {Order}_{orderId}` with subfolders: `01_Inputs`, `02_Drafts`, `03_Final_Deliverables`, `04_Invoices`).
- **Streaming Proxy**: `/api/drive/file/[fileId]` acts as an authenticated byte proxy; raw Google Drive URLs are never exposed to untrusted callers.

### 2.4 Orchestration & Event Dispatch
- **n8n Workflow Automation**: Dual-channel webhook dispatchers (`sutra-master-dispatch` and `sutra-inbound-inquiry`) secured with HMAC signatures and timing-safe token checks.
- **Scheduled Automation**: Cron handlers (`/api/cron/retainer-dispatch`, `/api/cron/retention`) protected by `CRON_SECRET` and `authorizeScheduledCall`.

---

## 3. Existing Creative Automation Scaffolding

### 3.1 Existing Modules
1. **`src/lib/creative-automation/`**:
   - `types.ts`: Initial definitions for `CreativeStylePreset`, `MasterPromptTemplate`, `CreativeKeyword`, `CapabilityItem`, `WorkflowStepConfig`, `WorkflowDefinition`, `CreativeJob`, and `BrandProfile`.
   - `capabilityRegistry.ts`: 14 provider entries with `installedStatus` flags (`configured_api`, `installed`, `missing_key`).
   - `stylePresets.ts`: 5 style presets (`kinetic-explainer`, `screen-ui-walkthrough`, `marketing-commercial`, `cinematic-architecture`, `interior-3d-360`).
   - `promptLibrary.ts`: 5 master prompts with variable substitution.
   - `keywordLibrary.ts`: 30 categorized cinematic and motion design keywords.
   - `brandProfiles.ts`: Default Sutra Studio flagship brand configuration.
   - `trendResearchEngine.ts`: Trend observation synthesis with velocity tracking.
   - `workflowEngine.ts`: 14-step prototype workflow structure.

2. **`src/lib/services/aiPipeline.ts` & `outputProcessors.ts`**:
   - Live generation integration with **Black Forest Labs FLUX.1 Pro** (`BFL_API_KEY`) and **Pollinations AI** (zero-key fallback).
   - Video generation wrapper for **Kling AI** (`KLING_API_KEY`) and Runway Gen-3.
   - Voice synthesis with **ElevenLabs** (`ELEVENLABS_API_KEY`).
   - 3D model generation with **Tripo3D** (`TRIPO3D_API_KEY`).
   - Trend research integration with **SerpAPI** (`SERPAPI_API_KEY`) and **Google Gemini** (`GEMINI_API_KEY`).
   - Storage in Firestore collection `generated_outputs`.

3. **`src/app/admin/creative-automation/page.tsx`**:
   - Comprehensive dashboard featuring tabs for Workflows, Prompts, Keywords, Presets, Trends, Capabilities, Brands, and Jobs.

---

## 4. Gap Analysis & Required Enhancements

| Area | Current Baseline | Target Engine Requirement | Action Required |
|---|---|---|---|
| **Shot Presets** | 5 style presets only | 18 professional cinematic shot presets (aerial, drone orbit, fly-through, macro, match-cut, etc.) | Create dedicated `ShotPreset` library with all 18 creative specifications. |
| **Workflow Steps** | 14 hardcoded prototype steps | Configurable 8-step dynamic workflow (Brief, Creative Direction, Shot Planning, Image Gen, Video Gen, Editing, QA, Delivery) | Implement modular 8-step dynamic workflow orchestrator with dependency checking. |
| **Job States & Lifecycle** | Prototype in-memory array | Robust state machine: `draft → queued → processing → quality_check → completed` + `failed`, `cancelled` | Build Firestore-backed `CreativeJobStore` with execution logs and step recovery. |
| **Provider Adapters** | Ad-hoc fetch calls in processor functions | Unified `AIProviderAdapter` interface with cost, speed, format, rate-limiting, and automatic fallback | Standardize adapter layer with pluggable execution engine. |
| **Step Execution API** | Demo advance/reject endpoint only | Real asynchronous execution endpoint (`/api/admin/creative-automation/execute`) executing real providers | Build authenticated step runner calling Pollinations, BFL, Gemini, Kling. |
| **Quality Gate** | Basic aspect ratio check | Multi-factor QA validator (resolution, duration, aspect ratio, missing asset detection) | Extend quality gate and expose manual approval controls. |
| **Documentation** | Minimal internal notes | Full 17-file GitBook documentation suite under `docs/ai-creative-automation/` | Author complete documentation library and SUMMARY.md. |

---

## 5. Security & Isolation Directives

1. **Zero Secret Leaks**: All provider API keys (`GEMINI_API_KEY`, `BFL_API_KEY`, `KLING_API_KEY`, etc.) remain server-side only in `.env.local` and `readEnv()`. Never return keys in API responses or bundle them into client components.
2. **Zero Fake Executions**: When a provider is unconfigured, the engine explicitly marks the step as `blocked` or `missing_key` with clear instructions rather than manufacturing mock artifacts.
3. **Multi-Tenant Safeguard**: Client workspace only receives approved, watermarked, or finalized deliverables. Raw intermediate prompts, provider logs, and internal costs are strictly restricted to Studio Administrators.
4. **Idempotency**: Every job and step execution carries an idempotency token (`executionId`) to prevent duplicate API spend or redundant generation calls.
