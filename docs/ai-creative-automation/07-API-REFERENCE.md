# 07 — REST API Reference & Contracts

All Sutra Studio creative automation endpoints are protected by `requireAdmin()` session authentication and `sameOrigin()` CSRF validation. Requests require valid studio administrator privileges.

---

## 📋 Endpoint Index

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/creative-automation/jobs` | List all jobs or fetch single job with execution logs |
| `POST` | `/api/admin/creative-automation/jobs` | Create, execute step, retry, cancel, approve, or reject |
| `GET` | `/api/admin/creative-automation/workflows` | List default workflows and dynamic 8-step pipeline |
| `POST` | `/api/admin/creative-automation/workflows` | Save workflow, duplicate template, or validate steps |
| `GET` | `/api/admin/creative-automation/shot-presets` | List 18 cinematic shot presets with tag/category filters |
| `POST` | `/api/admin/creative-automation/shot-presets` | Compile production prompt for a specific shot preset |
| `GET` | `/api/admin/creative-automation/providers` | Check live AI provider status, health, and missing keys |
| `POST` | `/api/admin/creative-automation/providers` | Query smart provider selection for a sample task |
| `GET` | `/api/admin/creative-automation/capabilities` | Inspect full capability registry items |
| `POST` | `/api/admin/creative-automation/trends` | Execute verified trend research query |

---

## 🔍 Detailed Endpoint Contracts

### 1. Creative Jobs: `GET /api/admin/creative-automation/jobs`
Query parameters:
- `jobId` *(optional)*: Fetch specific job details alongside its execution audit logs.
- `status` *(optional)*: Filter by job status (`queued`, `processing`, `paused_for_approval`, `completed`, `failed`).
- `clientUid` *(optional)*: Filter jobs by tenant client UID.

**Response (200 OK)**:
```json
{
  "jobs": [
    {
      "id": "job-mf39-abc",
      "brandId": "brand-sutra-flagship",
      "title": "Autumn 2026 AI Automation Reel",
      "status": "processing",
      "currentStepIndex": 3,
      "totalCostUsd": 0.041,
      "steps": [ ... ]
    }
  ],
  "totalCount": 12,
  "pendingApprovalCount": 2
}
```

---

### 2. Job Operations: `POST /api/admin/creative-automation/jobs`
Accepts an `action` payload:

#### Action: `create`
```json
{
  "action": "create",
  "newJobParams": {
    "brandId": "brand-sutra-flagship",
    "clientUid": "admin-sutra-master",
    "title": "Autonomous Reel Showcase",
    "workflowId": "wf-dynamic-8-master",
    "category": "cinematic_video",
    "brief": {
      "topic": "Luxury Architecture",
      "targetAudience": "HNW Individuals",
      "keyMessage": "Sculpted sanctuary in Rajasthan.",
      "tone": "luxury_atelier"
    }
  }
}
```

#### Action: `execute_step`
Executes a step via the designated AI Provider Adapter.
```json
{
  "action": "execute_step",
  "jobId": "job-mf39-abc",
  "stepIndex": 4
}
```

#### Action: `retry`
Resets a failed or halted step back to pending.
```json
{
  "action": "retry",
  "jobId": "job-mf39-abc",
  "stepIndex": 4
}
```

#### Action: `approve`
Passes a human approval gate and advances to the next step.
```json
{
  "action": "approve",
  "jobId": "job-mf39-abc",
  "approvalNotes": "Storyboard approved by Creative Director."
}
```

#### Action: `cancel`
```json
{
  "action": "cancel",
  "jobId": "job-mf39-abc",
  "reason": "Brief revised by client."
}
```

---

### 3. Shot Presets: `GET /api/admin/creative-automation/shot-presets`
Query parameters:
- `category`: `architectural`, `product`, `brand_film`, `aerial`, `social_motion`.
- `search`: Keyword string matching preset name, purpose, or camera movement.

**Response (200 OK)**:
```json
{
  "totalCount": 18,
  "presets": [
    {
      "id": "shot-aerial-establishing",
      "name": "Aerial Establishing Shot",
      "category": "architectural",
      "cameraMovement": "High-altitude slow forward drifting drone movement...",
      "aspectRatio": "16/9",
      "durationTargetSeconds": 4
    }
  ]
}
```

---

### 4. Shot Prompt Compiler: `POST /api/admin/creative-automation/shot-presets`
```json
{
  "presetId": "shot-drone-forward-reveal",
  "subject": "travertine courtyard pavilion",
  "environment": "golden hour sunset horizon",
  "lighting": "warm volumetric god rays",
  "details": "sculpted ivory archway, brass accents"
}
```

**Response (200 OK)**:
```json
{
  "compiledPrompt": "Cinematic forward reveal gliding past sculpted ivory archway to unveil majestic view of travertine courtyard pavilion... Lighting: warm volumetric god rays... Camera Movement: Low-to-high ascending push-in...",
  "recommendedAspectRatio": "16/9",
  "lensStyle": "35mm prime cinema lens, shallow foreground falloff (f/4)"
}
```

---

### 5. Provider Status: `GET /api/admin/creative-automation/providers`
**Response (200 OK)**:
```json
{
  "totalCount": 5,
  "availableCount": 2,
  "missingKeyCount": 3,
  "providers": [
    {
      "providerId": "provider-gemini-2",
      "name": "Google Gemini 2.0 Flash / Pro",
      "isAvailable": false,
      "missingKeyNotice": "GEMINI_API_KEY is not configured in environment variables."
    },
    {
      "providerId": "provider-pollinations-image",
      "name": "Pollinations FLUX Free Tier",
      "isAvailable": true,
      "missingKeyNotice": null
    }
  ]
}
```
