# 09 — Firebase Firestore & Google Drive Storage Architecture

Sutra Studio utilizes Google Firebase for application state, metadata, and execution auditing, paired with Google Drive as the enterprise media storage vault for 4K video renders, 3D GLB meshes, and master imagery.

---

## 🔥 Firestore Database Schema

Firestore stores structured data across four primary collections:

```mermaid
erDiagram
    creative_jobs ||--o{ job_execution_logs : traces
    creative_jobs }|--|| brand_profiles : scoped_by
    creative_jobs }|--|| workflow_definitions : implements

    creative_jobs {
        string id PK
        string brandId
        string clientUid
        string workflowId
        string title
        string category
        string status
        int currentStepIndex
        array steps
        map targetDeliverables
        map brief
        map script
        array storyboard
        float totalCostUsd
        timestamp createdAt
        timestamp updatedAt
    }

    job_execution_logs {
        string id PK
        string jobId FK
        int stepIndex
        string stepId
        string provider
        string action
        string status
        int durationMs
        float costUsd
        map inputPayload
        map outputPayload
        string error
        timestamp timestamp
    }
```

### Collection Definitions

1. **`creative_jobs`**:
   - Stores current and historical creative jobs.
   - Indexed on `updatedAt DESC` and `clientUid + updatedAt DESC` for fast dashboard queries.
2. **`job_execution_logs`**:
   - Immutable audit trail recording each provider call, payload, latency, cost, and error message.
3. **`brand_profiles`**:
   - Stores client-specific branding guidelines, primary/accent colors, voice tones, and negative style rules.
4. **`workflow_definitions`**:
   - Stores custom and duplicated workflow templates configured by administrators.

---

## 💾 Dual-Mode Memory Cache Layer

To ensure resilient operation even when Firebase credentials are not yet configured or during development:
- `CreativeJobStore` maintains `MEMORY_JOB_CACHE` and `MEMORY_LOG_CACHE`.
- Whenever a job is created, updated, or advanced, it updates the memory cache first, then asynchronously persists to Firestore inside a safe try/catch wrapper.
- Reads query Firestore first, falling back to the memory cache if Firestore returns an error or is uninitialized.

---

## 📁 Google Drive Media Vault Integration

Large media files (MP4 videos, ProRes exports, GLB meshes, PNG keyframes) are stored in Google Drive rather than base64 strings or short-lived server memory.

### Configuration
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`: The parent folder under which all studio assets are cataloged.
- Service account authentication via `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`.

### Folder Organization
```text
Google Drive Root /
└── SutraStudio_Vault /
    ├── brand-sutra-flagship /
    │   ├── 2026-10 /
    │   │   └── job-mf39-abc /
    │   │       ├── step-04_keyframe-01.png
    │   │       ├── step-05_scene-01.mp4
    │   │       └── master_render_final.mp4
    └── client-tenant-xyz /
        └── ...
```

### MediaAsset Tracking
When an asset is uploaded to Google Drive, a `MediaAsset` record is attached to the job with:
- `driveFileId`: Unique Google Drive file ID.
- `driveViewLink`: Direct preview URL for the admin/client viewer.
- `mimeType`: Standard MIME type (e.g., `video/mp4`, `image/png`).
- `dimensions`: Width, height, and aspect ratio metadata.
