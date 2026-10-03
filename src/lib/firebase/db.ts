/**
 * SUTRA STUDIO — Firestore Data Access Layer (Server Only)
 *
 * Thin wrapper over firebase-admin Firestore that gives every server file the
 * same helpers and the same NotConfigured behaviour. All reads are scoped by
 * an explicit uid/role — there is no unscoped convenience read.
 */

import "server-only";
import { adminDb, isNotConfigured, NotConfiguredError } from "@/lib/firebase/admin";
import type { Firestore, Query, DocumentData } from "firebase-admin/firestore";

export { isNotConfigured, NotConfiguredError };

export function db(): Firestore {
  return adminDb();
}

/** Normalise Firestore Timestamp | ISO string | number | Date → ISO string. */
export function toIso(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const d = (value as { toDate(): Date }).toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
  }
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  return "";
}

export function plain<T = DocumentData>(snap: {
  id: string;
  data: () => DocumentData;
  exists: boolean;
}): T | null {
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export function plainAll<T = DocumentData>(snap: {
  docs: Array<{ id: string; data: () => DocumentData; exists: boolean }>;
}): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export function queryToArray<T = DocumentData>(q: Query): Promise<T[]> {
  return q.get().then((snap) => plainAll<T>(snap));
}

export function dataToArray<T = DocumentData>(q: Query): Promise<T[]> {
  return q.get().then((snap) => plainAll<T>(snap));
}

/** Strip undefined values so Firestore does not reject the write. */
export function clean<T extends Record<string, unknown>>(input: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out as T;
}

export const nowIso = () => new Date().toISOString();