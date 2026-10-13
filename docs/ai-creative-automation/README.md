# SUTRA STUDIO — AI Creative Automation Engine
## Enterprise Production & GitBook Documentation Hub

Welcome to the **Sutra Studio AI Creative Automation Engine** documentation. This system provides autonomous, multi-step image and video production pipelines, cinematic shot planning, smart AI provider adapters, Firebase/Firestore persistence, Google Drive asset management, and n8n orchestration.

---

## 🏛️ System Philosophy & Core Guardrails

1. **Warm Ivory & Luxury Atelier Aesthetics**: Built with Sutra Studio's signature ivory (`#FAF9F5`), charcoal (`#171717`), and muted brass (`#A98B57`) design system.
2. **Deterministic Dual-Mode Persistence**: Primary real-time state stored in Google Firestore (`creative_jobs`, `job_execution_logs`), backed by an in-memory fallback layer for seamless offline and low-latency operation.
3. **Zero Fake Outputs**: When external commercial credentials (`BFL_API_KEY`, `KLING_API_KEY`) are missing, the system never fabricates synthetic assets. Instead, it surfaces honest status notices, actionable setup instructions, and automatically executes zero-key fallback adapters (Pollinations AI, Local Cognitive Template Engine).
4. **Human-in-the-Loop Governance**: Multi-stage creative reviews, approval gates, idempotent step execution, and audit tracing ensure full creative director control over brand fidelity.

---

## 📚 GitBook Documentation Library

This documentation suite is organized for seamless browsing in GitBook and markdown viewers:

| File | Title | Description |
|---|---|---|
| [01-PROJECT-AUDIT.md](./01-PROJECT-AUDIT.md) | Project Audit & Integration Baseline | Technical audit of existing Next.js App Router, Firebase, and APIs. |
| [02-SYSTEM-ARCHITECTURE.md](./02-SYSTEM-ARCHITECTURE.md) | System Architecture & Flow | Architectural blueprint, entity models, and runtime sequence. |
| [03-WORKFLOW-ENGINE.md](./03-WORKFLOW-ENGINE.md) | Dynamic Workflow Orchestrator | Core state machine, dependency validator, and job execution runner. |
| [04-WORKFLOW-STEPS.md](./04-WORKFLOW-STEPS.md) | 8-Step Dynamic Pipeline | Specification of the 8 canonical creative production stages. |
| [05-AI-PROVIDER-ADAPTERS.md](./05-AI-PROVIDER-ADAPTERS.md) | Smart AI Provider Adapters | Adapter layer for Gemini, BFL FLUX, Pollinations, Kling, and Local Engine. |
| [06-CINEMATIC-SHOT-PRESETS.md](./06-CINEMATIC-SHOT-PRESETS.md) | 18 Cinematic Shot Presets | Complete library of 18 camera, lens, and lighting presets. |
| [07-API-REFERENCE.md](./07-API-REFERENCE.md) | API Contracts & Endpoints | Complete REST contracts for Jobs, Workflows, Shot Presets, and Providers. |
| [08-ADMIN-DASHBOARD.md](./08-ADMIN-DASHBOARD.md) | Admin Studio Integration | Admin UI walkthrough, workflow builder, shot tester, and job queue. |
| [09-FIREBASE-AND-STORAGE.md](./09-FIREBASE-AND-STORAGE.md) | Firebase & Google Drive Vault | Firestore collections, security rules, and Google Drive vault syncing. |
| [10-N8N-INTEGRATION.md](./10-N8N-INTEGRATION.md) | n8n Webhook & Distribution | Webhook payload structures, event triggers, and distribution nodes. |
| [11-SECURITY-AND-SECRETS.md](./11-SECURITY-AND-SECRETS.md) | Security, Roles & Secret Handling | Session guarding, CSRF protection, and zero-leak credential hygiene. |
| [12-TESTING-AND-QA.md](./12-TESTING-AND-QA.md) | Testing & Quality Assurance | Verification test matrices, retry safety, and test commands. |
| [13-DEPLOYMENT.md](./13-DEPLOYMENT.md) | Production Deployment Guide | Environment variables, containerization, and Vercel/Node deployment. |
| [14-TROUBLESHOOTING.md](./14-TROUBLESHOOTING.md) | Troubleshooting & Diagnostics | Error codes, rate limit recovery, and credential remediation. |
| [15-ADDING-A-NEW-PROVIDER.md](./15-ADDING-A-NEW-PROVIDER.md) | Developer Guide: New AI Provider | Step-by-step instructions for implementing an `AIProviderAdapter`. |
| [16-ADDING-A-NEW-WORKFLOW.md](./16-ADDING-A-NEW-WORKFLOW.md) | Developer Guide: New Workflow | Step-by-step instructions for defining custom workflow templates. |
| [CHANGELOG.md](./CHANGELOG.md) | Engine Release History | Version history and major capability milestones. |
| [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) | Master Implementation QA Report | Final verification audit, git commit details, and delivery log. |

---

## ⚡ Quick Start (Developer Setup)

```bash
# 1. Inspect TypeScript compiler validity
npm run typecheck

# 2. Run unit & integration test suites
npm run test

# 3. Launch local dev server
npm run dev
```

Navigate to [http://localhost:3000/admin/creative-automation](http://localhost:3000/admin/creative-automation) to access the studio.
