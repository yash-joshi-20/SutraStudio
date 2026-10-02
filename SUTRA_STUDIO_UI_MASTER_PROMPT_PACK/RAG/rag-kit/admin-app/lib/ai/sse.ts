/** Yields the payload of each `data:` line from a server-sent-events response body. */
export async function* sseData(res: Response): AsyncGenerator<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).replace(/\r$/, "");
        buf = buf.slice(idx + 1);
        if (line.startsWith("data:")) yield line.slice(5).trim();
      }
    }
    const tail = buf.trim();
    if (tail.startsWith("data:")) yield tail.slice(5).trim();
  } finally {
    reader.releaseLock();
  }
}
