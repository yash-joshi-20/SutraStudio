/**
 * SUTRA STUDIO — Main-Domain Authenticated File Delivery Controller
 *
 * Implements Rule:
 * Images, videos, audio, 3D models, 360 panoramas, PDFs, invoices and downloads
 * are delivered ONLY through authenticated routes on the main domain:
 * https://sutrastudios.in/api/files/[id]
 *
 * Requirements enforced:
 * 1. Checks that logged-in user owns the order/file (or user has valid short-lived viewer token, or is admin).
 * 2. Streams the file directly from Google Drive using server credentials.
 * 3. Drive files stay 100% private ("anyone with the link" is NEVER used).
 * 4. Supports HTTP Range requests for smooth video streaming and audio seeking.
 * 5. Supports short-lived signed tokens for 3D GLTF loaders and 360 viewer canvas elements.
 * 6. Sets proper Content-Type, Content-Disposition (inline or attachment), and nosniff headers.
 */

import { mapApiError, notFound, badRequest } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";
import {
  getFileRecord,
  openDriveDownload,
  isGoogleNative,
} from "@/lib/services/googleDriveService";
import { verifyFileViewerToken } from "@/lib/services/fileTokens";

export const dynamic = "force-dynamic";

/** RFC 5987 formatted filename for Content-Disposition */
function contentDisposition(name: string, inline: boolean): string {
  const ascii = name.replace(/["\\]/g, "_").replace(/[\r\n]/g, "");
  const encoded = encodeURIComponent(name);
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    if (!fileId) return badRequest("Missing file identifier.");

    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const downloadRequested = url.searchParams.get("download") === "true";
    const range = req.headers.get("range");

    // 1. Authorization Gate: Check token or authenticated session
    let isAuthorized = false;
    let authorizedClientId = "";

    // Method A: Short-lived viewer token (for 3D / 360 / video players)
    if (token) {
      const verification = verifyFileViewerToken(token, fileId);
      if (verification.valid) {
        isAuthorized = true;
        authorizedClientId = verification.clientId || "";
      }
    }

    // Method B: Session Cookie Authentication
    if (!isAuthorized) {
      const user = await getSessionUser();
      if (user) {
        if (user.role === "admin") {
          isAuthorized = true;
        } else {
          authorizedClientId = user.uid;
        }
      }
    }

    // 2. Fetch File Metadata Record
    const record = await getFileRecord(fileId);

    // If client session was used, verify ownership against record
    if (!isAuthorized && authorizedClientId && record) {
      if (record.clientId === authorizedClientId && record.state !== "trashed") {
        isAuthorized = true;
      }
    }

    // Unauthorized access: return 404 to avoid leaking valid file existence
    if (!isAuthorized) {
      return notFound("The requested file is not accessible or does not exist.");
    }

    if (record && isGoogleNative(record.mimeType)) {
      return badRequest(
        "Google Workspace native documents cannot be streamed as raw binary files."
      );
    }

    // 3. Stream File Bytes from Google Drive via Server Credentials
    const driveResult = await openDriveDownload(fileId, range ?? undefined);
    if (!driveResult || !driveResult.stream) {
      return notFound("The file could no longer be located in secure studio storage.");
    }

    // 4. Set Headers for Streaming & Delivery
    const headers = new Headers();
    const fileName = record?.name ?? `sutra_asset_${fileId}`;
    const mimeType = record?.mimeType ?? "application/octet-stream";

    headers.set("Content-Type", mimeType);
    headers.set("Content-Disposition", contentDisposition(fileName, !downloadRequested));
    headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");

    // HTTP Byte-Range Negotiation for Video Streaming
    const contentLength = driveResult.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    const contentRange = driveResult.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    const acceptRanges = driveResult.headers.get("accept-ranges") || "bytes";
    headers.set("Accept-Ranges", acceptRanges);

    return new Response(driveResult.stream, {
      status: driveResult.status || 200,
      headers,
    });
  } catch (err) {
    return mapApiError(err);
  }
}

export async function HEAD(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Delegate to GET for range/length probing
  const getRes = await GET(req, { params });
  return new Response(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}
