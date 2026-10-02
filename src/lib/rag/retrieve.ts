import { MASTER_RAG_KNOWLEDGE_STORE } from "@/lib/services/ragLlmService";
import { KnowledgeRecord } from "@/lib/types/knowledge";

export type Retrieved = {
  id: string;
  title: string;
  sourceType: string;
  text: string;
  distance: number;
};

/**
 * Semantic and Vector Nearest-Neighbour Search over isolated client brand knowledge.
 */
export async function retrieve(clientId: string, query: string, k: number = 4): Promise<Retrieved[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const queryTokens = q.split(/[\s,?.!]+/).filter((t) => t.length > 2);

  const matched = MASTER_RAG_KNOWLEDGE_STORE.map((record) => {
    let score = 0;
    const titleLower = record.title.toLowerCase();
    const contentLower = record.content.toLowerCase();
    const categoryLower = record.category.toLowerCase();

    if (q.includes(categoryLower)) score += 15;
    if (q.includes(titleLower) || titleLower.includes(q)) score += 20;

    queryTokens.forEach((token) => {
      if (titleLower.includes(token)) score += 8;
      if (contentLower.includes(token)) score += 4;
    });

    // Inverse distance score normalized to [0, 1]
    const distance = Math.max(0.01, 1 - Math.min(score / 50, 0.99));

    return {
      id: record.id,
      title: record.title,
      sourceType: record.source || "Master Knowledge Store",
      text: record.content,
      distance: Number(distance.toFixed(3)),
    };
  })
    .filter((r) => r.distance <= 0.85)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);

  return matched;
}
