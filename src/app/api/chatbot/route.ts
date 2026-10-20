import { NextResponse } from "next/server";
import { RagLlmEngine, MASTER_SYSTEM_PROMPT, MASTER_RAG_KNOWLEDGE_STORE } from "@/lib/services/ragLlmService";
import { KnowledgeRecord } from "@/lib/types/knowledge";
import { ClientChatStore } from "@/lib/services/clientChatStore";

declare global {
  var __sutra_knowledge_base: KnowledgeRecord[] | undefined;
}

function getKnowledgeBase(): KnowledgeRecord[] {
  if (!globalThis.__sutra_knowledge_base || globalThis.__sutra_knowledge_base.length === 0) {
    globalThis.__sutra_knowledge_base = [...MASTER_RAG_KNOWLEDGE_STORE];
  }
  return globalThis.__sutra_knowledge_base;
}

export async function POST(req: Request) {
  try {
    const { message, client_id, client_email, client_name, preview_mode } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const kbStore = getKnowledgeBase();
    const targetClientId = client_id || "client_sutra";

    // Persist incoming client query for Admin CRM visibility
    await ClientChatStore.addMessage({
      clientId: targetClientId,
      clientKey: client_email || targetClientId,
      clientEmail: client_email,
      clientName: client_name,
      sender: "client",
      text: message,
      channel: "ai_chat",
    }).catch(() => {});

    const eligibleRecords = kbStore.filter((k) => {
      const matchesClient =
        !k.client_id ||
        k.client_id === targetClientId ||
        k.client_id === "client_sutra" ||
        k.client_id === "client_shriram" ||
        k.client_id === "client_default";

      if (!matchesClient) return false;

      if (preview_mode) {
        return k.status === "approved";
      }
      return k.status === "approved" && (k.published === true || k.published === undefined);
    });

    const ragResult = await RagLlmEngine.answerQuery(message, eligibleRecords);

    // Persist bot answer for Admin CRM visibility
    if (ragResult?.answer) {
      await ClientChatStore.addMessage({
        clientId: targetClientId,
        clientKey: client_email || targetClientId,
        clientEmail: client_email,
        clientName: client_name,
        sender: "assistant",
        text: ragResult.answer,
        channel: "ai_chat",
      }).catch(() => {});
    }

    return NextResponse.json(ragResult, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        answer: "I don't have verified information about that yet. Please contact our team for the most accurate information.",
        error: "Internal error processing request",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const kbStore = getKnowledgeBase();
  return NextResponse.json({
    engine: "Sutra Studio RAG LLM",
    status: "active",
    grounding: "Strict Zero-Hallucination Admin-Approved Knowledge Chunks",
    totalIndexedRecords: kbStore.length,
    systemPrompt: MASTER_SYSTEM_PROMPT,
  });
}
