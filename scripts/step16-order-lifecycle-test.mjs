/**
 * STEP 16 — Comprehensive Order Lifecycle, 100% Progress Tracker & Approval Suite Test
 */

import { OrdersStore, computeOrderProgress, ALLOWED_STATUS_TRANSITIONS } from "../src/lib/services/ordersStore.js";

async function runStep16Tests() {
  console.log("================================================================================");
  console.log("🕉️ SUTRA STUDIO — STEP 16 FULL ORDER LIFECYCLE & 100% PROGRESS TEST SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Progress Percentage & Stage Mapping Across All Lifecycle Statuses
  // ---------------------------------------------------------------------------
  console.log("--- 1. Testing Stage-to-Percent Mapping & Progress Tracker ---");

  const testCases = [
    { status: "pending_payment", expectedPercent: 10, expectedStage: "Order Placed" },
    { status: "paid", expectedPercent: 20, expectedStage: "Payment Verified" },
    { status: "brief_review", expectedPercent: 30, expectedStage: "Brief Reviewed" },
    { status: "in_production", expectedPercent: 60, expectedStage: "In Production" },
    { status: "draft_delivered", expectedPercent: 80, expectedStage: "Draft Delivered" },
    { status: "revision_requested", expectedPercent: 90, expectedStage: "Revision Pass 01" },
    { status: "approved", expectedPercent: 100, expectedStage: "Approved", isComplete: true },
    { status: "completed", expectedPercent: 100, expectedStage: "Completed", isComplete: true },
    { status: "on_hold", expectedPercent: 45, expectedStage: "On Hold" },
    { status: "cancelled", expectedPercent: 0, expectedStage: "Cancelled", isComplete: true },
    { status: "refunded", expectedPercent: 0, expectedStage: "Refunded", isComplete: true },
  ];

  for (const tc of testCases) {
    const mockOrder = {
      id: "test_prog_01",
      code: "#TEST-PROG",
      status: tc.status,
      type: "service",
      revisionRound: 1,
      maxRevisions: 2,
    };
    const p = computeOrderProgress(mockOrder);
    assert(
      p.percentage === tc.expectedPercent,
      `Status '${tc.status}' computes exactly ${tc.expectedPercent}% (Got: ${p.percentage}%)`
    );
    assert(
      p.stageName === tc.expectedStage,
      `Status '${tc.status}' stage name matches '${tc.expectedStage}' (Got: '${p.stageName}')`
    );
    if (tc.isComplete) {
      assert(p.isComplete === true, `Status '${tc.status}' marked as isComplete: true`);
    }
  }

  // Monthly Retainer Cycle Progress
  const monthlyTrialOrder = {
    id: "test_m_01",
    type: "monthly_plan",
    subscriptionStatus: "trial",
    trialEndsAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
  };
  const trialProgress = computeOrderProgress(monthlyTrialOrder);
  assert(trialProgress.stageName === "3-Day Free Trial", "Monthly 3-Day Trial stage recognized");
  assert(trialProgress.daysRemaining !== undefined, "Monthly trial reports days remaining");

  // ---------------------------------------------------------------------------
  // TEST 2: Full Linear Lifecycle Progression (10% -> 100%)
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Testing End-to-End Linear Lifecycle Progression ---");

  const testOrder = {
    id: "ord_step16_demo",
    code: "#ORD-S16-001",
    orderNumber: "ORD-2026-S16001",
    title: "Heritage Courtyard 4K Spatial Visualization",
    service: "3D Spatial Architecture",
    type: "service",
    totalAmount: 18999,
    status: "pending_payment",
    statusLabel: "Order Placed",
    clientUid: "usr_client_step16",
    clientName: "Meera Singhania",
    clientEmail: "meera@atelier.com",
    driveFolderId: "drive_fld_step16",
    driveFolderPath: "Clients/Meera Singhania/ORD-S16-001-3D Spatial Architecture",
    revisionRound: 0,
    maxRevisions: 2,
    deliverables: [],
    internalNotes: [],
    comments: [],
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  OrdersStore.add(testOrder);

  // Step 2.1: Payment Settlement (10% -> 20%)
  OrdersStore.markAsPaid({
    orderId: testOrder.id,
    razorpayPaymentId: "pay_step16_test_001",
    amountPaid: 18999,
    source: "checkout",
  });
  let currentOrder = OrdersStore.findById(testOrder.id);
  assert(currentOrder.status === "paid", "Order transitioned to 'paid'");
  assert(computeOrderProgress(currentOrder).percentage === 20, "Progress at 'paid' is 20%");

  // Step 2.2: Brief Review & Kickoff by Admin (20% -> 30%)
  let res = OrdersStore.updateStatusWithValidation({
    orderId: testOrder.id,
    newStatus: "brief_review",
    actorRole: "admin",
    actorName: "Raghavan Sharma (Lead Producer)",
    note: "Client architectural blueprint verified. Geometry mesh kickoff.",
  });
  assert(res.success === true, "Admin successfully moved order to 'brief_review'");
  currentOrder = OrdersStore.findById(testOrder.id);
  assert(computeOrderProgress(currentOrder).percentage === 30, "Progress at 'brief_review' is 30%");

  // Step 2.3: Production Started & Team Assignment (30% -> 60%)
  OrdersStore.update(testOrder.id, {
    assignedTo: { id: "tm_002", name: "Priya Mehta", role: "Senior 3D Visualizer", assignedAt: new Date().toISOString() },
  });
  res = OrdersStore.updateStatusWithValidation({
    orderId: testOrder.id,
    newStatus: "in_production",
    actorRole: "admin",
    actorName: "Raghavan Sharma",
    note: "Assigned to Priya Mehta. Blender 4K render pipeline active.",
  });
  assert(res.success === true, "Order transitioned to 'in_production'");
  currentOrder = OrdersStore.findById(testOrder.id);
  assert(currentOrder.assignedTo.name === "Priya Mehta", "Team specialist successfully assigned");
  assert(computeOrderProgress(currentOrder).percentage === 60, "Progress at 'in_production' is 60%");

  // Step 2.4: Admin Delivers Draft Deliverable v1.0 (60% -> 80%)
  res = OrdersStore.deliverOrder({
    orderId: testOrder.id,
    deliverables: [
      {
        filename: "Courtyard_Spatial_Render_Pass_01.zip",
        previewUrl: "https://drive.google.com/file/d/demo1",
        fileSize: "142 MB",
        version: "v1.0",
        category: "drafts",
      },
    ],
    deliveryNote: "Initial 4K render bake ready for client inspection.",
    isFinal: false,
    adminName: "Priya Mehta",
  });
  assert(res.success === true, "Draft delivered via OrdersStore.deliverOrder");
  currentOrder = OrdersStore.findById(testOrder.id);
  assert(currentOrder.status === "draft_delivered", "Status updated to 'draft_delivered'");
  assert(currentOrder.deliverables.length === 1, "Deliverable v1.0 recorded in deliverables list");
  assert(computeOrderProgress(currentOrder).percentage === 80, "Progress at 'draft_delivered' is 80%");

  // Step 2.5: Client Requests Revision Round 1 (80% -> 90%)
  res = OrdersStore.clientReviewOrder({
    orderId: testOrder.id,
    action: "revision",
    comment: "Please warm up the terracotta archway lighting and add teak bench textures.",
    clientName: "Meera Singhania",
  });
  assert(res.success === true, "Client revision request submitted");
  currentOrder = OrdersStore.findById(testOrder.id);
  assert(currentOrder.status === "revision_requested", "Status updated to 'revision_requested'");
  assert(currentOrder.revisionRound === 1, "Revision round incremented to 1");
  assert(computeOrderProgress(currentOrder).percentage === 90, "Progress at 'revision_requested' is 90%");

  // Step 2.6: Admin Re-Delivers Revised Deliverable v2.0
  res = OrdersStore.deliverOrder({
    orderId: testOrder.id,
    deliverables: [
      {
        filename: "Courtyard_Spatial_Render_Pass_02_Revised.zip",
        previewUrl: "https://drive.google.com/file/d/demo2",
        fileSize: "145 MB",
        version: "v2.0",
        category: "revisions",
      },
    ],
    deliveryNote: "Warm terracotta lighting pass baked and uploaded to 04 Revisions.",
    isFinal: true,
    adminName: "Priya Mehta",
  });
  assert(res.success === true, "Revised deliverable v2.0 uploaded");

  // Step 2.7: Client Approves Final Delivery -> 100% Completed!
  res = OrdersStore.clientReviewOrder({
    orderId: testOrder.id,
    action: "approve",
    comment: "Perfect lighting bakes! Everything matches the luxury architectural brief.",
    clientName: "Meera Singhania",
  });
  assert(res.success === true, "Client successfully approved deliverables");
  currentOrder = OrdersStore.findById(testOrder.id);
  assert(currentOrder.status === "completed", "Order status officially moved to 'completed'");
  const finalProg = computeOrderProgress(currentOrder);
  assert(finalProg.percentage === 100, "Progress tracker reaches exactly 100%!");
  assert(finalProg.stageName === "Completed", "Stage name displays 'Completed'");
  assert(finalProg.isComplete === true, "Order isComplete flag is true");

  // ---------------------------------------------------------------------------
  // TEST 3: Validation Guardrails & Illegal Transition Prevention
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Testing Status Validation & Security Guardrails ---");

  // Unpaid order cannot jump to completed or in_production directly
  const unpaidOrder = {
    id: "ord_unpaid_guard",
    code: "#ORD-UNPAID",
    status: "pending_payment",
    type: "service",
  };
  OrdersStore.add(unpaidOrder);

  let badTransition = OrdersStore.updateStatusWithValidation({
    orderId: unpaidOrder.id,
    newStatus: "in_production",
    actorRole: "client",
  });
  assert(badTransition.success === false, "Illegal transition from 'pending_payment' to 'in_production' rejected");

  let clientAdminGuard = OrdersStore.updateStatusWithValidation({
    orderId: testOrder.id,
    newStatus: "in_production",
    actorRole: "client",
  });
  assert(clientAdminGuard.success === false, "Client cannot execute admin-only production status transitions");

  // ---------------------------------------------------------------------------
  // TEST 4: Revision Limits & Overage Alerts
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Testing Revision Limits & Extra Revision Warnings ---");

  const limitedOrder = {
    id: "ord_rev_limit_test",
    code: "#ORD-REV-LIM",
    status: "draft_delivered",
    type: "service",
    revisionRound: 2,
    maxRevisions: 2,
  };
  OrdersStore.add(limitedOrder);

  const revOverage = OrdersStore.clientReviewOrder({
    orderId: limitedOrder.id,
    action: "revision",
    comment: "Extra revision after 2 included rounds.",
    clientName: "Meera",
  });
  assert(revOverage.limitReached === true, "System accurately flags revision overage (Round 3 of 2)");

  // ---------------------------------------------------------------------------
  // TEST 5: Private Internal Notes vs Client Discussion Thread Confidentiality
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Testing Discussion Comments & Private Internal Notes ---");

  // Add Client Message
  OrdersStore.addOrderComment({
    orderId: testOrder.id,
    sender: "client",
    authorName: "Meera Singhania",
    text: "Can we get high-res TIFF stills exported along with the ZIP?",
  });

  // Add Admin Message
  OrdersStore.addOrderComment({
    orderId: testOrder.id,
    sender: "admin",
    authorName: "Raghavan Sharma",
    text: "Namaste Meera, yes TIFF stills have been vaulted into 03 Final Delivery.",
  });

  // Add Private Internal Note (never visible to client)
  OrdersStore.addInternalNote({
    orderId: testOrder.id,
    author: "Raghavan Sharma (Supervisor)",
    text: "INTERNAL: Priority client commission. Ensure 16-bit uncompressed color depth on TIFFs.",
  });

  const inspected = OrdersStore.findById(testOrder.id);
  assert(inspected.comments.length >= 2, "Both client and admin comments recorded in discussion thread");
  assert(inspected.internalNotes.length >= 1, "Private supervisor note recorded securely in internalNotes");
  assert(
    inspected.internalNotes[0].text.includes("16-bit uncompressed"),
    "Internal note content preserved"
  );

  console.log("\n================================================================================");
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep16Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
