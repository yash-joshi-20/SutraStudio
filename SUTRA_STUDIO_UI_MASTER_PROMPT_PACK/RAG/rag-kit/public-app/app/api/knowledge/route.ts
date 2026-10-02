import { randomUUID } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/server";
import { isStaffRole, sameOrigin } from "@/lib/auth/shared";
import { rateLimit } from "@/lib/rate-limit";
import { deleteKnowledgeSource, ingestKnowledge } from "@/lib/rag/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function client(req: Request) {
  if (!sameOrigin(req)) return null;
  const s = await getSession();
  return s && !isStaffRole(s.role) ? s : null;
}

/** Client adds a brand note, e.g. "We never use red. Our customers are young parents." */
export async function POST(req: Request) {
  const s = await client(req);
  if (!s) return json({ message: "Please sign in." }, 401);
  if (!rateLimit(`knowledge:${s.uid}`, 20, 3_600_000)) return json({ message: "Too many notes. Try again later." }, 429);

  const body = (await req.json().catch(() => null)) as { title?: unknown; text?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "Note";
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 10 || text.length > 10_000) return json({ message: "Write between 10 and 10,000 characters." }, 400);

  const count = await adminDb().collection("brandKnowledge").where("clientId", "==", s.uid).where("sourceType", "==", "note").count().get();
  if (count.data().count > 200) return json({ message: "You've reached the notes limit. Delete some first." }, 400);

  const sourceId = `note_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const { chunks } = await ingestKnowledge({ clientId: s.uid, sourceType: "note", sourceId, title: title || "Note", text });
  return json({ ok: true, sourceId, chunks });
}

/** Client deletes one of their notes (sourceId is checked against clientId inside deleteKnowledgeSource). */
export async function DELETE(req: Request) {
  const s = await client(req);
  if (!s) return json({ message: "Please sign in." }, 401);
  const sourceId = new URL(req.url).searchParams.get("sourceId") ?? "";
  if (!/^note_[a-f0-9]{16}$/.test(sourceId)) return json({ message: "Note not found." }, 404);
  await deleteKnowledgeSource(s.uid, sourceId);
  return json({ ok: true });
}
