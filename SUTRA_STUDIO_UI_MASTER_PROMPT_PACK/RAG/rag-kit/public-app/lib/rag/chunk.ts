/**
 * Splits text into chunks of about `maxChars` characters with a small overlap, preferring
 * paragraph and sentence boundaries (including the Hindi/Gujarati danda "।") so that a chunk reads naturally.
 */
export function chunkText(input: string, maxChars = 900, overlapChars = 120): string[] {
  const text = input.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) return [];

  const pieces: string[] = [];
  for (const para of text.split(/\n{2,}/)) {
    const p = para.trim();
    if (!p) continue;
    if (p.length <= maxChars) {
      pieces.push(p);
      continue;
    }
    for (const sentence of p.split(/(?<=[.!?।])\s+/)) {
      if (sentence.length <= maxChars) pieces.push(sentence);
      else for (let i = 0; i < sentence.length; i += maxChars) pieces.push(sentence.slice(i, i + maxChars));
    }
  }

  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    const joined = current ? `${current}\n${piece}` : piece;
    if (joined.length <= maxChars) {
      current = joined;
      continue;
    }
    if (current) {
      chunks.push(current);
      const tail = current.slice(-overlapChars);
      const cut = tail.indexOf(" ");
      const overlap = cut >= 0 && current.length > overlapChars ? tail.slice(cut + 1) : "";
      current = overlap && (overlap + "\n" + piece).length <= maxChars ? `${overlap}\n${piece}` : piece;
    } else {
      current = piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
