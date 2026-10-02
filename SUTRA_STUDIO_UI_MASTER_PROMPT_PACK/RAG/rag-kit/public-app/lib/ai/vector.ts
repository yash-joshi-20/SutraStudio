/** L2-normalise. Gemini embeddings are only unit-length at the full 3072 dims; truncated (e.g. 768) ones must be normalised. */
export function l2normalize(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum);
  if (!Number.isFinite(norm) || norm === 0) throw new Error("Embedding returned a zero or invalid vector");
  return v.map((x) => x / norm);
}
