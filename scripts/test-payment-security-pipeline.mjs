/**
 * SUTRA STUDIO — PAYMENT SECURITY & UPI LIFECYCLE TEST SUITE
 *
 * Validates:
 * 1. Payment creation authentication & multi-tenant order ownership (401/403).
 * 2. Server-authoritative locked amount & forged client amount rejection (400).
 * 3. UTR submission transitions to 'payment_submitted' / 'pending_verification' (NEVER 'paid').
 * 4. Single-use UTR across orders and duplicate replay rejection (409).
 * 5. Public / client protection against forging 'paid' status (403 on PATCH, ignored on POST).
 * 6. Admin verification & rejection requiring admin session with audit logging.
 * 7. State transition protection (cannot pay cancelled/paid orders, cannot reject paid orders).
 */

import Module from "node:module";
import fs from "node:fs";
import path from "node:path";

// Allow server-only modules to load during standalone test runs
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }
  return origLoad.apply(this, arguments);
};

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runPaymentSuite() {
  console.log("\n========================================================");
  console.log("  SUTRA STUDIO — PAYMENT SECURITY & UPI PIPELINE SUITE");
  console.log("========================================================\n");

  // -------------------------------------------------------------------------
  // Step 1: Create baseline test orders for Client A and Client B
  // -------------------------------------------------------------------------
  console.log("--> 1. Creating baseline test orders for multi-tenant payment tests...");
  
  // Order A (Client A: test-client-a@sutrastudio.com)
  const resOrderA = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 1,
      clientName: "Client Alpha",
      clientEmail: "client-a@example.com",
      clientPhone: "9876543210",
      clientUid: "usr_client_alpha_001",
    }),
  });
  const dataOrderA = await resOrderA.json();
  assert(resOrderA.status === 200 && dataOrderA.order, "Order A created for Client Alpha (HTTP 200)");
  const orderA = dataOrderA.order;
  assert(orderA.totalAmount === 99, "Order A authoritative total is ₹99");
  assert(orderA.paymentStatus === "unpaid", "Order A initial paymentStatus is 'unpaid' (not paid)");

  // Order B (Client B: test-client-b@sutrastudio.com)
  const resOrderB = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "daily-trend-creator",
      quantity: 1,
      clientName: "Client Beta",
      clientEmail: "client-b@example.com",
      clientPhone: "9876543211",
      clientUid: "usr_client_beta_002",
    }),
  });
  const dataOrderB = await resOrderB.json();
  assert(resOrderB.status === 200 && dataOrderB.order, "Order B created for Client Beta (HTTP 200)");
  const orderB = dataOrderB.order;
  assert(orderB.totalAmount === 19999, "Order B authoritative total is ₹19,999");
  assert(orderB.paymentStatus === "unpaid", "Order B initial paymentStatus is 'unpaid'");

  // -------------------------------------------------------------------------
  // Step 2: Payment Creation Authentication & Cross-User Rejection
  // -------------------------------------------------------------------------
  console.log("\n--> 2. Testing Payment Creation Authentication & Cross-User Isolation...");

  // Unauthenticated request with no credentials or matching email/token
  const resAnonPay = await fetch(`${BASE_URL}/api/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: orderA.id }),
  });
  assert(resAnonPay.status === 401, "Unauthenticated payment initialization rejected with HTTP 401 Unauthorized");
  const dataAnonPay = await resAnonPay.json();
  assert(dataAnonPay.error.includes("Unauthorized"), "Error reports active authentication session required");

  // Cross-user attempt: Client A tries to initialize payment for Order B (Client B's order) using A's email
  const resCrossPay = await fetch(`${BASE_URL}/api/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderB.id,
      clientEmail: "client-a@example.com", // mismatch!
    }),
  });
  assert(resCrossPay.status === 401 || resCrossPay.status === 403, "Cross-user payment attempt rejected with HTTP 401/403");

  // Valid ownership payment initialization for Order A
  const resValidPayA = await fetch(`${BASE_URL}/api/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderA.id,
      clientEmail: "client-a@example.com",
    }),
  });
  assert(resValidPayA.status === 200, "Authorized owner payment initialization succeeded with HTTP 200");
  const dataPayA = await resValidPayA.json();
  assert(dataPayA.amountINR === 99, "Payment intent locked amount matches authoritative order price (₹99)");
  assert(dataPayA.currency === "INR", "Payment currency is strictly 'INR'");
  assert(dataPayA.vpa && dataPayA.vpa.includes("@"), "Payment includes verified merchant VPA");
  assert(dataPayA.payeeName === "Yash Joshi", "Payment includes verified payee name (Yash Joshi)");
  assert(dataPayA.upiUri && dataPayA.upiUri.startsWith("upi://pay"), "Payment generates standard RFC-compliant UPI deep link");

  // -------------------------------------------------------------------------
  // Step 3: Anti-Tampering: Forged Browser Amount Rejection
  // -------------------------------------------------------------------------
  console.log("\n--> 3. Testing Anti-Tampering & Browser Amount Rejection...");

  // Client attempts to pay ₹1 for a ₹99 order
  const resTamper = await fetch(`${BASE_URL}/api/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderA.id,
      clientEmail: "client-a@example.com",
      amount: 1, // Tampered!
    }),
  });
  assert(resTamper.status === 400, "Forged browser amount (₹1 instead of ₹99) rejected with HTTP 400");
  const dataTamper = await resTamper.json();
  assert(dataTamper.error.includes("Amount tampering detected"), "Error specifically reports amount tampering detection");

  // -------------------------------------------------------------------------
  // Step 4: UTR Submission Transitions & Non-Verification Guarantee
  // -------------------------------------------------------------------------
  console.log("\n--> 4. Testing UTR Submission Lifecycle (Distinct from Verification)...");

  const validTestUtrA = "UTR" + Date.now().toString().slice(-8) + "1234";
  const dummyCrossUtr = "UTR" + (Date.now() + 1).toString().slice(-8) + "9999";

  // Invalid format rejection
  const resBadUtr = await fetch(`${BASE_URL}/api/payments/submit-utr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderA.id,
      clientEmail: "client-a@example.com",
      utrNumber: "123", // too short!
    }),
  });
  assert(resBadUtr.status === 422, "Invalid UTR format (< 12 chars) rejected with HTTP 422 Unprocessable");

  // Cross-user UTR submission attempt
  const resCrossUtr = await fetch(`${BASE_URL}/api/payments/submit-utr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderB.id,
      clientEmail: "client-a@example.com", // mismatch!
      utrNumber: dummyCrossUtr,
    }),
  });
  assert(resCrossUtr.status === 401 || resCrossUtr.status === 403, "Cross-user UTR submission rejected with HTTP 401/403");

  // Valid UTR submission on Order A
  const resSubmitUtr = await fetch(`${BASE_URL}/api/payments/submit-utr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderA.id,
      clientEmail: "client-a@example.com",
      utrNumber: validTestUtrA,
    }),
  });
  if (resSubmitUtr.status !== 200) {
    const errText = await resSubmitUtr.clone().text();
    console.error(`  DEBUG resSubmitUtr failed with status ${resSubmitUtr.status}: ${errText}`);
  }
  assert(resSubmitUtr.status === 200, "Valid UTR submission succeeded with HTTP 200");
  const dataSubmitUtr = await resSubmitUtr.json();
  assert(dataSubmitUtr.status === "payment_submitted", "Payment status transitioned to 'payment_submitted' (NOT 'paid')");

  // Verify the client-scoped read path now requires a verified session (no anonymous tenant leak)
  const resOrderCheckA = await fetch(`${BASE_URL}/api/orders?clientUid=usr_client_alpha_001`);
  assert(resOrderCheckA.status === 401, "Unauthenticated client-scoped order lookup rejected with HTTP 401 (tenant reads require session)");

  // Verify the persisted order transition on disk (UTR is NOT automatic verification)
  let foundOrderA;
  try {
    const ordersDisk = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "data", "sutra_orders_store.json"), "utf8")
    );
    foundOrderA = ordersDisk.find((o) => o.id === orderA.id);
  } catch {
    foundOrderA = undefined;
  }
  assert(foundOrderA, "Order A retrieved from on-disk orders store");
  assert(foundOrderA?.paymentStatus === "pending_verification", "Order paymentStatus is 'pending_verification' (UTR is NOT automatic verification)");
  assert(foundOrderA?.status !== "paid", "Order status is NOT marked as paid");

  // -------------------------------------------------------------------------
  // Step 5: Single-Use UTR & Duplicate Replay Protection
  // -------------------------------------------------------------------------
  console.log("\n--> 5. Testing Single-Use UTR & Replay Rejection...");

  // Attempt to use validTestUtrA on Order B
  const resDupUtr = await fetch(`${BASE_URL}/api/payments/submit-utr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderB.id,
      clientEmail: "client-b@example.com",
      utrNumber: validTestUtrA, // duplicate!
    }),
  });
  assert(resDupUtr.status === 409, "Replaying previously submitted UTR rejected with HTTP 409 Conflict");
  const dataDupUtr = await resDupUtr.json();
  assert(dataDupUtr.error.includes("already been registered"), "Error reports UTR is already registered for another order");

  // -------------------------------------------------------------------------
  // Step 6: Public / Client Protection Against Forging 'paid' Status
  // -------------------------------------------------------------------------
  console.log("\n--> 6. Testing Forged 'paid' Status Rejection on Client Routes...");

  // Non-admin attempt to create order with paymentStatus: 'paid'
  const resForgedCreate = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 1,
      clientName: "Hacker Client",
      clientEmail: "hacker@example.com",
      paymentStatus: "paid", // forged!
      isPaid: true,
    }),
  });
  const dataForgedCreate = await resForgedCreate.json();
  assert(resForgedCreate.status === 200, "Order created (HTTP 200)");
  assert(dataForgedCreate.order.paymentStatus === "unpaid", "Server ignored client-supplied 'paid' status (order remains 'unpaid')");
  assert(dataForgedCreate.order.status === "pending_payment", "Order status remains 'pending_payment' (not in_progress)");

  // Non-admin attempt to PATCH order to 'paid'
  const resForgedPatch = await fetch(`${BASE_URL}/api/orders`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderA.id,
      action: "mark_paid",
      clientRole: "client",
    }),
  });
  assert(resForgedPatch.status === 403, "Non-admin call to mark_paid rejected with HTTP 403 Forbidden");

  // -------------------------------------------------------------------------
  // Step 7: Admin Verification & Rejection Security
  // -------------------------------------------------------------------------
  console.log("\n--> 7. Testing Admin Payment Verification & Rejection Permissions...");

  // Unauthenticated call to /api/admin/payments/verify
  const resUnauthVerify = await fetch(`${BASE_URL}/api/admin/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: orderA.id }),
  });
  assert(resUnauthVerify.status === 401, "Unauthenticated call to /api/admin/payments/verify rejected with HTTP 401 Unauthorized");

  // Unauthenticated call to /api/admin/payments/reject
  const resUnauthReject = await fetch(`${BASE_URL}/api/admin/payments/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: orderA.id, reason: "Invalid UTR" }),
  });
  assert(resUnauthReject.status === 401, "Unauthenticated call to /api/admin/payments/reject rejected with HTTP 401 Unauthorized");

  // Unauthenticated call to /api/admin/payments/pending
  const resUnauthPending = await fetch(`${BASE_URL}/api/admin/payments/pending`);
  assert(resUnauthPending.status === 401, "Unauthenticated call to /api/admin/payments/pending rejected with HTTP 401 Unauthorized");

  // -------------------------------------------------------------------------
  // Step 8: Direct Verification through Authorized PaymentsStore
  // -------------------------------------------------------------------------
  console.log("\n--> 8. Testing Authoritative Studio Ledger Verification...");

  const { PaymentsStore } = await import("../src/lib/services/paymentsStore.ts");
  const { OrdersStore } = await import("../src/lib/services/ordersStore.ts");

  const adminActor = {
    uid: "admin_test_ledger_001",
    email: "yashjoshi20@zohomail.in",
    name: "Yash Joshi (Studio Principal)",
  };

  // Admin verifies payment for Order A
  const verifyResult = await PaymentsStore.verifyPayment({
    orderId: orderA.id,
    adminActor,
    notes: "Verified against studio ICICI bank ledger credit",
  });

  assert(verifyResult.success === true, "Admin verifyPayment returned success: true");
  assert(verifyResult.payment.status === "paid", "Payment record status transitioned to 'paid'");
  assert(verifyResult.payment.verifiedBy === adminActor.email, "Payment record records admin actor email");

  const verifiedOrderA = OrdersStore.findById(orderA.id);
  assert(verifiedOrderA.paymentStatus === "paid", "Order paymentStatus is now 'paid'");
  assert(verifiedOrderA.status === "in_production", "Order moved to 'in_production' status");

  // State Transition Guard: Cannot submit UTR on an already paid order
  const resPostPaidUtr = await fetch(`${BASE_URL}/api/payments/submit-utr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderA.id,
      clientEmail: "client-a@example.com",
      utrNumber: "UTR" + Date.now().toString().slice(-8) + "8888",
    }),
  });
  assert(resPostPaidUtr.status === 400, "Submitting UTR on an already paid order rejected with HTTP 400");

  // State Transition Guard: Cannot reject an already paid order without refund flow
  const rejectPaidResult = await PaymentsStore.rejectPayment({
    orderId: orderA.id,
    reason: "Mistaken rejection attempt",
    adminActor,
  });
  assert(rejectPaidResult.success === false, "Rejecting an already paid payment rejected by PaymentsStore");
  assert(rejectPaidResult.error.includes("refund"), "Error instructs caller to use refund pipeline");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`TOTAL ASSERTIONS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    console.error(`PAYMENT SECURITY SUITE FAILED with ${failedTests} failure(s).`);
    process.exit(1);
  } else {
    console.log("ALL PAYMENT SECURITY & UPI LIFECYCLE TESTS PASSED CLEANLY!\n");
    process.exit(0);
  }
}

runPaymentSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
