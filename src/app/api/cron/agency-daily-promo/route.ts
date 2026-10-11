/**
 * SUTRA STUDIO — Autonomous Daily Agency Self-Promotion Cron
 *
 * Runs daily to:
 * 1. Generate 1x 4K Master Post + 1x Commercial Motion Video Reel
 * 2. Dispatch to n8n master orchestrator (sutra-master-dispatch)
 * 3. Publish to Meta endpoints (Facebook Page 61594200943169 & Instagram @yashsutrastudio)
 * 4. Vault into Firestore marketing_publications & admin_deliverables
 */

import { NextResponse } from "next/server";
import { runAgencySelfPromotionWorkflow } from "@/lib/services/marketingAutoPublisher";
import { authorizeScheduledCall } from "@/lib/api/cronAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!(await authorizeScheduledCall(req))) {
      return NextResponse.json({ error: "Unauthorized cron trigger." }, { status: 401 });
    }

    const result = await runAgencySelfPromotionWorkflow();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      runId: result.runId,
      message: result.message,
      concept: result.concept,
      imagePost: result.imagePost,
      videoReel: result.videoReel,
      n8nStatus: result.n8nStatus,
    });
  } catch (error: any) {
    console.error("[Daily Agency Promo Cron GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute daily promo cron" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
