# Changelog — Sutra Studio AI Creative Automation Engine

All notable changes to the AI Creative Automation Engine are documented in this file.

---

## [2.4.0] — 2026-10-13

### Added
- **Dynamic 8-Step Pipeline**: Implemented `DYNAMIC_8_STEP_PIPELINE` in `dynamicWorkflowEngine.ts` covering Brief, Direction, Shot Planning, Image Gen, Video Gen, Editing, QA, and Export.
- **18 Professional Cinematic Shot Presets**: Complete cinematographic library in `shotPresets.ts` with camera motion, focal lenses, lighting setups, and negative prompts.
- **Interactive Shot Prompt Compiler**: Built `compileShotPrompt` and integrated live preview into Admin Studio.
- **AI Provider Adapter Layer**: Common interface `AIProviderAdapter` with smart router selecting among Gemini 2.0, BFL FLUX.1 [pro], Pollinations FLUX, Kling AI 1.5, and Local Cognitive Template Engine.
- **Dual-Mode Persistence**: Implemented `CreativeJobStore` with automatic Firestore synchronization (`creative_jobs`, `job_execution_logs`) and in-memory cache resilience.
- **Admin Studio Integration**: Added Cinematic Shots inspection tab, step runner execution controls, retry/cancel buttons, and live step progress indicators (`Step 3 of 8`).
- **REST API Endpoints**: Created `/api/admin/creative-automation/shot-presets`, updated `/jobs`, `/workflows`, and `/providers`.
- **Complete GitBook Suite**: 17 comprehensive documentation manuals under `docs/ai-creative-automation/` with `SUMMARY.md`.

### Security & Governance
- **Zero Mock Policy**: Explicit missing key disclosures and fallback routing rather than fake synthetic video/image generation.
- **Idempotency & RBAC**: Enforced `requireAdmin()` and `sameOrigin()` on all mutating endpoints.

---

## [2.0.0] — 2026-10-10
- Initial 14-step creative pipeline scaffolding and prompt library catalog.
- Brand profiles architecture for multi-tenant luxury ateliers.
- Client Portal deliverable isolation.

---

## [1.0.0] — 2026-09-15
- Core Sutra Studio luxury website architecture, Firebase authentication, and warm ivory design tokens.
