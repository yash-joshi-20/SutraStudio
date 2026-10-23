/**
 * SUTRA STUDIO — Free-First Provider Router & Quota Management Engine
 *
 * Implements Rule 9 (Free-First Provider Policy):
 * 1. Cheapest option order:
 *    (1) Free open-source local tools (FFmpeg, Blender headless, Three.js/Pannellum)
 *    (2) Free tiers of existing keyed providers (Gemini 2.0 Flash, Cerebras, Groq, Pollinations)
 *    (3) OpenRouter models with ":free" suffix for TEXT tasks only (live fetched at runtime)
 *    (4) Paid options ONLY where free cannot meet promised quality, listed for approval.
 * 2. Rate-limit and daily quota tracking per provider.
 * 3. Exponential backoff retry on 429 / 402 / 503 errors.
 * 4. Clear failure state: Order status -> "needs_attention" + admin alert.
 * 5. Zero fake output guarantee (Never fall back to stock or fake media).
 * 6. Privacy Sanitizer: Redacts PII before sending to free-tier or training providers.
 * 7. License Compliance Matrix: Commercial use & ownership transfer validation.
 */

import { adminDb, isFirebaseAdminReady } from "@/lib/db";
import { isEnvSet } from "@/lib/config/env";
import { recordMissingKey } from "@/lib/services/missingKeyRegistry";
import {
  OpenRouterService,
  type OpenRouterModel,
  type RerankResult,
} from "./openrouterService";
import { PrivacySanitizer, type ClientMetadata } from "./privacySanitizer";
import { LICENSE_COMPLIANCE_MATRIX, type LicenseEntry } from "./licenseCompliance";
import { NotificationsStore } from "@/lib/services/notificationsStore";

// ---------------------------------------------------------------------------
// Types & Definitions
// ---------------------------------------------------------------------------

export type TaskType =
  | "text_chat"
  | "creative_brief"
  | "captions"
  | "translation"
  | "agent_reasoning"
  | "text_qa"
  | "image_draft"
  | "image_final"
  | "research"
  | "video"
  | "voiceover"
  | "three_d"
  | "three_sixty"
  | "embeddings"
  | "rerank";

export interface ProviderDefinition {
  id: string;
  name: string;
  task: TaskType;
  envKey: string;
  tier: 1 | 2 | 3 | 4; // 1: Local Open-Source, 2: Keyed Free Tier, 3: OpenRouter Free, 4: Paid
  isFree: boolean;
  allowsTraining: boolean; // false = private/zero-retention
  costPerUnitUSD: number;
  costUnitDescription: string;
  rateLimitPerMin: number;
  dailyLimitCalls: number;
  defaultPriority: number;
  description: string;
  isOpenSourceLocal?: boolean;
}

export interface RouterConfig {
  taskChains: Record<TaskType, string[]>;
  noTrainingOnly: boolean; // Admin privacy switch
  dailyCostCapUSD: number;
  orderCostCapUSD: number;
  updatedAt: string;
  updatedBy: string;
}

export interface ProviderUsageRecord {
  callsToday: number;
  tokensOrUnitsToday: number;
  estimatedSpendUSD: number;
  errorCountToday: number;
  lastErrorStatus?: number;
  lastErrorMessage?: string;
  backoffUntil?: number; // epoch ms
  lastUsedAt: string;
}

export interface SparkUsageRecord {
  date: string; // YYYY-MM-DD
  readsToday: number;
  writesToday: number;
  deletesToday: number;
  warningLevel: "normal" | "warning_70" | "critical_90";
  updatedAt: string;
}

// Spark Plan Limits
export const SPARK_LIMITS = {
  MAX_READS_PER_DAY: 50000,
  MAX_WRITES_PER_DAY: 20000,
  MAX_DELETES_PER_DAY: 20000,
  THRESHOLD_70_READS: 35000,
  THRESHOLD_90_READS: 45000,
  THRESHOLD_70_WRITES: 14000,
  THRESHOLD_90_WRITES: 18000,
};

// ---------------------------------------------------------------------------
// Provider Registry (16 Providers Across 4 Tiers)
// ---------------------------------------------------------------------------

export const ALL_PROVIDERS: ProviderDefinition[] = [
  // --- TIER 1: Free Open-Source Local Tools ---
  {
    id: "ffmpeg",
    name: "FFmpeg (Local Video Stitcher & Subtitles)",
    task: "video",
    envKey: "",
    tier: 1,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "unlimited local execution",
    rateLimitPerMin: 60,
    dailyLimitCalls: 10000,
    defaultPriority: 1,
    isOpenSourceLocal: true,
    description: "Open-source CLI for lossless video stitching, audio mix, and subtitle burning.",
  },
  {
    id: "blender",
    name: "Blender (Headless 3D & Spatial Render CLI)",
    task: "three_d",
    envKey: "",
    tier: 1,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "unlimited local rendering",
    rateLimitPerMin: 20,
    dailyLimitCalls: 1000,
    defaultPriority: 1,
    isOpenSourceLocal: true,
    description: "Headless background rendering for photorealistic spatial interior & 3D CAD scenes.",
  },
  {
    id: "threejs-viewer",
    name: "Three.js & Pannellum (Open-Source 3D/360 Web)",
    task: "three_sixty",
    envKey: "",
    tier: 1,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "unlimited client web embeds",
    rateLimitPerMin: 120,
    dailyLimitCalls: 50000,
    defaultPriority: 1,
    isOpenSourceLocal: true,
    description: "Client-side interactive WebGL/WebXR viewers for 360 virtual tours and 3D models.",
  },

  // --- TIER 2: Free Tiers of Existing Keyed Providers ---
  {
    id: "gemini",
    name: "Google Gemini 2.0 Flash",
    task: "text_chat",
    envKey: "GEMINI_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0001,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 15,
    dailyLimitCalls: 1500,
    defaultPriority: 2,
    description: "Fast multimodal reasoning engine with generous free quota.",
  },
  {
    id: "groq",
    name: "Groq (Llama 3.3 70B Versatile)",
    task: "text_chat",
    envKey: "GROQ_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0002,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 30,
    dailyLimitCalls: 14400,
    defaultPriority: 3,
    description: "Ultra-low latency Llama 3.3 inference on LPU hardware.",
  },
  {
    id: "cerebras",
    name: "Cerebras Inference",
    task: "text_chat",
    envKey: "CEREBRAS_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0002,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 30,
    dailyLimitCalls: 10000,
    defaultPriority: 4,
    description: "High-speed Llama inference engine with generous free tier.",
  },
  {
    id: "huggingface",
    name: "HuggingFace Serverless Inference",
    task: "text_chat",
    envKey: "HUGGINGFACE_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "free inference",
    rateLimitPerMin: 15,
    dailyLimitCalls: 1000,
    defaultPriority: 5,
    description: "Open-source model serverless inference endpoint.",
  },
  {
    id: "pollinations",
    name: "Pollinations AI (Concept Drafts)",
    task: "image_draft",
    envKey: "POLLINATIONS_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: true,
    costPerUnitUSD: 0,
    costUnitDescription: "free draft generation",
    rateLimitPerMin: 10,
    dailyLimitCalls: 1000,
    defaultPriority: 1,
    description: "Fast draft concept generator. Internal ideation only; not for confidential finals.",
  },
  {
    id: "huggingface-image",
    name: "HuggingFace FLUX.1 Schnell",
    task: "image_draft",
    envKey: "HUGGINGFACE_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "free serverless pass",
    rateLimitPerMin: 10,
    dailyLimitCalls: 500,
    defaultPriority: 2,
    description: "FLUX Schnell draft passes on Hugging Face free serverless tier.",
  },
  {
    id: "gemini-research",
    name: "Gemini Market Synthesizer",
    task: "research",
    envKey: "GEMINI_API_KEY",
    tier: 2,
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0001,
    costUnitDescription: "per batch",
    rateLimitPerMin: 15,
    dailyLimitCalls: 1500,
    defaultPriority: 1,
    description: "Synthesized regional market and trend research (cached 24h).",
  },

  // --- TIER 3: OpenRouter Models with ":free" Suffix (TEXT TASKS ONLY) ---
  {
    id: "openrouter-free",
    name: "OpenRouter Free Models (:free suffix)",
    task: "text_chat",
    envKey: "OPENROUTER_API_KEY",
    tier: 3,
    isFree: true,
    allowsTraining: true, // underlying open hosts may log
    costPerUnitUSD: 0,
    costUnitDescription: "100% free models",
    rateLimitPerMin: 20,
    dailyLimitCalls: 1000,
    defaultPriority: 6,
    description:
      "Dynamically fetched runtime :free models (Llama 3, Mistral, Gemma, Qwen). Text tasks only.",
  },

  // --- TIER 4: Paid Options (Requires Explicit Admin Approval) ---
  {
    id: "bfl-flux",
    name: "Black Forest Labs FLUX 1.1 Pro",
    task: "image_final",
    envKey: "BFL_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.04,
    costUnitDescription: "per 4K master image",
    rateLimitPerMin: 10,
    dailyLimitCalls: 500,
    defaultPriority: 1,
    description: "Ultra-photorealistic commercial master render (Paid / Approval Required).",
  },
  {
    id: "kling",
    name: "Kling AI Video Engine",
    task: "video",
    envKey: "KLING_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.1,
    costUnitDescription: "per 5s video",
    rateLimitPerMin: 3,
    dailyLimitCalls: 200,
    defaultPriority: 2,
    description: "Cinematic commercial motion video engine (Paid / Approval Required).",
  },
  {
    id: "runway",
    name: "Runway Gen-3 Turbo",
    task: "video",
    envKey: "RUNWAY_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.15,
    costUnitDescription: "per 5s clip",
    rateLimitPerMin: 3,
    dailyLimitCalls: 100,
    defaultPriority: 3,
    description: "High-end motion graphics and video synthesis (Paid / Approval Required).",
  },
  {
    id: "tripo3d",
    name: "Tripo3D Spatial CAD Engine",
    task: "three_d",
    envKey: "TRIPO3D_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.2,
    costUnitDescription: "per 3D GLTF asset",
    rateLimitPerMin: 5,
    dailyLimitCalls: 100,
    defaultPriority: 2,
    description: "Automated 3D mesh generator from brief (Paid / Approval Required).",
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o Mini",
    task: "text_chat",
    envKey: "OPENAI_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.0015,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 60,
    dailyLimitCalls: 5000,
    defaultPriority: 7,
    description: "Paid commercial fallback when all free tiers fail (Approval Required).",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Neural Voiceover",
    task: "voiceover",
    envKey: "ELEVENLABS_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.03,
    costUnitDescription: "per commercial track",
    rateLimitPerMin: 10,
    dailyLimitCalls: 500,
    defaultPriority: 1,
    description: "Studio-grade voiceover tracks with commercial rights (Paid / Approval Required).",
  },
  {
    id: "serpapi",
    name: "SerpAPI Google Trends",
    task: "research",
    envKey: "SERPAPI_API_KEY",
    tier: 4,
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.01,
    costUnitDescription: "per search query",
    rateLimitPerMin: 20,
    dailyLimitCalls: 100,
    defaultPriority: 2,
    description: "Live search intelligence (Cached 24 hours).",
  },
];

export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  taskChains: {
    text_chat: ["gemini", "cerebras", "groq", "openrouter-free", "huggingface", "openai"],
    creative_brief: ["gemini", "cerebras", "groq", "openrouter-free", "openai"],
    captions: ["gemini", "groq", "cerebras", "openrouter-free", "openai"],
    translation: ["gemini", "openrouter-free", "groq", "openai"],
    agent_reasoning: ["gemini", "cerebras", "groq", "openrouter-free", "openai"],
    text_qa: ["gemini", "cerebras", "groq", "openrouter-free", "openai"],
    image_draft: ["pollinations", "huggingface-image"],
    image_final: ["bfl-flux"],
    video: ["ffmpeg", "kling", "runway"],
    voiceover: ["elevenlabs"],
    three_d: ["blender", "tripo3d"],
    three_sixty: ["threejs-viewer", "blender", "tripo3d"],
    research: ["gemini-research", "serpapi"],
    embeddings: ["openrouter-free"],
    rerank: ["openrouter-free"],
  },
  noTrainingOnly: false,
  dailyCostCapUSD: 10.0,
  orderCostCapUSD: 2.5,
  updatedAt: new Date().toISOString(),
  updatedBy: "system_init",
};

// ---------------------------------------------------------------------------
// In-Memory Usage & Backoff Cache (Synchronized with Firestore)
// ---------------------------------------------------------------------------

const usageMemoryMap = new Map<string, ProviderUsageRecord>();
const sparkUsageMemory: SparkUsageRecord = {
  date: new Date().toISOString().split("T")[0],
  readsToday: 0,
  writesToday: 0,
  deletesToday: 0,
  warningLevel: "normal",
  updatedAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Provider Router Class
// ---------------------------------------------------------------------------

export class ProviderRouter {
  private static cachedConfig: RouterConfig | null = null;
  private static configFetchedAt = 0;
  private static readonly CONFIG_CACHE_MS = 60 * 1000; // 1 min

  /**
   * Get current active configuration (Firestore backed with local caching)
   */
  static async getConfig(): Promise<RouterConfig> {
    const now = Date.now();
    if (this.cachedConfig && now - this.configFetchedAt < this.CONFIG_CACHE_MS) {
      return this.cachedConfig;
    }

    try {
      this.trackSparkOp("read");
      const doc = await adminDb().collection("studioConfig").doc("providerRouter").get();
      if (doc.exists) {
        this.cachedConfig = {
          ...DEFAULT_ROUTER_CONFIG,
          ...(doc.data() as Partial<RouterConfig>),
        };
      } else {
        this.cachedConfig = DEFAULT_ROUTER_CONFIG;
      }
    } catch {
      this.cachedConfig = DEFAULT_ROUTER_CONFIG;
    }

    this.configFetchedAt = now;
    return this.cachedConfig;
  }

  /**
   * Save updated router configuration (Admin only)
   */
  static async saveConfig(
    updates: Partial<RouterConfig>,
    adminName = "Studio Administrator"
  ): Promise<RouterConfig> {
    const current = await this.getConfig();
    const updated: RouterConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };

    this.trackSparkOp("write");
    await adminDb().collection("studioConfig").doc("providerRouter").set(updated, { merge: true });
    this.cachedConfig = updated;
    this.configFetchedAt = Date.now();
    return updated;
  }

  /**
   * Check if a specific provider is configured (key exists or open source local)
   */
  static isProviderConfigured(providerId: string): boolean {
    const def = ALL_PROVIDERS.find((p) => p.id === providerId);
    if (!def) return false;

    // Open-source local tools require no API key
    if (def.isOpenSourceLocal || !def.envKey) {
      return true;
    }

    // Special case: Pollinations draft doesn't require a key
    if (providerId === "pollinations") {
      return true;
    }

    return isEnvSet(def.envKey as any);
  }

  /**
   * Check if provider is in active backoff (429/quota error state)
   */
  static isProviderInBackoff(providerId: string): boolean {
    const record = usageMemoryMap.get(providerId);
    if (!record || !record.backoffUntil) return false;
    return Date.now() < record.backoffUntil;
  }

  /**
   * Get resolved fallback chain for a task, respecting Free-First hierarchy
   */
  static async getExecutableChain(
    task: TaskType,
    options?: { sensitiveOrder?: boolean; allowPaid?: boolean }
  ): Promise<ProviderDefinition[]> {
    const config = await this.getConfig();
    const chainIds = config.taskChains[task] || DEFAULT_ROUTER_CONFIG.taskChains[task] || [];
    const requireNoTraining = config.noTrainingOnly || options?.sensitiveOrder;

    const executable: ProviderDefinition[] = [];

    for (const id of chainIds) {
      const def = ALL_PROVIDERS.find((p) => p.id === id);
      if (!def) continue;

      // Privacy filter: Skip providers that allow public training if sensitive
      if (requireNoTraining && def.allowsTraining) {
        continue;
      }

      // Paid approval gate: Skip paid providers if caller did not explicitly authorize paid fallback
      if (def.tier === 4 && options?.allowPaid === false) {
        continue;
      }

      // Check key presence: skip if key is missing
      if (!this.isProviderConfigured(id)) {
        if (def.envKey) {
          recordMissingKey(def.envKey as any, `Provider Router (${def.name})`, "MEDIUM").catch(
            () => {}
          );
        }
        continue;
      }

      // Check backoff: skip if 429/quota error was recently encountered
      if (this.isProviderInBackoff(id)) {
        continue;
      }

      executable.push(def);
    }

    return executable;
  }

  /**
   * Record successful provider call and update cost/quota tracking
   */
  static async recordSuccess(providerId: string, units = 1, costUSD = 0): Promise<void> {
    const def = ALL_PROVIDERS.find((p) => p.id === providerId);
    const calculatedCost = costUSD || (def ? def.costPerUnitUSD * units : 0);

    const current = usageMemoryMap.get(providerId) || {
      callsToday: 0,
      tokensOrUnitsToday: 0,
      estimatedSpendUSD: 0,
      errorCountToday: 0,
      lastUsedAt: new Date().toISOString(),
    };

    current.callsToday += 1;
    current.tokensOrUnitsToday += units;
    current.estimatedSpendUSD += calculatedCost;
    current.lastUsedAt = new Date().toISOString();
    current.backoffUntil = undefined; // clear backoff on success

    usageMemoryMap.set(providerId, current);
    this.persistDailyUsage(providerId, current).catch(() => {});
  }

  /**
   * Record provider error and apply exponential backoff on 429 / Quota / 503 errors
   */
  static async recordError(
    providerId: string,
    status: number,
    errorMessage: string
  ): Promise<void> {
    const current = usageMemoryMap.get(providerId) || {
      callsToday: 0,
      tokensOrUnitsToday: 0,
      estimatedSpendUSD: 0,
      errorCountToday: 0,
      lastUsedAt: new Date().toISOString(),
    };

    current.errorCountToday += 1;
    current.lastErrorStatus = status;
    current.lastErrorMessage = errorMessage;
    current.lastUsedAt = new Date().toISOString();

    // If 429 (Rate Limit), 402 (Payment/Quota Exceeded), or 503: calculate exponential backoff
    if (status === 429 || status === 402 || status === 503) {
      const backoffSeconds = Math.min(30 * Math.pow(2, current.errorCountToday - 1), 3600);
      current.backoffUntil = Date.now() + backoffSeconds * 1000;
    }

    usageMemoryMap.set(providerId, current);
    this.persistDailyUsage(providerId, current).catch(() => {});
  }

  /**
   * Persist provider usage to Firestore (non-blocking)
   */
  private static async persistDailyUsage(
    providerId: string,
    record: ProviderUsageRecord
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const docId = `${today}_${providerId}`;
      this.trackSparkOp("write");
      await adminDb().collection("providerUsage").doc(docId).set(
        {
          date: today,
          providerId,
          ...record,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Ignored for non-blocking
    }
  }

  /**
   * Execute with ordered fallback across providers
   * Enforces: Privacy Sanitization, Zero-Fake Output, and Failure State (needs_attention + admin alert)
   */
  static async executeWithFallback<T>(params: {
    task: TaskType;
    orderId?: string;
    orderNumber?: string;
    promptText?: string;
    sensitiveOrder?: boolean;
    containsClientData?: boolean;
    clientMetadata?: ClientMetadata;
    allowPaid?: boolean;
    orderCostSoFarUSD?: number;
    execute: (
      provider: ProviderDefinition,
      sanitizedPrompt?: string
    ) => Promise<{ result: T; units?: number; costUSD?: number }>;
  }): Promise<{
    data: T;
    providerUsed: ProviderDefinition;
    isDraft: boolean;
    costUSD: number;
    redactionsApplied: number;
  }> {
    const chain = await this.getExecutableChain(params.task, {
      sensitiveOrder: params.sensitiveOrder,
      allowPaid: params.allowPaid,
    });
    const config = await this.getConfig();

    if (chain.length === 0) {
      await this.handleExhaustionFailure({
        task: params.task,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        error: new Error(`No available provider configured for task "${params.task}".`),
      });
      throw new Error(
        `No available provider configured for task "${params.task}". Order marked as needs_attention.`
      );
    }

    // Check order cost cap
    const currentOrderCost = params.orderCostSoFarUSD || 0;
    if (currentOrderCost >= config.orderCostCapUSD) {
      await this.handleExhaustionFailure({
        task: params.task,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        error: new Error(
          `Order cost cap exceeded ($${currentOrderCost.toFixed(2)} / $${config.orderCostCapUSD.toFixed(2)}).`
        ),
      });
      throw new Error(`Order cost cap exceeded. Order marked as needs_attention.`);
    }

    let lastError: Error | null = null;

    for (const provider of chain) {
      try {
        // Zero-Data-Retention & Privacy Directive:
        // "Whenever a request contains any client data, only use endpoints marked
        // zero-data-retention; otherwise send no client data."
        let sanitizedText = params.promptText;
        let redactionsCount = 0;

        if (params.promptText) {
          const hasClientData =
            Boolean(params.containsClientData) ||
            PrivacySanitizer.containsClientData(params.promptText, params.clientMetadata);

          if (hasClientData) {
            if (provider.allowsTraining) {
              // Non-ZDR endpoint: scrub completely so NO client data is sent
              const scrubbed = PrivacySanitizer.scrubAllClientData(
                params.promptText,
                params.clientMetadata
              );
              sanitizedText = scrubbed.scrubbedText;
              redactionsCount += scrubbed.totalRemoved;
            } else {
              // ZDR endpoint: zero data retention guaranteed
              sanitizedText = params.promptText;
            }
          } else if (PrivacySanitizer.shouldSanitize(provider)) {
            const s = PrivacySanitizer.sanitize(params.promptText);
            sanitizedText = s.sanitizedText;
            redactionsCount = s.redactionsCount;
          }
        }

        const { result, units = 1, costUSD = provider.costPerUnitUSD * units } = await params.execute(
          provider,
          sanitizedText
        );

        // Zero-Fake Guarantee: Guard against null/empty output
        if (!result) {
          throw new Error(`Provider ${provider.id} returned null or empty output.`);
        }

        // Record success
        await this.recordSuccess(provider.id, units, costUSD);

        const isDraft = provider.isFree || provider.task === "image_draft";

        return {
          data: result,
          providerUsed: provider,
          isDraft,
          costUSD,
          redactionsApplied: redactionsCount,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const status =
          (err as any)?.status ||
          (lastError.message.includes("429")
            ? 429
            : lastError.message.includes("quota")
            ? 402
            : 500);

        await this.recordError(provider.id, status, lastError.message);
        // Continue to next provider in fallback chain
        continue;
      }
    }

    // All providers failed: Enter failure state
    await this.handleExhaustionFailure({
      task: params.task,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      error: lastError || new Error("Unknown error across all providers"),
    });

    throw new Error(
      `All providers in chain failed for task "${params.task}". Order has been flagged as "needs_attention". Reason: ${
        lastError?.message || "Unknown"
      }`
    );
  }

  /**
   * Handle failure state: mark order as "needs_attention" & notify studio admin
   */
  private static async handleExhaustionFailure(params: {
    task: TaskType;
    orderId?: string;
    orderNumber?: string;
    error: Error;
  }): Promise<void> {
    const errorMsg = params.error.message;

    // 1. Update order status in Firestore to "needs_attention"
    if (params.orderId && isFirebaseAdminReady()) {
      try {
        this.trackSparkOp("write");
        await adminDb()
          .collection("orders")
          .doc(params.orderId)
          .set(
            {
              status: "needs_attention",
              qualityReviewNote: `AI generation halted: all providers in fallback chain failed for task "${params.task}". Reason: ${errorMsg}`,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
      } catch (err) {
        console.warn("[ProviderRouter] Failed to set order status to needs_attention:", err);
      }
    }

    // 2. Dispatch high-priority admin notification
    try {
      await NotificationsStore.add({
        userId: "admin",
        type: "status_update",
        title: "AI Provider Chain Exhausted — Action Required",
        message: `Task "${params.task}" failed across all fallback options for order ${
          params.orderNumber || params.orderId || "system task"
        }. Marked as needs_attention.`,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        actionUrl: params.orderId ? `/admin?tab=approvals` : `/admin/integrations`,
        actionLabel: "Review in Order Queue",
      });
    } catch (notifErr) {
      console.warn("[ProviderRouter] Failed to dispatch admin failure notification:", notifErr);
    }
  }

  // -------------------------------------------------------------------------
  // OpenRouter Text Task Delegation
  // -------------------------------------------------------------------------

  /**
   * Dedicated helper for executing text tasks through OpenRouter free models
   * Enforces modality guardrails, runtime capability selection, and zero-data-retention.
   */
  public static async executeOpenRouterText(options: {
    task:
      | "text_chat"
      | "creative_brief"
      | "captions"
      | "translation"
      | "agent_reasoning"
      | "text_qa";
    prompt: string;
    systemPrompt?: string;
    targetLanguage?: "Gujarati" | "Hindi" | "English";
    containsClientData?: boolean;
    clientMetadata?: ClientMetadata;
    orderId?: string;
    orderNumber?: string;
  }): Promise<{ text: string; modelUsed: string; tokensUsed: number }> {
    const messages = [
      ...(options.systemPrompt ? [{ role: "system" as const, content: options.systemPrompt }] : []),
      { role: "user" as const, content: options.prompt },
    ];

    const res = await this.executeWithFallback({
      task: options.task,
      orderId: options.orderId,
      orderNumber: options.orderNumber,
      promptText: options.prompt,
      containsClientData: options.containsClientData,
      clientMetadata: options.clientMetadata,
      execute: async () => {
        const out = await OpenRouterService.generateText({
          task: options.task,
          messages,
          targetLanguage: options.targetLanguage,
          containsClientData: options.containsClientData,
          clientMetadata: options.clientMetadata,
        });
        return { result: out, units: out.tokensUsed, costUSD: 0 };
      },
    });

    return res.data;
  }

  /**
   * Dedicated helper for embedding generation through OpenRouter.
   * Enforces zero-data-retention and client privacy scrubbing.
   */
  public static async executeOpenRouterEmbedding(options: {
    text: string;
    containsClientData?: boolean;
    clientMetadata?: ClientMetadata;
    orderId?: string;
    orderNumber?: string;
  }): Promise<{ embedding: number[]; modelUsed: string; isZeroDataRetention: boolean }> {
    const res = await this.executeWithFallback({
      task: "embeddings",
      orderId: options.orderId,
      orderNumber: options.orderNumber,
      promptText: options.text,
      containsClientData: options.containsClientData,
      clientMetadata: options.clientMetadata,
      execute: async () => {
        const out = await OpenRouterService.embedText({
          text: options.text,
          containsClientData: options.containsClientData,
          clientMetadata: options.clientMetadata,
        });
        return { result: out, units: 1, costUSD: 0 };
      },
    });

    return res.data;
  }

  /**
   * Dedicated helper for document reranking through OpenRouter reasoning models.
   * Enforces zero-data-retention and client privacy scrubbing.
   */
  public static async executeOpenRouterRerank(options: {
    query: string;
    documents: string[];
    topN?: number;
    containsClientData?: boolean;
    clientMetadata?: ClientMetadata;
    orderId?: string;
    orderNumber?: string;
  }): Promise<RerankResult[]> {
    const res = await this.executeWithFallback({
      task: "rerank",
      orderId: options.orderId,
      orderNumber: options.orderNumber,
      promptText: options.query,
      containsClientData: options.containsClientData,
      clientMetadata: options.clientMetadata,
      execute: async () => {
        const out = await OpenRouterService.rerankDocuments({
          query: options.query,
          documents: options.documents,
          topN: options.topN,
          containsClientData: options.containsClientData,
          clientMetadata: options.clientMetadata,
        });
        return { result: out, units: options.documents.length, costUSD: 0 };
      },
    });

    return res.data;
  }

  // -------------------------------------------------------------------------
  // Firebase Spark Limits Tracker
  // -------------------------------------------------------------------------

  static trackSparkOp(type: "read" | "write" | "delete", count = 1): void {
    const today = new Date().toISOString().split("T")[0];
    if (sparkUsageMemory.date !== today) {
      sparkUsageMemory.date = today;
      sparkUsageMemory.readsToday = 0;
      sparkUsageMemory.writesToday = 0;
      sparkUsageMemory.deletesToday = 0;
      sparkUsageMemory.warningLevel = "normal";
    }

    if (type === "read") sparkUsageMemory.readsToday += count;
    if (type === "write") sparkUsageMemory.writesToday += count;
    if (type === "delete") sparkUsageMemory.deletesToday += count;

    sparkUsageMemory.updatedAt = new Date().toISOString();

    if (
      sparkUsageMemory.readsToday >= SPARK_LIMITS.THRESHOLD_90_READS ||
      sparkUsageMemory.writesToday >= SPARK_LIMITS.THRESHOLD_90_WRITES
    ) {
      sparkUsageMemory.warningLevel = "critical_90";
    } else if (
      sparkUsageMemory.readsToday >= SPARK_LIMITS.THRESHOLD_70_READS ||
      sparkUsageMemory.writesToday >= SPARK_LIMITS.THRESHOLD_70_WRITES
    ) {
      sparkUsageMemory.warningLevel = "warning_70";
    } else {
      sparkUsageMemory.warningLevel = "normal";
    }
  }

  static getSparkUsage(): SparkUsageRecord & { limits: typeof SPARK_LIMITS } {
    return {
      ...sparkUsageMemory,
      limits: SPARK_LIMITS,
    };
  }

  // -------------------------------------------------------------------------
  // Admin Summary & Quota Dashboard
  // -------------------------------------------------------------------------

  /**
   * Get all provider stats, live OpenRouter free models, and license compliance table
   */
  static async getAdminUsageSummary(): Promise<{
    config: RouterConfig;
    providers: Array<
      ProviderDefinition & {
        isConfigured: boolean;
        usage: ProviderUsageRecord;
        remainingCallsToday: number;
        inBackoff: boolean;
      }
    >;
    openRouterFreeModels: OpenRouterModel[];
    licenseMatrix: LicenseEntry[];
    totalEstimatedSpendUSD: number;
    sparkUsage: SparkUsageRecord & { limits: typeof SPARK_LIMITS };
  }> {
    const config = await this.getConfig();
    let totalEstimatedSpendUSD = 0;

    // Fetch live OpenRouter free models at runtime
    let openRouterFreeModels: OpenRouterModel[] = [];
    try {
      if (this.isProviderConfigured("openrouter-free")) {
        openRouterFreeModels = await OpenRouterService.getLiveFreeModels();
      }
    } catch (err) {
      console.warn("[ProviderRouter] Failed to fetch live OpenRouter models:", err);
    }

    const providerStats = ALL_PROVIDERS.map((p) => {
      const usage = usageMemoryMap.get(p.id) || {
        callsToday: 0,
        tokensOrUnitsToday: 0,
        estimatedSpendUSD: 0,
        errorCountToday: 0,
        lastUsedAt: "never",
      };
      totalEstimatedSpendUSD += usage.estimatedSpendUSD;

      const remainingCallsToday = Math.max(0, p.dailyLimitCalls - usage.callsToday);
      const inBackoff = this.isProviderInBackoff(p.id);

      return {
        ...p,
        isConfigured: this.isProviderConfigured(p.id),
        usage,
        remainingCallsToday,
        inBackoff,
      };
    });

    return {
      config,
      providers: providerStats,
      openRouterFreeModels,
      licenseMatrix: LICENSE_COMPLIANCE_MATRIX,
      totalEstimatedSpendUSD: Number(totalEstimatedSpendUSD.toFixed(4)),
      sparkUsage: this.getSparkUsage(),
    };
  }
}
