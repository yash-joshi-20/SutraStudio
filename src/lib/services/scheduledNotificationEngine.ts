/**
 * SUTRA STUDIO — Scheduled Automated Notification & Lifecycle Engine
 * Daily idempotent scheduler for Monthly Retainers, Trials, SLA Due Dates, and Draft Reviews.
 */

import { OrdersStore } from "./ordersStore";
import { NotificationsStore } from "./notificationsStore";
import { NotificationSettingsStore } from "./notificationSettingsStore";

export interface ScheduledJobResult {
  success: boolean;
  simulatedDate: string;
  evaluatedOrdersCount: number;
  notificationsSent: number;
  skippedDuplicates: number;
  statusTransitions: number;
  summary: Array<{
    orderId: string;
    orderNumber: string;
    type: string;
    action: string;
    recipient: string;
  }>;
}

export class ScheduledNotificationEngine {
  /**
   * Evaluates all orders against time-based triggers and dispatches idempotent notifications.
   * @param options.simulateDate - ISO string or YYYY-MM-DD to simulate a future/past date for testing.
   * @param options.dryRun - If true, evaluates without persisting state changes.
   */
  public static async runDailyJob(options?: {
    simulateDate?: string;
    dryRun?: boolean;
    orderId?: string;
  }): Promise<ScheduledJobResult> {
    const settings = NotificationSettingsStore.getSettings();
    const now = options?.simulateDate ? new Date(options.simulateDate) : new Date();
    const simulatedDateStr = now.toISOString();

    const allOrders = OrdersStore.getAll();
    const ordersToEvaluate = options?.orderId
      ? allOrders.filter((o) => o.id === options.orderId || o.orderNumber === options.orderId || (o as any).code === options.orderId)
      : allOrders;

    let notificationsSent = 0;
    let skippedDuplicates = 0;
    let statusTransitions = 0;
    const summary: ScheduledJobResult["summary"] = [];

    for (const rawOrder of ordersToEvaluate) {
      const o = rawOrder as any;
      const orderId: string = o.id || "";
      const orderNumber: string = o.orderNumber || o.code || orderId;
      const serviceName: string = o.serviceName || o.service || "Studio Creative Commission";
      const clientUid: string = o.clientUid || o.clientId || "usr_mock_001";
      const clientEmail: string | undefined = o.clientEmail;
      const clientName: string = o.clientName || "Studio Client";

      const isMonthly =
        o.pricingType === "monthly" ||
        o.type === "monthly" ||
        o.type === "monthly_plan" ||
        o.status === "trial" ||
        o.status === "active";

      // ======================================================================
      // 1. MONTHLY ORDERS & 3-DAY TRIALS
      // ======================================================================
      if (isMonthly) {
        const periodEnd = o.currentPeriodEnd
          ? new Date(o.currentPeriodEnd)
          : o.trialEndDate || o.trialEndsAt
          ? new Date(o.trialEndDate || o.trialEndsAt)
          : new Date(new Date(o.createdAt || Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000);

        const periodEndStr = periodEnd.toISOString().split("T")[0];
        const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // A. Trial 1-Day Expiry Notice
        if (o.status === "trial") {
          if (daysRemaining <= 1 && daysRemaining >= 0) {
            const clientKey = `trial_ending_1d_${orderId}_${periodEndStr}`;
            const { duplicate: d1 } = await NotificationsStore.addWithIdempotency({
              userId: clientUid,
              type: "trial_ending_1d",
              title: "Free Trial Ending Tomorrow",
              message: `Your 3-day trial for ${serviceName} completes tomorrow. Auto-renewal of ₹${(o.totalPriceINR || o.totalAmount || 35000).toLocaleString("en-IN")}/mo will begin unless cancelled.`,
              orderId,
              orderNumber,
              actionUrl: "/orders",
              actionLabel: "Manage Trial",
              idempotencyKey: clientKey,
              recipientEmail: clientEmail,
            });

            if (!d1) {
              notificationsSent++;
              summary.push({
                orderId,
                orderNumber,
                type: "trial_ending_1d",
                action: "Dispatched 1-day trial warning to Client",
                recipient: clientEmail || clientUid,
              });
            } else {
              skippedDuplicates++;
            }
          }
        }

        // B. Active Monthly Retainer: 5-Day Expiry Notice
        if (o.status === "active" || o.status === "paid" || o.status === "in_production") {
          if (daysRemaining <= 5 && daysRemaining > 1) {
            const clientKey = `monthly_expiring_5d_client_${orderId}_${periodEndStr}`;
            const adminKey = `monthly_expiring_5d_admin_${orderId}_${periodEndStr}`;

            // Client Notification
            const { duplicate: dc } = await NotificationsStore.addWithIdempotency({
              userId: clientUid,
              type: "monthly_expiring_5d",
              title: "Monthly Retainer Expiring in 5 Days",
              message: `Your ${serviceName} cycle concludes on ${periodEnd.toLocaleDateString("en-IN")}. Renew today to reserve studio continuity.`,
              orderId,
              orderNumber,
              actionUrl: "/orders",
              actionLabel: "Renew Retainer",
              idempotencyKey: clientKey,
              recipientEmail: clientEmail,
            });

            // Admin Notification
            const { duplicate: da } = await NotificationsStore.addWithIdempotency({
              userId: "usr_admin_001",
              type: "monthly_expiring_5d",
              title: "Client Retainer Expiring in 5 Days",
              message: `${clientName} (${orderNumber}) retainer expires on ${periodEnd.toLocaleDateString("en-IN")}.`,
              orderId,
              orderNumber,
              actionUrl: "/admin",
              actionLabel: "View Order in Hub",
              idempotencyKey: adminKey,
            });

            if (!dc || !da) {
              notificationsSent += (!dc ? 1 : 0) + (!da ? 1 : 0);
              summary.push({
                orderId,
                orderNumber,
                type: "monthly_expiring_5d",
                action: "Dispatched 5-day expiry notices (Client + Admin)",
                recipient: "Client & Studio Admin",
              });
            } else {
              skippedDuplicates += 2;
            }
          }

          // C. Active Monthly Retainer: 1-Day Expiry Notice
          if (daysRemaining <= 1 && daysRemaining > 0) {
            const clientKey = `monthly_expiring_1d_client_${orderId}_${periodEndStr}`;
            const { duplicate } = await NotificationsStore.addWithIdempotency({
              userId: clientUid,
              type: "monthly_expiring_1d",
              title: "Urgent: Monthly Retainer Expires Tomorrow",
              message: `Your ${serviceName} cycle closes tomorrow. Immediate renewal recommended.`,
              orderId,
              orderNumber,
              actionUrl: "/orders",
              actionLabel: "Renew Now",
              idempotencyKey: clientKey,
              recipientEmail: clientEmail,
            });

            if (!duplicate) {
              notificationsSent++;
              summary.push({
                orderId,
                orderNumber,
                type: "monthly_expiring_1d",
                action: "Dispatched 1-day urgent expiry notice to Client",
                recipient: clientEmail || clientUid,
              });
            } else {
              skippedDuplicates++;
            }
          }

          // D. Period Ended without renewal -> Mark Closed / Expired
          if (daysRemaining <= 0) {
            const expiredKey = `monthly_closed_${orderId}_${periodEndStr}`;
            if (!NotificationsStore.hasIdempotencyKey(expiredKey)) {
              if (!options?.dryRun) {
                OrdersStore.updateStatusWithValidation({
                  orderId,
                  newStatus: "expired",
                  actorRole: "admin",
                  note: `Automated closure: Monthly cycle concluded on ${periodEndStr} without active renewal.`,
                });
                statusTransitions++;
              }

              // Notify Client
              await NotificationsStore.addWithIdempotency({
                userId: clientUid,
                type: "monthly_expired",
                title: "Monthly Retainer Concluded",
                message: `Your monthly subscription for ${serviceName} has closed. You can reactivate anytime from your portal.`,
                orderId,
                orderNumber,
                actionUrl: "/orders",
                actionLabel: "Reactivate Subscription",
                idempotencyKey: `client_${expiredKey}`,
                recipientEmail: clientEmail,
              });

              // Notify Admin
              await NotificationsStore.addWithIdempotency({
                userId: "usr_admin_001",
                type: "monthly_expired",
                title: "Client Monthly Plan Closed",
                message: `${clientName}'s monthly plan #${orderNumber} reached period end and is marked expired.`,
                orderId,
                orderNumber,
                actionUrl: "/admin",
                actionLabel: "Inspect Closed Plan",
                idempotencyKey: expiredKey,
              });

              notificationsSent += 2;
              summary.push({
                orderId,
                orderNumber,
                type: "monthly_expired",
                action: "Order closed/expired; notified Client and Admin",
                recipient: "Client & Studio Admin",
              });
            } else {
              skippedDuplicates++;
            }
          }
        }
      }

      // ======================================================================
      // 2. INDIVIDUAL MILESTONE ORDERS
      // ======================================================================
      if (!isMonthly && o.status !== "completed" && o.status !== "cancelled" && o.status !== "refunded") {
        // A. Draft Review Reminder (3 days no response)
        if (o.status === "draft_delivered") {
          const lastDeliveryHistory = [...(o.statusHistory || [])]
            .reverse()
            .find((h: any) => h.status === "draft_delivered");

          const deliveredAt: string = lastDeliveryHistory?.changedAt || lastDeliveryHistory?.timestamp || o.deliveredAt || o.updatedAt || o.createdAt || new Date().toISOString();
          const daysWaiting = Math.floor((now.getTime() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24));

          if (daysWaiting >= settings.draftReviewReminderDays) {
            const draftKey = `draft_review_reminder_${orderId}_${deliveredAt.split("T")[0]}`;
            const { duplicate } = await NotificationsStore.addWithIdempotency({
              userId: clientUid,
              type: "draft_review_reminder",
              title: "Draft Deliverables Awaiting Your Review",
              message: `Studio deliverables for #${orderNumber} have been in your review vault for ${daysWaiting} days. Please approve or submit revisions.`,
              orderId,
              orderNumber,
              actionUrl: "/orders",
              actionLabel: "Review Draft in Vault",
              idempotencyKey: draftKey,
              recipientEmail: clientEmail,
            });

            if (!duplicate) {
              notificationsSent++;
              summary.push({
                orderId,
                orderNumber,
                type: "draft_review_reminder",
                action: `Sent review nudge after ${daysWaiting} days`,
                recipient: clientEmail || clientUid,
              });
            } else {
              skippedDuplicates++;
            }
          }
        }

        // B. Unpaid 24h Reminder
        if (o.status === "pending_payment") {
          const createdAtStr: string = o.createdAt || new Date().toISOString();
          const hoursSinceCreated = Math.floor(
            (now.getTime() - new Date(createdAtStr).getTime()) / (1000 * 60 * 60)
          );

          if (hoursSinceCreated >= settings.unpaidReminderHours) {
            const unpaidKey = `unpaid_reminder_${orderId}_${createdAtStr.split("T")[0]}`;
            const { duplicate } = await NotificationsStore.addWithIdempotency({
              userId: clientUid,
              type: "unpaid_reminder",
              title: "Pending Payment for Studio Commission",
              message: `Order #${orderNumber} (${serviceName}) is confirmed and awaiting settlement to commence production.`,
              orderId,
              orderNumber,
              actionUrl: "/orders",
              actionLabel: "Pay via Razorpay",
              idempotencyKey: unpaidKey,
              recipientEmail: clientEmail,
            });

            if (!duplicate) {
              notificationsSent++;
              summary.push({
                orderId,
                orderNumber,
                type: "unpaid_reminder",
                action: "Sent 24h unpaid payment reminder",
                recipient: clientEmail || clientUid,
              });
            } else {
              skippedDuplicates++;
            }
          }
        }

        // C. SLA / Due Date Approaching & Overdue Alert for Admin
        const estimatedDays = o.estimatedDeliveryDays || 5;
        const baseDate = o.createdAt ? new Date(o.createdAt) : new Date();
        const dueDate = new Date(baseDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const dueDateStr = dueDate.toISOString().split("T")[0];

        if (daysUntilDue < 0) {
          // Overdue Alert
          const overdueKey = `order_overdue_${orderId}_${now.toISOString().split("T")[0]}`;
          const { duplicate } = await NotificationsStore.addWithIdempotency({
            userId: "usr_admin_001",
            type: "order_overdue",
            title: "🚨 Order SLA Overdue",
            message: `Order #${orderNumber} (${serviceName}) is overdue by ${Math.abs(daysUntilDue)} day(s). Expedite production.`,
            orderId,
            orderNumber,
            actionUrl: "/admin",
            actionLabel: "Open Order in Hub",
            idempotencyKey: overdueKey,
          });

          if (!duplicate) {
            notificationsSent++;
            summary.push({
              orderId,
              orderNumber,
              type: "order_overdue",
              action: `Admin alerted: Overdue by ${Math.abs(daysUntilDue)} days`,
              recipient: "Studio Admin",
            });
          } else {
            skippedDuplicates++;
          }
        } else if (daysUntilDue <= settings.dueDateWarningDays) {
          // Approaching SLA Alert
          const approachingKey = `order_due_warn_${orderId}_${dueDateStr}`;
          const { duplicate } = await NotificationsStore.addWithIdempotency({
            userId: "usr_admin_001",
            type: "order_due_warning",
            title: "Order Approaching Delivery Due Date",
            message: `Order #${orderNumber} is due in ${daysUntilDue} day(s) on ${dueDate.toLocaleDateString("en-IN")}.`,
            orderId,
            orderNumber,
            actionUrl: "/admin",
            actionLabel: "Review Production Status",
            idempotencyKey: approachingKey,
          });

          if (!duplicate) {
            notificationsSent++;
            summary.push({
              orderId,
              orderNumber,
              type: "order_due_warning",
              action: `Admin alerted: Due in ${daysUntilDue} days`,
              recipient: "Studio Admin",
            });
          } else {
            skippedDuplicates++;
          }
        }
      }
    }

    return {
      success: true,
      simulatedDate: simulatedDateStr,
      evaluatedOrdersCount: ordersToEvaluate.length,
      notificationsSent,
      skippedDuplicates,
      statusTransitions,
      summary,
    };
  }
}
