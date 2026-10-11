/**
 * /api/drive/files
 *
 * GET: Lists client files filtered by client, folder, or order.
 *      Enforces multi-tenant isolation: non-admins can only list their own files.
 *      Drive URLs are NEVER exposed to clients (omitted unless caller is admin).
 * POST: Handles direct file upload with size and MIME-type limits, ownership checks,
 *       and administrative audit logging.
 */

import { NextResponse } from "next/server";
import { requestRole, requestUid } from "@/lib/auth/requestRole";
import {
  listFileRecords,
  saveFileRecord,
  folderLink,
  getClientDriveFolders,
  provisionClientDriveFolders,
  type DriveFileRecord,
} from "@/lib/services/googleDriveService";
import {
  DRIVE_MAX_FILE_BYTES,
  DRIVE_MAX_FILE_LABEL,
  type DriveCategoryKey,
} from "@/lib/config/driveStorage";
import { validateFile, DEFAULT_CONTENT_POLICY } from "@/lib/services/contentSafety";
import { AuditLogService } from "@/lib/services/auditLogService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const userId = await requestUid(req);
    const userRole = await requestRole(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = userRole === "admin";
    const url = new URL(req.url);
    const requestedClientId = url.searchParams.get("clientId") || url.searchParams.get("client_id");
    const orderId = url.searchParams.get("orderId") || url.searchParams.get("order_id");
    const kind = url.searchParams.get("kind") as DriveCategoryKey | null;

    // Multi-tenant security guard: Clients can ONLY list their own files
    const effectiveClientId = isAdmin ? (requestedClientId || undefined) : userId;

    const records = await listFileRecords({
      clientId: effectiveClientId,
      orderId: orderId || undefined,
      kinds: kind ? [kind] : undefined,
      limit: 200,
    });

    const activeFiles = records
      .filter((r) => r.state !== "trashed")
      .map((r) => ({
        driveFileId: r.driveFileId,
        id: r.driveFileId,
        name: r.name,
        size: r.size,
        mimeType: r.mimeType,
        folderId: r.folderId,
        kind: r.kind,
        orderId: r.orderId,
        clientId: r.clientId,
        version: r.version,
        shareState: r.shareState,
        downloadUrl: `/api/drive/file/${r.driveFileId}?download=true`,
        previewUrl: `/api/drive/file/${r.driveFileId}`,
        // Admin gets "Open in Drive" button link; never exposed to clients
        openInDriveUrl: isAdmin ? (r.webViewLink || folderLink(r.folderId)) : undefined,
        createdAt: r.createdAt,
      }));

    return NextResponse.json({
      success: true,
      count: activeFiles.length,
      files: activeFiles,
    });
  } catch (error: any) {
    console.error("[API/drive/files GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list files" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requestUid(req);
    const userRole = await requestRole(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = userRole === "admin";
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = (formData.get("orderId") as string) || "";
    const requestedFolderId = (formData.get("folderId") as string) || "";
    const kind = ((formData.get("kind") as string) || "client_assets") as DriveCategoryKey;
    const requestedClientId = (formData.get("clientId") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
    }

    const effectiveClientId = isAdmin ? (requestedClientId || userId) : userId;

    // Enforce size limit
    if (file.size > DRIVE_MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of ${DRIVE_MAX_FILE_LABEL}` },
        { status: 400 }
      );
    }

    // Content safety & extension policy validation
    const validation = validateFile(
      { name: file.name, size: file.size, type: file.type },
      DEFAULT_CONTENT_POLICY
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    // Resolve target folder: ensure client folder structure exists
    let targetFolderId = requestedFolderId;
    if (!targetFolderId) {
      let folders = await getClientDriveFolders(effectiveClientId);
      if (!folders) {
        folders = await provisionClientDriveFolders({
          clientId: effectiveClientId,
          clientName: "Studio Client",
        });
      }
      targetFolderId = folders.subfolders.inputs.id;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveFileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const record: DriveFileRecord = await saveFileRecord({
      driveFileId,
      folderId: targetFolderId,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      kind,
      orderId,
      clientId: effectiveClientId,
      version: 1,
      shareState: "private",
      state: "active",
      webViewLink: `/api/drive/file/${driveFileId}`,
      uploadedByUid: userId,
      uploadedByName: isAdmin ? "Studio Administrator" : "Client Member",
      uploadedByRole: isAdmin ? "admin" : "client",
      createdAt: now,
    });

    // Audit log file upload
    try {
      AuditLogService.record({
        who: {
          uid: userId,
          email: `${userId}@studio.local`,
          name: isAdmin ? "Studio Administrator" : "Client Member",
          role: userRole,
        },
        what: "STATUS_UPDATED",
        targetType: "order",
        targetId: orderId || driveFileId,
        targetTitle: file.name,
        note: `${isAdmin ? "Admin" : "Client"} uploaded file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
        type: "info",
      });
    } catch {}

    return NextResponse.json({
      success: true,
      file: {
        driveFileId: record.driveFileId,
        id: record.driveFileId,
        name: record.name,
        size: record.size,
        mimeType: record.mimeType,
        folderId: record.folderId,
        kind: record.kind,
        orderId: record.orderId,
        clientId: record.clientId,
        downloadUrl: `/api/drive/file/${record.driveFileId}?download=true`,
        previewUrl: `/api/drive/file/${record.driveFileId}`,
        createdAt: record.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API/drive/files POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
