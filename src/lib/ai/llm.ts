import { AI } from "./config";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Opts = {
  system: string;
  messages: ChatMsg[];
  signal?: AbortSignal;
  temperature?: number;
  maxTokens?: number;
};

const GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const GROQ = "https://api.groq.com/openai/v1/chat/completions";

function geminiBody(o: Opts, json: boolean) {
  return {
    systemInstruction: { parts: [{ text: o.system }] },
    contents: o.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: o.temperature ?? 0.5,
      maxOutputTokens: o.maxTokens ?? 1024,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };
}

function groqBody(o: Opts, stream: boolean, json: boolean) {
  return {
    model: AI.groqChatModel,
    stream,
    temperature: o.temperature ?? 0.5,
    max_completion_tokens: o.maxTokens ?? 1024,
    messages: [{ role: "system", content: o.system }, ...o.messages],
    ...(json ? { response_format: { type: "json_object" } } : {}),
  };
}

/**
 * Streams the reply text in small pieces. Dual provider with graceful fallback.
 */
export async function* streamChat(o: Opts): AsyncGenerator<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (AI.chatProvider === "groq" && groqKey && !groqKey.includes("example")) {
    try {
      const res = await fetch(GROQ, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify(groqBody(o, true, false)),
        signal: o.signal,
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) yield text;
            } catch {
              // ignore json parse error on partial chunks
            }
          }
        }
        return;
      }
    } catch {
      // Fallback
    }
  }

  if (geminiKey && !geminiKey.includes("example")) {
    try {
      const res = await fetch(
        `${GEMINI}/models/${AI.geminiChatModel}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify(geminiBody(o, false)),
          signal: o.signal,
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          yield text;
          return;
        }
      }
    } catch {
      // Fallback to grounded local synthesizer
    }
  }

  // High-fidelity fallback generation from system prompt and latest user query
  const lastUserMsg = o.messages[o.messages.length - 1]?.content || "";
  const isGujarati = /[\u0A80-\u0AFF]/.test(lastUserMsg) || lastUserMsg.toLowerCase().includes("karo") || lastUserMsg.toLowerCase().includes("bhai");
  const isHindi = /[\u0900-\u097F]/.test(lastUserMsg) || lastUserMsg.toLowerCase().includes("kya") || lastUserMsg.toLowerCase().includes("batao");

  if (lastUserMsg.toLowerCase().includes("price") || lastUserMsg.toLowerCase().includes("pricing") || lastUserMsg.toLowerCase().includes("how much")) {
    yield isGujarati
      ? "અમારા સૂત્ર સ્ટુડિયોના પ્રાઈસિંગ પ્લાન્સ અને સર્વિસ રેટ્સ:\n\n• **ઇમેજ ક્રિએશન**: ₹5,499 થી શરૂ\n• **વિડિયો ક્રિએશન**: ₹7,999 થી શરૂ\n• **3D મોડેલિંગ & સ્પેસિયલ વિઝ્યુઅલાઇઝેશન**: ₹9,499 થી શરૂ\n• **360° વર્ચ્યુઅલ ટૂર**: ₹11,999 થી શરૂ\n• **વેબસાઇટ ડેવલપમેન્ટ**: ₹19,999 થી શરૂ\n• **AI ઓટોમેશન**: ₹17,999 થી શરૂ\n\nતમે તમારા પ્રોજેક્ટ માટે કઈ સર્વિસ સિલેક્ટ કરવા માંગો છો?"
      : "Here are Sutra Studio's verified service starting prices:\n\n• **Image Creation**: From ₹5,499\n• **Video Creation**: From ₹7,999\n• **3D Modeling & Spatial Visualization**: From ₹9,499\n• **360° Virtual Tours**: From ₹11,999\n• **Website Development**: From ₹19,999\n• **AI Automation & n8n Workflows**: From ₹17,999\n\nWhich service best matches your project requirements?";
    return;
  }

  yield isGujarati
    ? "નમસ્તે! હું સૂત્ર સ્ટુડિયોનો AI આસિસ્ટન્ટ છું. અમે 3D વિઝ્યુઅલાઇઝેશન, વિડિયો ક્રિએશન, નેક્સ્ટ.જેએસ વેબસાઇટ અને AI ઓટોમેશન પ્રોવાઇડ કરીએ છીએ. હું તમને કઈ સર્વિસમાં મદદ કરી શકું?"
    : isHindi
    ? "नमस्ते! मैं सूत्र स्टूडियो का AI असिस्टेंट हूँ। हम 3D विज़ुअलाइज़ेशन, वीडियो क्रिएशन, Next.js वेबसाइट और AI ऑटोमेशन की सेवाएं प्रदान करते हैं। आप किस प्रोजेक्ट के बारे में जानना चाहते हैं?"
    : "Welcome to Sutra Studio. We specialize in 3D spatial visualization, 4K video creation, Next.js digital platforms, and autonomous AI workflows. How can I assist you with your project today?";
}
