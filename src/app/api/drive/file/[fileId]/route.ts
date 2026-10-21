/**
 * SUTRA STUDIO — Authenticated Drive File Handler (Proxy, Rename, Delete)
 *
 * GET: Streams file bytes directly from Drive. Ownership verified. Download audit-logged.
 * PATCH: Renames file. Ownership verified. Rename audit-logged.
 * DELETE: Moves file to trash. Ownership verified. Delete audit-logged.
 *
 * Multi-tenant isolation:
 * - A client may only view, download, rename, or delete files belonging to their own account.
 * - Administrators have supervisor access across all studio client files.
 */

import { mapApiError, notFound, badRequest, forbidden, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import {
  getFileRecord,
  openDriveDownload,
  isGoogleNative,
  renameDriveFile,
  deleteDriveFile,
  driveConfigured,
  type DriveFileRecord,
} from "@/lib/services/googleDriveService";
import { AuditLogService } from "@/lib/services/auditLogService";
import { OrdersStore } from "@/lib/services/ordersStore";

export const dynamic = "force-dynamic";

/** RFC 5987 filename for the Content-Disposition header. */
function contentDisposition(name: string, inline: boolean): string {
  const ascii = name.replace(/["\\]/g, "_").replace(/[\r\n]/g, "");
  const encoded = encodeURIComponent(name);
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

async function resolveDriveOrOrderRecord(
  fileId: string,
  user: { uid: string; email?: string; role: string }
): Promise<{
  record: DriveFileRecord | null;
  matchingDeliverable: any | null;
  isAuthorized: boolean;
}> {
  const isAdmin = user.role === "admin";
  let record = await getFileRecord(fileId);
  let matchingDeliverable: any = null;

  if (!record) {
    const allOrders = OrdersStore.getAll();
    const matchingOrder = allOrders.find((o) =>
      o.deliverables?.some((d) => d.driveFileId === fileId)
    );
    if (matchingOrder) {
      matchingDeliverable = matchingOrder.deliverables?.find((d) => d.driveFileId === fileId);
      record = {
        driveFileId: fileId,
        folderId: matchingOrder.driveFolderId || "folder_root",
        name: matchingDeliverable?.filename || `${fileId}.png`,
        mimeType:
          matchingDeliverable?.mimeType ||
          (matchingDeliverable?.filename?.endsWith(".svg")
            ? "image/svg+xml"
            : matchingDeliverable?.filename?.endsWith(".mp4")
            ? "video/mp4"
            : matchingDeliverable?.filename?.endsWith(".pdf")
            ? "application/pdf"
            : "image/png"),
        size: 5 * 1024 * 1024,
        kind: "final_delivery",
        orderId: matchingOrder.id,
        clientId: matchingOrder.clientUid || matchingOrder.clientId || user.uid,
        version: 1,
        createdAt: matchingOrder.createdAt,
        shareState: "shared",
      };
    }
  }

  // Ownership check: admin may inspect anything; client only files in their own account
  if (!isAdmin) {
    const isOwner =
      record &&
      (record.clientId === user.uid ||
        record.clientId === user.email ||
        (user.email && record.clientId?.toLowerCase() === user.email.toLowerCase()));

    if (!record || !isOwner || record.state === "trashed") {
      return { record: null, matchingDeliverable: null, isAuthorized: false };
    }
  }

  return { record, matchingDeliverable, isAuthorized: true };
}

export async function HEAD(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const user = await requireUser();
    const { record, isAuthorized } = await resolveDriveOrOrderRecord(fileId, user);

    if (!isAuthorized || !record) {
      return notFound("This file is not part of your account.");
    }

    if (record && isGoogleNative(record.mimeType)) {
      return badRequest("This is a Google Doc/Sheet and cannot be downloaded as raw bytes.");
    }

    const url = new URL(req.url);
    const inline = url.searchParams.get("download") !== "true";

    const headers = new Headers();
    headers.set("Content-Type", record.mimeType ?? "application/octet-stream");
    headers.set("Content-Disposition", contentDisposition(record.name ?? fileId, inline));
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Accept-Ranges", "bytes");
    if (record.size) headers.set("Content-Length", String(record.size));

    return new Response(null, { status: 200, headers });
  } catch (err) {
    return mapApiError(err);
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const user = await requireUser();
    const { record, matchingDeliverable, isAuthorized } = await resolveDriveOrOrderRecord(fileId, user);

    if (!isAuthorized || !record) {
      return notFound("This file is not part of your account.");
    }

    if (record && isGoogleNative(record.mimeType)) {
      return badRequest(
        "This is a Google Doc/Sheet and cannot be downloaded as raw bytes."
      );
    }

    const url = new URL(req.url);
    const inline = url.searchParams.get("download") !== "true";
    const range = req.headers.get("range");

    let streamBody: any = null;
    let streamStatus = 200;
    let streamHeaders: Headers | null = null;

    // 1. If Google Drive is configured, stream directly from Drive vault
    if (driveConfigured()) {
      try {
        const result = await openDriveDownload(fileId, range ?? undefined);
        if (result && result.stream) {
          streamBody = result.stream;
          streamStatus = result.status;
          streamHeaders = result.headers;
        }
      } catch (err) {
        console.warn("[Drive File Route] Drive download stream error:", err);
      }
    }

    // 2. White-labeled fallback proxy (for simulated or draft preview assets)
    if (!streamBody && (matchingDeliverable?.previewUrl || matchingDeliverable?.downloadUrl)) {
      const fallbackUrl = matchingDeliverable.previewUrl || matchingDeliverable.downloadUrl;
      try {
        const proxyRes = await fetch(fallbackUrl);
        if (proxyRes.ok && proxyRes.body) {
          streamBody = proxyRes.body;
          streamStatus = proxyRes.status;
        }
      } catch (err) {
        console.warn("[Drive File Route] Fallback proxy error:", err);
      }
    }

    if (!streamBody) return notFound("The file could no longer be found in the studio vault.");

    // Audit log file download / streaming
    try {
      AuditLogService.record({
        who: {
          uid: user.uid,
          email: user.email,
          name: user.name || "Client",
          role: user.role,
        },
        what: "STATUS_UPDATED",
        targetType: "order",
        targetId: fileId,
        targetTitle: record.name || fileId,
        note: `${user.role === "admin" ? "Admin" : "Client"} accessed vaulted file "${record.name || fileId}".`,
        type: "info",
      });
    } catch {}

    const headers = new Headers();
    headers.set("Content-Type", record.mimeType ?? "application/octet-stream");
    headers.set("Content-Disposition", contentDisposition(record.name ?? fileId, inline));
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    if (streamHeaders) {
      const contentLength = streamHeaders.get("content-length");
      if (contentLength) headers.set("Content-Length", contentLength);
      const contentRange = streamHeaders.get("content-range");
      if (contentRange) headers.set("Content-Range", contentRange);
      const acceptRanges = streamHeaders.get("accept-ranges");
      if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
    }

    return new Response(streamBody, { status: streamStatus, headers });
  } catch (err) {
    return mapApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const user = await requireUser();
    const isAdmin = user.role === "admin";
    const record = await getFileRecord(fileId);

    if (!record || record.state === "trashed") {
      return notFound("File not found or already trashed.");
    }

    // Ownership check: only owner or admin may rename
    if (!isAdmin && record.clientId !== user.uid) {
      return forbidden("Forbidden: Cannot rename files belonging to another client.");
    }

    const body = await req.json().catch(() => ({}));
    const newName = (body.name ?? "").trim();
    if (!newName) return badRequest("A new file name is required.");

    const oldName = record.name;
    const updated = await renameDriveFile(fileId, newName);

    // Audit log file rename
    try {
      AuditLogService.record({
        who: {
          uid: user.uid,
          email: user.email,
          name: user.name || "User",
          role: user.role,
        },
        what: "STATUS_UPDATED",
        targetType: "order",
        targetId: fileId,
        targetTitle: newName,
        note: `Renamed file from "${oldName}" to "${newName}".`,
        type: "info",
      });
    } catch {}

    return ok({ success: true, file: updated });
  } catch (err) {
    return mapApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const user = await requireUser();
    const isAdmin = user.role === "admin";
    const record = await getFileRecord(fileId);

    if (!record || record.state === "trashed") {
      return notFound("File not found or already trashed.");
    }

    // Ownership check: only owner or admin may delete
    if (!isAdmin && record.clientId !== user.uid) {
      return forbidden("Forbidden: Cannot delete files belonging to another client.");
    }

    await deleteDriveFile(fileId);

    // Audit log file deletion
    try {
      AuditLogService.record({
        who: {
          uid: user.uid,
          email: user.email,
          name: user.name || "User",
          role: user.role,
        },
        what: "STATUS_UPDATED",
        targetType: "order",
        targetId: fileId,
        targetTitle: record.name,
        note: `Deleted file "${record.name}" from studio vault.`,
        type: "warning",
      });
    } catch {}

    return ok({ success: true, message: `File "${record.name}" removed.` });
  } catch (err) {
    return mapApiError(err);
  }
}
