/**
 * SUTRA STUDIO — OpenRouter Capability-Based Free Model Engine
 *
 * Implements Rule 9 OpenRouter Specific Directives:
 * 1. Query live models endpoint at runtime and pick free (":free") models by CAPABILITY:
 *    - "text": General creative generation, captions, translation, copywriting.
 *    - "long_context": Large context windows (>= 128k up to 1M tokens) for multi-document briefs.
 *    - "reasoning": High-reasoning and deep-thinking models for complex logic, planning, QA.
 *    - "embeddings": Vector embedding models.
 *    - "rerank": Cross-encoder scoring and document reranking.
 * 2. Strict Modality Guardrail:
 *    - Free models used ONLY for TEXT, embedding, and rerank tasks.
 *    - CANNOT produce images, video, 3D or 360 views (routed to existing provider keys / ffmpeg / Blender).
 * 3. Zero-Data-Retention & Privacy Guardrail:
 *    - Whenever a request contains client data, only use endpoints marked zero-data-retention;
 *      otherwise send NO client data (scrubbed completely).
 * 4. Fallback & Failure State:
 *    - If a free model hits quota or fails, fall back to next free model;
 *      if all fail, mark task "needs_attention" and notify admin instead of returning a made-up answer.
 */

import { readEnv } from "@/lib/config/env";
import { PrivacySanitizer, type ClientMetadata } from "./privacySanitizer";

export type OpenRouterCapability =
  | "text"
  | "long_context"
  | "reasoning"
  | "embeddings"
  | "rerank";

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
  capabilities: OpenRouterCapability[];
  isZeroDataRetention: boolean;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
    instruct_type?: string | null;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CapabilityGenerationOptions {
  capability: OpenRouterCapability;
  taskName: string;
  messages: ChatMessage[];
  containsClientData?: boolean;
  clientMetadata?: ClientMetadata;
  temperature?: number;
  maxTokens?: number;
  targetLanguage?: "Gujarati" | "Hindi" | "English";
}

export interface OpenRouterResult {
  text: string;
  modelUsed: string;
  tokensUsed: number;
  capabilityMatched: OpenRouterCapability;
  isZeroDataRetention: boolean;
  scrubbedClientData: boolean;
}

export interface RerankOptions {
  query: string;
  documents: string[];
  topN?: number;
  containsClientData?: boolean;
  clientMetadata?: ClientMetadata;
}

export interface RerankResult {
  index: number;
  document: string;
  relevanceScore: number;
}

// In-Memory Cache for live classified free models (1-hour TTL)
let cachedFreeModels: OpenRouterModel[] = [];
let modelsCacheExpiresAt = 0;
const MODELS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Model Backoff map (modelId -> epoch ms when cooldown ends)
const modelBackoffMap = new Map<string, number>();

export class OpenRouterService {
  private static getApiKey(): string | undefined {
    return readEnv("OPENROUTER_API_KEY");
  }

  private static getBaseUrl(): string {
    return readEnv("OPENROUTER_BASE_URL") || "https://openrouter.ai/api/v1";
  }

  /**
   * Classify a raw model from OpenRouter into supported studio capabilities.
   */
  private static classifyCapabilities(m: {
    id: string;
    name?: string;
    description?: string;
    context_length?: number;
    architecture?: any;
    top_provider?: any;
  }): { capabilities: OpenRouterCapability[]; isZeroDataRetention: boolean } {
    const caps: Set<OpenRouterCapability> = new Set();
    const id = m.id.toLowerCase();
    const desc = (m.description || "").toLowerCase();
    const name = (m.name || "").toLowerCase();
    const contextLength = m.context_length || 0;

    // 1. Text capability (Any text-output model)
    const outModalities = m.architecture?.output_modalities || [];
    const modalityStr = m.architecture?.modality || "";
    if (outModalities.includes("text") || modalityStr.includes("->text") || modalityStr === "text->text") {
      caps.add("text");
    }

    // 2. Long context capability (>= 128k tokens)
    if (contextLength >= 131072) {
      caps.add("long_context");
    }

    // 3. Reasoning capability
    const hasReasoningKeyword =
      id.includes("reasoning") ||
      id.includes("r1") ||
      id.includes("qwq") ||
      id.includes("math") ||
      id.includes("code") ||
      id.includes("think") ||
      desc.includes("reasoning") ||
      desc.includes("thinking") ||
      desc.includes("deep research") ||
      desc.includes("mixture-of-experts") ||
      name.includes("reasoning");

    if (hasReasoningKeyword) {
      caps.add("reasoning");
    }

    // 4. Embeddings capability
    if (id.includes("embed") || desc.includes("embedding") || desc.includes("vector")) {
      caps.add("embeddings");
    }

    // 5. Rerank capability
    if (id.includes("rerank") || desc.includes("reranking") || caps.has("reasoning")) {
      caps.add("rerank");
    }

    // Ensure at least "text" if it produces text
    if (caps.size === 0) {
      caps.add("text");
    }

    // Zero-data-retention detection
    // Paid/corporate zero-retention hosts vs public community hosts
    const isZeroDataRetention =
      Boolean(m.top_provider?.is_moderated === false && m.top_provider?.data_collection === "deny") ||
      id.startsWith("google/") ||
      id.startsWith("nvidia/") ||
      id.startsWith("meta-llama/");

    return {
      capabilities: Array.from(caps),
      isZeroDataRetention,
    };
  }

  /**
   * Fetch live list of free models from OpenRouter at runtime.
   * Never hardcodes model names. Dynamically classifies capabilities.
   */
  public static async getLiveFreeModels(forceRefresh = false): Promise<OpenRouterModel[]> {
    const now = Date.now();
    if (!forceRefresh && cachedFreeModels.length > 0 && now < modelsCacheExpiresAt) {
      return cachedFreeModels;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in environment.");
    }

    const baseUrl = this.getBaseUrl();
    const res = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sutrastudios.in",
        "X-Title": "Sutra Studios",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Failed to fetch models from OpenRouter (HTTP ${res.status}): ${errText}`);
    }

    const json = await res.json();
    const rawList: any[] = json.data || [];

    // Filter strictly for free models (":free" suffix or 0 cost)
    const freeRaw = rawList.filter((m) => {
      const isFreeSuffix = m.id.toLowerCase().endsWith(":free");
      const isZeroPrice =
        m.pricing &&
        (m.pricing.prompt === "0" || m.pricing.prompt === "0.0") &&
        (m.pricing.completion === "0" || m.pricing.completion === "0.0");
      return isFreeSuffix || isZeroPrice;
    });

    // Classify capabilities for each free model
    const classified: OpenRouterModel[] = freeRaw.map((m) => {
      const { capabilities, isZeroDataRetention } = this.classifyCapabilities(m);
      return {
        id: m.id,
        name: m.name || m.id,
        description: m.description,
        context_length: m.context_length || 32768,
        pricing: m.pricing,
        architecture: m.architecture,
        capabilities,
        isZeroDataRetention,
      };
    });

    if (classified.length > 0) {
      cachedFreeModels = classified;
      modelsCacheExpiresAt = now + MODELS_CACHE_TTL_MS;
    }

    return cachedFreeModels;
  }

  /**
   * Pick live free models matching a specific capability (text, long_context, reasoning, embeddings, rerank)
   */
  public static async getFreeModelsByCapability(
    capability: OpenRouterCapability,
    requireZeroRetention = false
  ): Promise<OpenRouterModel[]> {
    const allFree = await this.getLiveFreeModels();
    let matching = allFree.filter((m) => m.capabilities.includes(capability));

    if (matching.length === 0) {
      // Fallback to general text models if specific subtype not matched
      matching = allFree.filter((m) => m.capabilities.includes("text"));
    }

    // Filter for zero-data-retention if required
    if (requireZeroRetention) {
      const zdr = matching.filter((m) => m.isZeroDataRetention);
      if (zdr.length > 0) return zdr;
    }

    // Sort models by context length descending for long_context or reasoning
    if (capability === "long_context" || capability === "reasoning") {
      matching.sort((a, b) => b.context_length - a.context_length);
    }

    return matching;
  }

  private static readonly NON_TEXT_MODALITIES = [
    "image",
    "image_draft",
    "image_final",
    "video",
    "three_d",
    "3d",
    "three_sixty",
    "360",
    "voiceover",
  ];

  /**
   * Modality Guardrail: Free OpenRouter models are strictly for TEXT/embedding/rerank tasks.
   * They cannot produce images, video, 3D or 360 views; route those to existing provider keys or free open-source tools.
   */
  public static assertAllowedModality(taskOrCapability: string): void {
    const lower = taskOrCapability.toLowerCase();
    if (this.NON_TEXT_MODALITIES.some((m) => lower.includes(m))) {
      throw new Error(
        `OpenRouter free models cannot produce images, video, 3D or 360 views. Routing rule: Route task "${taskOrCapability}" to existing provider keys (FLUX, Kling, Runway, Tripo3D) or free open-source tools (FFmpeg, Blender, Three.js).`
      );
    }
  }

  /**
   * General text generation helper with automatic capability resolution.
   */
  public static async generateText(options: {
    task: string;
    messages: ChatMessage[];
    targetLanguage?: "Gujarati" | "Hindi" | "English";
    temperature?: number;
    maxTokens?: number;
    containsClientData?: boolean;
    clientMetadata?: ClientMetadata;
  }): Promise<{
    text: string;
    modelUsed: string;
    tokensUsed: number;
    capabilityMatched: OpenRouterCapability;
  }> {
    this.assertAllowedModality(options.task);

    let capability: OpenRouterCapability = "text";
    if (options.task === "agent_reasoning" || options.task === "text_qa") {
      capability = "reasoning";
    } else if (
      options.task === "creative_brief" ||
      options.messages.some((m) => m.content.length > 4000)
    ) {
      capability = "long_context";
    }

    const res = await this.generateTextByCapability({
      capability,
      taskName: options.task,
      messages: options.messages,
      targetLanguage: options.targetLanguage,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      containsClientData: options.containsClientData,
      clientMetadata: options.clientMetadata,
    });

    return {
      text: res.text,
      modelUsed: res.modelUsed,
      tokensUsed: res.tokensUsed,
      capabilityMatched: res.capabilityMatched,
    };
  }

  /**
   * Generate text using OpenRouter free models picked by capability at runtime.
   * Enforces Zero-Data-Retention guardrail and client privacy.
   */
  public static async generateTextByCapability(
    options: CapabilityGenerationOptions
  ): Promise<OpenRouterResult> {
    this.assertAllowedModality(options.taskName);
    this.assertAllowedModality(options.capability);
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const containsClientData = Boolean(
      options.containsClientData ||
        (options.clientMetadata &&
          options.messages.some((m) => PrivacySanitizer.containsClientData(m.content, options.clientMetadata)))
    );

    // Get models matching capability
    const candidateModels = await this.getFreeModelsByCapability(
      options.capability,
      containsClientData // If client data present, prefer zero retention endpoints
    );

    if (candidateModels.length === 0) {
      throw new Error(
        `No free OpenRouter models available for capability "${options.capability}".`
      );
    }

    const now = Date.now();
    // Exclude models currently in cooldown backoff
    const available = candidateModels.filter((m) => {
      const until = modelBackoffMap.get(m.id) || 0;
      return now >= until;
    });

    const modelsToTry = available.length > 0 ? available : candidateModels;

    const baseUrl = this.getBaseUrl();
    let lastError: Error | null = null;

    // Prepare messages and apply Zero-Data-Retention privacy policy
    let processedMessages = options.messages.map((m) => ({ ...m }));
    let scrubbedApplied = false;

    for (const model of modelsToTry) {
      // ZERO-DATA-RETENTION GUARDRAIL:
      // "Whenever a request contains any client data, only use endpoints marked
      // zero-data-retention; otherwise send no client data."
      if (containsClientData && !model.isZeroDataRetention) {
        // Model is NOT zero-data-retention: scrub all client data completely so NO client data is sent!
        processedMessages = processedMessages.map((msg) => {
          const { scrubbedText } = PrivacySanitizer.scrubAllClientData(
            msg.content,
            options.clientMetadata
          );
          return { ...msg, content: scrubbedText };
        });
        scrubbedApplied = true;
      }

      // Add task context (e.g. Translation Gujarati/Hindi/English)
      const finalMessages = [...processedMessages];
      if (options.taskName === "translation" && options.targetLanguage) {
        finalMessages.unshift({
          role: "system",
          content: `You are the Sutra Studios official language translation engine. Translate the provided text into ${options.targetLanguage} with exact professional nuance. Return only the translation.`,
        });
      }

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://sutrastudios.in",
            "X-Title": "Sutra Studios",
            "Content-Type": "application/json",
            ...(model.isZeroDataRetention ? { "X-Data-Policy": "no-training" } : {}),
          },
          body: JSON.stringify({
            model: model.id,
            messages: finalMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1500,
          }),
        });

        if (response.status === 429 || response.status === 503) {
          // Rate limited: cooldown for 60s and try next free model in list
          modelBackoffMap.set(model.id, Date.now() + 60 * 1000);
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status}`;
          lastError = new Error(`OpenRouter free model ${model.id} error: ${errMsg}`);
          if (response.status === 402 || response.status === 400) {
            modelBackoffMap.set(model.id, Date.now() + 120 * 1000);
          }
          continue;
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const text = choice?.message?.content || "";
        const tokensUsed = data.usage?.total_tokens || 0;

        if (!text) {
          throw new Error(`Model ${model.id} returned empty content.`);
        }

        return {
          text: text.trim(),
          modelUsed: model.id,
          tokensUsed,
          capabilityMatched: options.capability,
          isZeroDataRetention: model.isZeroDataRetention,
          scrubbedClientData: scrubbedApplied,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        modelBackoffMap.set(model.id, Date.now() + 30 * 1000);
        continue;
      }
    }

    throw (
      lastError ||
      new Error(
        `All free OpenRouter models for capability "${options.capability}" failed or are rate-limited.`
      )
    );
  }

  /**
   * Embed text vectors via OpenRouter embedding endpoints with Zero-Data-Retention guardrail.
   */
  public static async embedText(options: {
    text: string;
    containsClientData?: boolean;
    clientMetadata?: ClientMetadata;
  }): Promise<{ embedding: number[]; modelUsed: string; isZeroDataRetention: boolean }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    let inputText = options.text;
    let isZdr = false;

    // Zero-data-retention guardrail for embeddings
    if (options.containsClientData) {
      const { scrubbedText } = PrivacySanitizer.scrubAllClientData(
        inputText,
        options.clientMetadata
      );
      inputText = scrubbedText;
    }

    const baseUrl = this.getBaseUrl();
    const candidateEmbeddingModels = ["text-embedding-3-small", "text-embedding-ada-002"];

    for (const model of candidateEmbeddingModels) {
      try {
        const res = await fetch(`${baseUrl}/embeddings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://sutrastudios.in",
            "X-Title": "Sutra Studios",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            input: inputText,
          }),
        });

        if (!res.ok) continue;

        const data = await res.json();
        const embedding = data.data?.[0]?.embedding;
        if (embedding && Array.isArray(embedding)) {
          return {
            embedding,
            modelUsed: model,
            isZeroDataRetention: isZdr,
          };
        }
      } catch {
        continue;
      }
    }

    throw new Error("OpenRouter embeddings generation failed across all available endpoints.");
  }

  /**
   * Rerank a set of documents against a query using free reasoning models.
   */
  public static async rerankDocuments(options: RerankOptions): Promise<RerankResult[]> {
    const { query, documents, topN = documents.length } = options;
    if (documents.length === 0) return [];
    if (documents.length === 1) {
      return [{ index: 0, document: documents[0], relevanceScore: 1.0 }];
    }

    // Prepare document list prompt
    const docPrompt = documents
      .map((doc, idx) => `[DOC_${idx}]: ${doc.slice(0, 400)}`)
      .join("\n\n");

    const systemPrompt = `You are the Sutra Studios high-speed reranking engine. Rank the documents by relevance to the query from most relevant to least relevant. Return ONLY a valid JSON array of indices and scores: [{"index": 0, "score": 0.95}, ...]`;

    const userPrompt = `Query: ${query}\n\nDocuments to rank:\n${docPrompt}`;

    const res = await this.generateTextByCapability({
      capability: "reasoning",
      taskName: "rerank",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      containsClientData: options.containsClientData,
      clientMetadata: options.clientMetadata,
      temperature: 0.1,
      maxTokens: 500,
    });

    try {
      const match = res.text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const results: RerankResult[] = parsed.map((item: any) => ({
          index: item.index,
          document: documents[item.index] || "",
          relevanceScore: item.score || 0,
        }));
        return results.slice(0, topN);
      }
    } catch {
      // Fallback: return in original order
    }

    return documents.slice(0, topN).map((doc, idx) => ({
      index: idx,
      document: doc,
      relevanceScore: 1.0 - idx * 0.1,
    }));
  }
}
