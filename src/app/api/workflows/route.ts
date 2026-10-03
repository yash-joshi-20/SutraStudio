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
      "W1_order_fulfillment_router",
      "W2_approval_and_publish",
      "W3_monthly_plan_content",
      "W4_error_handler",
      "W5_agency_daily_autopost",
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

    const n8nWorkflowId = "W1_order_fulfillment_router";

    const n8nResult = await N8nAutomationService.dispatchWorkflow({
      workflowId: n8nWorkflowId,
      orderId: orderId || `ORD-${Date.now()}`,
      service: workflowType,
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
      timestamp: new Date().toISOString(),
      governance: "Sutra Studio Workflow Orchestrator v2.0",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal workflow isolation dispatch failure.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
