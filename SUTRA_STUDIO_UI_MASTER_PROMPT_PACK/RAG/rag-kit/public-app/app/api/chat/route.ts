import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/server";
import { isStaffRole, sameOrigin } from "@/lib/auth/shared";
import { rateLimit } from "@/lib/rate-limit";
import { AI } from "@/lib/ai/config";
import { streamChat } from "@/lib/ai/llm";
import { retrieve, type Retrieved } from "@/lib/rag/retrieve";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import { getCatalogText } from "@/lib/rag/catalog";
import { MarkerFilter } from "@/lib/rag/markers";
import { toModelMessages, type StoredMessage } from "@/lib/chat/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FRIENDLY_ERROR = "Sorry, I couldn't answer that just now. Please try again in a moment.";
const ID = /^[A-Za-z0-9]{10,40}$/;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ message: "Request blocked." }, 403);
  const session = await getSession();
  if (!session || isStaffRole(session.role)) return json({ message: "Please sign in." }, 401);
  if (!rateLimit(`chat:${session.uid}`, 20, 60_000)) return json({ message: "You're sending messages too fast. Wait a moment." }, 429);

  const body = (await req.json().catch(() => null)) as { conversationId?: unknown; message?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 4000) return json({ message: "Write a message of up to 4,000 characters." }, 400);

  // Conversation: reuse (must belong to this client) or create.
  const db = adminDb();
  let convRef;
  let mode: "ai" | "human" = "ai";
  if (body?.conversationId !== undefined) {
    if (typeof body.conversationId !== "string" || !ID.test(body.conversationId)) return json({ message: "Conversation not found." }, 404);
    convRef = db.collection("conversations").doc(body.conversationId);
    const snap = await convRef.get();
    const c = snap.data() as { clientId?: string; mode?: "ai" | "human" } | undefined;
    if (!snap.exists || c?.clientId !== session.uid) return json({ message: "Conversation not found." }, 404);
    mode = c.mode === "human" ? "human" : "ai";
  } else {
    convRef = db.collection("conversations").doc();
    await convRef.set({
      clientId: session.uid,
      clientName: session.name,
      mode: "ai",
      needsHuman: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  const messages = convRef.collection("messages");

  // History is read BEFORE the new message is written, then the new message is appended in memory.
  const historySnap = await messages.orderBy("createdAt", "desc").limit(AI.historyMessages).get();
  const history = historySnap.docs.reverse().map((d) => d.data() as StoredMessage);
  await messages.add({ role: "user", author: "client", content: message, createdAt: FieldValue.serverTimestamp() });
  await convRef.update({ lastMessageAt: FieldValue.serverTimestamp(), lastMessagePreview: message.slice(0, 120), updatedAt: FieldValue.serverTimestamp() });

  const enc = new TextEncoder();
  const abort = new AbortController();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: Record<string, unknown>) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
        } catch {
          /* client disconnected */
        }
      };
      send({ type: "meta", conversationId: convRef.id, mode });

      // A team member has taken over: store the message, do not call the model.
      if (mode === "human") {
        send({ type: "done" });
        controller.close();
        return;
      }

      const started = Date.now();
      let reply = "";
      let handoff = false;
      let context: Retrieved[] = [];
      try {
        const prev = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
        const query = message.length < 25 && prev ? `${prev} ${message}` : message;
        const [catalog, found] = await Promise.all([
          getCatalogText(),
          retrieve(session.uid, query).catch((e) => {
            console.error("[chat] retrieval failed", e); // e.g. vector index not created yet: answer without brand notes
            return [] as Retrieved[];
          }),
        ]);
        context = found;

        const system = buildSystemPrompt({
          clientName: session.name,
          catalog,
          context,
          today: new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date()),
        });
        const modelMessages = toModelMessages([...history, { role: "user", content: message }]);

        const filter = new MarkerFilter();
        for await (const piece of streamChat({ system, messages: modelMessages, signal: abort.signal })) {
          const safe = filter.push(piece);
          if (safe) {
            reply += safe;
            send({ type: "delta", text: safe });
          }
        }
        const rest = filter.flush();
        if (rest) {
          reply += rest;
          send({ type: "delta", text: rest });
        }
        handoff = filter.found;
        if (!reply.trim()) throw new Error("Empty model reply");
      } catch (err) {
        if (!abort.signal.aborted) {
          console.error("[chat] generation failed", err);
          if (!reply.trim()) {
            reply = FRIENDLY_ERROR;
            send({ type: "error", message: FRIENDLY_ERROR });
          }
        }
      }

      const text = reply.trim();
      if (text) {
        const saved = await messages.add({ role: "assistant", author: "ai", content: text, createdAt: FieldValue.serverTimestamp() });
        // Internal trace (sources, timing) lives in a subcollection that clients cannot read.
        await convRef.collection("aiTrace").doc(saved.id).set({
          sources: context.map((c) => ({ id: c.id, distance: c.distance })),
          provider: AI.chatProvider,
          model: AI.chatProvider === "groq" ? AI.groqChatModel : AI.geminiChatModel,
          latencyMs: Date.now() - started,
          createdAt: FieldValue.serverTimestamp(),
        });
        await convRef.update({
          lastMessageAt: FieldValue.serverTimestamp(),
          lastMessagePreview: text.slice(0, 120),
          updatedAt: FieldValue.serverTimestamp(),
          ...(handoff ? { needsHuman: true } : {}),
        });
      }
      if (handoff) send({ type: "handoff" });
      send({ type: "done" });
      controller.close();
    },
    cancel() {
      abort.abort();
    },
  });

  req.signal.addEventListener("abort", () => abort.abort());
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
