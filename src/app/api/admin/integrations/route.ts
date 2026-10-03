/**
 * GET /api/admin/integrations
 * POST /api/admin/integrations (triggers sync / re-check)
 *
 * Admin-only. Returns "configured" / "not configured" per integration with the
 * NAMES of missing keys, priorities, affected features, and credential instructions.
 * Values are never returned, never logged, never sent to the browser.
 */

import { requireAdmin } from "@/lib/auth/session";
import { guarded, ok } from "@/lib/api/response";
import { getIntegrationStatuses, getIntegrationSummary } from "@/lib/config/integrations";
import { adminDb } from "@/lib/firebase/admin";
import {
  syncAllIntegrationsToFirestore,
  regenerateMissingKeysMarkdown,
} from "@/lib/services/missingKeyRegistry";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const statuses = getIntegrationStatuses();

    // Live counts from Firestore, when available.
    let liveCounts: Record<string, number> = {};
    try {
      const [orders, users, payments, notifications] = await Promise.all([
        adminDb().collection("orders").count().get(),
        adminDb().collection("users").count().get(),
        adminDb().collection("payments").count().get(),
        adminDb().collection("notifications").count().get(),
      ]);
      liveCounts = {
        orders: orders.data().count,
        users: users.data().count,
        payments: payments.data().count,
        notifications: notifications.data().count,
      };
    } catch {
      liveCounts = {};
    }

    // Read Firestore integrationStatus records if available
    let firestoreRegistry: Record<string, unknown>[] = [];
    try {
      const regSnap = await adminDb().collection("integrationStatus").get();
      firestoreRegistry = regSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch {
      firestoreRegistry = [];
    }

    return ok({
      summary: getIntegrationSummary(),
      integrations: statuses,
      counts: liveCounts,
      countsAvailable: Object.keys(liveCounts).length > 0,
      firestoreRegistry,
    });
  });
}

export async function POST() {
  return guarded(async () => {
    await requireAdmin();
    await syncAllIntegrationsToFirestore();
    regenerateMissingKeysMarkdown();

    const statuses = getIntegrationStatuses();
    return ok({
      message: "Integration registry synchronized successfully.",
      summary: getIntegrationSummary(),
      integrations: statuses,
    });
  });
}