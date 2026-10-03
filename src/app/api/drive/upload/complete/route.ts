/**
 * SUTRA STUDIO — Finalise a completed Drive upload (STEP 30)
 *
 * The browser has already PUT every byte to Drive. This endpoint re-reads the
 * finished file from Drive, proves it landed in the folder we authorised, then
 * writes the METADATA record to Firestore and mirrors the order side effects
 * (attachments / deliverables / "delivered" status) the legacy proxy used to do.
 *
 * Never accepts a size, mime type or parent folder on trust.
 */

import { guarded, ok, forbidden, notFound, badRequest } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import { OrdersStore, type FirestoreOrderRecord } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";
import {
  getFileMetadata,
  saveFileRecord,
} from "@/lib/services/googleDriveService";
import { DRIVE_MAX_FILE_BYTES, DRIVE_MAX_FILE_LABEL, type DriveCategoryKey } from "@/lib/config/driveStorage";

export const dynamic = "force-dynamic";

const SUBFOLDER_KEY: Record<DriveCategoryKey, "clientAssets" | "drafts" | "finalDelivery" | "revisions"> = {
  client_assets: "clientAssets",
  drafts: "drafts",
  final_delivery: "finalDelivery",
  revisions: "revisions",
};

interface CompleteBody {
  fileId?: string;
  orderId?: string;
  kind?: string;
  version?: number;
  notes?: string;
  fileName?: string;
}

function mb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(req: Request) {
  return guarded(async () => {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as CompleteBody;

    const fileId = (body.fileId ?? "").trim();
    const orderId = (body.orderId ?? "").trim();
    const kind = (body.kind ?? "") as DriveCategoryKey;
    if (!fileId) return badRequest("A Drive file id is required.");
    if (!orderId) return badRequest("An order id is required.");

    const order = OrdersStore.findById(orderId);
    if (!order) return notFound("Order not found.");

    const owner = order.clientUid || order.clientId || "";
    if (user.role !== "admin" && owner !== user.uid) return forbidden("This order does not belong to your account.");

    // Re-read the file from Drive — the browser's claims are never trusted.
    const meta = await getFileMetadata(fileId);
    if (meta.trashed) return badRequest("That file was moved to the Drive trash before it was registered.");

    const sizeBytes = Number(meta.size ?? 0);
    if (sizeBytes > DRIVE_MAX_FILE_BYTES) {
      return badRequest(`Uploaded file exceeds the ${DRIVE_MAX_FILE_LABEL} limit.`);
    }

    // Prove the file actually landed in the folder we authorised.
    const key = SUBFOLDER_KEY[kind];
    const expectedFolder = key ? order.driveSubfolders?.[key]?.id : undefined;
    if (expectedFolder && meta.parents?.length && !meta.parents.includes(expectedFolder)) {
      return forbidden("The uploaded file is not inside this order's Drive folder.");
    }

    const mimeType = meta.mimeType || "application/octet-stream";
    const name = meta.name || body.fileName || fileId;
    const kindKey: DriveCategoryKey = key ? kind : "client_assets";
    const createdAt = new Date().toISOString();

    await saveFileRecord({
      driveFileId: fileId,
      folderId: expectedFolder ?? meta.parents?.[0] ?? "",
      name,
      mimeType,
      size: sizeBytes,
      kind: kindKey,
      orderId: order.id,
      clientId: owner,
      version: Number(body.version) || 1,
      shareState: "private",
      createdAt,
      webViewLink: `/api/drive/file/${fileId}`,
      uploadedByUid: user.uid,
      uploadedByName: user.name || user.email || "Studio member",
      uploadedByRole: user.role === "admin" ? "admin" : "client",
    });

    await syncOrderSideEffects({
      order,
      kind,
      fileId,
      name,
      mimeType,
      sizeBytes,
      expectedFolder,
      notes: body.notes ?? "",
      adminName: user.name || user.email || "Studio Producer",
    });

    return ok({
      success: true,
      file: {
        driveFileId: fileId,
        name,
        mimeType,
        size: sizeBytes,
        folderId: expectedFolder ?? meta.parents?.[0] ?? "",
        kind: kindKey,
        shareState: "private",
        downloadUrl: `/api/drive/file/${fileId}?download=true`,
        createdAt,
      },
    });
  });
}

interface SideEffectArgs {
  order: FirestoreOrderRecord;
  kind: DriveCategoryKey;
  fileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  expectedFolder?: string;
  notes: string;
  adminName: string;
}

async function syncOrderSideEffects(args: SideEffectArgs): Promise<void> {
  const { order, kind, fileId, name, mimeType, sizeBytes, expectedFolder, notes, adminName } = args;
  const at = new Date().toISOString();

  try {
    const db = adminDb();
    const orderRef = db.collection("orders").doc(order.id);
    const snap = await orderRef.get();
    if (snap.exists) {
      const current = (snap.data() ?? {}) as Record<string, unknown>;

      if (kind === "client_assets") {
        const attachments = Array.isArray(current.attachments) ? (current.attachments as unknown[]) : [];
        await orderRef.update({
          attachments: [
            ...attachments,
            {
              name,
              size: mb(sizeBytes),
              type: mimeType,
              driveFileId: fileId,
              driveFolderId: expectedFolder ?? "",
              link: `/api/drive/file/${fileId}`,
              uploadedAt: at,
            },
          ],
          updatedAt: at,
        });
      } else {
        const deliverables = Array.isArray(current.deliverables) ? (current.deliverables as unknown[]) : [];
        const updates: Record<string, unknown> = {
          deliverables: [
            ...deliverables,
            {
              filename: name,
              fileSize: mb(sizeBytes),
              mimeType,
              driveFileId: fileId,
              driveFolderId: expectedFolder ?? "",
              previewUrl: `/api/drive/file/${fileId}`,
              category: kind === "final_delivery" ? "final" : kind === "drafts" ? "draft" : "revision",
              version: Number(1),
              notes,
              deliveredAt: at,
            },
          ],
          updatedAt: at,
        };

        if (kind === "final_delivery") {
          updates.status = "delivered";
          updates.statusLabel = "Delivered — Awaiting Client Review";
          updates.deliveredAt = at;
        }
        await orderRef.update(updates);
      }
    }
  } catch (err) {
    console.warn("[drive/complete] Firestore order sync skipped:", err);
  }

  try {
    if (kind !== "client_assets") {
      OrdersStore.deliverOrder({
        orderId: order.id,
        deliverables: [
          {
            filename: name,
            previewUrl: `/api/drive/file/${fileId}`,
            fileSize: mb(sizeBytes),
            mimeType,
            driveFileId: fileId,
          },
        ],
        deliveryNote: notes || `Deliverable uploaded to ${kind}`,
        adminName,
      });
    }
  } catch {
    // in-memory mirror is best-effort
  }
}
