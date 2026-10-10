import { NextResponse } from "next/server";
import { runAgencySelfPromotionWorkflow } from "@/lib/services/marketingAutoPublisher";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { theme, prompt, disciplineId } = body;

    const result = await runAgencySelfPromotionWorkflow({
      customTheme: theme,
      customPrompt: prompt,
      disciplineId,
    });

    return NextResponse.json({
      success: true,
      runId: result.runId,
      message: result.message,
      concept: result.concept,
      imagePost: result.imagePost,
      videoReel: result.videoReel,
      n8nStatus: result.n8nStatus,
      n8nResponse: result.n8nResponse,
    });
  } catch (error: any) {
    console.error("[Marketing Dispatch POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch marketing campaign" },
      { status: 500 }
    );
  }
}
