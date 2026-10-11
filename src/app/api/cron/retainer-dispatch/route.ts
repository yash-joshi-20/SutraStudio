/**
 * SUTRA STUDIO — Daily Multi-Client Retainer Cron Dispatcher
 *
 * Runs daily at 06:00 AM IST (via external cron or Render cron job):
 * - Loops over all active monthly client retainers in Cloud Firestore
 * - Synthesizes personalized daily drafts for each subscriber
 * - Routes drafts to Studio Admin review queue in Google Drive 02 Drafts
 */

import { NextResponse } from "next/server";
import { RetainerSchedulerService } from "@/lib/services/retainerScheduler";
import { authorizeScheduledCall } from "@/lib/api/cronAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!(await authorizeScheduledCall(req))) {
      return NextResponse.json({ error: "Unauthorized cron trigger." }, { status: 401 });
    }

    const report = await RetainerSchedulerService.runDailyRetainerCycle();

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("[Retainer Cron Dispatcher GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute retainer cycle" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
