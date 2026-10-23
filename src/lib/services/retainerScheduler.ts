import { OrdersStore, type FirestoreOrderRecord } from "@/lib/services/ordersStore";
import { N8nAutomationService } from "@/lib/services/n8nService";
import { adminDb, isFirebaseAdminReady } from "@/lib/db";
import { NotificationsStore } from "@/lib/services/notificationsStore";

/**
 * SUTRA STUDIO — Multi-Client Retainer Scheduled Engine
 * Loops over all active monthly subscriptions from Firebase Firestore and
 * dispatches personalized daily content drafts for each client's brand.
 */

export interface RetainerClientJobResult {
  orderId: string;
  clientUid: string;
  clientName: string;
  brandName: string;
  niche: string;
  status: "dispatched" | "skipped" | "failed";
  runId?: string;
  message?: string;
}

export interface MultiClientRetainerRunReport {
  totalActiveSubscribers: number;
  processedCount: number;
  dispatchedCount: number;
  skippedCount: number;
  results: RetainerClientJobResult[];
  executedAt: string;
}

export class RetainerSchedulerService {
  /**
   * Fetches all active subscriptions and executes daily scheduled generation
   */
  public static async runDailyRetainerCycle(): Promise<MultiClientRetainerRunReport> {
    const executedAt = new Date().toISOString();
    const results: RetainerClientJobResult[] = [];

    // 1. Sync and fetch all orders
    let allOrders = await OrdersStore.syncFromFirestore(true);
    if (!allOrders || allOrders.length === 0) {
      allOrders = OrdersStore.getAll();
    }

    const now = new Date();

    // 2. Filter active subscriptions
    const activeSubscriptions = allOrders.filter((order) => {
      if (order.type !== "monthly_plan") return false;

      // Exclude cancelled, expired, closed, refunded
      const isDead =
        order.status === "cancelled" ||
        order.status === "refunded" ||
        order.status === "closed" ||
        order.status === "expired" ||
        order.subscriptionStatus === "cancelled" ||
        order.subscriptionStatus === "expired" ||
        order.subscriptionStatus === "closed";

      if (isDead) return false;

      // Check trial validity
      if (order.status === "trial" || order.subscriptionStatus === "trial") {
        if (order.trialEndsAt && new Date(order.trialEndsAt).getTime() < now.getTime()) {
          return false;
        }
      }

      // Check current billing period validity
      if (order.currentPeriodEnd && new Date(order.currentPeriodEnd).getTime() < now.getTime()) {
        return false;
      }

      return true;
    });

    let dispatchedCount = 0;
    let skippedCount = 0;

    // 3. Process each active client subscription
    for (const sub of activeSubscriptions) {
      const clientUid = sub.clientUid || sub.clientId || "";
      const clientName = sub.clientName || "Valued Studio Client";
      const brandName = (sub as any).brandName || sub.clientName || "Bespoke Atelier";
      const niche = (sub as any).niche || sub.service || "Luxury Architecture & Design";
      const driveFolderId = sub.driveFolderId;

      try {
        const dispatchRes = await N8nAutomationService.dispatchWorkflow({
          workflowId: "W3_monthly_plan_content",
          orderId: sub.id,
          clientId: clientUid,
          service: sub.service || "30-Day Content Atelier",
          niche: niche,
          brief: `Daily content generation for ${brandName} (${niche}). High-fidelity architectural render with editorial commentary.`,
          driveFolderId: driveFolderId,
          client: {
            name: clientName,
            email: sub.clientEmail || "client@sutrastudios.in",
            brandName: brandName,
          },
          isAdminDispatch: false,
        });

        dispatchedCount++;
        results.push({
          orderId: sub.id,
          clientUid,
          clientName,
          brandName,
          niche,
          status: "dispatched",
          runId: dispatchRes.runId,
          message: dispatchRes.message,
        });
      } catch (err: any) {
        skippedCount++;
        results.push({
          orderId: sub.id,
          clientUid,
          clientName,
          brandName,
          niche,
          status: "failed",
          message: err.message || "Failed to dispatch daily workflow",
        });
      }
    }

    // 4. Record summary notice for studio supervisor
    if (activeSubscriptions.length > 0) {
      try {
        NotificationsStore.add({
          userId: "admin",
          type: "status_update",
          title: `Daily Retainer Cycle Complete: ${dispatchedCount} Dispatches`,
          message: `Processed ${activeSubscriptions.length} active retainer subscriptions. ${dispatchedCount} pipelines running in queue; ${skippedCount} items paused.`,
          actionUrl: "/admin/orders",
        });
      } catch {
        // Non-blocking
      }
    }

    return {
      totalActiveSubscribers: activeSubscriptions.length,
      processedCount: activeSubscriptions.length,
      dispatchedCount,
      skippedCount,
      results,
      executedAt,
    };
  }
}
