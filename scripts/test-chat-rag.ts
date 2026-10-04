import * as fs from "node:fs";
import * as path from "node:path";
import Module from "node:module";

// Mock server-only in node script test
const origRequire = (Module.prototype as any).require;
(Module.prototype as any).require = function (id: string) {
  if (id === "server-only") return {};
  return origRequire.apply(this, arguments);
};

const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

async function testChatApi() {
  const { generateChatResponse } = await import("../src/lib/ai/llm");
  const { MASTER_RAG_KNOWLEDGE_STORE, MASTER_SYSTEM_PROMPT } = await import("../src/lib/services/ragLlmService");

  const knowledgeChunks = MASTER_RAG_KNOWLEDGE_STORE.map(
    (k) => `[Category: ${k.category}] Title: ${k.title}\nContent:\n${k.content}`
  ).join("\n\n---\n\n");

  const systemPrompt = `${MASTER_SYSTEM_PROMPT}\n\nKNOWLEDGE BASE:\n${knowledgeChunks}\n\nCONVERSATIONAL RULES:\n1. Always respond in the EXACT language used by the user. If the user writes in Gujarati (ગુજરાતી), respond completely and fluently in Gujarati. If in English, respond in English. If in Hindi, respond in Hindi.\n2. Be warm, polite, and helpful.`;

  console.log("\n=== TEST 1: Greeting 'hi' ===");
  const res1 = await generateChatResponse({
    system: systemPrompt,
    messages: [{ role: "user", content: "hi" }],
  });
  console.log("Response 1:\n", res1);

  console.log("\n=== TEST 2: Gujarati Query 'તમારા વિડિયો ક્રિએશન સર્વિસ અને ભાવ શું છે?' ===");
  const res2 = await generateChatResponse({
    system: systemPrompt,
    messages: [{ role: "user", content: "તમારા વિડિયો ક્રિએશન સર્વિસ અને ભાવ શું છે?" }],
  });
  console.log("Response 2:\n", res2);
}

testChatApi();
