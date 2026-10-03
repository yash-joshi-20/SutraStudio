/**
 * SUTRA STUDIO — Configurable Drive retention job (STEP 30)
 *
 * Called by n8n or an external cron via a shared secret (see cronAuth).
 * Deletes rejected / regenerated DRAFTS and superseded REVISIONS after their
 * retention window, and NEVER touches finals while `keepFinals` is on.
 *
 * Policy lives in `studio_config/retention` and falls back to defaults.
 */

import { NextResponse } from "next/server";
import { authorizeScheduledCall } from "@/lib/api/cronAuth";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import {
  listFileRecords,
  trashDriveFile,
  DRIVE_FILES_COLLECTION,
} from "@/lib/services/googleDriveService";
import {
  DEFAULT_RETENTION_POLICY,
  RETENTION_CONFIG_DOC,
  type RetentionPolicyConfig,
} from "@/lib/config/driveStorage";

export const dynamic = "force-dynamic";

async function loadPolicy(): Promise<RetentionPolicyConfig> {
  try {
    const snap = await adminDb().doc(RETENTION_CONFIG_DOC).get();
    if (!snap.exists) return DEFAULT_RETENTION_POLICY;
    const data = snap.data() as Partial<RetentionPolicyConfig>;
    return {
      draftRetentionDays: Number(data.draftRetentionDays ?? DEFAULT_RETENTION_POLICY.draftRetentionDays),
      revisionRetentionDays: Number(
        data.revisionRetentionDays ?? DEFAULT_RETENTION_POLICY.revisionRetentionDays
      ),
      keepFinals: data.keepFinals ?? DEFAULT_RETENTION_POLICY.keepFinals,
      clientAssetsRetentionDays: Number(
        data.clientAssetsRetentionDays ?? DEFAULT_RETENTION_POLICY.clientAssetsRetentionDays
      ),
    };
  } catch {
    return DEFAULT_RETENTION_POLICY;
  }
}

function cutoffIso(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

async function run(req: Request) {
  if (!(await authorizeScheduledCall(req))) {
    return NextResponse.json({ error: "Unauthorized scheduled execution." }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "true" || req.method === "GET";

  const policy = await loadPolicy();
  const windows = (
    [
      { kind: "drafts", days: policy.draftRetentionDays },
      { kind: "revisions", days: policy.revisionRetentionDays },
      { kind: "client_assets", days: policy.clientAssetsRetentionDays },
    ] as Array<{ kind: "drafts" | "revisions" | "client_assets"; days: number }>
  ).filter((w) => w.days > 0);

  const deleted: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];
  const failures: Array<{ id: string; reason: string }> = [];

  for (const window of windows) {
    const records = await listFileRecords({ kinds: [window.kind], limit: 500 });
    const cutoff = cutoffIso(window.days);

    for (const record of records) {
      if (record.state === "trashed") continue;
      const created = Date.parse(record.createdAt);
      if (!Number.isFinite(created) || created > cutoff) continue;

      if (dryRun) {
        deleted.push(record.driveFileId);
        continue;
      }

      try {
        await trashDriveFile(record.driveFileId);
        await adminDb()
          .collection(DRIVE_FILES_COLLECTION)
          .doc(record.driveFileId)
          .set({ state: "trashed", trashedAt: new Date().toISOString(), updatedAt: serverTimestamp() }, { merge: true });
        deleted.push(record.driveFileId);
      } catch (err) {
        failures.push({ id: record.driveFileId, reason: err instanceof Error ? err.message : "unknown" });
      }
    }
  }

  if (policy.keepFinals) {
    const finals = await listFileRecords({ kinds: ["final_delivery"], limit: 500 });
    for (const record of finals) {
      if (record.state !== "trashed") continue;
      skipped.push({ id: record.driveFileId, reason: "keepFinals=true; finals are never auto-deleted." });
    }
  }

  const summary = {
    ranAt: new Date().toISOString(),
    dryRun,
    policy,
    deletedCount: deleted.length,
    deletedIds: deleted,
    keptFinals: policy.keepFinals,
    skipped,
    failures,
  };

  await adminDb().collection("retention_runs").add({ ...summary, createdAt: serverTimestamp() });

  return NextResponse.json(summary);
}

export async function GET(req: Request) {
  try {
    return await run(req);
  } catch (err) {
    return NextResponse.json(
      { error: "Retention job failed.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await run(req);
  } catch (err) {
    return NextResponse.json(
      { error: "Retention job failed.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
