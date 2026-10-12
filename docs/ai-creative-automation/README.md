# Sutra Studio — AI Creative Automation Platform
**Version:** 2.4.0  
**Environment:** Next.js 16 (App Router), React 19, TypeScript Strict, Cloud Firestore, Google Drive API  
**Branch:** `feature/creative-automation-master-system`

---

## 1. Overview

The **AI Creative Automation Platform** upgrades Sutra Studio from an agency website into a dynamic, multi-client creative production engine. It integrates trend research, screenplay drafting, scene-by-scene storyboards, capability dispatching, programmatic video rendering (Remotion, FFmpeg), and Google Drive Vault delivery into a unified 14-step pipeline.

### Core Philosophy
- **Authentic Brand Heritage:** Retains Sutra Studio's signature warm ivory palette (`#FAF9F5`), charcoal slate (`#171717`), and muted brass accents (`#A98B57`), rooted in sacred Indian proportion and calm luxury.
- **Client Segregation:** Full multi-tenant isolation preserving separate brand kits, negative style rules, reference assets, and approval queues.
- **Zero Hallucination / Zero Fake Media:** Strict safeguards prohibiting the generation or mock fabrication of final media during platform setup.
- **Human-in-the-Loop:** Mandatory approval gates before jobs advance from storyboard to rendering and delivery.

---

## 2. Platform Architecture Directory

```text
src/
├── lib/
│   └── creative-automation/
│       ├── types.ts                   # Core contracts & data schemas
│       ├── stylePresets.ts            # Observable creative style presets
│       ├── promptLibrary.ts           # Master Prompt Library (Categories A–E)
│       ├── keywordLibrary.ts          # Searchable technique & keyword dictionary
│       ├── capabilityRegistry.ts      # Live tool/adapter discovery & provider router
│       ├── workflowEngine.ts          # 14-step configurable pipeline & job simulator
│       ├── brandProfiles.ts           # Sutra flagship profile & multi-tenant schema
│       └── trendResearchEngine.ts     # Verified trends & audience topic analysis
├── app/
│   ├── admin/
│   │   └── creative-automation/
│   │       └── page.tsx               # Admin Creative Automation Studio UI
│   └── api/
│       └── admin/
│           └── creative-automation/   # Server-side guarded REST endpoints
│               ├── capabilities/
│               ├── prompts/
│               ├── keywords/
│               ├── workflows/
│               ├── brands/
│               ├── trends/
│               └── jobs/
```

---

## 3. Documentation Suite Index

1. [`EXISTING_SYSTEM_AUDIT.md`](file:///d:/SutraStudio/docs/ai-creative-automation/EXISTING_SYSTEM_AUDIT.md) — Comprehensive pre-implementation system audit.
2. [`ARCHITECTURE.md`](file:///d:/SutraStudio/docs/ai-creative-automation/ARCHITECTURE.md) — Technical architecture, state machines, and data models.
3. [`WORKFLOW_ENGINE.md`](file:///d:/SutraStudio/docs/ai-creative-automation/WORKFLOW_ENGINE.md) — 14-step execution lifecycle, approval gates, and retry policies.
4. [`PROMPT_LIBRARY.md`](file:///d:/SutraStudio/docs/ai-creative-automation/PROMPT_LIBRARY.md) — Categorized prompt catalog (Reels, UI Demos, Marketing, Cinematic, 3D).
5. [`KEYWORD_LIBRARY.md`](file:///d:/SutraStudio/docs/ai-creative-automation/KEYWORD_LIBRARY.md) — Searchable dictionary of creative keywords and technique rules.
6. [`CREATIVE_STYLE_PRESETS.md`](file:///d:/SutraStudio/docs/ai-creative-automation/CREATIVE_STYLE_PRESETS.md) — Observable presets extracted from reference media.
7. [`SKILLS_AND_PLUGINS.md`](file:///d:/SutraStudio/docs/ai-creative-automation/SKILLS_AND_PLUGINS.md) — Capability discovery, provider routing, and execution fallbacks.
8. [`TREND_RESEARCH.md`](file:///d:/SutraStudio/docs/ai-creative-automation/TREND_RESEARCH.md) — Topic discovery, search velocity, and audience research workflows.
9. [`SCREEN_TUTORIAL_WORKFLOWS.md`](file:///d:/SutraStudio/docs/ai-creative-automation/SCREEN_TUTORIAL_WORKFLOWS.md) — Screen recording, cursor tracking, and Next.js demo standards.
10. [`IMAGE_VIDEO_WORKFLOWS.md`](file:///d:/SutraStudio/docs/ai-creative-automation/IMAGE_VIDEO_WORKFLOWS.md) — Image generation & video assembly pipelines.
11. [`3D_INTERIOR_360_WORKFLOWS.md`](file:///d:/SutraStudio/docs/ai-creative-automation/3D_INTERIOR_360_WORKFLOWS.md) — 3D mesh modeling, equirectangular panoramas, and WebGL viewers.
12. [`ADMIN_EDITOR.md`](file:///d:/SutraStudio/docs/ai-creative-automation/ADMIN_EDITOR.md) — Admin Creative Automation Studio interface and controls.
13. [`MULTI_CLIENT_SYSTEM.md`](file:///d:/SutraStudio/docs/ai-creative-automation/MULTI_CLIENT_SYSTEM.md) — Multi-client tenant structure, security boundaries, and custom kits.
14. [`API_REFERENCE.md`](file:///d:/SutraStudio/docs/ai-creative-automation/API_REFERENCE.md) — Specifications for all `/api/admin/creative-automation/*` endpoints.
15. [`SECURITY.md`](file:///d:/SutraStudio/docs/ai-creative-automation/SECURITY.md) — Authentication, credential protection, and Firestore security rules.
16. [`QA_REPORT.md`](file:///d:/SutraStudio/docs/ai-creative-automation/QA_REPORT.md) — Validation checklist, responsive verification, and lint results.
17. [`IMPLEMENTATION_REPORT.md`](file:///d:/SutraStudio/docs/ai-creative-automation/IMPLEMENTATION_REPORT.md) — Step-by-step audit of completed deliverables.

---

## 4. Key Directives & Operating Constraints
- **Zero Media Generation During Setup:** All pipelines are configured to register specifications and queues without invoking billing or generative media APIs.
- **Preserved Identity:** Official Sutra logo, warm ivory tokens, and canonical pricing (₹99 to ₹19,999) remain intact.
