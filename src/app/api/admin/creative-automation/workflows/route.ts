import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { DEFAULT_WORKFLOW_DEFINITIONS, STANDARD_WORKFLOW_STEPS } from "@/lib/creative-automation/workflowEngine";
import { WorkflowDefinition } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    return ok({
      workflows: DEFAULT_WORKFLOW_DEFINITIONS,
      standardSteps: STANDARD_WORKFLOW_STEPS,
      totalCount: DEFAULT_WORKFLOW_DEFINITIONS.length,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Partial<WorkflowDefinition>;
    if (!body.name || !body.steps || !Array.isArray(body.steps)) {
      return badRequest("Missing workflow name or steps array.");
    }

    const newWorkflow: WorkflowDefinition = {
      id: body.id || `wf-custom-${Date.now().toString(36)}`,
      name: body.name,
      description: body.description || "",
      category: body.category || "educational_reels",
      isDefault: false,
      steps: body.steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ok({
      message: "Workflow definition saved.",
      workflow: newWorkflow,
    });
  });
}
