/**
 * Markers used for autonomous human handoff and state signaling in RAG chat.
 */

export const HANDOFF = "[[HANDOFF]]";

export class MarkerFilter {
  private buffer = "";
  public found = false;

  public push(chunk: string): string {
    this.buffer += chunk;
    if (this.buffer.includes(HANDOFF)) {
      this.found = true;
      const parts = this.buffer.split(HANDOFF);
      this.buffer = "";
      return parts.join("").trim();
    }
    // Hold last few characters in buffer in case marker is split across chunks
    if (this.buffer.length > HANDOFF.length) {
      const flushLength = this.buffer.length - HANDOFF.length;
      const safeToEmit = this.buffer.slice(0, flushLength);
      this.buffer = this.buffer.slice(flushLength);
      return safeToEmit;
    }
    return "";
  }

  public flush(): string {
    const remaining = this.buffer.replace(HANDOFF, "").trim();
    this.buffer = "";
    return remaining;
  }
}
