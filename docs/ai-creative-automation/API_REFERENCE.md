# Backend API Reference
**Document:** `docs/ai-creative-automation/API_REFERENCE.md`  
**Version:** 2.4.0

---

## 1. Endpoints Overview

All creative automation endpoints are located under `/api/admin/creative-automation/*` and require an authenticated admin session (`requireAdmin()`) and same-origin validation (`sameOrigin()`) for mutations.

---

### `GET /api/admin/creative-automation/capabilities`
Returns the live capability registry, configured tool counts, and missing API key counts.

**Response (200 OK):**
```json
{
  "success": true,
  "capabilities": [...],
  "totalCount": 14,
  "configuredCount": 6,
  "missingKeyCount": 8
}
```

---

### `GET /api/admin/creative-automation/prompts?category={category}`
Fetches master prompt templates, optionally filtered by category.

**Response (200 OK):**
```json
{
  "success": true,
  "prompts": [...],
  "totalCount": 6
}
```

---

### `POST /api/admin/creative-automation/prompts`
Creates or updates a versioned prompt template.

---

### `GET /api/admin/creative-automation/keywords?category={cat}&q={query}&enabled=true`
Searches creative keywords across categories with optional search queries.

---

### `POST /api/admin/creative-automation/keywords`
Enables or disables a creative keyword.

**Payload:**
```json
{
  "keywordId": "kw-cin-lighting",
  "isEnabled": true
}
```

---

### `GET /api/admin/creative-automation/workflows`
Returns active workflow definitions and standard 14-step blueprints.

---

### `POST /api/admin/creative-automation/workflows`
Saves or updates custom workflow pipelines.

---

### `GET /api/admin/creative-automation/brands`
Lists multi-client brand profiles.

---

### `POST /api/admin/creative-automation/brands`
Registers or updates a client brand profile.

---

### `POST /api/admin/creative-automation/trends`
Executes market research query.

**Payload:**
```json
{
  "industry": "Creative Technology",
  "targetAudience": "Agency Founders",
  "platform": "instagram_reels"
}
```

---

### `GET /api/admin/creative-automation/jobs`
Lists active creative jobs and pending approval counts.

---

### `POST /api/admin/creative-automation/jobs`
Manages creative jobs and advances approval stages.

**Actions:**
- `action: "create"` — Initialises new job specification.
- `action: "approve"` — Advances job past approval gate.
- `action: "reject"` — Requests revision on job step.
