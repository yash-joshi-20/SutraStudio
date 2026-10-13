# 02 — System Architecture & Data Flow

The Sutra Studio AI Creative Automation Engine is engineered as a modular, extensible orchestration platform integrated directly inside Next.js App Router and Node.js. It bridges creative direction briefs, AI generation engines, cloud storage vaults, and multi-tenant admin dashboards without introducing secondary microservices or SQL databases.

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
    subgraph Client_Admin_Layer [Client & Admin Interfaces]
        AdminUI["Admin Studio Dashboard (/admin/creative-automation)"]
        ClientPortal["Client Brand Portal (/portal/overview)"]
        RESTAPI["REST API Contracts (/api/admin/creative-automation/*)"]
    end

    subgraph Orchestration_Layer [Workflow Orchestration & Core Services]
        WorkflowOrch["Dynamic Workflow Orchestrator (dynamicWorkflowEngine.ts)"]
        JobStore["Job Store & State Machine (jobStore.ts)"]
        ShotPlanner["18 Cinematic Shot Planner (shotPresets.ts)"]
        PromptCompiler["Master Prompt & Keyword Compiler"]
    end

    subgraph Adapter_Layer [AI Provider Adapter Registry]
        AdapterRouter["Smart Provider Adapter Router (providerAdapters.ts)"]
        GeminiAdapter["Google Gemini 2.0 (Scripting & Vision)"]
        BflAdapter["BFL FLUX.1 [pro] (High-Res Images)"]
        PollinationsAdapter["Pollinations FLUX (Zero-Key Fallback)"]
        KlingAdapter["Kling AI 1.5 (Dynamic Video)"]
        LocalAdapter["Local Cognitive Template Engine"]
    end

    subgraph Persistence_Storage [Persistence & Distribution]
        Firestore["Google Firestore (creative_jobs, job_execution_logs)"]
        GDrive["Google Drive Production Media Vault"]
        n8nEngine["n8n Webhook & Multi-Channel Distribution"]
    end

    AdminUI --> RESTAPI
    ClientPortal --> RESTAPI
    RESTAPI --> JobStore
    RESTAPI --> WorkflowOrch
    WorkflowOrch --> ShotPlanner
    WorkflowOrch --> AdapterRouter
    JobStore --> Firestore
    AdapterRouter --> GeminiAdapter
    AdapterRouter --> BflAdapter
    AdapterRouter --> PollinationsAdapter
    AdapterRouter --> KlingAdapter
    AdapterRouter --> LocalAdapter
    JobStore --> GDrive
    JobStore --> n8nEngine
```

---

## 🔄 Job State Machine

Each creative production job strictly transitions through well-defined lifecycle states:

```mermaid
stateDiagram-v2
    [*] --> draft : User or Admin defines brief
    draft --> queued : Register in production queue
    queued --> processing : executeStepRunner starts step
    processing --> quality_check : Provider generates asset
    quality_check --> paused_for_approval : If step requires human sign-off
    paused_for_approval --> processing : Approved / next step
    quality_check --> processing : Next step (if automated)
    quality_check --> completed : All pipeline steps finished
    processing --> failed : Provider error / Rate limit / Missing key
    failed --> queued : retryStep triggered
    queued --> cancelled : Admin terminates job
    processing --> cancelled : Admin terminates job
    completed --> [*]
    cancelled --> [*]
```

### State Definitions

1. `draft`: Job parameters and creative brief are defined but not queued for execution.
2. `queued`: Job is registered in Firestore / memory queue and pending invocation of Step 1.
3. `processing`: An active step runner is interacting with an AI provider adapter.
4. `quality_check`: Generated output (resolution, format, prompt fidelity) is undergoing validation.
5. `paused_for_approval`: Execution is held at a designated human approval gate for Creative Director review.
6. `completed`: All dynamic steps are executed and deliverables are synced with Google Drive.
7. `failed`: Execution encountered an unrecoverable provider failure, timeout, or missing credential.
8. `cancelled`: Administrator manually stopped the job.

---

## 📦 Core Domain Entities

```mermaid
erDiagram
    CreativeJob ||--o{ JobStepRecord : contains
    CreativeJob ||--o{ JobExecutionLog : generates
    CreativeJob }|--|| BrandProfile : isolated_by
    CreativeJob }|--|| WorkflowDefinition : instantiates
    JobStepRecord }|--o| ShotPreset : references
    JobStepRecord }|--o| MediaAsset : produces

    CreativeJob {
        string id PK
        string brandId FK
        string clientUid
        string workflowId FK
        string title
        string category
        string status
        int currentStepIndex
        float totalCostUsd
        string createdAt
        string updatedAt
    }

    JobStepRecord {
        int stepIndex PK
        string stepId
        string name
        string status
        float costUsd
        string reviewedBy
        string completedAt
    }

    JobExecutionLog {
        string id PK
        string jobId FK
        int stepIndex
        string provider
        string status
        int durationMs
        float costUsd
        string timestamp
    }

    ShotPreset {
        string id PK
        string name
        string category
        string cameraMovement
        string lensStyleGuidance
        string lightingAtmosphere
        string aspectRatio
        float durationTargetSeconds
    }
```

---

## 🛡️ Architecture Invariants

- **No SQL Database**: All job metadata, tenant settings, and step execution records are saved in Firebase Firestore and synchronized with in-memory mirrors.
- **Client Segregation**: Client dashboards (`/portal/*`) only receive finalized deliverable URLs and approved status strings. Internal prompts, provider configurations, error traces, and API keys are strictly forbidden from leaking to client contexts.
- **Idempotent Step Runner**: Calling `executeStepRunner(jobId, stepIndex)` repeatedly cannot create duplicate billing transactions or corrupted state.
