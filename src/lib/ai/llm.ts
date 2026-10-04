import { AI } from "./config";
import { ProviderRouter } from "./providerRouter";
import { readEnv } from "@/lib/config/env";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Opts = {
  system: string;
  messages: ChatMsg[];
  signal?: AbortSignal;
  temperature?: number;
  maxTokens?: number;
  sensitiveOrder?: boolean;
};

const GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const GROQ = "https://api.groq.com/openai/v1/chat/completions";
const CEREBRAS = "https://api.cerebras.ai/v1/chat/completions";
const OPENAI = "https://api.openai.com/v1/chat/completions";

function geminiBody(o: Opts, json: boolean) {
  return {
    systemInstruction: { parts: [{ text: o.system }] },
    contents: o.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: o.temperature ?? 0.6,
      maxOutputTokens: o.maxTokens ?? 1500,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };
}

function openAIBody(model: string, o: Opts, stream: boolean, json: boolean) {
  return {
    model,
    stream,
    temperature: o.temperature ?? 0.6,
    max_completion_tokens: o.maxTokens ?? 1500,
    messages: [{ role: "system", content: o.system }, ...o.messages],
    ...(json ? { response_format: { type: "json_object" } } : {}),
  };
}

/**
 * Generate a complete text reply using Gemini -> Groq -> Cerebras -> OpenAI.
 */
export async function generateChatResponse(o: Opts): Promise<string> {
  const geminiKey =
    readEnv("GEMINI_API_KEY") ||
    readEnv("GOOGLE_AI_API_KEY" as any) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  const groqKey = readEnv("GROQ_API_KEY") || process.env.GROQ_API_KEY;
  const cerebrasKey = readEnv("CEREBRAS_API_KEY") || process.env.CEREBRAS_API_KEY;
  const openaiKey = readEnv("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;

  // 1. Multi-model Gemini Cascade
  if (geminiKey && !geminiKey.includes("example")) {
    const modelsToTry = AI.geminiModelCascade || [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
    ];

    for (const model of modelsToTry) {
      try {
        const res = await fetch(`${GEMINI}/models/${model}:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody(o, false)),
          signal: o.signal,
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            await ProviderRouter.recordSuccess("gemini", 1, 0.0001);
            return text.trim();
          }
        }
      } catch {
        // Try next model in cascade
      }
    }
  }

  // 2. Groq Llama 3.3 70B
  if (groqKey && !groqKey.includes("example") && !ProviderRouter.isProviderInBackoff("groq")) {
    try {
      const res = await fetch(GROQ, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify(openAIBody(AI.groqChatModel, o, false, false)),
        signal: o.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          await ProviderRouter.recordSuccess("groq", 1, 0.0002);
          return text.trim();
        }
      }
    } catch {
      // Fallback
    }
  }

  // 3. Cerebras
  if (cerebrasKey && !cerebrasKey.includes("example") && !ProviderRouter.isProviderInBackoff("cerebras")) {
    try {
      const res = await fetch(CEREBRAS, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cerebrasKey}` },
        body: JSON.stringify(openAIBody("llama3.1-8b", o, false, false)),
        signal: o.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          await ProviderRouter.recordSuccess("cerebras", 1, 0.0002);
          return text.trim();
        }
      }
    } catch {
      // Fallback
    }
  }

  // 4. OpenAI
  if (openaiKey && !openaiKey.includes("example") && !ProviderRouter.isProviderInBackoff("openai")) {
    try {
      const res = await fetch(OPENAI, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify(openAIBody("gpt-4o-mini", o, false, false)),
        signal: o.signal,
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          await ProviderRouter.recordSuccess("openai", 1, 0.0015);
          return text.trim();
        }
      }
    } catch {
      // Fallback
    }
  }

  // Local Grounded Synthesizer Fallback
  const lastUserMsg = o.messages[o.messages.length - 1]?.content || "";
  const isGujarati =
    /[\u0A80-\u0AFF]/.test(lastUserMsg) ||
    lastUserMsg.toLowerCase().includes("karo") ||
    lastUserMsg.toLowerCase().includes("chhe") ||
    lastUserMsg.toLowerCase().includes("bhai");
  const isHindi =
    /[\u0900-\u097F]/.test(lastUserMsg) ||
    lastUserMsg.toLowerCase().includes("kya") ||
    lastUserMsg.toLowerCase().includes("batao");

  if (
    lastUserMsg.toLowerCase().includes("price") ||
    lastUserMsg.toLowerCase().includes("pricing") ||
    lastUserMsg.toLowerCase().includes("how much") ||
    lastUserMsg.toLowerCase().includes("rate") ||
    lastUserMsg.includes("ભાવ") ||
    lastUserMsg.includes("કિંમત")
  ) {
    return isGujarati
      ? "અમારા સૂત્ર સ્ટુડિયોના પ્રાઈસિંગ પ્લાન્સ અને સર્વિસ રેટ્સ:\n\n• **ઇમેજ ક્રિએશન**: ₹5,499 થી શરૂ\n• **વિડિયો ક્રિએશન**: ₹7,999 થી શરૂ\n• **3D મોડેલિંગ & સ્પેસિયલ વિઝ્યુઅલાઇઝેશન**: ₹9,499 થી શરૂ\n• **360° વર્ચ્યુઅલ ટૂર**: ₹11,999 થી શરૂ\n• **વેબસાઇટ ડેવલપમેન્ટ**: ₹19,999 થી શરૂ\n• **AI ઓટોમેશન**: ₹17,999 થી શરૂ\n\nતમે તમારા પ્રોજેક્ટ માટે કઈ સર્વિસ સિલેક્ટ કરવા માંગો છો?"
      : "Here are Sutra Studio's verified service starting prices:\n\n• **Image Creation**: From ₹5,499\n• **Video Creation**: From ₹7,999\n• **3D Modeling & Spatial Visualization**: From ₹9,499\n• **360° Virtual Tours**: From ₹11,999\n• **Website Development**: From ₹19,999\n• **AI Automation & n8n Workflows**: From ₹17,999\n\nWhich service best matches your project requirements?";
  }

  return isGujarati
    ? "નમસ્તે! 🙏 હું સૂત્ર સ્ટુડિયોનો AI આસિસ્ટન્ટ છું. અમે 3D વિઝ્યુઅલાઇઝેશન, 4K વિડિયો ક્રિએશન, Next.js વેબસાઇટ અને AI ઓટોમેશન પ્રોવાઇડ કરીએ છીએ. હું તમને કઈ રીતે મદદ કરી શકું?"
    : isHindi
    ? "नमस्ते! 🙏 मैं सूत्र स्टूडियो का AI असिस्टेंट हूँ। हम 3D विज़ुअलाइज़ेशन, 4K वीडियो क्रिएशन, Next.js वेबसाइट और AI ऑटोमेशन की सेवाएं प्रदान करते हैं। आप किस प्रोजेक्ट के बारे में जानना चाहते हैं?"
    : "Namaste! Welcome to Sutra Studio. We specialize in 3D spatial visualization, 4K video creation, Next.js digital platforms, and autonomous AI workflows. How can I assist you with your project today?";
}

/**
 * Streams the reply text in small pieces.
 */
export async function* streamChat(o: Opts): AsyncGenerator<string> {
  const fullText = await generateChatResponse(o);
  const words = fullText.split(" ");
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(" ") + " ";
    yield chunk;
  }
}
