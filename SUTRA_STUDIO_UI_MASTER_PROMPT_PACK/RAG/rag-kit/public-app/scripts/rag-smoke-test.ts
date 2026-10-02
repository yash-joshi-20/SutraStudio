/**
 * End-to-end check of embedding -> Firestore vector search -> LLM, using a throwaway test client.
 *   1) Set env vars (see .env.example) and create the vector index first.
 *   2) npx tsx --conditions=react-server scripts/rag-smoke-test.ts
 * It writes 2 notes for the client id "smoke-test-client", asks a question, prints the answer, then cleans up.
 */
import { ingestKnowledge, deleteKnowledgeSource } from "../lib/rag/ingest";
import { retrieve } from "../lib/rag/retrieve";
import { buildSystemPrompt } from "../lib/rag/prompt";
import { getCatalogText } from "../lib/rag/catalog";
import { generateText } from "../lib/ai/llm";

const CLIENT = "smoke-test-client";

async function main() {
  await ingestKnowledge({
    clientId: CLIENT, sourceType: "note", sourceId: "note_smoke_1", title: "Brand colors",
    text: "Our brand uses deep green and ivory. We never use red because our customers associate it with sale banners.",
  });
  await ingestKnowledge({
    clientId: CLIENT, sourceType: "note", sourceId: "note_smoke_2", title: "Audience",
    text: "Our customers are young parents in Ahmedabad who buy organic baby food. They prefer calm, honest messaging.",
  });
  console.log("Waiting a few seconds for the index to see the new documents...");
  await new Promise((r) => setTimeout(r, 5000));

  const question = "Which colors should my Instagram ad use?";
  const context = await retrieve(CLIENT, question);
  console.log("Retrieved:", context.map((c) => `${c.title} (distance ${c.distance.toFixed(3)})`));

  const system = buildSystemPrompt({ catalog: await getCatalogText(), context, today: new Date().toDateString() });
  console.log("\nAnswer:\n" + (await generateText({ system, messages: [{ role: "user", content: question }] })));

  // Tenant isolation check: another client must get nothing.
  const other = await retrieve("some-other-client", question);
  console.log("\nOther client sees", other.length, "notes (must be 0)");

  await deleteKnowledgeSource(CLIENT, "note_smoke_1");
  await deleteKnowledgeSource(CLIENT, "note_smoke_2");
}
main().catch((e) => { console.error(e); process.exit(1); });
