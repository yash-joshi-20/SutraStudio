# Provider Integration Guide — Adding New AI Capabilities
**Document:** `docs/ai-creative-automation/PROVIDER_INTEGRATION_GUIDE.md`  
**Version:** 2.4.0  
**Status:** Canonical Engineering SOP

---

## 1. Overview

The Sutra Studio AI Creative Automation Platform employs a decoupled provider adapter pattern. Adding a new external provider (e.g., Luma Dream Machine, Suno Audio, Midjourney API, Minimax) involves 4 standardized steps without touching existing UI components or disruptive database migrations.

---

## 2. Standard 4-Step Integration Lifecycle

### Step 1: Declare the Environment Secret
Add the new provider's secret variable name to `src/lib/config/env.ts` under `EnvKey`:

```typescript
export type EnvKey =
  | ...
  | "LUMA_API_KEY"
  | "SUNO_API_KEY";
```

*Rule: Never add default mock secrets or commit `.env.local` to Git.*

---

### Step 2: Register in `capabilityRegistry.ts`
Append the new adapter definition into `getLiveCapabilityRegistry()` in `src/lib/creative-automation/capabilityRegistry.ts`:

```typescript
const lumaConfigured = isEnvSet("LUMA_API_KEY" as EnvKey);

{
  id: "cap-luma-dream-machine",
  name: "Luma Dream Machine 1.5",
  type: "video_generation",
  provider: "Luma AI",
  installedStatus: lumaConfigured ? "configured_api" : "missing_key",
  executionMethod: "api_cloud",
  supportedCapabilities: ["video_generation"],
  authRequirements: {
    envKey: "LUMA_API_KEY",
    isConfigured: lumaConfigured,
    instructions: "Acquire key from lumalabs.ai and set LUMA_API_KEY in server secrets.",
  },
  inputOutputFormats: {
    acceptedInputs: ["prompt", "aspect_ratio", "keyframe_image"],
    producedOutputs: ["video/mp4 (1080p)"],
  },
  estimatedCost: {
    costPerUnit: 0.12,
    unit: "per 5s generation",
  },
  rateLimits: {
    rpm: 5,
  },
  errorHandling: "Poll task URL; on failure fallback to Kling or Remotion.",
  fallbackOptionId: "cap-remotion-engine",
  notes: "High camera responsiveness and fast realistic generation.",
}
```

---

### Step 3: Configure the Router Fallback Chain
In `src/lib/ai/providerRouter.ts`, link the new adapter into the appropriate task chain (e.g., `video`, `image`, `audio`).

---

### Step 4: Verify via Health Check
Execute the health check endpoint:
```bash
curl -H "Cookie: sutra_session=..." http://localhost:3000/api/admin/creative-automation/health
```
Verify that:
1. When the key is unset, the provider displays status `"missing_key"` and the system falls back gracefully.
2. When the key is set, the provider displays status `"configured_api"`.
