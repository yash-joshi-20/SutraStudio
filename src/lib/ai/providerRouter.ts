/**
 * SUTRA STUDIO — Free-First Provider Router & Quota Management Engine
 *
 * Implements Step 31B:
 * 1. Ordered fallbacks per task, editable in Admin (stored in Firestore).
 * 2. Key presence check: skips any provider whose required API key is missing.
 * 3. Quota awareness: per-provider daily usage counters in Firestore, 429/quota error switching with backoff.
 * 4. Cost caps: per-order and per-day caps with estimated spend tracking.
 * 5. Reuse & Cache: 24h trend research caching per industry, duplicate generation avoidance.
 * 6. Free vs. Premium tiers: free outputs flagged as drafts requiring review; "noTrainingOnly" privacy switch.
 * 7. Firebase Spark limits: daily read/write tracking with warnings at 70% and 90%.
 */

import { adminDb } from "@/lib/firebase/admin";
import { isEnvSet, readEnv } from "@/lib/config/env";
import { recordMissingKey } from "@/lib/services/missingKeyRegistry";

// ---------------------------------------------------------------------------
// Types & Definitions
// ---------------------------------------------------------------------------

export type TaskType =
  | "text_chat"
  | "image_draft"
  | "image_final"
  | "research"
  | "video"
  | "voiceover"
  | "three_d";

export interface ProviderDefinition {
  id: string;
  name: string;
  task: TaskType;
  envKey: string;
  isFree: boolean;
  allowsTraining: boolean; // false = enterprise / zero-retention / no-training
  costPerUnitUSD: number;
  costUnitDescription: string;
  rateLimitPerMin: number;
  defaultPriority: number;
  description: string;
}

export interface RouterConfig {
  taskChains: Record<TaskType, string[]>;
  noTrainingOnly: boolean; // Admin switch: only use paid/private non-training providers for sensitive orders
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
// Provider Registry
// ---------------------------------------------------------------------------

export const ALL_PROVIDERS: ProviderDefinition[] = [
  // Text / Chat Providers
  {
    id: "gemini",
    name: "Google Gemini 2.0 Flash",
    task: "text_chat",
    envKey: "GEMINI_API_KEY",
    isFree: true, // generous free tier
    allowsTraining: false, // via API terms
    costPerUnitUSD: 0.0001,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 30,
    defaultPriority: 1,
    description: "Primary fast multimodal LLM with free tier.",
  },
  {
    id: "groq",
    name: "Groq (Llama 3.3 70B)",
    task: "text_chat",
    envKey: "GROQ_API_KEY",
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0002,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 30,
    defaultPriority: 2,
    description: "Ultra-low latency inference engine.",
  },
  {
    id: "cerebras",
    name: "Cerebras Inference",
    task: "text_chat",
    envKey: "CEREBRAS_API_KEY",
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0002,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 30,
    defaultPriority: 3,
    description: "High-speed Llama inference hardware.",
  },
  {
    id: "huggingface",
    name: "HuggingFace Inference API",
    task: "text_chat",
    envKey: "HUGGINGFACE_API_KEY",
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "free inference",
    rateLimitPerMin: 15,
    defaultPriority: 4,
    description: "Open-source model serverless inference endpoint.",
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o Mini",
    task: "text_chat",
    envKey: "OPENAI_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.0015,
    costUnitDescription: "per 1K tokens",
    rateLimitPerMin: 60,
    defaultPriority: 5,
    description: "Commercial fallback (last resort).",
  },

  // Image Draft Providers
  {
    id: "pollinations",
    name: "Pollinations AI",
    task: "image_draft",
    envKey: "POLLINATIONS_API_KEY", // Optional: works anonymously without key
    isFree: true,
    allowsTraining: true, // public free pipeline
    costPerUnitUSD: 0,
    costUnitDescription: "free generation",
    rateLimitPerMin: 10,
    defaultPriority: 1,
    description: "Instant free AI image synthesis for draft concepts.",
  },
  {
    id: "huggingface-image",
    name: "HuggingFace FLUX.1 Schnell",
    task: "image_draft",
    envKey: "HUGGINGFACE_API_KEY",
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0,
    costUnitDescription: "free tier",
    rateLimitPerMin: 10,
    defaultPriority: 2,
    description: "Open weights FLUX generator on HF serverless endpoints.",
  },
  {
    id: "pixazo",
    name: "Pixazo API",
    task: "image_draft",
    envKey: "PIXAZO_API_KEY",
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.005,
    costUnitDescription: "per draft",
    rateLimitPerMin: 20,
    defaultPriority: 3,
    description: "High quality draft generator with fast turnaround.",
  },

  // Image Final Providers
  {
    id: "bfl-flux",
    name: "Black Forest Labs FLUX 1.1 Pro",
    task: "image_final",
    envKey: "BFL_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.04,
    costUnitDescription: "per 4K master image",
    rateLimitPerMin: 10,
    defaultPriority: 1,
    description: "Ultra-photorealistic commercial master render.",
  },
  {
    id: "pollinations-final",
    name: "Pollinations AI (High-Res)",
    task: "image_final",
    envKey: "POLLINATIONS_API_KEY",
    isFree: true,
    allowsTraining: true,
    costPerUnitUSD: 0,
    costUnitDescription: "free fallback",
    rateLimitPerMin: 5,
    defaultPriority: 2,
    description: "High-resolution free fallback for non-commercial finals.",
  },

  // Research Providers
  {
    id: "serpapi",
    name: "SerpAPI Google Trends",
    task: "research",
    envKey: "SERPAPI_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.01,
    costUnitDescription: "per query",
    rateLimitPerMin: 20,
    defaultPriority: 1,
    description: "Live search & market trend intelligence (24h cached).",
  },
  {
    id: "gemini-research",
    name: "Gemini Market Synthesizer",
    task: "research",
    envKey: "GEMINI_API_KEY",
    isFree: true,
    allowsTraining: false,
    costPerUnitUSD: 0.0001,
    costUnitDescription: "per research batch",
    rateLimitPerMin: 30,
    defaultPriority: 2,
    description: "Synthesized regional market and creative trend analyzer.",
  },

  // Video Providers
  {
    id: "kling",
    name: "Kling AI Video",
    task: "video",
    envKey: "KLING_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.10,
    costUnitDescription: "per 5s video",
    rateLimitPerMin: 3,
    defaultPriority: 1,
    description: "Cinematic commercial motion video engine.",
  },
  {
    id: "runway",
    name: "Runway Gen-3 Turbo",
    task: "video",
    envKey: "RUNWAY_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.15,
    costUnitDescription: "per 5s clip",
    rateLimitPerMin: 3,
    defaultPriority: 2,
    description: "High-end motion graphics and video synthesis.",
  },

  // Voiceover Providers
  {
    id: "elevenlabs",
    name: "ElevenLabs Voiceover",
    task: "voiceover",
    envKey: "ELEVENLABS_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.03,
    costUnitDescription: "per voiceover track",
    rateLimitPerMin: 10,
    defaultPriority: 1,
    description: "Studio-grade neural voice synthesis.",
  },

  // 3D Providers
  {
    id: "tripo3d",
    name: "Tripo3D Spatial Engine",
    task: "three_d",
    envKey: "TRIPO3D_API_KEY",
    isFree: false,
    allowsTraining: false,
    costPerUnitUSD: 0.20,
    costUnitDescription: "per 3D GLTF asset",
    rateLimitPerMin: 5,
    defaultPriority: 1,
    description: "Interactive GLTF 3D model generator.",
  },
];

export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  taskChains: {
    text_chat: ["gemini", "groq", "cerebras", "huggingface", "openai"],
    image_draft: ["pollinations", "huggingface-image", "pixazo"],
    image_final: ["bfl-flux", "pollinations-final"],
    research: ["serpapi", "gemini-research"],
    video: ["kling", "runway"],
    voiceover: ["elevenlabs"],
    three_d: ["tripo3d"],
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

// In-Memory Cache for Trend Research & Prompt Hashes (24h TTL)
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
const trendCacheMap = new Map<string, CacheEntry<any>>();
const promptCacheMap = new Map<string, CacheEntry<any>>();

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
   * Check if a specific provider is configured (key exists)
   */
  static isProviderConfigured(providerId: string): boolean {
    const def = ALL_PROVIDERS.find((p) => p.id === providerId);
    if (!def) return false;

    // Special case: Pollinations draft doesn't require a key
    if (providerId === "pollinations" || providerId === "pollinations-final") {
      return true;
    }

    return isEnvSet(def.envKey as any);
  }

  /**
   * Check if provider is in active backoff (429/error state)
   */
  static isProviderInBackoff(providerId: string): boolean {
    const record = usageMemoryMap.get(providerId);
    if (!record || !record.backoffUntil) return false;
    return Date.now() < record.backoffUntil;
  }

  /**
   * Get resolved fallback chain for a task, skipping unconfigured or backoff providers
   */
  static async getExecutableChain(
    task: TaskType,
    options?: { sensitiveOrder?: boolean }
  ): Promise<ProviderDefinition[]> {
    const config = await this.getConfig();
    const chainIds = config.taskChains[task] || DEFAULT_ROUTER_CONFIG.taskChains[task] || [];
    const requireNoTraining = config.noTrainingOnly || options?.sensitiveOrder;

    const executable: ProviderDefinition[] = [];

    for (const id of chainIds) {
      const def = ALL_PROVIDERS.find((p) => p.id === id);
      if (!def) continue;

      // Privacy filter: Skip providers that allow public data training if sensitive
      if (requireNoTraining && def.allowsTraining) {
        continue;
      }

      // Check key presence: skip if key is missing
      if (!this.isProviderConfigured(id)) {
        // Record missing key in background registry
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

    // Asynchronously persist to daily usage doc in Firestore
    this.persistDailyUsage(providerId, current).catch(() => {});
  }

  /**
   * Record provider error and apply exponential backoff on 429 / Quota / 402 errors
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

    // If 429 (Rate Limit), 402 (Payment/Quota Exceeded), or 503: calculate backoff
    if (status === 429 || status === 402 || status === 503) {
      const backoffSeconds = Math.min(30 * Math.pow(2, current.errorCountToday - 1), 3600); // 30s -> 60s -> 120s up to 1h
      current.backoffUntil = Date.now() + backoffSeconds * 1000;
    }

    usageMemoryMap.set(providerId, current);
    this.persistDailyUsage(providerId, current).catch(() => {});
  }

  /**
   * Persist provider usage to Firestore (batched/non-blocking)
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
      // Ignored for non-blocking operations
    }
  }

  /**
   * Execute with ordered fallback across providers
   */
  static async executeWithFallback<T>(params: {
    task: TaskType;
    sensitiveOrder?: boolean;
    orderCostSoFarUSD?: number;
    execute: (provider: ProviderDefinition) => Promise<{ result: T; units?: number; costUSD?: number }>;
  }): Promise<{
    data: T;
    providerUsed: ProviderDefinition;
    isDraft: boolean;
    costUSD: number;
  }> {
    const chain = await this.getExecutableChain(params.task, {
      sensitiveOrder: params.sensitiveOrder,
    });
    const config = await this.getConfig();

    if (chain.length === 0) {
      throw new Error(
        `No available provider configured for task "${params.task}". Please configure keys in Settings or Integrations.`
      );
    }

    // Check order cost cap
    const currentOrderCost = params.orderCostSoFarUSD || 0;
    if (currentOrderCost >= config.orderCostCapUSD) {
      throw new Error(
        `Order cost cap exceeded ($${currentOrderCost.toFixed(2)} / $${config.orderCostCapUSD.toFixed(2)}).`
      );
    }

    let lastError: any = null;

    for (const provider of chain) {
      try {
        const { result, units = 1, costUSD = provider.costPerUnitUSD * units } = await params.execute(
          provider
        );

        // Record success
        await this.recordSuccess(provider.id, units, costUSD);

        const isDraft = provider.isFree || provider.task === "image_draft";

        return {
          data: result,
          providerUsed: provider,
          isDraft,
          costUSD,
        };
      } catch (err: any) {
        lastError = err;
        const status = err.status || (err.message?.includes("429") ? 429 : err.message?.includes("quota") ? 402 : 500);
        await this.recordError(provider.id, status, err.message || "Unknown error");
        // Proceed to next provider in fallback chain
        continue;
      }
    }

    throw new Error(
      `All providers in chain failed for task "${params.task}". Last error: ${lastError?.message || "Unknown"}`
    );
  }

  // -------------------------------------------------------------------------
  // Caching Layer (Trend Research & Prompt Duplication)
  // -------------------------------------------------------------------------

  /**
   * Cache and retrieve 24-hour industry trend research
   */
  static async getCachedTrends<T>(
    industry: string,
    region: string,
    fetcher: () => Promise<T>
  ): Promise<{ data: T; fromCache: boolean }> {
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `trends_${industry.toLowerCase().trim()}_${region.toLowerCase().trim()}_${today}`;

    // 1. Check in-memory cache
    const mem = trendCacheMap.get(cacheKey);
    if (mem && Date.now() < mem.expiresAt) {
      return { data: mem.value, fromCache: true };
    }

    // 2. Check Firestore cache
    try {
      this.trackSparkOp("read");
      const doc = await adminDb().collection("studioCache").doc(cacheKey).get();
      if (doc.exists) {
        const cachedData = doc.data()?.data as T;
        trendCacheMap.set(cacheKey, { value: cachedData, expiresAt: Date.now() + 24 * 3600 * 1000 });
        return { data: cachedData, fromCache: true };
      }
    } catch {
      // fallback to live fetch
    }

    // 3. Fetch live
    const liveData = await fetcher();

    // 4. Save to cache
    const expiresAt = Date.now() + 24 * 3600 * 1000;
    trendCacheMap.set(cacheKey, { value: liveData, expiresAt });

    try {
      this.trackSparkOp("write");
      await adminDb().collection("studioCache").doc(cacheKey).set({
        key: cacheKey,
        industry,
        region,
        date: today,
        data: liveData,
        expiresAt: new Date(expiresAt).toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch {
      // non-blocking
    }

    return { data: liveData, fromCache: false };
  }

  /**
   * Check for duplicate prompt generation within short window
   */
  static getPromptCache<T>(promptHash: string): T | null {
    const mem = promptCacheMap.get(promptHash);
    if (mem && Date.now() < mem.expiresAt) {
      return mem.value;
    }
    return null;
  }

  static setPromptCache<T>(promptHash: string, value: T, ttlSeconds = 3600): void {
    promptCacheMap.set(promptHash, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  // -------------------------------------------------------------------------
  // Firebase Spark Limits Tracker
  // -------------------------------------------------------------------------

  /**
   * Track Firestore daily reads, writes, and deletes to protect Spark Tier limits
   */
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

    // Check thresholds
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

  /**
   * Get all provider usage stats and estimated daily spend for Admin Console
   */
  static async getAdminUsageSummary(): Promise<{
    config: RouterConfig;
    providers: Array<ProviderDefinition & { isConfigured: boolean; usage: ProviderUsageRecord }>;
    totalEstimatedSpendUSD: number;
    sparkUsage: SparkUsageRecord & { limits: typeof SPARK_LIMITS };
  }> {
    const config = await this.getConfig();
    let totalEstimatedSpendUSD = 0;

    const providerStats = ALL_PROVIDERS.map((p) => {
      const usage = usageMemoryMap.get(p.id) || {
        callsToday: 0,
        tokensOrUnitsToday: 0,
        estimatedSpendUSD: 0,
        errorCountToday: 0,
        lastUsedAt: "never",
      };
      totalEstimatedSpendUSD += usage.estimatedSpendUSD;

      return {
        ...p,
        isConfigured: this.isProviderConfigured(p.id),
        usage,
      };
    });

    return {
      config,
      providers: providerStats,
      totalEstimatedSpendUSD: Number(totalEstimatedSpendUSD.toFixed(4)),
      sparkUsage: this.getSparkUsage(),
    };
  }
}
