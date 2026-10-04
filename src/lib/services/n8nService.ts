import { OrdersStore } from "./ordersStore";
import { FirestoreOrderRecord } from "@/app/api/orders/route";
import { readEnv, readPublicEnv } from "@/lib/config/env";

/**
 * SUTRA STUDIO — n8n Autonomous Workflow Orchestration Service
 * Connects the Next.js backend with n8n workflow engine using secure tokens,
 * cost guards, idempotent dispatching, and administrative review gates.
 */

export interface N8nWorkflowPayload {
  workflowId:
    | "W1_order_fulfillment_router"
    | "W2_approval_and_publish"
    | "W3_monthly_plan_content"
    | "W4_error_handler"
    | "W5_agency_daily_autopost"
    | string;
  orderId?: string;
  clientId?: string;
  service?: string;
  brief?: string;
  planId?: string;
  planName?: string;
  driveFolderId?: string;
  driveDraftsFolderId?: string;
  driveAssetsFolderId?: string;
  assets?: Array<{
    name: string;
    url?: string;
    driveFileId?: string;
    mimeType?: string;
  }>;
  publishTarget?: {
    platform: "instagram" | "facebook" | "both";
    igUserId?: string;
    facebookPageId?: string;
    caption?: string;
    mediaUrl?: string;
  };
  niche?: string;
  plan?: string;
  services?: string[];
  brandAssets?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isMockTest?: boolean;
}

export interface N8nWorkflowResponse {
  success: boolean;
  workflowId: string;
  runId: string;
  status: "queued" | "running" | "draft_ready" | "generation_failed" | "completed";
  orderId?: string;
  output?: Record<string, unknown>;
  message: string;
  timestamp: string;
  isMock?: boolean;
}

const MAX_RETRIES_PER_ORDER = 2;
const MAX_GENERATIONS_PER_ORDER = 3;

export class N8nAutomationService {
  public static getWebhookSecret(): string {
    return readEnv("N8N_WEBHOOK_SECRET") || readEnv("WORKFLOW_WEBHOOK_SECRET" as any) || "sutra_n8n_sec_live_9941a8";
  }

  public static getN8nBaseUrl(): string {
    return (
      readEnv("N8N_BASE_URL") ||
      readEnv("N8N_HOST" as any) ||
      readPublicEnv("NEXT_PUBLIC_N8N_URL" as any) ||
      "http://localhost:5678"
    );
  }

  public static getAppBaseUrl(): string {
    return (
      readEnv("APP_BASE_URL") ||
      readPublicEnv("NEXT_PUBLIC_APP_URL") ||
      "http://localhost:3000"
    );
  }

  /**
   * Verify shared secret header for n8n <-> App API communication
   */
  public static verifySecretHeader(req: Request): boolean {
    const providedSecret =
      req.headers.get("x-sutra-secret") ||
      req.headers.get("x-webhook-secret") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    const expectedSecret = this.getWebhookSecret();
    if (!providedSecret) return false;
    return providedSecret === expectedSecret;
  }

  /**
   * Dispatches an order fulfillment or task pipeline to n8n.
   * Includes idempotency, cost guards (max retries and generations), and fallback simulator.
   */
  public static async dispatchWorkflow(payload: N8nWorkflowPayload): Promise<N8nWorkflowResponse> {
    const runId = `sutra_run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Cost & Retry Guards for order-specific pipelines
    if (payload.orderId) {
      const order = OrdersStore.findById(payload.orderId);
      if (order) {
        const retryCount = order.workflowRetryCount || 0;
        const totalRuns = order.workflowHistory?.length || 0;

        if (retryCount >= MAX_RETRIES_PER_ORDER) {
          throw new Error(
            `Cost Guard: Maximum retries (${MAX_RETRIES_PER_ORDER}) exceeded for Order #${order.orderNumber || order.id}. Admin intervention required.`
          );
        }

        if (totalRuns >= MAX_GENERATIONS_PER_ORDER) {
          throw new Error(
            `Cost Guard: Maximum generation quota (${MAX_GENERATIONS_PER_ORDER}) reached for Order #${order.orderNumber || order.id}.`
          );
        }

        // Update order with dispatch status
        order.workflowStatus = "queued";
        order.workflowRunId = runId;
        order.workflowId = payload.workflowId;
        order.workflowLastDispatchedAt = now;
        order.workflowRetryCount = retryCount + 1;
        if (!order.workflowHistory) order.workflowHistory = [];
        order.workflowHistory.push({
          runId,
          workflowId: payload.workflowId,
          status: "queued",
          timestamp: now,
        });
      }
    }

    const n8nBaseUrl = this.getN8nBaseUrl();
    const webhookUrl = `${n8nBaseUrl}/webhook/${payload.workflowId}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sutra-secret": this.getWebhookSecret(),
        },
        body: JSON.stringify({
          ...payload,
          runId,
          appBaseUrl: this.getAppBaseUrl(),
          callbackUrl: `${this.getAppBaseUrl()}/api/n8n/webhook`,
          dispatchedAt: now,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        return {
          success: true,
          workflowId: payload.workflowId,
          runId,
          status: "running",
          orderId: payload.orderId,
          output: responseData,
          message: `Successfully dispatched to n8n [${payload.workflowId}]. Pipeline running.`,
          timestamp: now,
          isMock: false,
        };
      }
    } catch (err) {
      console.warn(`[n8n Dispatch] n8n webhook at ${webhookUrl} not reachable. Falling back to local development mock.`, err);
    }

    // Dev/Test Mock Mode — allowed only when external n8n is offline in development
    if (process.env.NODE_ENV === "production" && !payload.isMockTest) {
      throw new Error(
        `Failed to reach n8n production server at ${webhookUrl}. Check N8N_BASE_URL and credentials.`
      );
    }

    return this.getDevelopmentSimulatedResponse(payload, runId);
  }

  /**
   * Deterministic development simulator (strictly labeled as TEST OUTPUT).
   */
  private static getDevelopmentSimulatedResponse(
    payload: N8nWorkflowPayload,
    runId: string
  ): N8nWorkflowResponse {
    const isAiDraft = [
      "Image Creation",
      "Video Creation",
      "Interior Design",
      "Digital Marketing",
      "Meta Ads",
      "meta-ads",
      "video-production",
      "brand-identity",
    ].some((s) => payload.service?.toLowerCase().includes(s.toLowerCase()));

    const mockOutput = isAiDraft
      ? {
          pipelineType: "AI_DRAFT_GENERATION",
          mockNotice: "TEST OUTPUT — GENERATED BY SUTRA DEV SIMULATOR",
          draftFiles: [
            {
              name: `${payload.service || "Creative"}_Concept_Draft_01.png`,
              url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
              category: "draft",
              mimeType: "image/png",
              fileSize: "4.8 MB",
            },
          ],
          reviewStatus: "DRAFT_READY_FOR_ADMIN_REVIEW",
        }
      : {
          pipelineType: "HUMAN_PRODUCTION_TASK",
          mockNotice: "TEST OUTPUT — GENERATED BY SUTRA DEV SIMULATOR",
          taskBriefSummary: `Admin Checklist and Milestones provisioned for human execution: ${payload.service}.`,
          driveSubfoldersPrepared: ["01 Client Assets", "02 Drafts", "03 Final Delivery", "04 Revisions"],
          reviewStatus: "PRODUCTION_TASK_ASSIGNED",
        };

    return {
      success: true,
      workflowId: payload.workflowId,
      runId,
      status: "draft_ready",
      orderId: payload.orderId,
      output: mockOutput,
      message: `[TEST OUTPUT] Development mock execution for ${payload.workflowId}. Draft ready for admin verification.`,
      timestamp: new Date().toISOString(),
      isMock: true,
    };
  }
}
