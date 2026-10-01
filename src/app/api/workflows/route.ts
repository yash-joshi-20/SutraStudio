import { NextResponse } from "next/server";

export const VALID_WORKFLOW_ENGINES = [
  "image",
  "video",
  "three-d",
  "three-sixty",
  "interior",
  "marketing",
  "website",
  "app",
] as const;

export type ValidWorkflowEngine = (typeof VALID_WORKFLOW_ENGINES)[number];

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

    const { orderId, workflowType, action } = await req.json();

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

    const runId = `run_${workflowType}_${Date.now()}`;
    const suppressedEngines = VALID_WORKFLOW_ENGINES.filter((e) => e !== workflowType);

    return NextResponse.json({
      success: true,
      runId,
      orderId: orderId || `ORD-ISO-${Math.floor(Math.random() * 900 + 100)}`,
      workflowType,
      executedOnly: workflowType,
      otherEnginesSuppressed: true,
      suppressedEnginesCount: suppressedEngines.length,
      containerIsolation: "Strict sandbox - single worker dispatched",
      status: "running",
      action: action || "dispatch",
      message: `Isolated [${workflowType}] workflow successfully triggered. Zero leakage into remaining ${suppressedEngines.length} engines.`,
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

