/**
 * SUTRA STUDIO — Per-client Drive usage + 5 TB quota alerts (admin, STEP 30)
 */

import { guarded, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { getDriveUsage } from "@/lib/services/googleDriveService";
import {
  DRIVE_ACCOUNT_QUOTA_BYTES,
  DRIVE_QUOTA_CRITICAL_PERCENT,
  DRIVE_QUOTA_WARNING_PERCENT,
} from "@/lib/config/driveStorage";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const usage = await getDriveUsage();

    return ok({
      usedBytes: usage.usedBytes,
      totalBytes: usage.totalBytes,
      percent: Number(usage.percent.toFixed(2)),
      level: usage.level,
      message: usage.message,
      thresholds: {
        warningPercent: DRIVE_QUOTA_WARNING_PERCENT,
        criticalPercent: DRIVE_QUOTA_CRITICAL_PERCENT,
        quotaBytes: DRIVE_ACCOUNT_QUOTA_BYTES,
      },
      perClient: usage.perClient,
      alert:
        usage.level === "ok"
          ? null
          : {
              level: usage.level,
              percent: Number(usage.percent.toFixed(2)),
              message: usage.message,
            },
    });
  });
}
