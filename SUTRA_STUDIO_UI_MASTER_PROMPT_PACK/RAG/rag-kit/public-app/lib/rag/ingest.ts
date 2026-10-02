import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { AI } from "@/lib/ai/config";
import { embedTexts } from "@/lib/ai/embed";
import { chunkText } from "./chunk";

export type SourceType = "brand_intake" | "document" | "note" | "approved_work";
const MAX_CHARS = 60_000;
const MAX_CHUNKS = 80;
const COLLECTION = "brandKnowledge";

/**
 * Chunks, embeds and stores text for ONE client. Re-ingesting the same sourceId replaces its old chunks.
 * Every document carries clientId, and retrieval always filters on it (tenant isolation).
 */
export async function ingestKnowledge(p: {
  clientId: string;
  sourceType: SourceType;
  sourceId: string;
  title: string;
  text: string;
}): Promise<{ chunks: number }> {
  const chunks = chunkText(p.text.slice(0, MAX_CHARS)).slice(0, MAX_CHUNKS);
  const col = adminDb().collection(COLLECTION);
  if (!chunks.length) {
    await deleteKnowledgeSource(p.clientId, p.sourceId);
    return { chunks: 0 };
  }

  const vectors = await embedTexts(chunks, "document");
  const keep = new Set<string>();
  const batchSize = 400;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = adminDb().batch();
    for (let j = i; j < Math.min(i + batchSize, chunks.length); j++) {
      const id = `${p.sourceId}__${j}`;
      keep.add(id);
      batch.set(col.doc(id), {
        clientId: p.clientId,
        sourceType: p.sourceType,
        sourceId: p.sourceId,
        title: p.title.slice(0, 120),
        chunkIndex: j,
        text: chunks[j],
        embedding: FieldValue.vector(vectors[j]),
        embeddingModel: AI.embeddingModel,
        dims: AI.embeddingDims,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  // Remove chunks left over from a previous, longer version of the same source.
  const old = await col.where("clientId", "==", p.clientId).where("sourceId", "==", p.sourceId).get();
  const stale = old.docs.filter((d) => !keep.has(d.id));
  for (let i = 0; i < stale.length; i += batchSize) {
    const batch = adminDb().batch();
    stale.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return { chunks: chunks.length };
}

export async function deleteKnowledgeSource(clientId: string, sourceId: string): Promise<void> {
  const snap = await adminDb().collection(COLLECTION).where("clientId", "==", clientId).where("sourceId", "==", sourceId).get();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = adminDb().batch();
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

/** Call this when the client finishes (or edits) the first-login brand intake. */
export async function ingestBrandProfile(clientId: string, profile: Record<string, string | undefined>): Promise<{ chunks: number }> {
  const labels: Record<string, string> = {
    businessName: "Business name",
    vision: "Brand vision",
    audience: "Target audience",
    tone: "Tone of voice",
    colors: "Brand colors",
    competitors: "Competitors and references",
    goals: "Goals for working with the studio",
  };
  const text = Object.entries(profile)
    .filter(([, v]) => typeof v === "string" && v.trim())
    .map(([k, v]) => `${labels[k] ?? k}: ${v!.trim()}`)
    .join("\n\n");
  return ingestKnowledge({ clientId, sourceType: "brand_intake", sourceId: "brand_intake", title: "Brand intake", text });
}
