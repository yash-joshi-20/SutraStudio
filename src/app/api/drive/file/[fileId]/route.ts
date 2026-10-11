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
} from "@/lib/services/googleDriveService";
import { AuditLogService } from "@/lib/services/auditLogService";

export const dynamic = "force-dynamic";

/** RFC 5987 filename for the Content-Disposition header. */
function contentDisposition(name: string, inline: boolean): string {
  const ascii = name.replace(/["\\]/g, "_").replace(/[\r\n]/g, "");
  const encoded = encodeURIComponent(name);
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
    if (!fileId) return badRequest("Missing file id.");

    const user = await requireUser();
    const isAdmin = user.role === "admin";
    const record = await getFileRecord(fileId);

    // Ownership check: an admin may open anything; a client only files registered to their uid.
    if (!isAdmin) {
      if (!record || record.clientId !== user.uid || record.state === "trashed") {
        return notFound("This file is not part of your account.");
      }
    }

    if (record && isGoogleNative(record.mimeType)) {
      return badRequest(
        "This is a Google Doc/Sheet and cannot be downloaded as raw bytes."
      );
    }

    const url = new URL(req.url);
    const inline = url.searchParams.get("download") !== "true";
    const range = req.headers.get("range");

    const result = await openDriveDownload(fileId, range ?? undefined);
    if (!result) return notFound("The file could no longer be found in Drive.");

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
        targetTitle: record?.name || fileId,
        note: `${user.role === "admin" ? "Admin" : "Client"} downloaded file "${record?.name || fileId}" (size: ${record?.size || "unknown"} bytes).`,
        type: "info",
      });
    } catch {}

    const headers = new Headers();
    headers.set("Content-Type", record?.mimeType ?? "application/octet-stream");
    headers.set("Content-Disposition", contentDisposition(record?.name ?? fileId, inline));
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    // Forward Drive's byte-range negotiation so large files stream properly.
    const contentLength = result.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const contentRange = result.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    const acceptRanges = result.headers.get("accept-ranges");
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);

    if (!result.stream) return notFound("Drive returned no content for this file.");

    return new Response(result.stream, { status: result.status, headers });
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
