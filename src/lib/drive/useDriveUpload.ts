"use client";

/**
 * SUTRA STUDIO — Browser → Google Drive direct uploader (STEP 30)
 *
 * The backend opens a resumable session; THIS module PUTs the bytes straight
 * to Drive in chunks. No file body ever passes through a Next.js route, so a
 * 2 GB deliverable cannot blow a serverless payload limit.
 *
 * Provides: early size/type validation, per-chunk retry with backoff, live
 * progress, and a mid-upload token renewal for uploads longer than one hour.
 */

import { jsonRaw, errorMessage } from "@/lib/api/client";
import { validateFile, DEFAULT_CONTENT_POLICY } from "@/lib/services/contentSafety";
import {
  DRIVE_CHUNK_BYTES,
  DRIVE_MAX_FILE_BYTES,
  DRIVE_MAX_FILE_LABEL,
  DRIVE_SINGLE_SHOT_MAX_BYTES,
  type DriveCategoryKey,
} from "@/lib/config/driveStorage";

export type UploadPhase = "validating" | "opening" | "uploading" | "finalising" | "done";

export interface DriveUploadProgress {
  phase: UploadPhase;
  loaded: number;
  total: number;
  percent: number;
  chunkIndex: number;
  chunkCount: number;
}

export interface DriveUploadResult {
  driveFileId: string;
  name: string;
  size: number;
  mimeType: string;
  folderId: string;
  kind: DriveCategoryKey;
  shareState: string;
  downloadUrl: string;
  createdAt: string;
}

export interface DriveUploadOptions {
  orderId: string;
  kind: DriveCategoryKey;
  version?: number;
  notes?: string;
  signal?: AbortSignal;
  onProgress?: (progress: DriveUploadProgress) => void;
}

interface SessionResponse {
  uploadUri: string;
  accessToken: string;
  expiresAt: number;
  expiresAtIso: string;
  maxBytes: number;
  chunkBytes: number;
  folderId: string;
  orderId: string;
  clientId: string;
}

interface CompleteResponse {
  success: boolean;
  file: DriveUploadResult;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Uploads one file. Throws an `Error` whose message is safe to show the user.
 */
export async function uploadFileToDrive(
  file: File,
  opts: DriveUploadOptions
): Promise<DriveUploadResult> {
  const report = (progress: DriveUploadProgress) => opts.onProgress?.(progress);
  const total = file.size;
  const preliminaryChunks = Math.max(1, Math.ceil(total / DRIVE_CHUNK_BYTES));
  const chunkCount = preliminaryChunks;

  // ---- 1. Validate BEFORE opening a session -------------------------------
  report({ phase: "validating", loaded: 0, total, percent: 0, chunkIndex: 0, chunkCount });

  if (total > DRIVE_MAX_FILE_BYTES) {
    throw new Error(`That file is ${(total / 1024 ** 3).toFixed(2)} GB. The limit is ${DRIVE_MAX_FILE_LABEL}.`);
  }

  const mimeType = file.type || "application/octet-stream";
  const validation = validateFile({ name: file.name, size: total, type: mimeType }, DEFAULT_CONTENT_POLICY);
  if (!validation.valid) throw new Error(validation.errors.join(" "));

  // ---- 2. Open the resumable session --------------------------------------
  report({ phase: "opening", loaded: 0, total, percent: 0, chunkIndex: 0, chunkCount });

  const session = await jsonRaw<SessionResponse>("/api/drive/upload/session", "POST", {
    fileName: file.name,
    mimeType,
    sizeBytes: total,
    kind: opts.kind,
    orderId: opts.orderId,
    version: opts.version ?? 1,
    notes: opts.notes ?? "",
  });

  if (!session.uploadUri) throw new Error("The studio could not open a Drive upload session.");

  // ---- 3. Stream the chunks ------------------------------------------------
  const perChunk = session.chunkBytes > 0 ? session.chunkBytes : DRIVE_CHUNK_BYTES;
  const size = total <= DRIVE_SINGLE_SHOT_MAX_BYTES ? total : perChunk;
  const count = Math.max(1, Math.ceil(total / size));

  let token = session.accessToken;
  let fileId = "";

  const put = async (start: number, end: number): Promise<Response> =>
    fetch(session.uploadUri, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": mimeType,
        "Content-Range": `bytes ${start}-${end}/${total}`,
      },
      body: file.slice(start, end + 1),
      signal: opts.signal,
    });

  for (let index = 0; index < count; index++) {
    const start = index * size;
    const end = Math.min(start + size, total) - 1;
    const isLast = index === count - 1;

    let response: Response | null = null;
    let lastError = "";

    for (let attempt = 0; attempt < 4; attempt++) {
      if (opts.signal?.aborted) throw new Error("Upload cancelled.");

      try {
        response = await put(start, end);
      } catch (err) {
        lastError = errorMessage(err, "Network error while reaching Google Drive.");
        await sleep(400 * 2 ** attempt + Math.floor(Math.random() * 250));
        continue;
      }

      // Token expired mid-upload: renew and immediately retry this chunk.
      if (response.status === 401 && attempt < 3) {
        const renewed = await jsonRaw<{ accessToken: string }>("/api/drive/upload/token", "POST", {});
        token = renewed.accessToken;
        continue;
      }

      // 308 = chunk accepted, more to come. 200 = upload complete.
      if (response.status === 308 || (isLast && response.status === 200)) break;

      if (response.status >= 500 && attempt < 3) {
        await sleep(400 * 2 ** attempt + Math.floor(Math.random() * 250));
        continue;
      }

      const detail = await response.text().catch(() => "");
      lastError = `Google Drive rejected chunk ${index + 1} (HTTP ${response.status}). ${detail.slice(0, 180)}`;
      break;
    }

    if (!response) throw new Error(lastError || "Upload failed before reaching Google Drive.");
    if (!(response.status === 308 || (isLast && response.status === 200))) {
      throw new Error(lastError || `Upload failed at chunk ${index + 1} (HTTP ${response.status}).`);
    }

    if (isLast) {
      const text = await response.text().catch(() => "");
      try {
        const parsed = text ? (JSON.parse(text) as { id?: string }) : null;
        fileId = parsed?.id ?? "";
      } catch {
        fileId = "";
      }
    }

    const loaded = Math.min(end + 1, total);
    report({
      phase: isLast ? "finalising" : "uploading",
      loaded,
      total,
      percent: total > 0 ? Math.round((loaded / total) * 100) : 100,
      chunkIndex: index + 1,
      chunkCount: count,
    });
  }

  if (!fileId) {
    throw new Error(
      "Drive finished transferring the file but did not return its id. Re-run the upload; nothing was registered."
    );
  }

  // ---- 4. Register the metadata in Firestore ------------------------------
  const completed = await jsonRaw<CompleteResponse>("/api/drive/upload/complete", "POST", {
    fileId,
    orderId: opts.orderId ?? session.orderId,
    kind: opts.kind,
    version: opts.version ?? 1,
    notes: opts.notes ?? "",
    fileName: file.name,
  });

  report({ phase: "done", loaded: total, total, percent: 100, chunkIndex: count, chunkCount: count });
  return completed.file;
}
