/**
 * SUTRA STUDIO — Client account deletion request (STEP 30)
 *
 * Identity comes from the session cookie via `requireUser()`, never from
 * spoofable `x-user-*` headers — the previous handler accepted any uid the
 * caller put on the request, which would have let one client disable another.
 *
 * On success the client's Google Drive folder AND every order folder owned by
 * this uid are moved to Drive trash (retention step of the STEP 30 storage
 * policy). Drive being unconfigured is reported honestly rather than faked as
 * a completed purge.
 */

import { guarded, ok, badRequest, unauthorized } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import { ClientsStore } from "@/lib/services/clientsStore";
import { OrdersStore } from "@/lib/services/ordersStore";
import { archiveOrderFolder, trashClientFolder } from "@/lib/services/googleDriveService";
import { AuditLogService } from "@/lib/services/auditLogService";
import { NotificationsStore } from "@/lib/services/notificationsStore";
import { sanitizeInputText } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

/** Seeded fixtures use ids like `drive_fld_sutra_001`, which no real Drive API call can resolve. */
function looksLikeRealDriveId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{20,}$/.test(id);
}

export async function POST(req: Request) {
  return guarded(async () => {
    const user = await requireUser().catch(() => null);
    if (!user) return unauthorized("Sign in to submit an account deletion request.");

    const { reason, confirmText } = await req.json().catch(() => ({}) as Record<string, string>);

    if (confirmText !== "DELETE MY ACCOUNT") {
      return badRequest("Please type 'DELETE MY ACCOUNT' to confirm your deletion request.");
    }

    const client =
      ClientsStore.findById(user.uid) ||
      ClientsStore.getAll().find((c) => c.email === user.email);

    const safeReason = sanitizeInputText(reason || "None provided");

    // ---- STEP 30 retention: actually trash the Drive data ------------------
    const purgedFolders: string[] = [];
    const purgeFailures: string[] = [];

    const trashOne = async (label: string, run: () => Promise<{ success?: boolean; message?: string }>) => {
      try {
        const result = await run();
        // archiveOrderFolder resolves rather than throws on an API failure, so
        // the flag has to be inspected or a failed purge would be reported as done.
        if (result && result.success === false) {
          purgeFailures.push(`${label}: ${result.message || "Drive archive failed"}`);
          return;
        }
        purgedFolders.push(label);
      } catch (err) {
        purgeFailures.push(`${label}: ${err instanceof Error ? err.message : "Drive unavailable"}`);
      }
    };

    if (client?.driveFolderId && looksLikeRealDriveId(client.driveFolderId)) {
      await trashOne("client folder", () => trashClientFolder(client.driveFolderId));
    }

    for (const order of OrdersStore.getAll()) {
      const owner = order.clientUid || order.clientId || "";
      if (owner !== user.uid) continue;
      if (!order.driveFolderId || !looksLikeRealDriveId(order.driveFolderId)) continue;
      await trashOne(`order ${order.orderNumber || order.code || order.id}`, () =>
        archiveOrderFolder(order.driveFolderId, { trash: true })
      );
    }

    // ---- Account state -----------------------------------------------------
    if (client) {
      client.status = "Disabled";
      if (!client.adminNotes) client.adminNotes = [];
      client.adminNotes.push({
        id: `note_del_${Date.now()}`,
        authorName: "Security Compliance System",
        text: `[Account Deletion Requested on ${new Date().toISOString()}]: Reason: ${safeReason}`,
        createdAt: new Date().toISOString(),
      });
    }

    AuditLogService.record({
      who: { uid: user.uid, email: user.email, name: client?.name || user.name, role: "client" },
      what: "CLIENT_STATUS_TOGGLED",
      targetType: "client",
      targetId: user.uid,
      targetTitle: client?.name || user.email || "Client Account",
      note: `Account deletion requested. Reason: ${safeReason} | Drive folders trashed: ${purgedFolders.length} | pending: ${purgeFailures.length}`,
      type: "warning",
    });

    NotificationsStore.add({
      userId: "usr_admin_001",
      type: "status_update",
      title: "Account Deletion Request",
      message: `Client ${client?.name || user.email} requested account deletion. Account disabled; ${purgedFolders.length} Drive folder(s) trashed, ${purgeFailures.length} pending.`,
      actionUrl: `/admin`,
      actionLabel: "Review in Directory",
    });

    // Never claim a purge happened when Drive is unconfigured or the call failed.
    const message =
      purgeFailures.length > 0
        ? `Your account is disabled and ${purgedFolders.length} Drive folder(s) were moved to trash. ${purgeFailures.length} folder(s) are queued for an administrator to complete.`
        : purgedFolders.length > 0
          ? `Your account is disabled and ${purgedFolders.length} Drive folder(s) were moved to trash. Remaining personal data will be purged in compliance with DPDP & GDPR standards.`
          : "Your account deletion request has been registered and your account is disabled. Your Drive data will be purged by an administrator in compliance with DPDP & GDPR standards.";

    return ok({
      success: true,
      message,
      drive: { trashed: purgedFolders.length, pending: purgeFailures.length, failures: purgeFailures },
    });
  });
}
