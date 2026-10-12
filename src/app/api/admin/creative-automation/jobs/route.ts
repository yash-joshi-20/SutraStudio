import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { createNewCreativeJob } from "@/lib/creative-automation/workflowEngine";
import { CreativeJob, StepExecutionStatus } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

// In-memory / initial job tracker for admin session demo & state
let IN_MEMORY_JOBS: CreativeJob[] = [
  createNewCreativeJob({
    brandId: "brand-sutra-flagship",
    clientUid: "admin-sutra-master",
    workflowId: "wf-standard-14-step",
    title: "Sutra Studio Autumn 2026 AI Automation Reel",
    category: "educational_reels",
    brief: {
      topic: "Autonomous Creative Automation",
      targetAudience: "Creative Agency Founders",
      keyMessage: "Deliver bespoke digital experiences in 48 hours without burning out.",
      tone: "luxury_atelier",
    },
  }),
];

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    return ok({
      jobs: IN_MEMORY_JOBS,
      totalCount: IN_MEMORY_JOBS.length,
      pendingApprovalCount: IN_MEMORY_JOBS.filter((j) => j.status === "paused_for_approval").length,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = await req.json().catch(() => ({}));
    const { action, jobId, stepIndex, approvalNotes, newJobParams } = body;

    if (action === "create" && newJobParams) {
      const job = createNewCreativeJob(newJobParams);
      IN_MEMORY_JOBS.unshift(job);
      return ok({ message: "Creative job created.", job });
    }

    if (action === "approve" && jobId) {
      const target = IN_MEMORY_JOBS.find((j) => j.id === jobId);
      if (!target) return badRequest("Job not found.");

      target.status = "in_progress";
      const step = target.steps.find((s) => s.stepIndex === (stepIndex || target.currentStepIndex));
      if (step) {
        step.status = "completed" as StepExecutionStatus;
        step.reviewedBy = admin.name || "Studio Administrator";
        step.approvalNotes = approvalNotes || "Approved by Administrator";
      }
      target.currentStepIndex = Math.min(target.steps.length, target.currentStepIndex + 1);
      target.updatedAt = new Date().toISOString();

      return ok({ message: "Job approved and advanced to next step.", job: target });
    }

    if (action === "reject" && jobId) {
      const target = IN_MEMORY_JOBS.find((j) => j.id === jobId);
      if (!target) return badRequest("Job not found.");

      target.status = "paused_for_approval";
      const step = target.steps.find((s) => s.stepIndex === (stepIndex || target.currentStepIndex));
      if (step) {
        step.status = "failed" as StepExecutionStatus;
        step.reviewedBy = admin.name || "Studio Administrator";
        step.approvalNotes = approvalNotes || "Revision requested";
      }
      target.updatedAt = new Date().toISOString();

      return ok({ message: "Revision requested on step.", job: target });
    }

    return badRequest("Invalid action specified.");
  });
}
