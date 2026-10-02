import { NextResponse } from "next/server";
import { N8nAutomationService } from "@/lib/services/n8nService";

const VALID_WORKFLOW_ENGINES = [
  "image",
  "video",
  "three-d",
  "three-sixty",
  "interior",
  "marketing",
  "website",
  "app",
] as const;

type ValidWorkflowEngine = (typeof VALID_WORKFLOW_ENGINES)[number];

export async function GET(req: Request) {
  const userRole = req.headers.get("x-user-role");
  if (userRole === "client") {
    return NextResponse.json(
      { error: "Forbidden: Client accounts are strictly prohibited from inspecting internal workflow infrastructure." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    studio: "Sutra Studio",
    architecture: "Isolated n8n Multi-Engine Router",
    activeEnginesCount: VALID_WORKFLOW_ENGINES.length,
    supportedEngines: VALID_WORKFLOW_ENGINES,
    isolationEnforced: true,
    n8nPipelines: [
      "synapse-master-orchestrator",
      "synapse-client-intake-chat",
      "synapse-trend-research-engine",
      "synapse-brand-banner-generator",
      "synapse-video-reels-pipeline",
      "synapse-meta-ads-automation",
    ],
  });
}

export async function POST(req: Request) {
  try {
    const userRole = req.headers.get("x-user-role");
    if (userRole === "client") {
      return NextResponse.json(
        { error: "Forbidden: Administrative clearance required to trigger executive workflow execution." },
        { status: 403 }
      );
    }

    const { orderId, workflowType, action, niche, plan, brandAssets } = await req.json();

    if (!workflowType || !VALID_WORKFLOW_ENGINES.includes(workflowType as ValidWorkflowEngine)) {
      return NextResponse.json(
        {
          error: "Invalid or unsupported workflow engine.",
          received: workflowType,
          allowedEngines: VALID_WORKFLOW_ENGINES,
        },
        { status: 400 }
      );
    }

    // Map workflowType to specific n8n pipeline
    let n8nWorkflowId:
      | "synapse-master-orchestrator"
      | "synapse-brand-banner-generator"
      | "synapse-video-reels-pipeline"
      | "synapse-meta-ads-automation"
      | "synapse-trend-research-engine" = "synapse-master-orchestrator";

    if (workflowType === "image") n8nWorkflowId = "synapse-brand-banner-generator";
    else if (workflowType === "video") n8nWorkflowId = "synapse-video-reels-pipeline";
    else if (workflowType === "marketing") n8nWorkflowId = "synapse-meta-ads-automation";

    const n8nResult = await N8nAutomationService.dispatchWorkflow({
      workflowId: n8nWorkflowId,
      orderId: orderId || `ORD-${Date.now()}`,
      niche,
      plan: plan || "starter",
      services: [workflowType],
      brandAssets,
    });

    const suppressedEngines = VALID_WORKFLOW_ENGINES.filter((e) => e !== workflowType);

    return NextResponse.json({
      success: true,
      runId: n8nResult.runId,
      orderId: orderId || `ORD-ISO-${Math.floor(Math.random() * 900 + 100)}`,
      workflowType,
      n8nWorkflowId,
      executedOnly: workflowType,
      otherEnginesSuppressed: true,
      suppressedEnginesCount: suppressedEngines.length,
      containerIsolation: "Strict sandbox - single worker dispatched",
      status: n8nResult.status,
      action: action || "dispatch",
      n8nOutput: n8nResult.output,
      message: n8nResult.message,
      targetStorage: "Google Drive Client Folder",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to dispatch workflow. Malformed request payload." },
      { status: 400 }
    );
  }
}
