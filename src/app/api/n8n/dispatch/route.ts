import { NextResponse } from "next/server";
import { N8nAutomationService, N8nWorkflowPayload } from "@/lib/services/n8nService";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as N8nWorkflowPayload;

    if (!payload.workflowId) {
      return NextResponse.json(
        { error: "Missing required workflowId in request payload." },
        { status: 400 }
      );
    }

    const result = await N8nAutomationService.dispatchWorkflow(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to dispatch n8n automation pipeline.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
