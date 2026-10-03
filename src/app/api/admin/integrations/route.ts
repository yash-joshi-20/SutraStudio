/**
 * GET /api/admin/integrations
 *
 * Admin-only. Returns "configured" / "not configured" per integration with the
 * NAMES of missing keys. Values are never returned, never logged, never sent to
 * the browser.
 */

import { requireAdmin } from "@/lib/auth/session";
import { guarded, ok } from "@/lib/api/response";
import { getIntegrationStatuses, getIntegrationSummary } from "@/lib/config/integrations";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const statuses = getIntegrationStatuses();

    // Live counts from Firestore, when available. Absent data reports 0 and is
    // labelled as unavailable rather than invented.
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

    return ok({
      summary: getIntegrationSummary(),
      integrations: statuses,
      counts: liveCounts,
      countsAvailable: Object.keys(liveCounts).length > 0,
    });
  });
}