export const HANDOFF = "[[HANDOFF]]";

/**
 * The model appends HANDOFF when the client asks for a person or the topic needs the team.
 * This filter removes the marker from the streamed text, even when it arrives split across pieces.
 */
export class MarkerFilter {
  private pending = "";
  found = false;

  push(delta: string): string {
    if (this.found) return "";
    this.pending += delta;
    const i = this.pending.indexOf(HANDOFF);
    if (i >= 0) {
      this.found = true;
      const out = this.pending.slice(0, i);
      this.pending = "";
      return out;
    }
    let keep = 0;
    for (let len = Math.min(HANDOFF.length - 1, this.pending.length); len > 0; len--) {
      if (HANDOFF.startsWith(this.pending.slice(-len))) {
        keep = len;
        break;
      }
    }
    const out = this.pending.slice(0, this.pending.length - keep);
    this.pending = this.pending.slice(this.pending.length - keep);
    return out;
  }

  flush(): string {
    if (this.found) return "";
    const out = this.pending;
    this.pending = "";
    return out;
  }
}
