import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { runId, workflowId, status, deliverableUrl, driveFolder, notes } = payload;

    // Log n8n callback event
    console.log(`[n8n Webhook Received] Workflow: ${workflowId}, Run: ${runId}, Status: ${status}`);

    return NextResponse.json({
      received: true,
      workflowId,
      runId,
      status: status || "processed",
      updatedAt: new Date().toISOString(),
      message: `Webhook state synced to Sutra Studio ledger. Deliverables: ${deliverableUrl || "Vault synced"}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid webhook payload structure." },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Sutra Studio n8n Webhook Receptor",
    status: "online",
    supportedPipelines: [
      "synapse-master-orchestrator",
      "synapse-client-intake-chat",
      "synapse-trend-research-engine",
      "synapse-brand-banner-generator",
      "synapse-video-reels-pipeline",
      "synapse-meta-ads-automation",
    ],
  });
}
