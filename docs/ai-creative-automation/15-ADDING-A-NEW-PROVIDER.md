# 15 — Developer Guide: Adding a New AI Provider

This guide walks through implementing and registering a new AI Provider Adapter in Sutra Studio.

---

## 🛠️ Step-by-Step Implementation

### Step 1: Implement the `AIProviderAdapter` Interface
Create your adapter class in `src/lib/creative-automation/providerAdapters.ts`:

```typescript
import { isEnvSet, readEnv } from "@/lib/config/env";
import {
  AIProviderAdapter,
  ProviderTask,
  ProviderExecutionResult,
} from "./providerAdapters";
import { CapabilityType } from "./types";

export class LumaDreamMachineAdapter implements AIProviderAdapter {
  readonly providerId = "provider-luma-video";
  readonly name = "Luma Dream Machine Video";
  readonly description = "High-fidelity cinematic camera motions & physics";
  readonly capabilities: CapabilityType[] = ["video_generation"];

  isAvailable(): boolean {
    return isEnvSet("LUMA_API_KEY");
  }

  estimateCost(task: ProviderTask) {
    return { estimatedCostUsd: 0.12, unit: "per 5s video" };
  }

  getMissingKeyNotice(): string | null {
    if (this.isAvailable()) return null;
    return "LUMA_API_KEY is not configured in server environment. Set LUMA_API_KEY to enable Luma Dream Machine renders.";
  }

  async execute(task: ProviderTask): Promise<ProviderExecutionResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        providerId: this.providerId,
        model: "luma-dream-machine-v1.5",
        costUsd: 0,
        durationMs: 0,
        missingKeyNotice: this.getMissingKeyNotice() || undefined,
      };
    }

    const start = Date.now();
    try {
      // Execute API call to Luma SDK / REST API
      const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${readEnv("LUMA_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: task.prompt,
          aspect_ratio: task.aspectRatio || "16:9",
        }),
      });

      const data = await response.json();
      const durationMs = Date.now() - start;

      return {
        success: true,
        providerId: this.providerId,
        model: "luma-dream-machine-v1.5",
        outputUrl: data.video_url,
        costUsd: 0.12,
        durationMs,
      };
    } catch (err: any) {
      return {
        success: false,
        providerId: this.providerId,
        model: "luma-dream-machine-v1.5",
        costUsd: 0,
        durationMs: Date.now() - start,
        error: err?.message || "Luma API execution error",
      };
    }
  }
}
```

---

### Step 2: Register in `ALL_AI_ADAPTERS`
Add the new adapter instance to `ALL_AI_ADAPTERS` in `providerAdapters.ts`:

```typescript
export const ALL_AI_ADAPTERS: AIProviderAdapter[] = [
  new GeminiProviderAdapter(),
  new BflFluxAdapter(),
  new PollinationsImageAdapter(),
  new KlingVideoAdapter(),
  new LumaDreamMachineAdapter(), // Added here
  new LocalTemplateAdapter(),
];
```

---

### Step 3: Verify with TypeCheck & Provider Inspection API
1. Run `npm run typecheck` to ensure the adapter conforms to all interface contracts.
2. Query `GET /api/admin/creative-automation/providers` to confirm the new adapter appears in the Admin capabilities list.
