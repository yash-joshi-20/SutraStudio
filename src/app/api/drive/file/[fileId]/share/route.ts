/**
 * SUTRA STUDIO — Per-file share / revoke (STEP 30)
 *
 * Sharing is opt-in and scoped to ONE file: the client must click Share, we
 * create an `anyone with the link` READER permission on that single file, show
 * its state, allow Revoke, and write an immutable entry to `share_log`.
 *
 * Folders are never made public. Nothing is shared on upload.
 */

import { guarded, ok, badRequest } from "@/lib/api/response";
import { authorizeDriveFile } from "@/lib/api/driveAccess";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import {
  shareFile,
  revokeFileShare,
  getFileShareState,
} from "@/lib/services/googleDriveService";

export const dynamic = "force-dynamic";

interface ShareEvent {
  action: "share" | "revoke";
  fileId: string;
  fileName: string;
  clientId: string;
  orderId: string;
  byUid: string;
  byName: string;
  byRole: string;
  at: string;
  shareUrl?: string;
  permissionId?: string;
}

async function logShareEvent(event: Omit<ShareEvent, "at">): Promise<void> {
  try {
    await adminDb().collection("share_log").add({ ...event, at: new Date().toISOString(), createdAt: serverTimestamp() });
  } catch (err) {
    // Never block the share itself on the audit write, but make it visible.
    console.warn("[drive/share] audit write failed:", err);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  return guarded(async () => {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const { user, record } = await authorizeDriveFile(fileId, { requireRecord: true });

    const snapshot = await shareFile(fileId);
    const fileName = record?.name ?? fileId;

    await logShareEvent({
      action: "share",
      fileId,
      fileName,
      clientId: record?.clientId ?? "",
      orderId: record?.orderId ?? "",
      byUid: user.uid,
      byName: user.name || user.email || "Studio member",
      byRole: user.role,
      shareUrl: snapshot.shareUrl,
      permissionId: snapshot.permissionId,
    });

    return ok({
      shareState: "shared",
      shareUrl: snapshot.shareUrl,
      sharedAt: snapshot.sharedAt,
      permissionId: snapshot.permissionId,
      audience: "anyone_with_link",
      role: "reader",
    });
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  return guarded(async () => {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const { user, record } = await authorizeDriveFile(fileId, { requireRecord: true });

    const snapshot = await revokeFileShare(fileId);

    await logShareEvent({
      action: "revoke",
      fileId,
      fileName: record?.name ?? fileId,
      clientId: record?.clientId ?? "",
      orderId: record?.orderId ?? "",
      byUid: user.uid,
      byName: user.name || user.email || "Studio member",
      byRole: user.role,
    });

    return ok({ shareState: snapshot.shareState, permissions: snapshot.permissions });
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  return guarded(async () => {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const { record } = await authorizeDriveFile(fileId, { requireRecord: true });
    const snapshot = await getFileShareState(fileId);

    return ok({
      shareState: snapshot.shareState,
      shareUrl: snapshot.shareState === "shared" ? snapshot.shareUrl ?? null : null,
      sharedAt: snapshot.sharedAt ?? null,
      permissionId: snapshot.permissionId ?? null,
      fileName: record?.name ?? fileId,
    });
  });
}
