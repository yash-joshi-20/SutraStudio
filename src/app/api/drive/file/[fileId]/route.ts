/**
 * SUTRA STUDIO — Authenticated Drive download / preview proxy (STEP 30)
 *
 * The browser never talks to Drive directly here. We resolve the caller's
 * session, confirm the requested file is REGISTERED to that uid (admins may
 * open any client's file), and only then relay the bytes with Range support.
 *
 * Replaces the previous handler, which read `x-user-id` and then ignored it —
 * an effectively unauthenticated proxy to arbitrary Drive file IDs.
 *
 * Uses `mapApiError` rather than `guarded()` because the success path returns a
 * streaming `Response`, not a `NextResponse`.
 */

import { mapApiError, notFound, badRequest } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import { getFileRecord, openDriveDownload, isGoogleNative } from "@/lib/services/googleDriveService";

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

    // Ownership: an admin may open anything the app can reach; a client only
    // files registered to THEIR uid. An unregistered id is a 404 for non-admins
    // rather than a 403, so we do not leak which ids exist.
    if (!isAdmin) {
      if (!record || record.clientId !== user.uid || record.state === "trashed") {
        return notFound("This file is not part of your account.");
      }
    }

    if (record && isGoogleNative(record.mimeType)) {
      return badRequest(
        "This is a Google Doc/Sheet and cannot be downloaded as a file. Open it from the client's Drive folder instead."
      );
    }

    const url = new URL(req.url);
    const inline = url.searchParams.get("download") !== "true";
    const range = req.headers.get("range");

    const result = await openDriveDownload(fileId, range ?? undefined);
    if (!result) return notFound("The file could no longer be found in Drive.");

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
