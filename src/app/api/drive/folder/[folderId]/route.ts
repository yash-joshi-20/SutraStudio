/**
 * SUTRA STUDIO — Open a client's Drive folder from the order page (STEP 30)
 *
 * Administrators may open ANY client's folder. Clients may only open folders
 * belonging to their own orders.
 */

import { guarded, ok, forbidden, notFound, badRequest } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import { OrdersStore } from "@/lib/services/ordersStore";
import { folderLink, listFileRecords } from "@/lib/services/googleDriveService";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ folderId: string }> }) {
  return guarded(async () => {
    const { folderId } = await params;
    if (!folderId) return badRequest("Missing folder id.");

    const user = await requireUser();

    // Find which order owns this folder so a client cannot enumerate others'.
    const order = OrdersStore.getAll().find((o) => {
      if (!o.driveSubfolders) return false;
      const subs = Object.values(o.driveSubfolders);
      if (o.driveFolderId === folderId) return true;
      return subs.some((s) => s?.id === folderId);
    });

    if (user.role !== "admin") {
      if (!order) return notFound("That folder is not part of your account.");
      const owner = order.clientUid || order.clientId || "";
      if (owner !== user.uid) return forbidden("This folder belongs to another client.");
    }

    const records = order ? await listFileRecords({ orderId: order.id, limit: 200 }) : [];

    return ok({
      folderId,
      orderId: order?.id ?? null,
      clientName: order?.clientName ?? null,
      driveUrl: folderLink(folderId),
      /** The browser navigates here — Drive enforces its own auth on top. */
      openUrl: folderLink(folderId),
      fileCount: records.length,
      files: records.slice(0, 50).map((r) => ({
        driveFileId: r.driveFileId,
        name: r.name,
        size: r.size,
        mimeType: r.mimeType,
        kind: r.kind,
        shareState: r.shareState,
        downloadUrl: `/api/drive/file/${r.driveFileId}?download=true`,
      })),
    });
  });
}
