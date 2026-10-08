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
import { EmailService } from "@/lib/services/emailProvider";
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
      dnsGuidance: EmailService.getDnsGuidance(),
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // If admin requested a test email send
    if (body.action === "test_email" && body.to) {
      const testResult = await EmailService.dispatchNotificationEmail({
        to: body.to,
        type: "admin_test",
        title: "Test Email from Sutra Studio Dispatcher",
        message: "This is a live test notification verifying your SMTP / Email provider integration configuration.",
        priority: "high",
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudio-1.onrender.com"}/admin/integrations`,
        actionLabel: "View Studio Integrations",
      });

      return ok({
        message: testResult.success
          ? `Test email successfully dispatched via ${testResult.provider}.`
          : `Test email failed: ${testResult.error || "Unknown error"}`,
        testResult,
      });
    }

    await syncAllIntegrationsToFirestore();
    regenerateMissingKeysMarkdown();

    const statuses = getIntegrationStatuses();
    return ok({
      message: "Integration registry synchronized successfully.",
      summary: getIntegrationSummary(),
      integrations: statuses,
      dnsGuidance: EmailService.getDnsGuidance(),
    });
  });
}