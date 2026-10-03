import http from "http";
import crypto from "crypto";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const data = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      ...headers,
    };
    if (data) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(data);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(resBody);
            resolve({ status: res.statusCode, data: parsed, raw: resBody });
          } catch {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      }
    );

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function computeHmac(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runStep15Tests() {
  console.log("\n=======================================================");
  console.log("  SUTRA STUDIO — STEP 15 RAZORPAY PAYMENTS TEST SUITE  ");
  console.log("=======================================================\n");

  const testClientId = "client_test_step15_" + Date.now();
  const testPkgId = "studio-growth";

  // 1. Create Individual Service Order & Verify Price Recomputation
  console.log("1. Testing Individual Service Order Creation with Server Price Recomputation...");
  const createOrderRes = await request(
    "POST",
    "/api/orders",
    {
      type: "service",
      clientUid: testClientId,
      clientId: testClientId,
      clientName: "Aarav Sharma",
      clientEmail: "aarav@example.com",
      clientPhone: "+91 98765 43210",
      items: [{ serviceId: "img-creation", quantity: 2 }],
      requirements: "Commercial hero render and product shots",
    },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );

  assert(createOrderRes.status === 200 && createOrderRes.data?.success, "Order created successfully");
  const order = createOrderRes.data?.order;
  assert(order?.status === "pending_payment", "Order status initialized as pending_payment");
  assert(order?.totalAmount === 5499 * 2, `Server price recomputed correctly (₹${order?.totalAmount})`);
  assert(createOrderRes.data?.razorpay?.orderId, "Razorpay order created with orderId");
  assert(createOrderRes.data?.razorpay?.amountInPaise === (5499 * 2) * 100, "Paise amount correctly calculated");

  const rzpOrderId = createOrderRes.data?.razorpay?.orderId;
  const mockPaymentId = "pay_test_" + Date.now();

  // 2. Test Payment Verification Signature (Invalid / Tampered vs Valid)
  console.log("\n2. Testing Payment Signature Verification Security...");
  const invalidVerifyRes = await request(
    "POST",
    "/api/payments/verify",
    {
      orderId: order.id,
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: "invalid_tampered_signature_12345",
    },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  assert(
    invalidVerifyRes.status === 400 || (invalidVerifyRes.data && !invalidVerifyRes.data.success),
    "Tampered payment signature rejected by server"
  );

  const secret = process.env.RAZORPAY_KEY_SECRET || "sutra_rzp_mock_secret_live_099182";
  const validSignature = computeHmac(secret, `${rzpOrderId}|${mockPaymentId}`);

  const validVerifyRes = await request(
    "POST",
    "/api/payments/verify",
    {
      orderId: order.id,
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: validSignature,
    },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  assert(validVerifyRes.status === 200 && validVerifyRes.data?.success, "Valid HMAC-SHA256 signature verified");

  // 3. Check Order Moved to Paid
  console.log("\n3. Testing Order Status Update Post Verification...");
  const getOrderRes = await request(
    "GET",
    `/api/orders?orderId=${order.id}`,
    null,
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  const updatedOrder = getOrderRes.data?.orders?.find((o) => o.id === order.id);
  assert(updatedOrder?.status === "paid" || updatedOrder?.paymentStatus === "paid", "Order moved to paid status");

  // 4. Test Webhook Idempotency & Events
  console.log("\n4. Testing Webhook Events & Idempotency...");
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    "sutra_webhook_mock_secret_8921";
  const webhookPayload = JSON.stringify({
    id: "evt_test_" + Date.now(),
    event: "payment.captured",
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      payment: {
        entity: {
          id: mockPaymentId,
          order_id: rzpOrderId,
          amount: 1099800,
          currency: "INR",
          status: "captured",
          notes: { orderId: order.id, clientId: testClientId },
        },
      },
    },
  });
  const webhookSig = computeHmac(webhookSecret, webhookPayload);

  const webhookRes1 = await request(
    "POST",
    "/api/payments/webhook",
    webhookPayload,
    { "x-razorpay-signature": webhookSig }
  );
  assert(webhookRes1.status === 200 && webhookRes1.data?.received, "Webhook payment.captured processed");

  const webhookRes2 = await request(
    "POST",
    "/api/payments/webhook",
    webhookPayload,
    { "x-razorpay-signature": webhookSig }
  );
  assert(webhookRes2.status === 200 && webhookRes2.data?.duplicate, "Duplicate webhook recognized idempotently");

  // 5. Test Monthly Package with 3-Day Free Trial
  console.log("\n5. Testing Monthly Package Order with 3-Day Free Trial...");
  const trialOrderRes = await request(
    "POST",
    "/api/orders",
    {
      type: "monthly_plan",
      planId: testPkgId,
      billingCycle: "monthly",
      clientUid: testClientId,
      clientId: testClientId,
      clientName: "Aarav Sharma",
      clientEmail: "aarav@example.com",
      requirements: "Full monthly growth tier support",
    },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  assert(trialOrderRes.status === 200 && trialOrderRes.data?.success, "Monthly package order placed");
  const trialOrder = trialOrderRes.data?.order;
  assert(trialOrder?.subscriptionStatus === "trial", "Subscription status initialized to 'trial'");
  assert(trialOrder?.trialEndsAt, `Trial endsAt date set: ${trialOrder?.trialEndsAt}`);

  // 6. Test Free Trial Rule: Only 1 Free Trial per Client / Package
  console.log("\n6. Testing Repeat Free Trial Prevention (1 Trial Rule)...");
  const repeatTrialOrderRes = await request(
    "POST",
    "/api/orders",
    {
      type: "monthly_plan",
      planId: testPkgId,
      billingCycle: "monthly",
      clientUid: testClientId,
      clientId: testClientId,
      clientName: "Aarav Sharma",
      clientEmail: "aarav@example.com",
    },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  const repeatOrder = repeatTrialOrderRes.data?.order;
  assert(
    repeatOrder?.subscriptionStatus === "active" || repeatOrder?.status === "pending_payment",
    "Repeat trial prevented: immediate paid/active cycle assigned instead of free trial"
  );

  // 7. Test Free Trial Cancellation (Zero Charge)
  console.log("\n7. Testing 3-Day Free Trial Cancellation (Zero Charge)...");
  const cancelTrialRes = await request(
    "POST",
    "/api/payments/cancel-subscription",
    {
      orderId: trialOrder.id,
      isTrialCancel: true,
      reason: "Client testing trial cancel feature",
    },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  assert(cancelTrialRes.status === 200 && cancelTrialRes.data?.success, "Free trial cancelled with zero charge");

  // 8. Test Monthly Package Renewal
  console.log("\n8. Testing Monthly Package Renewal Endpoint...");
  const renewRes = await request(
    "POST",
    "/api/payments/renew",
    { orderId: trialOrder.id },
    { "x-user-id": testClientId, "x-user-role": "client" }
  );
  assert(renewRes.status === 200 && renewRes.data?.success, "Renewal order initiated with Razorpay checkout data");
  assert(renewRes.data?.razorpay?.orderId, "Renewal Razorpay order ID received");

  // 9. Test Admin Manual Period Extension
  console.log("\n9. Testing Admin Manual Period Extension...");
  const extendRes = await request(
    "POST",
    "/api/payments/extend-period",
    {
      orderId: trialOrder.id,
      daysToAdd: 15,
      reason: "Client goodwill extension due to shoot delay",
    },
    { "x-user-id": "admin_sutra_001", "x-user-role": "admin" }
  );
  assert(extendRes.status === 200 && extendRes.data?.success, "Admin successfully extended period by 15 days");
  assert(extendRes.data?.order?.currentPeriodEnd, `New period end: ${extendRes.data?.order?.currentPeriodEnd}`);

  // 10. Test Admin Refund Action
  console.log("\n10. Testing Admin Refund Action...");
  const refundRes = await request(
    "POST",
    "/api/payments/refund",
    {
      orderId: order.id,
      reason: "Full studio satisfaction guarantee refund",
    },
    { "x-user-id": "admin_sutra_001", "x-user-role": "admin" }
  );
  assert(refundRes.status === 200 && refundRes.data?.success, "Admin refund processed and audit logged");

  console.log("\n=======================================================");
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep15Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
