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

  // 5. OpenRouter Free Models Cascade (Llama 3.3 70B, Gemini 2.0 Flash Exp, DeepSeek R1, Qwen 2.5)
  const openrouterKey = readEnv("OPENROUTER_API_KEY") || process.env.OPENROUTER_API_KEY;
  if (openrouterKey && !ProviderRouter.isProviderInBackoff("openrouter-free")) {
    try {
      const { OpenRouterService } = await import("./openrouterService");
      const res = await OpenRouterService.generateTextByCapability({
        capability: "text",
        taskName: "chat",
        messages: [{ role: "system", content: o.system }, ...o.messages],
        temperature: o.temperature,
        maxTokens: o.maxTokens,
      });
      if (res.text) {
        await ProviderRouter.recordSuccess("openrouter-free", 1, 0);
        return res.text.trim();
      }
    } catch {
      // Fallback to local grounded synthesizer
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
    if (isGujarati) {
      return "અમારા સૂત્ર સ્ટુડિયોના સત્તાવાર પ્રાઈસિંગ પ્લાન્સ અને સર્વિસ રેટ્સ:\n\n• **ઇમેજ ક્રિએશન**: ₹249 થી શરૂ (પેક્સ: ₹249 થી શરૂ)\n• **વિડિયો રીલ્સ & પ્રોડક્શન**: ₹199 થી શરૂ (પ્રોમોશનલ: ₹499)\n• **3D પ્રોડક્ટ મોડેલિંગ & વિઝ્યુઅલાઇઝેશન**: ₹999/વ્યુ થી શરૂ\n• **360° વર્ચ્યુઅલ ટૂર**: ₹2,999 થી શરૂ\n• **વેબસાઇટ ડિઝાઇન & ડેવલપમેન્ટ**: ₹4,999 થી શરૂ\n• **મંથલી કન્ટેન્ટ પેકેજ**: ₹9,999/મહિનો થી શરૂ\n\nતમે તમારા પ્રોજેક્ટ માટે કઈ સર્વિસ વિશે વધુ માહિતી મેળવવા માંગો છો?";
    }
    if (isHindi) {
      return "सूत्र स्टूडियो के आधिकारिक मूल्य और सेवा दरें:\n\n• **इमेज क्रिएशन**: ₹249 से शुरू (पैक्स: ₹249 से शुरू)\n• **वीडियो रील्स & प्रोडक्शन**: ₹199 से शुरू (प्रमोशनल: ₹499)\n• **3D प्रोडक्ट मॉडलिंग & विज़ुअलाइज़ेशन**: ₹999/व्यू से शुरू\n• **360° वर्चुअल टूर**: ₹2,999 से शुरू\n• **वेबसाइट डिज़ाइन & डेवलपमेंट**: ₹4,999 से शुरू\n• **मासिक कंटेंट पैकेज**: ₹9,999/माह से शुरू\n\nआप अपने प्रोजेक्ट के लिए किस सेवा की जानकारी चाहते हैं?";
    }
    return "Here are Sutra Studio's official canonical starting prices:\n\n• **Image Creation**: From ₹249 (Packs from ₹249, Single from ₹299)\n• **Video & Reel Production**: From ₹199 (Promo Reel: ₹499, Packs from ₹499)\n• **3D Modeling & Visualization**: From ₹999/view (Product Model: from ₹2,999)\n• **360° Virtual Tours**: From ₹2,999\n• **Interior & Architectural 3D**: From ₹1,499/view\n• **Website Design & Development**: From ₹4,999 (Business Web: ₹14,999)\n• **Monthly Content Packages**: From ₹9,999/mo (Starter Trend)\n\nWhich service or package best matches your requirements?";
  }

  return isGujarati
    ? "નમસ્તે! 🙏 હું સૂત્ર સ્ટુડિયોનો AI આસિસ્ટન્ટ છું. અમે ક્રિએટિવ ઇમેજ, શોર્ટ વિડિયો, 3D વિઝ્યુઅલાઇઝેશન, 360° ટૂર અને પ્રીમિયમ વેબસાઇટ ડેવલપમેન્ટ પ્રોવાઇડ કરીએ છીએ. હું તમને કઈ રીતે મદદ કરી શકું?"
    : isHindi
    ? "नमस्ते! 🙏 मैं सूत्र स्टूडियो का AI असिस्टेंट हूँ। हम क्रिएटिव इमेज, शॉर्ट वीडियो, 3D विज़ुअलाइज़ेशन, 360° टूर और प्रीमियम वेबसाइट डेवलपमेंट की सेवाएं प्रदान करते हैं। मैं आपकी क्या मदद कर सकता हूँ?"
    : "Namaste! Welcome to Sutra Studio. We craft commercial imagery, promotional video reels, 3D visualization, 360° virtual tours, and modern web applications. How can I assist you with your project today?";
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
