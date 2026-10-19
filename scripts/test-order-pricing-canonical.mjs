/**
 * SUTRA STUDIO — End-to-End Canonical Order Pricing, Validation & Snapshot Test Suite
 *
 * Validates:
 * 1. Approved Monthly Packages (Daily Trend Creator ₹19,999, Growth Trend ₹14,999, Starter Trend ₹9,999).
 * 2. Standalone Products & Deliverable Packs (Exact pricing, non-multiplied pack rates).
 * 3. Quantity multipliers & integer validation.
 * 4. Forged price rejection (HTTP 400 on client-tampered totals).
 * 5. Unknown / unapproved ID rejection (HTTP 400 on invalid IDs).
 * 6. Inactive service rejection (HTTP 400 on workflow-automation).
 * 7. Invalid quantity rejection (HTTP 400 on 0, negative, fractional, excessive).
 * 8. Idempotency replay (HTTP 200 + X-Idempotent-Replay on duplicate key).
 * 9. Immutable confirmed-order snapshots (scopeVersion, unitPrice, subtotal, tax, total, timestamps).
 * 10. Non-auto-renewing monthly retainer distinction.
 */

const BASE_URL = process.env.TEST_BASE_URL || "https://sutrastudios.in";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  SUTRA STUDIO — CANONICAL ORDER PRICING & SECURITY SUITE");
  console.log("========================================================\n");

  const testUid = `usr_test_${Date.now()}`;
  const testEmail = `tester_${Date.now()}@sutrastudio.test`;

  // --------------------------------------------------------------------------
  // TEST 1: Monthly Packages Authoritative Calculation
  // --------------------------------------------------------------------------
  console.log("--> 1. Testing Approved Monthly Packages Authoritative Pricing...");

  // 1a. Daily Trend Creator (Flagship ₹19,999)
  const dtcRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { tierId: "daily-trend-creator", billingCycle: "monthly" },
      clientUid: testUid,
      clientEmail: testEmail,
      clientName: "Test Agency",
    }),
  });
  const dtcData = await dtcRes.json();
  assert(dtcRes.status === 200, "Daily Trend Creator order created with HTTP 200");
  assert(dtcData.order.totalAmount === 19999, "Daily Trend Creator authoritative price is exactly ₹19,999");
  assert(dtcData.order.type === "monthly_plan", "Daily Trend Creator type is 'monthly_plan'");
  assert(dtcData.order.autoRenew === false, "Daily Trend Creator autoRenew is false (no unapproved recurrence)");
  assert(Boolean(dtcData.order.orderSnapshot), "Order snapshot is saved on Daily Trend Creator order");
  assert(dtcData.order.orderSnapshot?.total === 19999, "Snapshot total matches authoritative price (₹19,999)");
  assert(dtcData.order.orderSnapshot?.scopeVersion === "catalog_v2026_10", "Snapshot includes catalog scopeVersion");

  // 1b. Growth Trend (₹14,999)
  const growthRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { tierId: "growth-trend", billingCycle: "monthly" },
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const growthData = await growthRes.json();
  assert(growthRes.status === 200, "Growth Trend order created with HTTP 200");
  assert(growthData.order.totalAmount === 14999, "Growth Trend authoritative price is exactly ₹14,999");
  assert(growthData.order.orderSnapshot?.unitPrice === 14999, "Growth Trend snapshot unitPrice is ₹14,999");

  // 1c. Starter Trend (₹9,999)
  const starterRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { tierId: "starter-trend", billingCycle: "monthly" },
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const starterData = await starterRes.json();
  assert(starterRes.status === 200, "Starter Trend order created with HTTP 200");
  assert(starterData.order.totalAmount === 9999, "Starter Trend authoritative price is exactly ₹9,999");
  assert(starterData.order.orderSnapshot?.unitPrice === 9999, "Starter Trend snapshot unitPrice is ₹9,999");

  // --------------------------------------------------------------------------
  // TEST 2: Representative Standalone Services & Deliverable Packs
  // --------------------------------------------------------------------------
  console.log("\n--> 2. Testing Standalone Services & Deliverable Packs Pricing...");

  // 2a. Basic Template Image (₹99)
  const imgRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const imgData = await imgRes.json();
  assert(imgRes.status === 200, "Basic template image order created with HTTP 200");
  assert(imgData.order.totalAmount === 99, "Basic template image price is ₹99");
  assert(imgData.order.type === "service", "Standalone item type is 'service'");
  assert(imgData.order.orderSnapshot?.billingPeriod === "one_time", "Standalone snapshot billingPeriod is 'one_time'");

  // 2b. Basic Image 3-Pack (₹249 — pack rate must NOT multiply by 3!)
  const packRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "basic-image-pack-3",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const packData = await packRes.json();
  assert(packRes.status === 200, "basic-image-pack-3 order created with HTTP 200");
  assert(packData.order.totalAmount === 249, "basic-image-pack-3 price is exactly ₹249 (not 3x ₹99)");

  // 2c. Promo Reel 30s (₹499)
  const vidRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "vid-promo-reel-30s",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const vidData = await vidRes.json();
  assert(vidRes.status === 200, "vid-promo-reel-30s created with HTTP 200");
  assert(vidData.order.totalAmount === 499, "vid-promo-reel-30s price is exactly ₹499");

  // 2d. 3D Simple Model (₹2,999)
  const model3dRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "3d-simple-model",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const model3dData = await model3dRes.json();
  assert(model3dRes.status === 200, "3d-simple-model created with HTTP 200");
  assert(model3dData.order.totalAmount === 2999, "3d-simple-model price is exactly ₹2,999");

  // 2e. Dev Landing Page Starter (₹4,999)
  const devRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "dev-landing-page-starter",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const devData = await devRes.json();
  assert(devRes.status === 200, "dev-landing-page-starter created with HTTP 200");
  assert(devData.order.totalAmount === 4999, "dev-landing-page-starter price is exactly ₹4,999");

  // --------------------------------------------------------------------------
  // TEST 3: Quantity Scaling
  // --------------------------------------------------------------------------
  console.log("\n--> 3. Testing Quantity Multipliers...");
  const qtyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 5,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const qtyData = await qtyRes.json();
  assert(qtyRes.status === 200, "5x Basic Template Image created with HTTP 200");
  assert(qtyData.order.totalAmount === 5 * 99, `5x Basic Template Image is ₹495 (got ₹${qtyData.order.totalAmount})`);
  assert(qtyData.order.orderSnapshot?.quantity === 5, "Snapshot records quantity: 5");

  // --------------------------------------------------------------------------
  // TEST 4: Forged Price Rejection
  // --------------------------------------------------------------------------
  console.log("\n--> 4. Testing Forged Client Price Rejection...");
  const forgedRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { tierId: "daily-trend-creator", price: 1, billingCycle: "monthly" },
      totalAmount: 1,
      amount: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const forgedData = await forgedRes.json();
  assert(forgedRes.status === 400, "Forged price (₹1 for ₹19,999) rejected with HTTP 400 Bad Request");
  assert(
    forgedData.error?.includes("Forged or tampered price detected"),
    `Error reports forged price: "${forgedData.error}"`
  );

  // --------------------------------------------------------------------------
  // TEST 5: Unknown / Invalid Product ID Rejection
  // --------------------------------------------------------------------------
  console.log("\n--> 5. Testing Unknown / Invalid Product ID Rejection...");
  const unknownRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "nonexistent-hacked-product-xyz",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const unknownData = await unknownRes.json();
  assert(unknownRes.status === 400, "Unknown product ID rejected with HTTP 400 Bad Request");
  assert(
    unknownData.error?.includes("Unknown or unapproved service/package ID"),
    `Error reports invalid ID: "${unknownData.error}"`
  );

  // --------------------------------------------------------------------------
  // TEST 6: Inactive Product Rejection (Internal Automation)
  // --------------------------------------------------------------------------
  console.log("\n--> 6. Testing Inactive Product Rejection...");
  const inactiveRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "workflow-automation",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const inactiveData = await inactiveRes.json();
  assert(inactiveRes.status === 400, "Inactive service (workflow-automation) rejected with HTTP 400");
  assert(
    inactiveData.error?.includes("is inactive or not currently available"),
    `Error reports inactive state: "${inactiveData.error}"`
  );

  // --------------------------------------------------------------------------
  // TEST 7: Invalid Quantity Rejection
  // --------------------------------------------------------------------------
  console.log("\n--> 7. Testing Invalid Quantities Rejection...");

  const zeroQtyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 0,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  assert(zeroQtyRes.status === 400, "Quantity 0 rejected with HTTP 400");

  const negQtyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: -2,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  assert(negQtyRes.status === 400, "Negative quantity rejected with HTTP 400");

  const fracQtyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 2.5,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  assert(fracQtyRes.status === 400, "Fractional quantity (2.5) rejected with HTTP 400");

  const hugeQtyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId: "img-basic-template",
      quantity: 9999,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  assert(hugeQtyRes.status === 400, "Excessive quantity (9999) rejected with HTTP 400");

  // --------------------------------------------------------------------------
  // TEST 8: Idempotency Replay
  // --------------------------------------------------------------------------
  console.log("\n--> 8. Testing Idempotency Guard...");
  const uniqueKey = `idemp_test_${Date.now()}_abc`;

  // First call
  const idemp1Res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-idempotency-key": uniqueKey,
    },
    body: JSON.stringify({
      serviceId: "vid-promo-reel-30s",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const idemp1Data = await idemp1Res.json();
  const firstOrderId = idemp1Data.order?.id;
  assert(idemp1Res.status === 200, "First submission with idempotency key succeeded with HTTP 200");

  // Second duplicate call with same idempotency key
  const idemp2Res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-idempotency-key": uniqueKey,
    },
    body: JSON.stringify({
      serviceId: "vid-promo-reel-30s",
      quantity: 1,
      clientUid: testUid,
      clientEmail: testEmail,
    }),
  });
  const idemp2Data = await idemp2Res.json();
  assert(idemp2Res.status === 200, "Duplicate submission with same idempotency key succeeded with HTTP 200");
  assert(idemp2Data.replayed === true, "Response flagged with replayed: true");
  assert(idemp2Res.headers.get("x-idempotent-replay") === "true", "X-Idempotent-Replay header present");
  assert(idemp2Data.orderId === firstOrderId, "Replayed response returned original order ID (zero duplicate creation)");

  // --------------------------------------------------------------------------
  // TEST 9: Historical Order Snapshot Immutability
  // --------------------------------------------------------------------------
  console.log("\n--> 9. Testing Historical Order Snapshot Immutability...");
  const snap = dtcData.order.orderSnapshot;
  assert(snap.serviceId === "daily-trend-creator", "Snapshot preserved exact serviceId: daily-trend-creator");
  assert(snap.total === 19999, "Snapshot preserved exact total: ₹19,999");
  assert(snap.currency === "INR", "Snapshot preserved currency: INR");
  assert(snap.billingPeriod === "monthly", "Snapshot preserved billingPeriod: monthly");
  assert(Boolean(snap.createdAt), "Snapshot preserved createdAt timestamp");

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`TOTAL ASSERTIONS: ${passedCount + failedCount}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log("ALL CANONICAL ORDER PRICING TESTS PASSED CLEANLY!\n");
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw unhandled error:", err);
  process.exit(1);
});
