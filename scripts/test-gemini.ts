import * as fs from "node:fs";
import * as path from "node:path";

const envFile = path.join(process.cwd(), ".env.local");
const env: Record<string, string> = {};
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

const key = env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY;

async function testModernModels() {
  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  for (const m of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: "Respond with: 'Sutra Studio AI is live!' in Gujarati and English." }],
              },
            ],
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Model '${m}' SUCCESS:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
      } else {
        console.log(`❌ Model '${m}' FAILED (${res.status}):`, data.error?.message);
      }
    } catch (e: any) {
      console.log(`❌ Model '${m}' ERROR:`, e.message);
    }
  }
}

testModernModels();
