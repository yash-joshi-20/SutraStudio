/**
 * SUTRA STUDIO — AI Creative Pipeline
 * Trend Research → Prompt Builder → Provider Call → Output Save → Quality Gate
 * 
 * Provider chain: Configurable fallback order per service type.
 * Each output records: final prompt, provider used, cost, timestamps.
 */

import { adminDb } from "@/lib/firebase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrendResult {
  topic: string;
  keyword: string;
  volume?: number;
  source: "serpapi" | "gemini" | "manual";
  region?: string;
  fetchedAt: string;
}

export interface PromptTemplate {
  id: string;
  serviceId: string;
  name: string;
  template: string; // Uses {{brand_name}}, {{industry}}, {{trend}}, {{brief}}, etc.
  variables: string[];
  provider: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedOutput {
  id: string;
  orderId: string;
  clientUid: string;
  brandKitId: string;
  serviceId: string;

  // Pipeline trace
  trendData?: TrendResult;
  promptTemplate: string;
  finalPrompt: string;
  provider: string;
  providerModel?: string;
  providerRequestId?: string;

  // Output
  outputType: "image" | "video" | "3d_model" | "panorama" | "text" | "code";
  outputUrl?: string;
  outputFileId?: string;
  outputDriveUrl?: string;
  thumbnailUrl?: string;
  outputMetadata: Record<string, any>;

  // Formats (for images: 1:1, 9:16, 16:9)
  formats?: Array<{ ratio: string; url: string; fileId: string; width: number; height: number }>;

  // Quality gate
  status: "generating" | "draft_ready" | "admin_reviewing" | "approved" | "rejected" | "revision_requested";
  rejectionReason?: string;
  revisionCount: number;
  watermarked: boolean;

  // Cost tracking
  providerCost: number;
  costCurrency: string;
  billedToOrder: boolean;

  // Timestamps
  generationStartedAt: string;
  generationCompletedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: "image" | "video" | "3d" | "panorama" | "voice" | "text" | "search";
  apiKeyEnvVar: string;
  isConfigured: boolean;
  costPerUnit: number;
  costUnit: string;
  priority: number; // Lower = tried first
  isActive: boolean;
  models: string[];
  rateLimitPerMinute: number;
}

// ---------------------------------------------------------------------------
// Provider Registry — reads availability from env
// ---------------------------------------------------------------------------

export function getProviderRegistry(): ProviderConfig[] {
  return [
    // Image providers
    {
      id: "bfl-flux",
      name: "BFL FLUX",
      type: "image",
      apiKeyEnvVar: "BFL_API_KEY",
      isConfigured: !!process.env.BFL_API_KEY,
      costPerUnit: 0.04,
      costUnit: "per image",
      priority: 1,
      isActive: !!process.env.BFL_API_KEY,
      models: ["flux-pro-1.1", "flux-dev"],
      rateLimitPerMinute: 10,
    },
    {
      id: "pollinations",
      name: "Pollinations AI",
      type: "image",
      apiKeyEnvVar: "IMAGE_PROVIDER_API_KEY",
      isConfigured: !!process.env.IMAGE_PROVIDER_API_KEY,
      costPerUnit: 0,
      costUnit: "free tier",
      priority: 2,
      isActive: !!process.env.IMAGE_PROVIDER_API_KEY,
      models: ["flux", "turbo"],
      rateLimitPerMinute: 5,
    },
    // Video providers
    {
      id: "kling",
      name: "Kling AI",
      type: "video",
      apiKeyEnvVar: "KLING_ACCESS_KEY",
      isConfigured: !!(process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY),
      costPerUnit: 0.10,
      costUnit: "per 5s clip",
      priority: 1,
      isActive: !!(process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY),
      models: ["kling-v1", "kling-v1.5"],
      rateLimitPerMinute: 3,
    },
    {
      id: "runway",
      name: "Runway Gen-3",
      type: "video",
      apiKeyEnvVar: "RUNWAY_API_KEY",
      isConfigured: !!process.env.RUNWAY_API_KEY,
      costPerUnit: 0.15,
      costUnit: "per 5s clip",
      priority: 2,
      isActive: !!process.env.RUNWAY_API_KEY,
      models: ["gen-3-alpha"],
      rateLimitPerMinute: 3,
    },
    // Voice providers
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      type: "voice",
      apiKeyEnvVar: "ELEVENLABS_API_KEY",
      isConfigured: !!process.env.ELEVENLABS_API_KEY,
      costPerUnit: 0.03,
      costUnit: "per 100 chars",
      priority: 1,
      isActive: !!process.env.ELEVENLABS_API_KEY,
      models: ["eleven_multilingual_v2"],
      rateLimitPerMinute: 10,
    },
    // 3D providers
    {
      id: "tripo3d",
      name: "Tripo3D",
      type: "3d",
      apiKeyEnvVar: "TRIPO3D_API_KEY",
      isConfigured: !!process.env.TRIPO3D_API_KEY,
      costPerUnit: 0.20,
      costUnit: "per model",
      priority: 1,
      isActive: !!process.env.TRIPO3D_API_KEY,
      models: ["tripo-v2"],
      rateLimitPerMinute: 5,
    },
    // Search providers
    {
      id: "serpapi",
      name: "SerpAPI",
      type: "search",
      apiKeyEnvVar: "SERPAPI_API_KEY",
      isConfigured: !!process.env.SERPAPI_API_KEY,
      costPerUnit: 0.01,
      costUnit: "per search",
      priority: 1,
      isActive: !!process.env.SERPAPI_API_KEY,
      models: ["google-trends", "google-search"],
      rateLimitPerMinute: 20,
    },
    // Text / LLM providers
    {
      id: "gemini",
      name: "Google Gemini",
      type: "text",
      apiKeyEnvVar: "GEMINI_API_KEY",
      isConfigured: !!process.env.GEMINI_API_KEY,
      costPerUnit: 0.001,
      costUnit: "per 1K tokens",
      priority: 1,
      isActive: !!process.env.GEMINI_API_KEY,
      models: ["gemini-2.0-flash", "gemini-1.5-pro"],
      rateLimitPerMinute: 30,
    },
    {
      id: "openai",
      name: "OpenAI",
      type: "text",
      apiKeyEnvVar: "OPENAI_API_KEY",
      isConfigured: !!process.env.OPENAI_API_KEY,
      costPerUnit: 0.003,
      costUnit: "per 1K tokens",
      priority: 2,
      isActive: !!process.env.OPENAI_API_KEY,
      models: ["gpt-4o", "gpt-4o-mini"],
      rateLimitPerMinute: 20,
    },
  ];
}

/**
 * Get the best available provider for a service type
 */
export function getBestProvider(type: ProviderConfig["type"]): ProviderConfig | null {
  const providers = getProviderRegistry()
    .filter((p) => p.type === type && p.isActive)
    .sort((a, b) => a.priority - b.priority);
  return providers[0] || null;
}

/**
 * Get all configured providers for a type (for fallback chain)
 */
export function getProviderChain(type: ProviderConfig["type"]): ProviderConfig[] {
  return getProviderRegistry()
    .filter((p) => p.type === type && p.isActive)
    .sort((a, b) => a.priority - b.priority);
}

// ---------------------------------------------------------------------------
// Trend Research
// ---------------------------------------------------------------------------

export async function researchTrends(
  industry: string,
  region: string = "India",
  keywords: string[] = []
): Promise<TrendResult[]> {
  const serpApiKey = process.env.SERPAPI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const trends: TrendResult[] = [];

  // 1. SerpAPI Google Trends
  if (serpApiKey) {
    try {
      const query = `${industry} ${keywords.slice(0, 3).join(" ")}`.trim();
      const url = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(query)}&geo=${region === "India" ? "IN" : "US"}&api_key=${serpApiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data = await res.json();
        const relatedQueries = data.related_queries?.rising || data.related_queries?.top || [];
        for (const q of relatedQueries.slice(0, 5)) {
          trends.push({
            topic: q.query || q.value || industry,
            keyword: q.query || q.value || "",
            volume: q.extracted_value,
            source: "serpapi",
            region,
            fetchedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      // SerpAPI failed, fall through to Gemini
    }
  }

  // 2. Gemini trend generation as fallback/supplement
  if (geminiKey && trends.length < 3) {
    try {
      const prompt = `List 5 trending creative content topics for the "${industry}" industry in ${region} right now. Return as JSON array: [{"topic": "...", "keyword": "..."}]. Only the JSON, no explanation.`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          for (const t of parsed.slice(0, 5)) {
            trends.push({
              topic: t.topic || t.title || "",
              keyword: t.keyword || t.topic || "",
              source: "gemini",
              region,
              fetchedAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch {
      // Gemini also unavailable
    }
  }

  return trends;
}

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

export function buildCreativePrompt(params: {
  template: string;
  brandKit: {
    brandName: string;
    companyName: string;
    industry: string;
    tone: string;
    tagline?: string;
    colors: Array<{ hex: string; name: string }>;
    language: string;
  };
  brief: Record<string, string>;
  trend?: TrendResult;
  serviceName: string;
  outputFormat?: string;
}): string {
  const { template, brandKit, brief, trend, serviceName, outputFormat } = params;

  let prompt = template;

  // Brand Kit variables
  prompt = prompt.replace(/\{\{brand_name\}\}/g, brandKit.brandName);
  prompt = prompt.replace(/\{\{company_name\}\}/g, brandKit.companyName);
  prompt = prompt.replace(/\{\{industry\}\}/g, brandKit.industry);
  prompt = prompt.replace(/\{\{tone\}\}/g, brandKit.tone);
  prompt = prompt.replace(/\{\{tagline\}\}/g, brandKit.tagline || "");
  prompt = prompt.replace(/\{\{language\}\}/g, brandKit.language);
  prompt = prompt.replace(/\{\{colors\}\}/g, brandKit.colors.map((c) => `${c.name} (${c.hex})`).join(", "));
  prompt = prompt.replace(/\{\{service_name\}\}/g, serviceName);
  prompt = prompt.replace(/\{\{output_format\}\}/g, outputFormat || "");

  // Trend variables
  if (trend) {
    prompt = prompt.replace(/\{\{trend_topic\}\}/g, trend.topic);
    prompt = prompt.replace(/\{\{trend_keyword\}\}/g, trend.keyword);
  }

  // Brief variables
  for (const [key, value] of Object.entries(brief)) {
    prompt = prompt.replace(new RegExp(`\\{\\{brief_${key}\\}\\}`, "g"), value);
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  // Clean up any unreplaced variables
  prompt = prompt.replace(/\{\{[^}]+\}\}/g, "");

  return prompt.trim();
}

// ---------------------------------------------------------------------------
// Default Prompt Templates per Service
// ---------------------------------------------------------------------------

export const DEFAULT_PROMPT_TEMPLATES: Record<string, string> = {
  "image-creation": `Create a premium, high-resolution commercial image for {{brand_name}} ({{industry}}).
Style: {{tone}}. Colors: {{colors}}.
Subject: {{brief_useCase}} — {{brief_visualStyle}}.
{{trend_topic ? "Incorporate trending theme: " + trend_topic : ""}}
The image should be photorealistic, 4K quality, suitable for {{brief_targetPlatform || "social media and advertising"}}.
Brand tagline: {{tagline}}. No text in image unless specified.`,

  "video-creation": `Script a 15-30 second cinematic commercial video for {{brand_name}} ({{industry}}).
Tone: {{tone}}. Visual style: {{brief_videoStyle}}.
Subject: {{brief_useCase}}.
Include: opening hook (2s), brand showcase (8-15s), call-to-action (3s).
Colors: {{colors}}. Music mood: {{brief_musicMood || "uplifting corporate"}}.`,

  "3d-modeling": `Generate a high-fidelity 3D model of {{brief_subject}} for {{brand_name}}.
Style: {{brief_modelStyle || "photorealistic"}}. Category: {{brief_useCase}}.
Material: {{brief_material || "default realistic"}}. Environment: {{brief_environment || "studio lighting"}}.
Output: GLB format, optimized for web viewing.`,

  "360-view": `Create an immersive 360-degree equirectangular panorama of {{brief_spaceType}} for {{brand_name}}.
Style: {{tone}}. Interior theme: {{brief_theme || "luxury modern"}}.
Lighting: {{brief_lighting || "warm natural daylight"}}.
Aspect ratio: 2:1 equirectangular. Resolution: 8192x4096.`,

  "interior-design": `Design a photorealistic interior rendering of {{brief_roomType}} for {{brand_name}}.
Style: {{brief_designStyle || "luxury contemporary"}}. Budget feel: {{brief_budgetLevel || "premium"}}.
Color palette: {{colors}}. Materials: {{brief_materials || "marble, wood, brass"}}.
Lighting: {{brief_lighting || "warm golden hour with accent spots"}}.`,

  "digital-marketing": `Create a comprehensive digital marketing strategy for {{brand_name}} ({{industry}}).
Target audience: {{brief_targetAudience}}. Goals: {{brief_goals}}.
Channels: {{brief_channels || "Instagram, Facebook, Google Ads"}}.
Budget range: {{brief_budget || "flexible"}}. Duration: {{brief_duration || "1 month"}}.`,

  "meta-ads-launcher": `Design ad creative variations for {{brand_name}} Meta Ads campaign.
Objective: {{brief_objective || "brand awareness"}}. Audience: {{brief_audience}}.
Ad formats: {{brief_formats || "feed, stories, reels"}}.
Colors: {{colors}}. CTA: {{brief_cta || "Learn More"}}.`,
};

// ---------------------------------------------------------------------------
// Output Store
// ---------------------------------------------------------------------------

const OUTPUT_COLLECTION = "generated_outputs";

export class OutputStore {
  static async create(output: GeneratedOutput): Promise<GeneratedOutput> {
    const db = adminDb();
    await db.collection(OUTPUT_COLLECTION).doc(output.id).set(output);
    return output;
  }

  static async getById(outputId: string): Promise<GeneratedOutput | null> {
    const db = adminDb();
    const doc = await db.collection(OUTPUT_COLLECTION).doc(outputId).get();
    if (!doc.exists) return null;
    return doc.data() as GeneratedOutput;
  }

  static async listByOrder(orderId: string): Promise<GeneratedOutput[]> {
    const db = adminDb();
    const snap = await db
      .collection(OUTPUT_COLLECTION)
      .where("orderId", "==", orderId)
      .orderBy("createdAt", "desc")
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as GeneratedOutput);
  }

  static async listByClient(clientUid: string, limit = 50): Promise<GeneratedOutput[]> {
    const db = adminDb();
    const snap = await db
      .collection(OUTPUT_COLLECTION)
      .where("clientUid", "==", clientUid)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as GeneratedOutput);
  }

  static async updateStatus(
    outputId: string,
    status: GeneratedOutput["status"],
    reviewedBy?: string,
    rejectionReason?: string
  ): Promise<void> {
    const db = adminDb();
    const update: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (reviewedBy) {
      update.reviewedAt = new Date().toISOString();
      update.reviewedBy = reviewedBy;
    }
    if (rejectionReason) {
      update.rejectionReason = rejectionReason;
    }
    await db.collection(OUTPUT_COLLECTION).doc(outputId).update(update);
  }

  static async incrementRevision(outputId: string): Promise<void> {
    const existing = await OutputStore.getById(outputId);
    if (!existing) return;
    const db = adminDb();
    await db.collection(OUTPUT_COLLECTION).doc(outputId).update({
      revisionCount: (existing.revisionCount || 0) + 1,
      status: "generating",
      updatedAt: new Date().toISOString(),
    });
  }

  /** Admin: list all pending review outputs */
  static async listPendingReview(limit = 50): Promise<GeneratedOutput[]> {
    const db = adminDb();
    const snap = await db
      .collection(OUTPUT_COLLECTION)
      .where("status", "==", "draft_ready")
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as GeneratedOutput);
  }
}

// ---------------------------------------------------------------------------
// Prompt Template Store
// ---------------------------------------------------------------------------

const TEMPLATE_COLLECTION = "prompt_templates";

export class PromptTemplateStore {
  static async getForService(serviceId: string): Promise<PromptTemplate[]> {
    const db = adminDb();
    const snap = await db
      .collection(TEMPLATE_COLLECTION)
      .where("serviceId", "==", serviceId)
      .where("isActive", "==", true)
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as PromptTemplate);
  }

  static async getDefault(serviceId: string): Promise<PromptTemplate | null> {
    const templates = await PromptTemplateStore.getForService(serviceId);
    return templates.find((t) => t.isDefault) || templates[0] || null;
  }

  static async upsert(template: PromptTemplate): Promise<PromptTemplate> {
    const db = adminDb();
    await db.collection(TEMPLATE_COLLECTION).doc(template.id).set(template);
    return template;
  }

  static async delete(templateId: string): Promise<void> {
    const db = adminDb();
    await db.collection(TEMPLATE_COLLECTION).doc(templateId).delete();
  }

  static async listAll(): Promise<PromptTemplate[]> {
    const db = adminDb();
    const snap = await db.collection(TEMPLATE_COLLECTION).orderBy("serviceId").get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as PromptTemplate);
  }
}
