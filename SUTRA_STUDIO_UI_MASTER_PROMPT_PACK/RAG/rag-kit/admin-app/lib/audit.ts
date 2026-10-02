import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export async function writeAudit(e: { actorId: string; actorEmail: string; action: string; targetType: string; targetId: string; meta?: Record<string, unknown> }) {
  await adminDb().collection("auditLogs").add({ ...e, meta: e.meta ?? {}, createdAt: FieldValue.serverTimestamp() });
}
