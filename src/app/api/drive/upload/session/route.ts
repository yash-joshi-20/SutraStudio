/**
 * SUTRA STUDIO — Open a resumable Drive upload session (STEP 30)
 *
 * Validates the request, resolves the DESTINATION folder server-side from the
 * caller's own order (the client never dictates an arbitrary Drive folder id),
 * then hands the browser a resumable session URI. File bytes go browser → Drive.
 */

import { guarded, ok, forbidden, notFound, badRequest } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import { OrdersStore, type FirestoreOrderRecord } from "@/lib/services/ordersStore";
import {
  createResumableUploadSession,
  provisionOrderDriveFolders,
} from "@/lib/services/googleDriveService";
import { validateFile, DEFAULT_CONTENT_POLICY } from "@/lib/services/contentSafety";
import {
  ADMIN_UPLOAD_CATEGORIES,
  CLIENT_UPLOAD_CATEGORIES,
  DRIVE_MAX_FILE_BYTES,
  DRIVE_MAX_FILE_LABEL,
  isDriveCategory,
  type DriveCategoryKey,
} from "@/lib/config/driveStorage";

export const dynamic = "force-dynamic";

/** kind → key used in `orders.driveSubfolders`. */
const SUBFOLDER_KEY: Record<DriveCategoryKey, "clientAssets" | "drafts" | "finalDelivery" | "revisions"> = {
  client_assets: "clientAssets",
  drafts: "drafts",
  final_delivery: "finalDelivery",
  revisions: "revisions",
};

interface SessionBody {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  kind?: string;
  orderId?: string;
  notes?: string;
  version?: number;
}

function ownerUidOf(order: FirestoreOrderRecord): string {
  return order.clientUid || order.clientId || "";
}

export async function POST(req: Request) {
  return guarded(async () => {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as SessionBody;

    const fileName = (body.fileName ?? "").trim();
    const mimeType = (body.mimeType ?? "application/octet-stream").trim();
    const sizeBytes = Number(body.sizeBytes);
    const kind = body.kind ?? "";

    if (!fileName) return badRequest("A file name is required.");
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) return badRequest("A valid file size is required.");
    if (!isDriveCategory(kind)) {
      return badRequest(`Unknown destination "${kind}". Expected one of: ${ADMIN_UPLOAD_CATEGORIES.join(", ")}.`);
    }

    // Size + type + extension policy — same rules the browser applies first.
    if (sizeBytes > DRIVE_MAX_FILE_BYTES) {
      return badRequest(`File exceeds the ${DRIVE_MAX_FILE_LABEL} per-file limit.`);
    }
    const validation = validateFile({ name: fileName, size: sizeBytes, type: mimeType }, DEFAULT_CONTENT_POLICY);
    if (!validation.valid) return badRequest(validation.errors.join(" "));

    // Clients may only drop into "01 Client Assets"; finals are admin-authored.
    const allowed = user.role === "admin" ? ADMIN_UPLOAD_CATEGORIES : CLIENT_UPLOAD_CATEGORIES;
    if (!allowed.includes(kind as DriveCategoryKey)) {
      return forbidden(
        `Your account may only upload to ${allowed.join(", ")}. Finals and drafts are authored by the studio.`
      );
    }

    if (!body.orderId) return badRequest("An order id is required to locate your Drive folder.");

    const order = body.orderId ? OrdersStore.findById(body.orderId) : undefined;
    if (!order) return notFound("Order not found.");

    const owner = ownerUidOf(order);
    if (user.role !== "admin" && owner !== user.uid) return forbidden("This order does not belong to your account.");

    const key = SUBFOLDER_KEY[kind as DriveCategoryKey];
    let folderId = order.driveSubfolders?.[key]?.id ?? "";

    if (!folderId) {
      // First upload for this order — provision the real hierarchy and persist it.
      const structure = await provisionOrderDriveFolders({
        orderId: order.id,
        orderNumber: order.orderNumber || order.code || order.id,
        serviceName: order.service || order.title || "Commission",
        clientId: owner,
        clientName: order.clientName || "Studio Client",
      });
      folderId = structure.subfolders[key].id;
      OrdersStore.update(order.id, {
        driveFolderId: structure.orderFolderId,
        driveFolderPath: `Clients/${structure.clientFolderName}/${structure.orderFolderName}`,
        driveFolderLink: structure.orderFolderLink,
        driveSubfolders: structure.subfolders,
      });
    }

    const session = await createResumableUploadSession({
      fileName,
      mimeType,
      sizeBytes,
      parentId: folderId,
      kind: kind as DriveCategoryKey,
      description: body.notes?.trim() || undefined,
      appProperties: {
        orderId: order.id,
        clientId: owner,
        kind: kind as DriveCategoryKey,
        uploadedBy: user.uid,
      },
    });

    return ok({
      uploadUri: session.uploadUri,
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      expiresAtIso: session.expiresAtIso,
      maxBytes: session.maxBytes,
      chunkBytes: session.chunkBytes,
      folderId,
      orderId: order.id,
      clientId: owner,
    });
  });
}
