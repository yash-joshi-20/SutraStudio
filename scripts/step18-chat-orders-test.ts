/**
 * SUTRA STUDIO — Step 18 AI Chat Automated Validation Suite
 * Tests all 11 backend chat tools, brief schema intake, explicit confirmation gates,
 * conversational order placement, live progress queries, revision/approval workflows, and security guardrails.
 */

import { ChatToolsService } from "../src/lib/services/chatTools";
import { OrdersStore } from "../src/lib/services/ordersStore";
import { SEED_CATALOG_SERVICES, SEED_CATALOG_PLANS } from "../src/lib/services/serviceCatalog";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function runStep18Tests() {
  console.log("===============================================================================");
  console.log("SUTRA STUDIO — STEP 18 AI CONVERSATIONAL ORDER & CHAT TOOLS TEST SUITE");
  console.log("===============================================================================\n");

  const testClientUid = "usr_client_step18";
  const testClientName = "Vikram Aditya";
  const testClientEmail = "vikram@adityarealms.com";

  // SECTION 1: Catalog & Plan Query Tools
  console.log("--- Section 1: Catalog & Plan Query Tools ---");

  // Tool 1: list_services
  const services = await ChatToolsService.listServices();
  assert(Array.isArray(services) && services.length >= 6, "Tool 1 (list_services) returns catalog services");
  const firstService = services[0];
  assert(
    typeof firstService.startingPriceINR === "number" && firstService.startingPriceINR > 0,
    "Tool 1 service items include official INR price"
  );
  assert(
    typeof firstService.estimatedDeliveryDays === "number" && typeof firstService.revisionsIncluded === "number",
    "Tool 1 service items include delivery SLA and revisions included"
  );

  // Tool 2: get_service_details
  const serviceDetails = await ChatToolsService.getServiceDetails("3d-modeling");
  assert(!serviceDetails.error, "Tool 2 (get_service_details) retrieves details for 3D Modeling");
  assert(
    Array.isArray(serviceDetails.briefSchema) && serviceDetails.briefSchema.length > 0,
    "Tool 2 returns briefSchema for missing brief field intake"
  );
  assert(
    Array.isArray(serviceDetails.workflowStages) && serviceDetails.workflowStages.length > 0,
    "Tool 2 returns workflow stages"
  );

  // Tool 3: list_plans
  const plans = await ChatToolsService.listPlans();
  assert(Array.isArray(plans) && plans.length === 3, "Tool 3 (list_plans) returns 3 Retainer Tiers");
  assert(plans.some((p) => p.tier === "Growth" && p.freeTrialDays === 3), "Tool 3 includes 3-Day Free Trial info");

  // SECTION 2: Conversational Order Creation & Checkout
  console.log("\n--- Section 2: Conversational Order Placement (Tool 4 & Tool 6) ---");

  // Tool 4: create_commission_draft (with source: "ai_chat" and chatId)
  const draftRes = await ChatToolsService.createCommissionDraft({
    clientUid: testClientUid,
    clientName: testClientName,
    clientEmail: testClientEmail,
    type: "service",
    serviceId: "3d-modeling",
    requirements: "3D model of a luxury perfume glass bottle with golden cap",
    briefAnswers: {
      productDimensions: "10cm x 5cm x 5cm",
      aestheticMood: "Warm ivory and brass luxury minimal",
      outputFormats: ["GLB", "FBX", "4K Render Stills"],
    },
    chatId: `chat_${testClientUid}`,
    confirmed: true,
  });

  assert(draftRes.success, "Tool 4 (create_commission_draft) creates order successfully");
  const order1 = draftRes.order;
  assert(order1.status === "pending_payment", "New chat order is created with status 'pending_payment'");
  assert(order1.source === "ai_chat", "Order has source: 'ai_chat'");
  assert(order1.chatId === `chat_${testClientUid}`, "Order stores conversational chatId");
  assert(order1.totalAmount === 9499, "Price is verified from catalog tool (₹9,499 for 3D Modeling)");
  assert(Boolean(draftRes.orderDraft?.razorpayOrderId), "Order draft includes Razorpay Order ID for Pay Now card");
  assert(Boolean(order1.driveFolderLink), "Google Drive Vault folder is automatically provisioned");

  // Tool 6: start_checkout
  const checkoutRes = await ChatToolsService.startCheckout({
    orderId: order1.id,
    clientUid: testClientUid,
  });
  assert(
    !checkoutRes.error && Boolean(checkoutRes.razorpayOrderId),
    "Tool 6 (start_checkout) returns payment credentials for pending order"
  );

  // SECTION 3: Asset Upload Vault & Live Progress Tracking
  console.log("\n--- Section 3: Asset Upload Vault & Live Progress Tracking (Tool 5 & Tool 7) ---");

  // Tool 5: get_upload_link
  const uploadLinkRes = await ChatToolsService.getUploadLink({
    orderId: order1.id,
    clientUid: testClientUid,
  });
  assert(
    !uploadLinkRes.error && Boolean(uploadLinkRes.driveFolderLink?.includes("drive.google.com")),
    "Tool 5 (get_upload_link) returns client's Google Drive upload vault link"
  );

  // Unauthorized client access check
  const unauthorizedUpload = await ChatToolsService.getUploadLink({
    orderId: order1.id,
    clientUid: "usr_malicious_attacker",
  });
  assert(Boolean(unauthorizedUpload.error), "Tool 5 blocks unauthorized client from accessing another's drive link");

  // Tool 7: get_my_orders
  const myOrders = await ChatToolsService.getMyOrders({ clientUid: testClientUid });
  assert(myOrders.length >= 1, "Tool 7 (get_my_orders) returns client orders");
  const orderSummary = myOrders.find((o) => o.id === order1.id);
  assert(
    Boolean(orderSummary && typeof orderSummary.progressPercentage === "number" && orderSummary.stageName !== undefined),
    "Tool 7 computes live progress percentage and stage name"
  );

  // SECTION 4: Subscriptions, Renewals, & Trials
  console.log("\n--- Section 4: Retainer Subscription, Renewal & Trial Tools (Tool 8 & Tool 9) ---");

  // Create Retainer Order in Trial status
  const planDraft = await ChatToolsService.createCommissionDraft({
    clientUid: testClientUid,
    clientName: testClientName,
    clientEmail: testClientEmail,
    type: "monthly_plan",
    planId: "studio-growth",
    billingCycle: "monthly",
    chatId: `chat_${testClientUid}`,
    confirmed: true,
  });

  const trialOrder = planDraft.order;
  trialOrder.status = "trial";
  trialOrder.statusLabel = "3-Day Free Trial Active";

  // Tool 9: cancel_trial
  const cancelTrialRes = await ChatToolsService.cancelTrial({
    orderId: trialOrder.id,
    clientUid: testClientUid,
    reason: "No longer needed",
  });
  assert(Boolean(cancelTrialRes.success), "Tool 9 (cancel_trial) cancels 3-day trial plan without charges");
  assert(trialOrder.status === "cancelled", "Trial order status transitions to 'cancelled'");

  // Tool 8: renew_plan
  const activePlanDraft = await ChatToolsService.createCommissionDraft({
    clientUid: testClientUid,
    clientName: testClientName,
    clientEmail: testClientEmail,
    type: "monthly_plan",
    planId: "studio-growth",
    billingCycle: "monthly",
    chatId: `chat_${testClientUid}`,
    confirmed: true,
  });
  const activePlanOrder = activePlanDraft.order;
  activePlanOrder.status = "active";

  const renewRes = await ChatToolsService.renewPlan({
    orderId: activePlanOrder.id,
    clientUid: testClientUid,
  });
  assert(Boolean(renewRes.success && renewRes.razorpayOrderId), "Tool 8 (renew_plan) initializes renewal checkout");

  // SECTION 5: Revision and Delivery Approval Flows
  console.log("\n--- Section 5: Revision & Delivery Approval (Tool 10 & Tool 11) ---");

  // Simulate order delivered
  order1.status = "delivered";
  order1.statusLabel = "Delivered — Pending Review";

  // Tool 10: request_revision
  const revRes = await ChatToolsService.requestRevision({
    orderId: order1.id,
    clientUid: testClientUid,
    comment: "Please adjust lighting on the gold cap to be more reflective",
  });
  assert(Boolean(revRes.success && revRes.revisionRound === 1), "Tool 10 (request_revision) increments revision counter to 1");

  // Tool 11: approve_delivery without confirmation (Gate check)
  const unconfirmedApproval = await ChatToolsService.approveDelivery({
    orderId: order1.id,
    clientUid: testClientUid,
    confirmed: false,
  });
  assert(
    Boolean(unconfirmedApproval.requiresConfirmation === true),
    "Tool 11 (approve_delivery) requires explicit confirmation before approving"
  );

  // Tool 11: approve_delivery with confirmation
  const confirmedApproval = await ChatToolsService.approveDelivery({
    orderId: order1.id,
    clientUid: testClientUid,
    confirmed: true,
    comment: "All renders look perfect!",
  });
  assert(Boolean(confirmedApproval.success && confirmedApproval.status === "completed"), "Tool 11 approves delivery at 100% completed");
  assert(order1.status === "completed", "Order status in store is updated to 'completed'");

  // SUMMARY REPORT
  console.log("\n===============================================================================");
  console.log(`TEST SUMMARY: Total ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep18Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
