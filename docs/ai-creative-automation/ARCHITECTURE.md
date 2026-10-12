# Technical Architecture — AI Creative Automation Platform
**Document:** `docs/ai-creative-automation/ARCHITECTURE.md`  
**Version:** 2.4.0  
**Status:** Approved

---

## 1. System Topology

The platform architecture bridges Next.js server components, client dashboard controls, isolated Firestore collections, Google Drive streaming proxies, and third-party AI provider adapters.

```
       ┌────────────────────────────────────────────────────────┐
       │                   Next.js 16 App Router                │
       │                                                        │
       │  [Admin Studio /admin/creative-automation]             │
       │        │                   │                           │
       │        ▼                   ▼                           │
       │  Workflow Engine    Capability Registry                │
       │        │                   │                           │
       │        ▼                   ▼                           │
       │  Job State Machine   Provider Adapter Chain            │
       └────────┬───────────────────┬───────────────────────────┘
                │                   │
                ▼                   ▼
       ┌─────────────────┐ ┌────────────────────────────────────┐
       │ Google Cloud    │ │ Provider Adapters (Simulated / Live)│
       │ Firestore       │ │  - Google Gemini 2.0 (Cognitive)   │
       │  - brandProfiles│ │  - Pollinations / BFL FLUX (Image) │
       │  - creativeJobs │ │  - Kling / Runway (Video)          │
       │  - prompts      │ │  - Remotion / FFmpeg (Render)      │
       │  - auditLedger  │ │  - ElevenLabs (Voice)              │
       └─────────────────┘ │  - Tripo3D / Three.js (3D & 360)   │
                           └────────────────────────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ Google Drive    │
                           │ Vault Storage   │
                           └─────────────────┘
```

---

## 2. Core Entities & Data Schema

### 1. BrandProfile
- Identifies the tenant (`clientUid`).
- Specifies brand palette tokens (`primaryColor`, `accentColor`, `backgroundColor`).
- Contains voice tone, typography rules, negative constraints, and approved prompt templates.

### 2. WorkflowDefinition & StepConfig
- Defines an ordered sequence of 1 to 14 production stages.
- Maps each stage to a `CapabilityType` and preferred `CapabilityItem`.
- Implements human approval flags (`requiresHumanApproval`), retry limits, and input/output schema validation.

### 3. CreativeJob
- Represents an execution instance of a workflow for a specific brand.
- Tracks step progression (`stepIndex`, `status`, `costUsd`, `reviewedBy`, `approvalNotes`).
- Maintains creative deliverables: creative brief, timed screenplay, scene storyboard, and output delivery references.

### 4. MasterPromptTemplate
- Versioned creative prompt with strict negative constraints, input parameters (`{{brand_name}}`, `{{industry}}`, `{{hook}}`), and output quality checks.

---

## 3. Execution Pipeline & Fallback Chains

1. **Cognitive Tier (Brief, Script, Storyboard):**
   `Google Gemini 2.0 Flash` → `OpenAI GPT-4o` → `Local Template Compiler`
2. **Visual Imaging Tier:**
   `BFL FLUX.1 [pro]` → `Pollinations AI Free Tier` → `Local Curated Vault`
3. **Motion Video Tier:**
   `Kling AI / Runway Gen-3` → `Remotion Programmatic Composition` → `FFmpeg Stitch`
4. **Spatial & 3D Tier:**
   `Tripo3D Mesh Generator` → `Three.js Procedural Geometry / Panorama Viewer`
5. **Storage & Vault Tier:**
   `Google Drive API Enterprise Folder` → `Firestore Metadata Record`
