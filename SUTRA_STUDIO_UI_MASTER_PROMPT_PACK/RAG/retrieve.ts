import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { AI } from "@/lib/ai/config";
import { embedTexts } from "@/lib/ai/embed";

export type Retrieved = { id: string; title: string; sourceType: string; text: string; distance: number };

/**
 * Nearest-neighbour search over ONE client's brand knowledge.
 * The `where("clientId", "==", ...)` pre-filter is mandatory: it is what keeps clients isolated from each other.
 * Needs the composite vector index (clientId ASC + embedding vector), see scripts/create-vector-index.sh.
 */
export async function retrieve(clientId: string, query: string, k: number = AI.topK): Promise<Retrieved[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const [vector] = await embedTexts([q], "query");
  const snap = await adminDb()
    .collection("brandKnowledge")
    .where("clientId", "==", clientId)
    .findNearest({
      vectorField: "embedding",
      queryVector: FieldValue.vector(vector),
      limit: k,
      distanceMeasure: "COSINE",
      distanceResultField: "_distance",
      distanceThreshold: AI.maxDistance, // server-side cut-off: cosine distance must be <= this
    })
    .get();

  return snap.docs
    .map((d) => {
      const x = d.data() as { title?: string; sourceType?: string; text?: string; _distance?: number };
      return { id: d.id, title: x.title ?? "", sourceType: x.sourceType ?? "", text: x.text ?? "", distance: x._distance ?? 0 };
    })
    .filter((r) => r.text && r.distance <= AI.maxDistance);
}
