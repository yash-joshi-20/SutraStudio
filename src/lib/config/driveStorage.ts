/**
 * SUTRA STUDIO — Google Drive Storage Policy
 *
 * Single source of truth for the Drive folder layout, per-file limits,
 * the account-wide quota thresholds and the retention rules.
 *
 * CLIENT-SAFE: contains no secret values, only limits and display strings.
 * Import this from a client component to pre-validate before uploading;
 * the server MUST still re-validate every request.
 */

/** Internal category keys used in API payloads and Firestore records. */
export type DriveCategoryKey = "client_assets" | "drafts" | "final_delivery" | "revisions";

export interface DriveSubfolderSpec {
  key: DriveCategoryKey;
  /** On-Drive folder title, exactly as it appears in the client's vault. */
  name: string;
}

/**
 * STEP 30 folder contract:
 *   Root > Clients > {clientName-uid} > {orderNumber-serviceName} >
 *     01 Client Assets / 02 Drafts / 03 Final / 04 Revisions
 */
export const DRIVE_ORDER_SUBFOLDERS: readonly DriveSubfolderSpec[] = [
  { key: "client_assets", name: "01 Client Assets" },
  { key: "drafts", name: "02 Drafts" },
  { key: "final_delivery", name: "03 Final" },
  { key: "revisions", name: "04 Revisions" },
] as const;

export const DRIVE_CLIENTS_FOLDER = "Clients";
export const DRIVE_MONTHLY_FOLDER = "Monthly";
export const DRIVE_ROOT_FOLDER_NAME = "SUTRA STUDIO VAULT";

export function subfolderNameFor(key: DriveCategoryKey): string {
  return DRIVE_ORDER_SUBFOLDERS.find((s) => s.key === key)?.name ?? "01 Client Assets";
}

/** Which categories a client may upload into (clients never author finals). */
export const CLIENT_UPLOAD_CATEGORIES: readonly DriveCategoryKey[] = ["client_assets"];

/** Every category an administrator may upload into. */
export const ADMIN_UPLOAD_CATEGORIES: readonly DriveCategoryKey[] = [
  "client_assets",
  "drafts",
  "final_delivery",
  "revisions",
];

export function isDriveCategory(value: string): value is DriveCategoryKey {
  return (DRIVE_ORDER_SUBFOLDERS as DriveSubfolderSpec[]).some((s) => s.key === value);
}

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

/**
 * Hard ceiling per file, enforced both in the browser (early rejection) and
 * again server-side when the resumable session is opened. Drive itself accepts
 * 5 TB, so the binding constraint is our own policy, not the provider.
 */
export const DRIVE_MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB
export const DRIVE_MAX_FILE_LABEL = "2 GB";

/** Chunk size used by the browser uploader. 8 MiB is Drive's 256 KiB multiple. */
export const DRIVE_CHUNK_BYTES = 8 * 1024 * 1024;

/** Files below this size are uploaded in a single PUT instead of chunked. */
export const DRIVE_SINGLE_SHOT_MAX_BYTES = 5 * 1024 * 1024;

/** How long a resumable session URI stays valid before Google invalidates it. */
export const DRIVE_UPLOAD_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Account quota (Drive personal account: 5 TB)
// ---------------------------------------------------------------------------

export const DRIVE_ACCOUNT_QUOTA_BYTES = 5 * 1024 * 1024 * 1024 * 1024; // 5 TiB
export const DRIVE_QUOTA_WARNING_PERCENT = 70;
export const DRIVE_QUOTA_CRITICAL_PERCENT = 90;

export interface QuotaBand {
  level: "ok" | "warning" | "critical";
  percent: number;
  message: string;
}

/**
 * Classify a used-bytes value against the 70 % / 90 % alert thresholds.
 */
export function quotaBand(usedBytes: number, totalBytes = DRIVE_ACCOUNT_QUOTA_BYTES): QuotaBand {
  const percent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  if (percent >= DRIVE_QUOTA_CRITICAL_PERCENT) {
    return {
      level: "critical",
      percent,
      message: `Drive storage is ${percent.toFixed(1)} % full. Over ${DRIVE_QUOTA_CRITICAL_PERCENT} % of the 5 TB allowance — archive or delete old client folders now.`,
    };
  }
  if (percent >= DRIVE_QUOTA_WARNING_PERCENT) {
    return {
      level: "warning",
      percent,
      message: `Drive storage is ${percent.toFixed(1)} % full. Over ${DRIVE_QUOTA_WARNING_PERCENT} % of the 5 TB allowance — schedule a clean-up.`,
    };
  }
  return { level: "ok", percent, message: `Drive storage is ${percent.toFixed(1)} % full.` };
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------

export type RetentionTargetKind = "drafts" | "revisions";

export interface RetentionPolicyConfig {
  /** Delete rejected / regenerated drafts after N days. 0 disables pruning. */
  draftRetentionDays: number;
  /** Delete superseded revision files after N days. 0 disables pruning. */
  revisionRetentionDays: number;
  /** Finals are never auto-deleted while this stays true. */
  keepFinals: boolean;
  clientAssetsRetentionDays: number;
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicyConfig = {
  draftRetentionDays: 30,
  revisionRetentionDays: 60,
  keepFinals: true,
  clientAssetsRetentionDays: 0,
};

export const DRIVE_CONFIG_DOC = "studio_config/drive";
export const RETENTION_CONFIG_DOC = "studio_config/retention";

/** Weights for the per-client usage rollup. */
export const USAGE_ROLLUP_DOC = "studio_config/storage_usage";
