import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { CreativeJobStore } from "@/lib/creative-automation/jobStore";
import { JobStatus } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as JobStatus | null;
    const clientUid = url.searchParams.get("clientUid") || undefined;
    const jobId = url.searchParams.get("jobId");

    if (jobId) {
      const job = await CreativeJobStore.getJobById(jobId);
      if (!job) return badRequest("Job not found.");
      const logs = await CreativeJobStore.getLogs(jobId);
      return ok({ job, logs });
    }

    const jobs = await CreativeJobStore.listJobs({
      status: status || undefined,
      clientUid,
    });

    return ok({
      jobs,
      totalCount: jobs.length,
      pendingApprovalCount: jobs.filter((j) => j.status === "paused_for_approval").length,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = await req.json().catch(() => ({}));
    const { action, jobId, stepIndex, approvalNotes, newJobParams, reason } = body;

    if (action === "create" && newJobParams) {
      const job = await CreativeJobStore.createJob(newJobParams);
      return ok({ message: "Creative job created.", job });
    }

    if (action === "execute_step" && jobId && typeof stepIndex === "number") {
      const result = await CreativeJobStore.executeStepRunner(
        jobId,
        stepIndex,
        admin.name || "Studio Administrator"
      );
      return ok({
        message: result.success ? "Step executed successfully." : "Step execution stopped or requires key.",
        ...result,
      });
    }

    if (action === "retry" && jobId && typeof stepIndex === "number") {
      const job = await CreativeJobStore.retryStep(jobId, stepIndex);
      return ok({ message: "Step reset for retry.", job });
    }

    if (action === "cancel" && jobId) {
      const job = await CreativeJobStore.cancelJob(jobId, reason || "Cancelled by Administrator");
      return ok({ message: "Job cancelled.", job });
    }

    if (action === "approve" && jobId) {
      const job = await CreativeJobStore.getJobById(jobId);
      if (!job) return badRequest("Job not found.");
      const stepIdx = stepIndex || job.currentStepIndex;
      const updated = await CreativeJobStore.advanceStep(
        jobId,
        stepIdx,
        { approved: true, notes: approvalNotes || "Approved by Administrator" },
        0,
        admin.name || "Studio Administrator"
      );
      return ok({ message: "Job approved and advanced to next step.", job: updated });
    }

    if (action === "reject" && jobId) {
      const stepIdx = stepIndex || 1;
      const failed = await CreativeJobStore.failStep(
        jobId,
        stepIdx,
        approvalNotes || "Revision requested by Administrator",
        admin.name || "Studio Administrator"
      );
      return ok({ message: "Step marked with revision request.", job: failed });
    }

    return badRequest("Invalid action specified.");
  });
}

