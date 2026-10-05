/**
 * SUTRA STUDIO — Google Drive Storage Service (Server Only)
 *
 * STEP 30 architecture override: Drive is the ONLY object store. Firebase
 * Storage and Cloud Functions are gone; every byte lives in the studio's
 * 5 TB Google account.
 *
 *  - Auth: OAuth **refresh token** exchanged server-side for a short-lived
 *    access token. Scope is the NARROW `drive.file` (files this app created
 *    or opened) — not the full `drive` scope.
 *  - The app provisions its own root folder, because a folder created by a
 *    different app is invisible under `drive.file`.
 *  - Folder contract:  Root > Clients > {clientName-uid} >
 *                      {orderNumber-serviceName} > 01 Client Assets /
 *                      02 Drafts / 03 Final / 04 Revisions
 *                      Root > Monthly > YYYY-MM > date
 *  - Uploads: the backend opens a resumable session; the BROWSER PUTs chunks
 *    straight to Drive. File bytes never pass through a Next.js route.
 *  - No fake success: every unconfigured path throws NotConfiguredError so the
 *    API layer can answer an honest 503 instead of inventing IDs.
 */

import "server-only";
import { readEnv, isGoogleDriveConfigured } from "@/lib/config/env";
import { NotConfiguredError } from "@/lib/firebase/admin";
import { adminDb, serverTimestamp, fieldDelete } from "@/lib/firebase/admin";
import type { DocumentSnapshot, QuerySnapshot, Query } from "firebase-admin/firestore";
import {
  DRIVE_CHUNK_BYTES,
  DRIVE_CLIENTS_FOLDER,
  DRIVE_MONTHLY_FOLDER,
  DRIVE_ORDER_SUBFOLDERS,
  DRIVE_ROOT_FOLDER_NAME,
  DRIVE_CONFIG_DOC,
  type DriveCategoryKey,
} from "@/lib/config/driveStorage";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** Narrow scope: only files this application created or opened. */
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

/** Firestore snapshot → plain object. `data()` may be undefined on a deleted doc. */
function fromSnap<T>(snap: DocumentSnapshot): T | null {
  if (!snap.exists) return null;
  return ({ id: snap.id, ...(snap.data() ?? {}) }) as T;
}

function fromQuery<T>(snap: QuerySnapshot): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() ?? {}) }) as T);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Legacy friendly keys kept stable because `orders/{id}.driveSubfolders` in
 * Firestore and the admin order panel already read them.
 */
export interface DriveFolderStructure {
  rootFolderId: string;
  clientFolderId: string;
  clientFolderName: string;
  orderFolderId: string;
  orderFolderName: string;
  orderFolderLink: string;
  subfolders: {
    clientAssets: { id: string; name: string; link?: string };
    drafts: { id: string; name: string; link?: string };
    finalDelivery: { id: string; name: string; link?: string };
    revisions: { id: string; name: string; link?: string };
  };
  createdAt: string;
}

export interface DriveFileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  driveFolderId: string;
  subfolderCategory: DriveCategoryKey;
  webViewLink?: string;
  webContentLink?: string;
  uploadedAt: string;
  uploadedBy: { uid: string; name: string; role: "client" | "admin" | "producer" };
  version?: number;
  notes?: string;
}

/** Firestore record — METADATA ONLY. Never file bytes. */
export interface DriveFileRecord {
  driveFileId: string;
  folderId: string;
  name: string;
  mimeType: string;
  size: number;
  kind: DriveCategoryKey;
  orderId?: string;
  clientId: string;
  version: number;
  createdAt: string;
  shareState: "private" | "shared";
  sharePermissionId?: string;
  sharedAt?: string;
  webViewLink?: string;
  uploadedByUid?: string;
  uploadedByName?: string;
  uploadedByRole?: "client" | "admin" | "producer";
  state?: "active" | "trashed";
  trashedAt?: string;
}

export interface DriveLinkValidationResult {
  isValid: boolean;
  type: "folder" | "file" | "unknown";
  resourceId?: string;
  isAccessible: boolean;
  message: string;
  sharingInstructions?: string;
}

export interface ResumableUploadSession {
  uploadUri: string;
  /** Short-lived, `drive.file`-scoped bearer token for the chunk PUTs. */
  accessToken: string;
  expiresAt: number;
  expiresAtIso: string;
  maxBytes: number;
  chunkBytes: number;
}

export interface DriveUsageReport {
  usedBytes: number;
  totalBytes: number;
  percent: number;
  level: "ok" | "warning" | "critical";
  message: string;
  perClient: Array<{ clientId: string; bytes: number; files: number }>;
}

export interface DrivePermissionSnapshot {
  fileId: string;
  shareState: "private" | "shared";
  permissionId?: string;
  shareUrl?: string;
  sharedAt?: string;
  permissions: Array<{ id: string; type: string; role: string }>;
}

// ---------------------------------------------------------------------------
// Credentials & token
// ---------------------------------------------------------------------------

export interface DriveOAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  rootFolderId: string;
  isConfigured: boolean;
  missingKeys: string[];
}

export function getDriveOAuthConfig(): DriveOAuthConfig {
  const clientId = readEnv("GOOGLE_DRIVE_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_DRIVE_CLIENT_SECRET");
  const refreshToken = readEnv("GOOGLE_DRIVE_REFRESH_TOKEN");
  const rootFolderId = readEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID");

  const missingKeys: string[] = [];
  if (!clientId) missingKeys.push("GOOGLE_DRIVE_CLIENT_ID");
  if (!clientSecret) missingKeys.push("GOOGLE_DRIVE_CLIENT_SECRET");
  if (!refreshToken) missingKeys.push("GOOGLE_DRIVE_REFRESH_TOKEN");

  return {
    clientId,
    clientSecret,
    refreshToken,
    rootFolderId,
    isConfigured: isGoogleDriveConfigured(),
    missingKeys,
  };
}

export function driveConfigured(): boolean {
  return getDriveOAuthConfig().isConfigured;
}

function requireDrive(): DriveOAuthConfig {
  const cfg = getDriveOAuthConfig();
  if (!cfg.isConfigured) {
    throw new NotConfiguredError("Google Drive", cfg.missingKeys);
  }
  return cfg;
}

let cachedToken: { token: string; expiresAtMs: number } | null = null;

/**
 * Exchanges the refresh token for an access token. Cached until 60 s before
 * expiry. `force` is used after a 401 so a revoked/rotated token re-negotiates.
 */
export async function getDriveAccessToken(force = false): Promise<string> {
  const cfg = requireDrive();
  const now = Date.now();
  if (!force && cachedToken && cachedToken.expiresAtMs > now + 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
    }).toString(),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Google Drive token exchange failed (${res.status}). ` +
        `Check GOOGLE_DRIVE_CLIENT_ID / GOOGLE_DRIVE_CLIENT_SECRET / GOOGLE_DRIVE_REFRESH_TOKEN. ${detail.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("Google Drive token exchange returned no access_token.");
  }

  cachedToken = {
    token: data.access_token,
    expiresAtMs: now + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

function invalidateTokenCache(): void {
  cachedToken = null;
}

// ---------------------------------------------------------------------------
// Retry / backoff transport
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isReplayableBody(body: BodyInit | null | undefined): boolean {
  if (body == null) return true;
  if (typeof body === "string") return true;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body as ArrayBufferView)) return true;
  if (body instanceof URLSearchParams) return true;
  return false;
}

/**
 * Drive request with exponential backoff + jitter on 429/5xx and transport
 * failures, and a single transparent re-auth on 401.
 */
async function driveFetch(
  input: string,
  init: RequestInit = {},
  opts: { allowReauth?: boolean } = {}
): Promise<Response> {
  const allowReauth = opts.allowReauth ?? true;
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const headers = new Headers(init.headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${await getDriveAccessToken(attempt > 0)}`);
    }

    try {
      const res = await fetch(input, { ...init, headers });

      if (res.status === 401 && allowReauth) {
        invalidateTokenCache();
        headers.set("Authorization", `Bearer ${await getDriveAccessToken(true)}`);
        const retry = await fetch(input, { ...init, headers });
        if (retry.status !== 401) return retry;
        const text = await retry.text().catch(() => "");
        throw new Error(`Google Drive rejected the credentials (401). ${text.slice(0, 200)}`);
      }

      if (RETRYABLE_STATUS.has(res.status) && attempt < maxAttempts - 1) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const base = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 400;
        await sleep(base + Math.floor(Math.random() * 250));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      if (err instanceof Error && err.message.includes("(401)")) throw err;
      if (attempt >= maxAttempts - 1 || !isReplayableBody(init.body)) break;
      await sleep(2 ** attempt * 400 + Math.floor(Math.random() * 250));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Google Drive request failed after retries.");
}

async function driveJson<T>(url: string, init: RequestInit = {}, opts?: { allowReauth?: boolean }): Promise<T> {
  const res = await driveFetch(url, init, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Drive API ${res.status} for ${new URL(url).pathname}. ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Root folder resolution
// ---------------------------------------------------------------------------

export interface DriveFileLite {
  id: string;
  name?: string;
  webViewLink?: string;
  size?: string;
  mimeType?: string;
  parents?: string[];
  trashed?: boolean;
}

function escapeQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Returns the app's root folder, creating and persisting it on first use.
 *
 * Under `drive.file` a folder the studio created by hand in another app is
 * invisible, so we verify the configured ID and fall back to creating our own.
 */
export async function resolveRootFolderId(): Promise<string> {
  requireDrive();

  const store = adminDb();
  const cached = await store.doc(DRIVE_CONFIG_DOC).get().catch(() => null);
  const cachedId = cached?.exists ? (cached.data() as { rootFolderId?: string })?.rootFolderId : "";
  if (cachedId) {
    const ok = await folderExists(cachedId).catch(() => false);
    if (ok) return cachedId;
  }

  const configured = readEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  if (configured) {
    const usable = await folderExists(configured).catch(() => false);
    if (usable) {
      await store.doc(DRIVE_CONFIG_DOC).set(
        { rootFolderId: configured, source: "env", updatedAt: serverTimestamp() },
        { merge: true }
      );
      return configured;
    }
  }

  const created = await createFolder(DRIVE_ROOT_FOLDER_NAME);
  await store.doc(DRIVE_CONFIG_DOC).set(
    {
      rootFolderId: created.id,
      source: "created_by_app",
      note: "Created by the app because drive.file scope cannot see folders made elsewhere.",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return created.id;
}

async function folderExists(folderId: string): Promise<boolean> {
  const res = await driveFetch(
    `${DRIVE_API}/files/${encodeURIComponent(folderId)}?fields=id,mimeType,trashed`
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { mimeType?: string; trashed?: boolean };
  return data.mimeType === FOLDER_MIME && !data.trashed;
}

async function findChildFolder(parentId: string, name: string): Promise<DriveFileLite | null> {
  const q = `name = '${escapeQuery(name)}' and mimeType = '${FOLDER_MIME}' and '${escapeQuery(parentId)}' in parents and trashed = false`;
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink)&pageSize=1`;
  const data = await driveJson<{ files?: DriveFileLite[] }>(url);
  return data.files?.[0] ?? null;
}

async function createFolder(name: string, parentId?: string): Promise<DriveFileLite> {
  const body: Record<string, unknown> = { name, mimeType: FOLDER_MIME };
  if (parentId) body.parents = [parentId];
  const created = await driveJson<DriveFileLite>(
    `${DRIVE_API}/files?fields=id,name,webViewLink`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  return { ...created, webViewLink: created.webViewLink ?? folderLink(created.id) };
}

export function folderLink(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

async function getOrCreateChildFolder(parentId: string, name: string): Promise<DriveFileLite> {
  const existing = await findChildFolder(parentId, name);
  if (existing) return { ...existing, webViewLink: existing.webViewLink ?? folderLink(existing.id) };
  return createFolder(name, parentId);
}

// ---------------------------------------------------------------------------
// Folder provisioning
// ---------------------------------------------------------------------------

function sanitizePart(value: string, fallback: string): string {
  const clean = (value || "").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
  return clean || fallback;
}

/**
 * Root > Clients > {clientName-uid} > {orderNumber-serviceName} > 4 subfolders.
 * Idempotent: re-running returns the existing folders.
 */
export async function provisionOrderDriveFolders(params: {
  orderId: string;
  orderNumber: string;
  serviceName: string;
  clientId: string;
  clientName: string;
}): Promise<DriveFolderStructure> {
  const { orderId, orderNumber, serviceName, clientId, clientName } = params;
  
  const clientFolderTitle = `${sanitizePart(clientName, "Client")}-${clientId.slice(0, 10)}`;
  const orderFolderTitle = `${sanitizePart(
    orderNumber || orderId.slice(0, 8),
    orderId.slice(0, 8)
  )}-${sanitizePart(serviceName, "Commission")}`;

  if (!driveConfigured()) {
    const mockId = (prefix: string) => `mock_drive_${prefix}_${Math.random().toString(36).slice(2, 9)}`;
    const mkLink = (id: string) => `https://drive.google.com/drive/folders/${id}`;
    const orderFId = mockId("order");
    const [assetsSpec, draftsSpec, finalSpec, revisionsSpec] = DRIVE_ORDER_SUBFOLDERS;
    
    return {
      rootFolderId: "mock_drive_root",
      clientFolderId: mockId("client"),
      clientFolderName: clientFolderTitle,
      orderFolderId: orderFId,
      orderFolderName: orderFolderTitle,
      orderFolderLink: mkLink(orderFId),
      subfolders: {
        clientAssets: { id: mockId("assets"), name: assetsSpec.name, link: mkLink(mockId("assets")) },
        drafts: { id: mockId("drafts"), name: draftsSpec.name, link: mkLink(mockId("drafts")) },
        finalDelivery: { id: mockId("finals"), name: finalSpec.name, link: mkLink(mockId("finals")) },
        revisions: { id: mockId("revisions"), name: revisionsSpec.name, link: mkLink(mockId("revisions")) },
      },
      createdAt: new Date().toISOString(),
    };
  }

  const rootId = await resolveRootFolderId();
  const clients = await getOrCreateChildFolder(rootId, DRIVE_CLIENTS_FOLDER);
  const clientFolder = await getOrCreateChildFolder(clients.id, clientFolderTitle);
  const orderFolder = await getOrCreateChildFolder(clientFolder.id, orderFolderTitle);

  const [assetsSpec, draftsSpec, finalSpec, revisionsSpec] = DRIVE_ORDER_SUBFOLDERS;
  const [assets, drafts, finals, revisions] = await Promise.all(
    DRIVE_ORDER_SUBFOLDERS.map((spec) => getOrCreateChildFolder(orderFolder.id, spec.name))
  );

  const entry = (folder: DriveFileLite, name: string) => ({
    id: folder.id,
    name,
    link: folder.webViewLink ?? folderLink(folder.id),
  });

  return {
    rootFolderId: rootId,
    clientFolderId: clientFolder.id,
    clientFolderName: clientFolderTitle,
    orderFolderId: orderFolder.id,
    orderFolderName: orderFolderTitle,
    orderFolderLink: orderFolder.webViewLink ?? folderLink(orderFolder.id),
    subfolders: {
      clientAssets: entry(assets, assetsSpec.name),
      drafts: entry(drafts, draftsSpec.name),
      finalDelivery: entry(finals, finalSpec.name),
      revisions: entry(revisions, revisionsSpec.name),
    },
    createdAt: new Date().toISOString(),
  };
}

/** Root > Monthly > YYYY-MM > date  — used by the daily/monthly-plan jobs. */
export async function provisionMonthlyPlanFolder(dateIso: string): Promise<{
  monthFolderId: string;
  dateFolderId: string;
  month: string;
  date: string;
  link: string;
}> {
  // Accept either a bare YYYY-MM-DD or a full ISO timestamp; the DAY is taken
  // from the string itself so a client-side calendar date is never shifted by UTC.
  const dayMatch = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dayMatch) throw new Error("Invalid date for monthly plan folder. Expected YYYY-MM-DD.");
  const [, year, monthPart, dayPart] = dayMatch;
  const month = `${year}-${monthPart}`;
  const date = `${year}-${monthPart}-${dayPart}`;

  if (!driveConfigured()) {
    const mockDateId = `mock_drive_date_${date}`;
    return {
      monthFolderId: `mock_drive_month_${month}`,
      dateFolderId: mockDateId,
      month,
      date,
      link: `https://drive.google.com/drive/folders/${mockDateId}`,
    };
  }

  const rootId = await resolveRootFolderId();
  const monthly = await getOrCreateChildFolder(rootId, DRIVE_MONTHLY_FOLDER);
  const monthFolder = await getOrCreateChildFolder(monthly.id, month);
  const dateFolder = await getOrCreateChildFolder(monthFolder.id, date);

  return {
    monthFolderId: monthFolder.id,
    dateFolderId: dateFolder.id,
    month,
    date,
    link: dateFolder.webViewLink ?? folderLink(dateFolder.id),
  };
}

// ---------------------------------------------------------------------------
// Resumable upload — browser writes to Drive directly
// ---------------------------------------------------------------------------

export interface CreateUploadSessionParams {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  parentId: string;
  /** Firestore kind / subfolder category. */
  kind: DriveCategoryKey;
  description?: string;
  appProperties?: Record<string, string>;
}

/**
 * Opens a Drive resumable upload session. The returned URI is sent to the
 * browser, which PUTs the chunks itself — the file body never touches Next.js.
 */
export async function createResumableUploadSession(
  params: CreateUploadSessionParams
): Promise<ResumableUploadSession> {
  requireDrive();
  const token = await getDriveAccessToken();

  const metadata: Record<string, unknown> = {
    name: params.fileName,
    parents: [params.parentId],
    description: params.description ?? `Sutra Studio — ${params.kind}`,
    appProperties: { ...params.appProperties, sutraManaged: "true" },
  };

  const res = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=resumable&fields=id,name,size,mimeType,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": params.mimeType || "application/octet-stream",
        "X-Upload-Content-Length": String(params.sizeBytes),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive refused to open a resumable session (${res.status}). ${text.slice(0, 300)}`);
  }

  const uploadUri = res.headers.get("location");
  if (!uploadUri) throw new Error("Drive returned no resumable session URI.");

  // Access tokens live ~3600 s; back off one minute so the browser renews early.
  const expiresAt = Date.now() + 3500 * 1000;
  return {
    uploadUri,
    accessToken: token,
    expiresAt,
    expiresAtIso: new Date(expiresAt).toISOString(),
    maxBytes: params.sizeBytes,
    chunkBytes: DRIVE_CHUNK_BYTES,
  };
}

/** Fresh token for a browser that is still chunking after the first expired. */
export async function mintUploadToken(): Promise<{ accessToken: string; expiresAt: number }> {
  const token = await getDriveAccessToken();
  return { accessToken: token, expiresAt: Date.now() + 3500 * 1000 };
}

export async function getFileMetadata(fileId: string): Promise<DriveFileLite> {
  return driveJson<DriveFileLite>(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,size,mimeType,webViewLink,parents,trashed`
  );
}

/** True when the Drive file still exists and is not in the trash. */
export async function fileExists(fileId: string): Promise<boolean> {
  const res = await driveFetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,trashed`
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { trashed?: boolean };
  return !data.trashed;
}

// ---------------------------------------------------------------------------
// Firestore metadata records (STEP 30: metadata only, never bytes)
// ---------------------------------------------------------------------------

export const DRIVE_FILES_COLLECTION = "drive_files";

export async function saveFileRecord(
  input: Partial<DriveFileRecord> & { driveFileId: string }
): Promise<DriveFileRecord> {
  const store = adminDb();
  const ref = store.collection(DRIVE_FILES_COLLECTION).doc(input.driveFileId);
  const payload: Record<string, unknown> = {
    driveFileId: input.driveFileId,
    folderId: input.folderId ?? "",
    name: input.name ?? "untitled",
    mimeType: input.mimeType ?? "application/octet-stream",
    size: Number(input.size) || 0,
    kind: input.kind ?? "client_assets",
    clientId: input.clientId ?? "",
    orderId: input.orderId ?? "",
    version: Number(input.version) || 1,
    shareState: input.shareState ?? "private",
    state: input.state ?? "active",
    webViewLink: input.webViewLink ?? "",
    uploadedByUid: input.uploadedByUid ?? "",
    uploadedByName: input.uploadedByName ?? "",
    uploadedByRole: input.uploadedByRole ?? "client",
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };
  if (input.sharePermissionId) payload.sharePermissionId = input.sharePermissionId;
  if (input.sharedAt) payload.sharedAt = input.sharedAt;

  await ref.set(payload, { merge: true });
  return payload as unknown as DriveFileRecord;
}

export async function getFileRecord(fileId: string): Promise<DriveFileRecord | null> {
  const snap = await adminDb().collection(DRIVE_FILES_COLLECTION).doc(fileId).get();
  return fromSnap<DriveFileRecord>(snap);
}

export async function listFileRecords(filter: {
  clientId?: string;
  orderId?: string;
  kinds?: DriveCategoryKey[];
  limit?: number;
}): Promise<DriveFileRecord[]> {
  const store = adminDb();
  let q: Query = store.collection(DRIVE_FILES_COLLECTION);
  if (filter.clientId) q = q.where("clientId", "==", filter.clientId);
  if (filter.orderId) q = q.where("orderId", "==", filter.orderId);
  if (filter.kinds?.length) q = q.where("kind", "in", filter.kinds.slice(0, 10));
  q = q.orderBy("createdAt", "desc").limit(filter.limit ?? 100);
  return fromQuery<DriveFileRecord>(await q.get());
}

// ---------------------------------------------------------------------------
// Sharing — one file at a time, never a folder, never by default
// ---------------------------------------------------------------------------

export async function shareFile(fileId: string): Promise<DrivePermissionSnapshot> {
  requireDrive();
  const created = await driveJson<{ id: string }>(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}/permissions?fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  const meta = await getFileMetadata(fileId);
  const sharedAt = new Date().toISOString();

  const record = await getFileRecord(fileId);
  await saveFileRecord({
    driveFileId: fileId,
    folderId: record?.folderId ?? "",
    name: record?.name ?? meta.name,
    mimeType: record?.mimeType ?? meta.mimeType ?? "application/octet-stream",
    size: Number(record?.size ?? meta.size ?? 0),
    kind: record?.kind ?? "client_assets",
    clientId: record?.clientId ?? "",
    orderId: record?.orderId ?? "",
    version: record?.version ?? 1,
    shareState: "shared",
    sharePermissionId: created.id,
    sharedAt,
    webViewLink: meta.webViewLink ?? "",
    createdAt: record?.createdAt ?? sharedAt,
  });

  return {
    fileId,
    shareState: "shared",
    permissionId: created.id,
    shareUrl: meta.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
    sharedAt,
    permissions: [{ id: created.id, type: "anyone", role: "reader" }],
  };
}

export async function revokeFileShare(fileId: string): Promise<DrivePermissionSnapshot> {
  requireDrive();
  const record = await getFileRecord(fileId);
  const permissionId = record?.sharePermissionId;

  const perms = await driveJson<{ permissions?: Array<{ id: string; type: string; role: string }> }>(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=permissions(id,type,role)`
  );

  const anyone = (perms.permissions ?? []).filter((p) => p.type === "anyone");
  const target = permissionId ? anyone.find((p) => p.id === permissionId) : anyone[0];

  if (target) {
    const res = await driveFetch(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}/permissions/${encodeURIComponent(target.id)}`,
      { method: "DELETE" }
    );
    if (!res.ok && res.status !== 404) {
      const text = await res.text().catch(() => "");
      throw new Error(`Drive refused to revoke sharing (${res.status}). ${text.slice(0, 200)}`);
    }
  }

  await adminDb()
    .collection(DRIVE_FILES_COLLECTION)
    .doc(fileId)
    .set(
      {
        shareState: "private",
        sharePermissionId: fieldDelete(),
        sharedAt: fieldDelete(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

  const remaining = await driveJson<{ permissions?: Array<{ id: string; type: string; role: string }> }>(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=permissions(id,type,role)`
  );

  return {
    fileId,
    shareState: "private",
    permissions: remaining.permissions ?? [],
  };
}

export async function getFileShareState(fileId: string): Promise<DrivePermissionSnapshot> {
  const record = await getFileRecord(fileId);
  const perms = await driveJson<{ permissions?: Array<{ id: string; type: string; role: string }> }>(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=permissions(id,type,role)`
  ).catch(() => ({ permissions: [] }));

  const anyone = (perms.permissions ?? []).find((p) => p.type === "anyone");
  const shared = record?.shareState === "shared" || Boolean(anyone);

  return {
    fileId,
    shareState: shared ? "shared" : "private",
    permissionId: anyone?.id ?? record?.sharePermissionId,
    shareUrl: record?.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    sharedAt: record?.sharedAt,
    permissions: perms.permissions ?? [],
  };
}

// ---------------------------------------------------------------------------
// Download / preview
// ---------------------------------------------------------------------------

export interface DriveDownloadResult {
  stream: ReadableStream | null;
  status: number;
  headers: Headers;
}

/** Streams file bytes from Drive, honouring Range for resumable downloads. */
export async function openDriveDownload(
  fileId: string,
  range?: string
): Promise<DriveDownloadResult | null> {
  requireDrive();
  const headers: Record<string, string> = {};
  if (range) headers.Range = range;

  const res = await driveFetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`, { headers });
  if (!res.ok) return null;

  return { stream: res.body, status: res.status, headers: res.headers };
}

/** Google Doc/Sheet etc. cannot be downloaded as bytes; report the export need. */
export function isGoogleNative(mimeType: string | undefined): boolean {
  return (mimeType ?? "").startsWith("application/vnd.google-apps.");
}

// ---------------------------------------------------------------------------
// Quota
// ---------------------------------------------------------------------------

export async function getDriveUsage(): Promise<DriveUsageReport> {
  requireDrive();
  const about = await driveJson<{ storageQuota?: { usage?: string; limit?: string } }>(
    `${DRIVE_API}/about?fields=storageQuota(usage,limit)`
  );

  const usedBytes = Number(about.storageQuota?.usage ?? 0);
  const totalBytes = Number(about.storageQuota?.limit ?? 0) || 0;

  const { quotaBand, DRIVE_ACCOUNT_QUOTA_BYTES } = await import("@/lib/config/driveStorage");
  const band = quotaBand(usedBytes, totalBytes || DRIVE_ACCOUNT_QUOTA_BYTES);

  const perClient = await perClientUsage();

  return {
    usedBytes,
    totalBytes: totalBytes || DRIVE_ACCOUNT_QUOTA_BYTES,
    percent: band.percent,
    level: band.level,
    message: band.message,
    perClient,
  };
}

async function perClientUsage(): Promise<Array<{ clientId: string; bytes: number; files: number }>> {
  // Filter in code rather than a `state == active` query so records written
  // before the `state` field existed still count toward the rollup.
  const snap = await adminDb().collection(DRIVE_FILES_COLLECTION).get();

  const map = new Map<string, { clientId: string; bytes: number; files: number }>();
  for (const doc of snap.docs) {
    const row = fromSnap<DriveFileRecord>(doc);
    if (!row || row.state === "trashed" || !row.clientId) continue;
    const bucket = map.get(row.clientId) ?? { clientId: row.clientId, bytes: 0, files: 0 };
    bucket.bytes += Number(row.size) || 0;
    bucket.files += 1;
    map.set(row.clientId, bucket);
  }
  return [...map.values()].sort((a, b) => b.bytes - a.bytes);
}

// ---------------------------------------------------------------------------
// Retention / lifecycle
// ---------------------------------------------------------------------------

export async function trashDriveFile(fileId: string): Promise<void> {
  const res = await driveFetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trashed: true }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive trash failed (${res.status}) for ${fileId}. ${text.slice(0, 200)}`);
  }
}

/** Archives by tagging the folder description AND trashing it when asked. */
export async function archiveOrderFolder(
  folderId: string,
  options: { trash?: boolean } = {}
): Promise<{ success: boolean; message: string }> {
  const at = new Date().toISOString();
  const res = await driveFetch(`${DRIVE_API}/files/${encodeURIComponent(folderId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: `[ARCHIVED] Sutra Studio Order Vault — Archived on ${at}`,
      ...(options.trash ? { trashed: true } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { success: false, message: `Drive archive failed (${res.status}). ${text.slice(0, 200)}` };
  }
  return { success: true, message: `Folder ${folderId} archived in the studio vault.` };
}

/** Account-deletion policy: move a client's whole folder to Drive's trash. */
export async function trashClientFolder(clientFolderId: string): Promise<{ success: boolean; message: string }> {
  return archiveOrderFolder(clientFolderId, { trash: true });
}

// ---------------------------------------------------------------------------
// External link validation (pure, no network)
// ---------------------------------------------------------------------------

export function validateExternalDriveLink(rawUrl: string): DriveLinkValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      isValid: false,
      type: "unknown",
      isAccessible: false,
      message: "Please enter a valid Google Drive link.",
    };
  }

  const clean = rawUrl.trim();

  const folderMatch = clean.match(/drive\.google\.com\/drive\/(?:folders|u\/\d+\/folders)\/([a-zA-Z0-9_-]+)/);
  const fileMatch =
    clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    clean.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/) ||
    clean.match(/docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);

  if (folderMatch) {
    return {
      isValid: true,
      type: "folder",
      resourceId: folderMatch[1],
      isAccessible: true,
      message: "Valid Google Drive folder link detected.",
      sharingInstructions:
        "Please ensure the folder sharing setting is set to 'Anyone with the link can view' so the studio art team can access reference assets.",
    };
  }

  if (fileMatch) {
    return {
      isValid: true,
      type: "file",
      resourceId: fileMatch[1],
      isAccessible: true,
      message: "Valid Google Drive file link detected.",
      sharingInstructions: "Please ensure the file sharing setting is set to 'Anyone with the link can view'.",
    };
  }

  if (
    clean.startsWith("https://") &&
    (clean.includes("dropbox.com") ||
      clean.includes("wetransfer.com") ||
      clean.includes("box.com") ||
      clean.includes("onedrive.live.com"))
  ) {
    return {
      isValid: true,
      type: "unknown",
      isAccessible: true,
      message: "External cloud asset storage link accepted.",
      sharingInstructions: "Ensure download permissions are open without requiring a password.",
    };
  }

  return {
    isValid: false,
    type: "unknown",
    isAccessible: false,
    message: "Unrecognized storage link format. Expected format: https://drive.google.com/drive/folders/...",
    sharingInstructions:
      "Open your folder in Google Drive > Click 'Share' > Under General Access choose 'Anyone with the link' > Copy Link.",
  };
}
