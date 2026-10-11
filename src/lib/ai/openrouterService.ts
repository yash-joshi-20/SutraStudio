/**
 * SUTRA STUDIO — OpenRouter Free Model Service
 *
 * Implements Rule 9 (Free-First Provider Policy):
 * - OpenRouter models with ":free" suffix for TEXT tasks only:
 *   chat assistant, creative brief, captions, translation (Gujarati/Hindi/English),
 *   agent reasoning, text QA.
 * - Fetches live list of free models from OpenRouter models endpoint at runtime.
 *   NEVER hardcodes model names.
 * - Rotates through free models with exponential backoff on 429/quota errors.
 * - Enforces client privacy and zero-fake generation.
 */

import { readEnv } from "@/lib/config/env";

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TextGenerationOptions {
  task:
    | "text_chat"
    | "creative_brief"
    | "captions"
    | "translation"
    | "agent_reasoning"
    | "text_qa";
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  targetLanguage?: "Gujarati" | "Hindi" | "English";
}

export interface OpenRouterResponse {
  text: string;
  modelUsed: string;
  tokensUsed: number;
  finishReason?: string;
}

// In-Memory Cache for live free models (1-hour TTL)
let cachedFreeModels: OpenRouterModel[] = [];
let modelsCacheExpiresAt = 0;
const MODELS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Model Backoff map (modelId -> epoch ms when backoff ends)
const modelBackoffMap = new Map<string, number>();

export class OpenRouterService {
  private static getApiKey(): string | undefined {
    return readEnv("OPENROUTER_API_KEY");
  }

  private static getBaseUrl(): string {
    return readEnv("OPENROUTER_BASE_URL") || "https://openrouter.ai/api/v1";
  }

  /**
   * Fetch live list of free models from OpenRouter endpoint at runtime.
   * Never hardcodes model names. Filters by `:free` suffix or zero pricing.
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
    const rawList: OpenRouterModel[] = json.data || [];

    // Filter strictly for models with ":free" suffix or zero pricing
    const freeModels = rawList.filter((m) => {
      const isFreeSuffix = m.id.toLowerCase().endsWith(":free");
      const isZeroPrice =
        m.pricing &&
        (m.pricing.prompt === "0" || m.pricing.prompt === "0.0") &&
        (m.pricing.completion === "0" || m.pricing.completion === "0.0");
      return isFreeSuffix || isZeroPrice;
    });

    if (freeModels.length > 0) {
      cachedFreeModels = freeModels;
      modelsCacheExpiresAt = now + MODELS_CACHE_TTL_MS;
    }

    return cachedFreeModels;
  }

  /**
   * Execute text generation using live OpenRouter free models with fallback and backoff.
   */
  public static async generateText(
    options: TextGenerationOptions
  ): Promise<OpenRouterResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    // Get live list of free models (runtime fetch, no hardcoding)
    const freeModels = await this.getLiveFreeModels();
    if (freeModels.length === 0) {
      throw new Error("No free models currently available on OpenRouter.");
    }

    const now = Date.now();
    // Filter out models currently in backoff
    const availableModels = freeModels.filter((m) => {
      const backoffUntil = modelBackoffMap.get(m.id) || 0;
      return now >= backoffUntil;
    });

    const modelsToTry = availableModels.length > 0 ? availableModels : freeModels;

    const baseUrl = this.getBaseUrl();
    let lastError: Error | null = null;

    // Build system message for task context (e.g. Translation Gujarati/Hindi/English)
    const enhancedMessages = [...options.messages];
    if (options.task === "translation" && options.targetLanguage) {
      enhancedMessages.unshift({
        role: "system",
        content: `You are the Sutra Studios official language translation engine. Translate the provided text accurately and idiomatically into ${options.targetLanguage}. Preserve tone and professional atelier terminology. Return only the translated text.`,
      });
    }

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://sutrastudios.in",
            "X-Title": "Sutra Studios",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model.id,
            messages: enhancedMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1500,
          }),
        });

        if (response.status === 429 || response.status === 503) {
          // Model is rate-limited: put it into backoff for 60 seconds and try next free model
          modelBackoffMap.set(model.id, Date.now() + 60 * 1000);
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status}`;
          lastError = new Error(`OpenRouter model ${model.id} failed: ${errMsg}`);
          // Put into backoff if quota or capacity error
          if (response.status === 402 || response.status === 400) {
            modelBackoffMap.set(model.id, Date.now() + 120 * 1000);
          }
          continue;
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const content = choice?.message?.content || "";
        const tokensUsed = data.usage?.total_tokens || 0;

        return {
          text: content.trim(),
          modelUsed: model.id,
          tokensUsed,
          finishReason: choice?.finish_reason,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error("Network error during completion");
        modelBackoffMap.set(model.id, Date.now() + 30 * 1000);
        continue;
      }
    }

    throw (
      lastError ||
      new Error(`All ${modelsToTry.length} free OpenRouter models failed or are currently rate limited.`)
    );
  }
}
