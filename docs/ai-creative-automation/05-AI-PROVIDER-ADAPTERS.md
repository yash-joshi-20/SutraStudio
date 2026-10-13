# 05 — Smart AI Provider Adapters & Capability Selection

Sutra Studio utilizes an adapter layer isolating AI engine implementations behind a standardized TypeScript interface (`AIProviderAdapter`). This ensures new AI providers can be plugged in without refactoring the core workflow engine.

---

## 🔌 The `AIProviderAdapter` Interface

Defined in `src/lib/creative-automation/providerAdapters.ts`:

```typescript
export interface AIProviderAdapter {
  readonly providerId: string;
  readonly name: string;
  readonly description?: string;
  readonly capabilities: CapabilityType[];
  isAvailable(): boolean;
  estimateCost(task: ProviderTask): { estimatedCostUsd: number; unit: string };
  execute(task: ProviderTask): Promise<ProviderExecutionResult>;
  getMissingKeyNotice?(): string | null;
}
```

---

## 🧠 Smart Provider Selection Algorithm

When a workflow step triggers an autonomous task, `selectBestProviderAdapter(task)` evaluates:

```mermaid
graph TD
    A[Incoming ProviderTask] --> B{Filter by Supported Capability}
    B --> C{Check API Key Availability}
    C -->|API Key Configured| D[Return Primary Adapter + Fallbacks]
    C -->|No Key Configured| E{Is Zero-Key Alternative Available?}
    E -->|Yes (e.g. Pollinations FLUX)| F[Select Zero-Key Engine]
    E -->|No| G[Return Missing Key Notice & Block Gracefully]
```

### Selection Criteria:
1. **Task Capability Match**: Verifies the provider supports the required output (e.g. `image_generation`, `video_generation`, `scriptwriting`).
2. **Credential Health**: Confirms corresponding environment keys exist.
3. **Cost & Quality Weighting**: Routes mission-critical client projects to high-fidelity endpoints (BFL FLUX, Gemini Pro) when keys exist.
4. **Graceful Fallback**: Automatically cascades to zero-key or alternative engines when primary endpoints are unconfigured.

---

## 🤖 Registered Provider Adapters

### 1. Google Gemini 2.0 Flash / Pro (`GeminiProviderAdapter`)
- **Capabilities**: `scriptwriting`, `topic_ideation`, `prompt_enhancement`, `trend_research`.
- **Environment Key**: `GEMINI_API_KEY`.
- **Pricing**: $0.001 per 1,000 tokens.
- **Role**: Primary cognitive brain for scriptwriting, hook ideation, and shot planning compilation.

### 2. Black Forest Labs FLUX.1 [pro] (`BflFluxAdapter`)
- **Capabilities**: `image_generation`, `image_editing`.
- **Environment Key**: `BFL_API_KEY`.
- **Endpoint**: `https://api.bfl.ml/v1/flux-pro-1.1`.
- **Pricing**: $0.04 per generated image.
- **Fallback**: Cascades to Pollinations FLUX when key is absent.

### 3. Pollinations AI FLUX Free Tier (`PollinationsImageAdapter`)
- **Capabilities**: `image_generation`.
- **Environment Key**: *None required (Zero-Key public engine)*.
- **Endpoint**: `https://image.pollinations.ai/prompt/{prompt}`.
- **Pricing**: $0.00 (Free development tier).
- **Role**: Always-available preview engine for development, testing, and prototyping.

### 4. Kling AI 1.5 Video (`KlingVideoAdapter`)
- **Capabilities**: `video_generation`, `motion_graphics`.
- **Environment Key**: `KLING_API_KEY`.
- **Pricing**: $0.10 per 5-second video render.
- **Zero Mock Policy**: If `KLING_API_KEY` is missing, the adapter returns:
  `"KLING_API_KEY is not configured in server environment. Configure KLING_API_KEY in .env.local to enable real 1080p AI video generation."`

### 5. Sutra Studio Core Script & Prompt Compiler (`LocalTemplateAdapter`)
- **Capabilities**: `prompt_enhancement`, `scriptwriting`, `topic_ideation`.
- **Environment Key**: *Zero dependencies (Native deterministic TypeScript)*.
- **Pricing**: $0.00 (Instant local execution).
- **Role**: Guarantees uninterrupted operation even during internet outages or cloud rate-limiting.

---

## 🚫 Zero Mock Outputs Policy

A fundamental principle of Sutra Studio is **Zero Fake Implementations**:
- We never mock video render completions or return fake stock footage claiming to be generated video.
- If a premium provider key is absent, the execution logs explicitly record the missing key notice and mark the step accordingly, directing administrators to supply credentials.
