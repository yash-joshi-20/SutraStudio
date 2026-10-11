import { NextResponse } from "next/server";
import { OrderPipelineService } from "@/lib/services/orderPipeline";
import { assertAdminSession } from "@/lib/auth/requestRole";

/**
 * GET /api/admin/reports/channels
 * Returns complete attribution and performance breakdown across all 8 canonical channels:
 * new_order, chat, whatsapp, email, instagram, facebook, ad_campaign, referral
 */
export async function GET(req: Request) {
  const auth = await assertAdminSession(req);
  if (!auth.ok) return auth.response;

  try {
    const report = await OrderPipelineService.getChannelAttributionReport();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...report,
    });
  } catch (err: any) {
    console.error("[Reports/Channels] Error aggregating channel report:", err);
    return NextResponse.json(
      { error: "Failed to generate channel attribution report", details: err.message },
      { status: 500 }
    );
  }
}
