/**
 * SUTRA STUDIO — Daily Scheduled Firebase Cloud Function (Asia/Kolkata)
 * Runs daily at 09:00 IST to process monthly renewals, trial expiries, SLA warnings, and review reminders.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Idempotent Daily Notification Scheduler
 * Scheduled for 09:00 AM IST daily (Asia/Kolkata)
 */
export const dailyOrderLifecycleNotifier = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "Asia/Kolkata",
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async (event) => {
    console.log("🕉️ [Sutra Studio] Running daily order lifecycle scheduled notifier...");
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    try {
      // 1. Fetch Notification Settings
      const settingsDoc = await db.collection("studio_config").doc("notifications").get();
      const settings = settingsDoc.exists
        ? settingsDoc.data()
        : {
            monthlyReminderDays: [5, 1],
            draftReviewReminderDays: 3,
            unpaidReminderHours: 24,
            dueDateWarningDays: 2,
            emailNotificationsEnabled: true,
            inAppNotificationsEnabled: true,
          };

      // 2. Fetch Active Orders
      const ordersSnapshot = await db
        .collection("orders")
        .where("status", "in", [
          "pending_payment",
          "paid",
          "brief_review",
          "in_production",
          "draft_delivered",
          "revision_requested",
          "trial",
          "active",
        ])
        .get();

      let notificationsDispatched = 0;
      let skippedDuplicates = 0;

      for (const doc of ordersSnapshot.docs) {
        const order = doc.data();
        const orderId = doc.id;
        const isMonthly =
          order.pricingType === "monthly" ||
          order.type === "monthly_plan" ||
          order.status === "trial" ||
          order.status === "active";

        // ====================================================================
        // MONTHLY RETAINER LIFECYCLE
        // ====================================================================
        if (isMonthly) {
          const periodEnd = order.currentPeriodEnd
            ? new Date(order.currentPeriodEnd)
            : order.trialEndDate
            ? new Date(order.trialEndDate)
            : new Date(now.getTime() + 30 * 24 * 3600 * 1000);

          const periodEndStr = periodEnd.toISOString().split("T")[0];
          const daysRemaining = Math.ceil(
            (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // 1. Trial Expiry (1-day)
          if (order.status === "trial" && daysRemaining <= 1 && daysRemaining >= 0) {
            const key = `trial_ending_1d_${orderId}_${periodEndStr}`;
            const exists = await hasIdempotencyKey(key);
            if (!exists) {
              await createNotification({
                userId: order.clientUid || order.clientId,
                type: "trial_ending_1d",
                title: "Free Trial Ending Tomorrow",
                message: `Your 3-day trial for ${order.service || "Monthly Retainer"} concludes tomorrow. Auto-renewal of ₹${(order.totalAmount || 35000).toLocaleString("en-IN")}/mo begins unless cancelled.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/orders",
                actionLabel: "Manage Subscription",
                idempotencyKey: key,
              });
              notificationsDispatched++;
            } else {
              skippedDuplicates++;
            }
          }

          // 2. Active Monthly (5-day Expiry Warning)
          if (order.status === "active" && daysRemaining <= 5 && daysRemaining > 1) {
            const clientKey = `monthly_expiring_5d_client_${orderId}_${periodEndStr}`;
            const adminKey = `monthly_expiring_5d_admin_${orderId}_${periodEndStr}`;

            if (!(await hasIdempotencyKey(clientKey))) {
              await createNotification({
                userId: order.clientUid || order.clientId,
                type: "monthly_expiring_5d",
                title: "Monthly Retainer Expiring in 5 Days",
                message: `Your ${order.service || "Monthly"} subscription cycle ends on ${periodEndStr}. Renew today to reserve studio continuity.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/orders",
                actionLabel: "Renew Retainer",
                idempotencyKey: clientKey,
              });
              notificationsDispatched++;
            }

            if (!(await hasIdempotencyKey(adminKey))) {
              await createNotification({
                userId: "usr_admin_001",
                type: "monthly_expiring_5d",
                title: "Client Retainer Expiring in 5 Days",
                message: `${order.clientName || "Client"} (${order.orderNumber}) retainer expires on ${periodEndStr}.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/admin",
                actionLabel: "View in Admin Hub",
                idempotencyKey: adminKey,
              });
              notificationsDispatched++;
            }
          }

          // 3. Active Monthly (1-day Expiry Warning)
          if (order.status === "active" && daysRemaining <= 1 && daysRemaining > 0) {
            const clientKey = `monthly_expiring_1d_client_${orderId}_${periodEndStr}`;
            if (!(await hasIdempotencyKey(clientKey))) {
              await createNotification({
                userId: order.clientUid || order.clientId,
                type: "monthly_expiring_1d",
                title: "Urgent: Monthly Retainer Expires Tomorrow",
                message: `Your ${order.service || "Monthly"} subscription closes tomorrow. Immediate renewal recommended.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/orders",
                actionLabel: "Renew Now",
                idempotencyKey: clientKey,
              });
              notificationsDispatched++;
            }
          }

          // 4. Period Ended Without Renewal -> Set status to expired / closed
          if (daysRemaining <= 0 && order.status !== "expired" && order.status !== "closed") {
            const expiredKey = `monthly_closed_${orderId}_${periodEndStr}`;
            if (!(await hasIdempotencyKey(expiredKey))) {
              await doc.ref.update({
                status: "expired",
                statusLabel: "Monthly Retainer Expired / Concluded",
                updatedAt: new Date().toISOString(),
              });

              // Client notification
              await createNotification({
                userId: order.clientUid || order.clientId,
                type: "monthly_expired",
                title: "Monthly Retainer Concluded",
                message: `Your monthly subscription for ${order.service || "Creative Retainer"} has closed. Renew anytime to reactivate studio production.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/orders",
                actionLabel: "Reactivate Subscription",
                idempotencyKey: `client_${expiredKey}`,
              });

              // Admin notification
              await createNotification({
                userId: "usr_admin_001",
                type: "monthly_expired",
                title: "Client Monthly Plan Closed",
                message: `${order.clientName || "Client"}'s monthly plan #${order.orderNumber} reached period end without active renewal and is marked expired.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/admin",
                actionLabel: "Inspect Closed Plan",
                idempotencyKey: expiredKey,
              });

              notificationsDispatched += 2;
            }
          }
        }

        // ====================================================================
        // INDIVIDUAL ORDERS
        // ====================================================================
        if (!isMonthly) {
          // Draft Review Reminder (3 days no client review)
          if (order.status === "draft_delivered") {
            const deliveredAt = order.deliveredAt || order.updatedAt || order.createdAt;
            const daysWaiting = Math.floor(
              (now.getTime() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysWaiting >= (settings.draftReviewReminderDays || 3)) {
              const draftKey = `draft_review_reminder_${orderId}_${deliveredAt.split("T")[0]}`;
              if (!(await hasIdempotencyKey(draftKey))) {
                await createNotification({
                  userId: order.clientUid || order.clientId,
                  type: "draft_review_reminder",
                  title: "Draft Deliverables Awaiting Your Review",
                  message: `Studio deliverables for #${order.orderNumber} have been in your review vault for ${daysWaiting} days. Please approve or submit revisions.`,
                  orderId,
                  orderNumber: order.orderNumber,
                  actionUrl: "/orders",
                  actionLabel: "Review Draft in Vault",
                  idempotencyKey: draftKey,
                });
                notificationsDispatched++;
              }
            }
          }

          // Due date & overdue checks
          const estDays = order.estimatedDeliveryDays || 5;
          const dueDate = new Date(
            new Date(order.createdAt).getTime() + estDays * 24 * 3600 * 1000
          );
          const daysUntilDue = Math.ceil(
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilDue < 0) {
            const overdueKey = `order_overdue_${orderId}_${todayStr}`;
            if (!(await hasIdempotencyKey(overdueKey))) {
              await createNotification({
                userId: "usr_admin_001",
                type: "order_overdue",
                title: "🚨 Order SLA Overdue",
                message: `Order #${order.orderNumber} is overdue by ${Math.abs(daysUntilDue)} day(s). Expedite production.`,
                orderId,
                orderNumber: order.orderNumber,
                actionUrl: "/admin",
                actionLabel: "Open Order in Hub",
                idempotencyKey: overdueKey,
              });
              notificationsDispatched++;
            }
          }
        }
      }

      console.log(
        `✅ [Sutra Studio] Daily scheduler completed: ${notificationsDispatched} dispatched, ${skippedDuplicates} duplicates skipped.`
      );
    } catch (err: any) {
      console.error("❌ [Sutra Studio] Error running daily scheduler:", err.message);
    }
  }
);

async function hasIdempotencyKey(key: string): Promise<boolean> {
  const snap = await db
    .collection("notifications")
    .where("idempotencyKey", "==", key)
    .limit(1)
    .get();
  return !snap.empty;
}

async function createNotification(data: any): Promise<void> {
  await db.collection("notifications").add({
    ...data,
    read: false,
    createdAt: new Date().toISOString(),
  });
}
