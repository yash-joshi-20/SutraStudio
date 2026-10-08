/**
 * SUTRA STUDIO - Order Progress & n8n Workflow Progress Computation (Client & Admin Safe)
 *
 * Pure function that maps an order's status and n8n autonomous workflow execution onto:
 * - A percentage (0% to 100%)
 * - A stage label and category
 * - Live step-by-step breakdown of active n8n workflows (W1, W2, W3, W5)
 *
 * No imports on purpose: this module is rendered in client components, so it
 * must stay free of firebase-admin, route handlers and in-memory stores.
 */

export interface OrderProgressInfo {
  percentage: number;
  stageName: string;
  stageLabel: string;
  isComplete: boolean;
  statusCategory: "active" | "review" | "completed" | "paused" | "cancelled" | "payment";
  daysRemaining?: number;
  periodSummary?: string;
}

export function computeOrderProgress(order: any): OrderProgressInfo {
  if (order.type === "monthly_plan") {
    const isClosed =
      (order.status as string) === "closed" ||
      (order.status as string) === "expired" ||
      order.subscriptionStatus === "cancelled" ||
      order.subscriptionStatus === "expired" ||
      order.subscriptionStatus === "closed";

    if (isClosed) {
      return {
        percentage: 100,
        stageName: "Period Closed",
        stageLabel: "Monthly Cycle Concluded",
        isComplete: true,
        statusCategory: "completed",
        periodSummary: "Billing cycle concluded",
      };
    }

    if (order.subscriptionStatus === "trial") {
      const trialEnd = order.trialEndsAt ? new Date(order.trialEndsAt) : null;
      const now = new Date();
      let daysLeft = 3;
      if (trialEnd) {
        daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
      return {
        percentage: Math.min(100, Math.max(20, Math.round(((3 - daysLeft) / 3) * 100))),
        stageName: "3-Day Free Trial",
        stageLabel: `${daysLeft} day(s) left in trial authorization`,
        isComplete: false,
        statusCategory: "active",
        daysRemaining: daysLeft,
        periodSummary: `Trial ends ${trialEnd ? trialEnd.toLocaleDateString("en-IN") : "in 3 days"}`,
      };
    }

    // Active Monthly Retainer Cycle
    const start = order.currentPeriodStart
      ? new Date(order.currentPeriodStart)
      : order.paidAt
      ? new Date(order.paidAt)
      : new Date(order.createdAt);
    const end = order.currentPeriodEnd
      ? new Date(order.currentPeriodEnd)
      : order.nextBillingDate
      ? new Date(order.nextBillingDate)
      : new Date(start.getTime() + 30 * 24 * 3600 * 1000);
    const now = new Date();
    const totalDuration = Math.max(1, end.getTime() - start.getTime());
    const elapsed = Math.max(0, now.getTime() - start.getTime());
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const timeProgress = Math.min(100, Math.max(15, Math.round((elapsed / totalDuration) * 100)));

    return {
      percentage: timeProgress,
      stageName: "Active Studio Retainer",
      stageLabel: `${daysLeft} days remaining in current period`,
      isComplete: false,
      statusCategory: "active",
      daysRemaining: daysLeft,
      periodSummary: `Cycle: ${start.toLocaleDateString("en-IN")} – ${end.toLocaleDateString("en-IN")}`,
    };
  }

  // Individual Service Lifecycle Progress
  switch (order.status) {
    case "pending_payment":
    case "pending":
      return {
        percentage: 10,
        stageName: "Order Placed",
        stageLabel: "Order Placed — Awaiting Payment Settlement",
        isComplete: false,
        statusCategory: "payment",
      };

    case "paid":
    case "confirmed":
      return {
        percentage: 20,
        stageName: "Payment Verified",
        stageLabel: "Payment Settled — In Studio Queue",
        isComplete: false,
        statusCategory: "active",
      };

    case "brief_review":
      return {
        percentage: 30,
        stageName: "Brief Reviewed",
        stageLabel: "Brief Reviewed & Creative Kickoff",
        isComplete: false,
        statusCategory: "active",
      };

    case "ai_generating":
    case "in_production":
      return {
        percentage: 60,
        stageName: "Visual Engineering Sprint in Progress",
        stageLabel: "Visual Engineering Sprint in Progress",
        isComplete: false,
        statusCategory: "active",
      };

    case "rendering":
      return {
        percentage: 70,
        stageName: "Visual Engineering Sprint in Progress",
        stageLabel: "Visual Engineering Sprint in Progress",
        isComplete: false,
        statusCategory: "active",
      };

    case "review":
    case "draft_delivered":
    case "awaiting_approval":
    case "delivered":
      return {
        percentage: 80,
        stageName: "Quality Assurance & Creative Review",
        stageLabel: "Quality Assurance & Creative Review",
        isComplete: false,
        statusCategory: "review",
      };

    case "revision_requested":
      return {
        percentage: 90,
        stageName: `Revision Pass 0${order.revisionRound || 1}`,
        stageLabel: `Revision in Progress (Round ${order.revisionRound || 1} of ${order.maxRevisions || 2})`,
        isComplete: false,
        statusCategory: "active",
      };

    case "approved":
      return {
        percentage: 100,
        stageName: "Approved",
        stageLabel: "Deliverables Approved by Client",
        isComplete: true,
        statusCategory: "completed",
      };

    case "completed":
      return {
        percentage: 100,
        stageName: "Delivered to Sutra Cloud Vault",
        stageLabel: "Delivered to Sutra Cloud Vault",
        isComplete: true,
        statusCategory: "completed",
      };

    case "on_hold":
      return {
        percentage: 45,
        stageName: "On Hold",
        stageLabel: "Production Temporarily Paused",
        isComplete: false,
        statusCategory: "paused",
      };

    case "cancelled":
      return {
        percentage: 0,
        stageName: "Cancelled",
        stageLabel: "Order Cancelled",
        isComplete: true,
        statusCategory: "cancelled",
      };

    case "refunded":
      return {
        percentage: 0,
        stageName: "Refunded",
        stageLabel: "Payment Refunded",
        isComplete: true,
        statusCategory: "cancelled",
      };

    default:
      return {
        percentage: 50,
        stageName: "In Progress",
        stageLabel: "In Progress",
        isComplete: false,
        statusCategory: "active",
      };
  }
}

export interface N8nWorkflowStage {
  id: string;
  name: string;
  description: string;
  percentage: number;
  isPassed: boolean;
  isCurrent: boolean;
}

export interface N8nWorkflowProgressInfo {
  workflowId: string;
  workflowName: string;
  shortCode: string;
  percentage: number;
  currentStepLabel: string;
  statusBadge: "queued" | "running" | "draft_ready" | "completed" | "generation_failed" | "published" | "idle";
  stages: N8nWorkflowStage[];
  runId?: string;
  lastDispatchedAt?: string;
  deliverablesCount: number;
}

export function computeN8nWorkflowProgress(order?: any, workflowIdOverride?: string): N8nWorkflowProgressInfo {
  const wfId =
    workflowIdOverride ||
    order?.workflowId ||
    "SUTRA_MASTER_RENDER_LOCAL_HYBRID";

  const wfStatus = order?.workflowStatus || "idle";
  const orderStatus = order?.status || "pending";
  const deliverablesCount = Array.isArray(order?.deliverables) ? order.deliverables.length : 0;
  const hasDrafts = deliverablesCount > 0 || orderStatus === "draft_delivered" || wfStatus === "draft_ready";

  let percentage = 0;
  let currentStepLabel = "Ready for execution";

  if (wfStatus === "generation_failed") {
    percentage = 35;
    currentStepLabel = "Pipeline Error — Admin intervention required";
  } else if (orderStatus === "completed" || wfStatus === "completed" || wfStatus === "published") {
    percentage = 100;
    currentStepLabel = "Workflow Pipeline Fully Executed (100%)";
  } else if (orderStatus === "approved") {
    percentage = 90;
    currentStepLabel = "Deliverables Approved — Ready for Meta Social Multi-Publishing";
  } else if (hasDrafts) {
    percentage = 80;
    currentStepLabel = "Draft Vaulted in Drive '02 Drafts' — Awaiting Studio Admin Review (80%)";
  } else if (wfStatus === "running" || orderStatus === "in_production") {
    percentage = 50;
    currentStepLabel = "Studio Proprietary Pipeline & Spatial Synthesis Active (50%)";
  } else if (wfStatus === "queued") {
    percentage = 20;
    currentStepLabel = "Queued in Studio Production Buffer & Mapped to Cloud Vault (20%)";
  } else {
    percentage = 10;
    currentStepLabel = "Order Intake & Payment Verified (10%)";
  }

  let workflowName = "Sutra Master Production Pipeline";
  let shortCode = "MASTER";
  let stages: N8nWorkflowStage[] = [];

  if (
    wfId === "SUTRA_MASTER_AUTONOMOUS_PIPELINE" ||
    wfId === "sutra-master-pipeline" ||
    wfId === "SUTRA_MASTER_RENDER_LOCAL_HYBRID" ||
    wfId === "sutra-master-dispatch" ||
    !wfId
  ) {
    workflowName = "Sutra Master Creative & Software Pipeline";
    shortCode = "MASTER";
    stages = [
      {
        id: "master_s1",
        name: "Context & Asset Ingestion",
        description: "Ingest client requirements, brief, and reference brand assets",
        percentage: 10,
        isPassed: percentage >= 10,
        isCurrent: percentage > 0 && percentage < 25,
      },
      {
        id: "master_s2",
        name: "Computational Market & Visual Analysis",
        description: "Design system research, trend intelligence & technical blueprinting",
        percentage: 25,
        isPassed: percentage >= 25,
        isCurrent: percentage >= 25 && percentage < 50,
      },
      {
        id: "master_s3",
        name: "High-Definition Visual & Spatial Synthesis",
        description: "4K Photorealistic renders, commercial motion suites & 3D spatial models",
        percentage: 50,
        isPassed: percentage >= 50,
        isCurrent: percentage >= 50 && percentage < 80,
      },
      {
        id: "master_s4",
        name: "Google Drive Cloud Vaulting",
        description: "Upload draft files into /DELIVERABLES/02_DRAFTS with SHA-256",
        percentage: 80,
        isPassed: percentage >= 80,
        isCurrent: percentage >= 80 && percentage < 100,
      },
      {
        id: "master_s5",
        name: "Studio Admin Quality Review Gate",
        description: "Lead Producer inspects quality, approves, and releases to client",
        percentage: 100,
        isPassed: percentage >= 100,
        isCurrent: percentage >= 100,
      },
    ];
  } else if (wfId === "W2_approval_and_publish") {
    workflowName = "W2: Client Approval & Social Media Multi-Publisher";
    shortCode = "W2";
    stages = [
      {
        id: "w2_s1",
        name: "Client Approval Check",
        description: "Verify client approval in Firestore",
        percentage: 25,
        isPassed: percentage >= 25,
        isCurrent: percentage > 0 && percentage < 50,
      },
      {
        id: "w2_s2",
        name: "Meta Container Creation",
        description: "Initialize Instagram Graph container & upload media",
        percentage: 50,
        isPassed: percentage >= 50,
        isCurrent: percentage >= 50 && percentage < 75,
      },
      {
        id: "w2_s3",
        name: "Multi-Feed Publishing",
        description: "Publish to connected Instagram & Facebook accounts",
        percentage: 75,
        isPassed: percentage >= 75,
        isCurrent: percentage >= 75 && percentage < 100,
      },
      {
        id: "w2_s4",
        name: "Live Verification & Client Alert",
        description: "Record audit log and dispatch notification",
        percentage: 100,
        isPassed: percentage >= 100,
        isCurrent: percentage >= 100,
      },
    ];
  } else if (wfId === "W3_monthly_plan_content") {
    workflowName = "W3: Monthly Retainer Automated Calendar Generator";
    shortCode = "W3";
    stages = [
      {
        id: "w3_s1",
        name: "Subscription & Trial Audit",
        description: "Fetch active retainer quotas & client brief history",
        percentage: 20,
        isPassed: percentage >= 20,
        isCurrent: percentage > 0 && percentage < 40,
      },
      {
        id: "w3_s2",
        name: "Editorial Content Matrix",
        description: "Generate 15-post multi-format calendar & captions",
        percentage: 45,
        isPassed: percentage >= 45,
        isCurrent: percentage >= 40 && percentage < 70,
      },
      {
        id: "w3_s3",
        name: "Sprint 1 Vault Staging",
        description: "Package creative visual batches into Drive '02 Drafts'",
        percentage: 70,
        isPassed: percentage >= 70,
        isCurrent: percentage >= 70 && percentage < 85,
      },
      {
        id: "w3_s4",
        name: "Admin Review Gate",
        description: "Admin inspects & verifies sprint deliverables",
        percentage: 85,
        isPassed: percentage >= 85,
        isCurrent: percentage >= 85 && percentage < 100,
      },
      {
        id: "w3_s5",
        name: "Client Sprint Release",
        description: "Live deliverables synced to client retainer vault",
        percentage: 100,
        isPassed: percentage >= 100,
        isCurrent: percentage >= 100,
      },
    ];
  } else if (wfId === "W5_agency_daily_autopost") {
    workflowName = "W5: Agency Daily Automated Social Publisher";
    shortCode = "W5";
    stages = [
      {
        id: "w5_s1",
        name: "Showcase Synthesis",
        description: "Generate daily Studio artwork & editorial copy",
        percentage: 30,
        isPassed: percentage >= 30,
        isCurrent: percentage > 0 && percentage < 60,
      },
      {
        id: "w5_s2",
        name: "Admin Vault Draft Gate",
        description: "Store in Admin showcase vault for pre-publish check",
        percentage: 70,
        isPassed: percentage >= 70,
        isCurrent: percentage >= 60 && percentage < 90,
      },
      {
        id: "w5_s3",
        name: "Scheduled Broadcast",
        description: "Publish live on Sutra Studio official channels",
        percentage: 100,
        isPassed: percentage >= 100,
        isCurrent: percentage >= 90,
      },
    ];
  } else {
    // Default W1: Order Fulfillment Router
    stages = [
      {
        id: "w1_s1",
        name: "Intake & Drive Mapping",
        description: "Verify payment and map 4 Google Drive subfolders",
        percentage: 20,
        isPassed: percentage >= 20,
        isCurrent: percentage > 0 && percentage < 40,
      },
      {
        id: "w1_s2",
        name: "Spatial & Visual Synthesis",
        description: "High-precision 3D and cinematic asset rendering sprint",
        percentage: 50,
        isPassed: percentage >= 50,
        isCurrent: percentage >= 40 && percentage < 70,
      },
      {
        id: "w1_s3",
        name: "Drive Vault Packaging",
        description: "Compress & vault deliverables into Drive '02 Drafts'",
        percentage: 75,
        isPassed: percentage >= 75,
        isCurrent: percentage >= 70 && percentage < 85,
      },
      {
        id: "w1_s4",
        name: "Studio Admin Review Gate",
        description: "Draft ready for Admin quality check before release",
        percentage: 85,
        isPassed: percentage >= 85,
        isCurrent: percentage >= 85 && percentage < 100,
      },
      {
        id: "w1_s5",
        name: "Client Approval & Handoff",
        description: "Final delivery approved and moved to '03 Final Delivery'",
        percentage: 100,
        isPassed: percentage >= 100,
        isCurrent: percentage >= 100,
      },
    ];
  }

  return {
    workflowId: wfId,
    workflowName,
    shortCode,
    percentage,
    currentStepLabel,
    statusBadge: wfStatus as any,
    stages,
    runId: order?.workflowRunId,
    lastDispatchedAt: order?.workflowLastDispatchedAt,
    deliverablesCount,
  };
}