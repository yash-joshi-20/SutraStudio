import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { DEFAULT_WORKFLOW_DEFINITIONS, STANDARD_WORKFLOW_STEPS } from "@/lib/creative-automation/workflowEngine";
import {
  MASTER_WORKFLOW_TEMPLATES,
  DYNAMIC_8_STEP_PIPELINE,
  duplicateWorkflowTemplate,
  validateDynamicStepDependencies,
} from "@/lib/creative-automation/dynamicWorkflowEngine";
import { WorkflowDefinition } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    return ok({
      workflows: DEFAULT_WORKFLOW_DEFINITIONS,
      masterTemplates: MASTER_WORKFLOW_TEMPLATES,
      dynamic8StepPipeline: DYNAMIC_8_STEP_PIPELINE,
      standardSteps: STANDARD_WORKFLOW_STEPS,
      totalCount: DEFAULT_WORKFLOW_DEFINITIONS.length + MASTER_WORKFLOW_TEMPLATES.length,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = await req.json().catch(() => ({}));
    const { action, sourceTemplateId, newName, workflow } = body;

    // Handle template duplication
    if (action === "duplicate" && sourceTemplateId) {
      const duplicated = duplicateWorkflowTemplate(sourceTemplateId, newName || "Duplicated Workflow");
      if (!duplicated) return badRequest(`Source template '${sourceTemplateId}' not found.`);
      return ok({
        message: "Workflow template duplicated.",
        workflow: duplicated,
      });
    }

    // Handle dependency validation
    if (action === "validate_step" && body.stepConfig) {
      const validation = validateDynamicStepDependencies(body.stepConfig, body.completedIndices || []);
      return ok({ validation });
    }

    // Standard workflow save
    const w = (workflow || body) as Partial<WorkflowDefinition>;
    if (!w.name || !w.steps || !Array.isArray(w.steps)) {
      return badRequest("Missing workflow name or steps array.");
    }

    const newWorkflow: WorkflowDefinition = {
      id: w.id || `wf-custom-${Date.now().toString(36)}`,
      name: w.name,
      description: w.description || "",
      category: w.category || "cinematic_video",
      isDefault: false,
      steps: w.steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ok({
      message: "Workflow definition saved.",
      workflow: newWorkflow,
    });
  });
}

