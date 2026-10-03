/**
 * SUTRA STUDIO — Step 17 Notifications & Scheduled Automation Test Suite
 * Validates in-app notifications, idempotency, email provider, scheduled triggers, and date simulation.
 */

import { NotificationsStore } from "../src/lib/services/notificationsStore";
import { NotificationSettingsStore } from "../src/lib/services/notificationSettingsStore";
import { ScheduledNotificationEngine } from "../src/lib/services/scheduledNotificationEngine";
import { OrdersStore } from "../src/lib/services/ordersStore";
import { EmailService } from "../src/lib/services/emailProvider";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n================================================================================");
  console.log("🕉️ SUTRA STUDIO — STEP 17 NOTIFICATIONS & SCHEDULED AUTOMATION TEST SUITE");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // 1. In-App Notifications Collection & Idempotency
  // --------------------------------------------------------------------------
  console.log("--- 1. Testing In-App Notifications & Idempotency ---");
  const testKey = `test_remind_${Date.now()}`;
  const firstAdd = await NotificationsStore.addWithIdempotency({
    userId: "usr_mock_001",
    type: "order_placed",
    title: "Test Order Placement",
    message: "Your commission is verified.",
    orderId: "ord_test_001",
    orderNumber: "ORD-TEST-001",
    idempotencyKey: testKey,
  });

  assert(firstAdd.duplicate === false, "First notification with new idempotency key accepted");
  assert(!!firstAdd.notification, "Notification object created successfully");

  const secondAdd = await NotificationsStore.addWithIdempotency({
    userId: "usr_mock_001",
    type: "order_placed",
    title: "Test Order Placement Duplicate",
    message: "Your commission is verified duplicate.",
    orderId: "ord_test_001",
    orderNumber: "ORD-TEST-001",
    idempotencyKey: testKey,
  });

  assert(secondAdd.duplicate === true, "Second notification with same idempotency key rejected as duplicate");
  assert(secondAdd.notification === null, "Duplicate notification does not create duplicate record");

  // Read status and counts
  const unreadBefore = NotificationsStore.getUnreadCount("usr_mock_001");
  assert(unreadBefore > 0, `Unread count for usr_mock_001 is positive (Got: ${unreadBefore})`);

  if (firstAdd.notification) {
    const marked = NotificationsStore.markAsRead(firstAdd.notification.id, "usr_mock_001");
    assert(marked === true, "markAsRead marks specific notification as read");
  }

  const markedCount = NotificationsStore.markAllAsRead("usr_mock_001");
  const unreadAfter = NotificationsStore.getUnreadCount("usr_mock_001");
  assert(unreadAfter === 0, `markAllAsRead resets unread count to 0 (Marked ${markedCount})`);

  // --------------------------------------------------------------------------
  // 2. Email Provider Interface & Fallback
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Testing Email Provider & Templates ---");
  const emailRes = await EmailService.dispatchNotificationEmail({
    to: "client@sutrastudio.com",
    type: "order_delivered",
    title: "Your 3D Spatial Renders Are Ready",
    message: "Pass 02 color graded renders have been uploaded to your Google Drive Vault.",
    orderNumber: "ORD-2026-0001",
    actionUrl: "https://sutrastudio.com/orders",
    actionLabel: "Review in Vault",
  });

  assert(emailRes.success === true, "Email dispatch succeeds via EmailProvider");
  assert(emailRes.provider === "console" || emailRes.provider === "resend", `Active email provider identified (${emailRes.provider})`);

  // --------------------------------------------------------------------------
  // 3. Notification Settings & Thresholds Store
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Testing Notification Settings & Thresholds ---");
  const currentSettings = NotificationSettingsStore.getSettings();
  assert(currentSettings.draftReviewReminderDays === 3, "Default draft review reminder is 3 days");
  assert(currentSettings.unpaidReminderHours === 24, "Default unpaid reminder is 24 hours");
  assert(currentSettings.timezone === "Asia/Kolkata", "Default timezone is Asia/Kolkata");

  const updatedSettings = NotificationSettingsStore.updateSettings({
    draftReviewReminderDays: 4,
    dueDateWarningDays: 3,
  });
  assert(updatedSettings.draftReviewReminderDays === 4, "Updated draft review reminder to 4 days");
  assert(updatedSettings.dueDateWarningDays === 3, "Updated due date warning to 3 days");

  // Restore defaults
  NotificationSettingsStore.updateSettings({
    draftReviewReminderDays: 3,
    dueDateWarningDays: 2,
  });

  // --------------------------------------------------------------------------
  // 4. Scheduled Notification Engine & Time-Travel Simulation
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Testing Scheduled Notification Engine & Triggers ---");

  // Create mock orders for testing time-based scenarios
  const now = new Date();
  const testMonthlyOrder: any = {
    id: "ord_sched_monthly_001",
    code: "#ORD-SCHED-01",
    orderNumber: "ORD-SCHED-0001",
    title: "Creative Retainer Test",
    service: "Creative Growth Retainer",
    serviceName: "Creative Growth Retainer",
    type: "monthly",
    pricingType: "monthly",
    status: "active",
    totalAmount: 35000,
    totalPriceINR: 35000,
    clientId: "usr_sched_client_001",
    clientUid: "usr_sched_client_001",
    clientName: "Siddharth Verma",
    clientEmail: "siddharth@verma.in",
    createdAt: new Date(now.getTime() - 25 * 24 * 3600 * 1000).toISOString(),
    currentPeriodStart: new Date(now.getTime() - 25 * 24 * 3600 * 1000).toISOString(),
    currentPeriodEnd: new Date(now.getTime() + 4 * 24 * 3600 * 1000).toISOString(), // 4 days remaining (triggers 5-day warning)
  };

  const testTrialOrder: any = {
    id: "ord_sched_trial_002",
    code: "#ORD-SCHED-02",
    orderNumber: "ORD-SCHED-0002",
    title: "Spatial Pro Trial",
    service: "3D Spatial Pro",
    serviceName: "3D Spatial Pro",
    type: "monthly",
    pricingType: "monthly",
    status: "trial",
    totalAmount: 35000,
    totalPriceINR: 35000,
    clientId: "usr_sched_client_002",
    clientUid: "usr_sched_client_002",
    clientName: "Aarti Sengupta",
    clientEmail: "aarti@sengupta.design",
    createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
    trialEndDate: new Date(now.getTime() + 1 * 24 * 3600 * 1000).toISOString(), // 1 day remaining
  };

  const testDraftOrder: any = {
    id: "ord_sched_draft_003",
    code: "#ORD-SCHED-03",
    orderNumber: "ORD-SCHED-0003",
    title: "Brand Genesis Design",
    service: "Brand Identity",
    serviceName: "Brand Identity",
    type: "service",
    pricingType: "milestone",
    status: "draft_delivered",
    totalAmount: 9999,
    clientId: "usr_sched_client_003",
    clientUid: "usr_sched_client_003",
    clientName: "Vikram Sethi",
    clientEmail: "vikram@sethi.co",
    createdAt: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
    deliveredAt: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(), // Delivered 4 days ago (triggers 3d review reminder)
    statusHistory: [
      {
        status: "draft_delivered",
        timestamp: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(),
        note: "Draft vaulted",
      },
    ],
  };

  const testUnpaidOrder: any = {
    id: "ord_sched_unpaid_004",
    code: "#ORD-SCHED-04",
    orderNumber: "ORD-SCHED-0004",
    title: "Spatial Architecture Model",
    service: "3D Spatial Architecture",
    serviceName: "3D Spatial Architecture",
    type: "service",
    pricingType: "milestone",
    status: "pending_payment",
    totalAmount: 14999,
    clientId: "usr_sched_client_004",
    clientUid: "usr_sched_client_004",
    clientName: "Nikhil Joshi",
    clientEmail: "nikhil@joshi.in",
    createdAt: new Date(now.getTime() - 30 * 3600 * 1000).toISOString(), // 30 hours ago (triggers 24h unpaid reminder)
  };

  OrdersStore.add(testMonthlyOrder);
  OrdersStore.add(testTrialOrder);
  OrdersStore.add(testDraftOrder);
  OrdersStore.add(testUnpaidOrder);

  // Execute Scheduled Evaluation
  const jobResult = await ScheduledNotificationEngine.runDailyJob();
  assert(jobResult.success === true, "Scheduled evaluation run completed successfully");
  assert(jobResult.notificationsSent >= 4, `Dispatched time-based alerts (Sent: ${jobResult.notificationsSent})`);

  // Verify specific notifications
  const clientMonthlyNotifs = NotificationsStore.getAll("usr_sched_client_001");
  assert(
    clientMonthlyNotifs.some((n) => n.type === "monthly_expiring_5d"),
    "Monthly 5-day expiry notification dispatched to client"
  );

  const adminMonthlyNotifs = NotificationsStore.getAll("usr_admin_001");
  assert(
    adminMonthlyNotifs.some((n) => n.orderNumber === "ORD-SCHED-0001" && n.type === "monthly_expiring_5d"),
    "Monthly 5-day expiry alert dispatched to Studio Administrator"
  );

  const trialNotifs = NotificationsStore.getAll("usr_sched_client_002");
  assert(
    trialNotifs.some((n) => n.type === "trial_ending_1d"),
    "1-day trial ending warning dispatched to client"
  );

  const draftReviewNotifs = NotificationsStore.getAll("usr_sched_client_003");
  assert(
    draftReviewNotifs.some((n) => n.type === "draft_review_reminder"),
    "Draft review reminder dispatched after 3 days of no response"
  );

  const unpaidNotifs = NotificationsStore.getAll("usr_sched_client_004");
  assert(
    unpaidNotifs.some((n) => n.type === "unpaid_reminder"),
    "Unpaid commission reminder dispatched after 24 hours"
  );

  // --------------------------------------------------------------------------
  // 5. Time-Travel Date Simulation & Automatic Period Closure
  // --------------------------------------------------------------------------
  console.log("\n--- 5. Testing Date Simulation & Retainer Auto-Closure ---");
  const futureSimulateDate = new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString().split("T")[0]; // +10 days into future

  const futureJobResult = await ScheduledNotificationEngine.runDailyJob({
    simulateDate: futureSimulateDate,
    orderId: "ord_sched_monthly_001",
  });

  assert(futureJobResult.success === true, `Future simulation executed for ${futureSimulateDate}`);
  assert(futureJobResult.statusTransitions >= 1, "Expired monthly order automatically moved to 'expired' status");

  const closedOrder = OrdersStore.findById("ord_sched_monthly_001");
  assert(closedOrder?.status === "expired", "Order status officially updated to 'expired' upon period conclusion");

  const closedClientNotifs = NotificationsStore.getAll("usr_sched_client_001");
  assert(
    closedClientNotifs.some((n) => n.type === "monthly_expired"),
    "Closure notice dispatched to client with reactivation link"
  );

  // --------------------------------------------------------------------------
  // 6. Real-Time Event Notifications
  // --------------------------------------------------------------------------
  console.log("\n--- 6. Testing Real-Time Event Notification Triggers ---");

  // A. Status Transition Event
  OrdersStore.updateStatusWithValidation({
    orderId: "ord_sched_unpaid_004",
    newStatus: "paid",
    actorRole: "admin",
    note: "Settled via NEFT bank transfer",
  });

  // B. Draft Delivery Event
  OrdersStore.deliverOrder({
    orderId: "ord_sched_unpaid_004",
    deliverables: [
      {
        filename: "Master_Spatial_Model_v1.0.glb",
        fileSize: "82.4 MB",
        category: "draft",
      },
    ],
    deliveryNote: "Initial spatial model ready for client review",
  });

  const deliverNotifs = NotificationsStore.getAll("usr_sched_client_004");
  assert(
    deliverNotifs.some((n) => n.type === "order_delivered"),
    "Event notification dispatched immediately on draft delivery"
  );

  // C. Client Revision Request Event
  OrdersStore.clientReviewOrder({
    orderId: "ord_sched_unpaid_004",
    action: "revision",
    comment: "Please adjust daylight intensity and ceiling wooden ribs texture.",
  });

  const adminRevNotifs = NotificationsStore.getAll("usr_admin_001");
  assert(
    adminRevNotifs.some(
      (n) => n.orderNumber === "ORD-SCHED-0004" && n.type === "revision_requested"
    ),
    "Event notification dispatched immediately to admin on client revision request"
  );

  // D. Client Approval & Completion Event
  OrdersStore.clientReviewOrder({
    orderId: "ord_sched_unpaid_004",
    action: "approve",
    comment: "Flawless renders. 100% approved!",
  });

  const adminApproveNotifs = NotificationsStore.getAll("usr_admin_001");
  assert(
    adminApproveNotifs.some(
      (n) => n.orderNumber === "ORD-SCHED-0004" && n.type === "order_approved"
    ),
    "Event notification dispatched to admin on client final approval"
  );

  console.log("\n================================================================================");
  console.log(`🎉 STEP 17 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
