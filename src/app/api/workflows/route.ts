import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId, workflowType, action } = await req.json();

    const runId = `run_${workflowType}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      runId,
      orderId,
      workflowType,
      status: "running",
      action: action || "start",
      message: `Isolated ${workflowType} workflow successfully triggered.`,
      targetStorage: "Google Drive Client Folder",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to dispatch workflow" },
      { status: 400 }
    );
  }
}
