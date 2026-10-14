/**
 * Verification Test: New Order Frontend Pricing Display (STEP 5)
 * Run with: npx tsx scripts/test-new-order-pricing.mjs
 *
 * Validates that:
 *  1. /new-order carries service/package/qty/deliverable identifiers into
 *     MasterOrderForm via the existing URL-parameter mechanism
 *  2. Monthly plan selection shows name, price, image/video quotas, video
 *     duration, revisions, exclusions and billing frequency
 *  3. Individual service selection shows service name, deliverable, unit
 *     price, quantity and a unit × quantity subtotal
 *  4. Deep-linked selections are never silently substituted
 *  5. The order submission payload/contract is unchanged (no deliverable
 *     field, canonical tierId/price resolution, same endpoint)
 *  6. No fake confirmation/payment success exists outside the real API flow
 *  7. The Packages/Pricing page hands selections to /new-order correctly
 */

import assert from "assert";
import path from "path";
import fs from "fs";

console.log("\n========================================================");
console.log("   NEW ORDER PRICING DISPLAY — VERIFICATION (STEP 5)");
console.log("========================================================\n");

let passed = 0;
let total = 0;

function check(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
  }
}

const ROOT = process.cwd();

const newOrderPageSrc = fs.readFileSync(
  path.join(ROOT, "src", "app", "(client)", "new-order", "page.tsx"),
  "utf8"
);
const formSrc = fs.readFileSync(
  path.join(ROOT, "src", "components", "orders", "MasterOrderForm.tsx"),
  "utf8"
);
const pricingPageSrc = fs.readFileSync(
  path.join(ROOT, "src", "app", "(public)", "pricing", "page.tsx"),
  "utf8"
);

console.log("--> 1. New Order route carries the selection (requirement 2)...");

check("New order page parses service, package, qty and deliverable params", () => {
  assert(newOrderPageSrc.includes('searchParams.get("service")'));
  assert(newOrderPageSrc.includes('searchParams.get("package")'));
  assert(newOrderPageSrc.includes('searchParams.get("qty")'));
  assert(newOrderPageSrc.includes('searchParams.get("deliverable")'));
});

check("Params are passed into MasterOrderForm via existing props", () => {
  assert(newOrderPageSrc.includes("initialServiceId={serviceParam}"));
  assert(newOrderPageSrc.includes("initialTierId={packageParam}"));
  assert(newOrderPageSrc.includes("initialQty={qtyParam}"));
  assert(newOrderPageSrc.includes("initialDeliverableId={deliverableParam}"));
});

check("Route guard, auth and success flow are preserved", () => {
  assert(newOrderPageSrc.includes("RouteGuard"), "RouteGuard must remain");
  assert(newOrderPageSrc.includes('requiredRole="client"'), "client role guard must remain");
  assert(newOrderPageSrc.includes("handleOrderSuccess"), "success handler must remain");
  assert(newOrderPageSrc.includes('router.push("/orders")'), "post-success navigation unchanged");
});

console.log("\n--> 2. Monthly plan display (requirement 3)...");

check("Monthly panel shows package name and monthly price", () => {
  assert(formSrc.includes("Billed every 30 days"), "billing frequency chip missing");
  assert(formSrc.includes("activePackage.title"), "package name missing");
  assert(formSrc.includes("/ month"), "monthly unit missing");
});

check("Monthly panel shows image & video quotas with duration limit", () => {
  assert(formSrc.includes("Included images"), "image quota row missing");
  assert(formSrc.includes("includedServices.images"), "canonical image count missing");
  assert(formSrc.includes("Included videos"), "video quota row missing");
  assert(formSrc.includes("includedServices.videos"), "canonical video count missing");
  assert(
    formSrc.includes("resolveMonthlyVideoDurationLimit"),
    "video duration resolution missing"
  );
  assert(
    formSrc.includes("videos per 30-day cycle") || formSrc.includes("images per 30-day cycle"),
    "per-cycle quota wording missing"
  );
});

check("Monthly panel shows revisions, exclusions and billing frequency", () => {
  assert(formSrc.includes("Revisions:"), "revision policy row missing");
  assert(formSrc.includes("revisionPolicy"), "canonical revision policy missing");
  assert(formSrc.includes("Not included:"), "exclusions row missing");
  assert(formSrc.includes("exclusions"), "canonical exclusions missing");
  assert(formSrc.includes("Billing frequency"), "billing frequency row missing");
});

check("Monthly details resolve from the canonical retainer package", () => {
  assert(
    formSrc.includes("activeCanonicalMonthly"),
    "canonical monthly package derivation missing"
  );
  assert(
    formSrc.includes("\"billingCycle\" in canonical"),
    "retainer type narrowing missing"
  );
});

console.log("\n--> 3. Individual service display (requirement 4)...");

check("Service panel shows name, deliverable, unit price and quantity", () => {
  assert(formSrc.includes("Selected deliverable"), "deliverable label missing");
  assert(formSrc.includes("per unit"), "unit price wording missing");
  assert(formSrc.includes("aria-label=\"Decrease quantity\""), "quantity stepper missing");
  assert(formSrc.includes("aria-label=\"Increase quantity\""), "quantity stepper missing");
});

check("Subtotal is calculated from displayed unit price × quantity", () => {
  assert(formSrc.includes("Subtotal"), "subtotal label missing");
  assert(
    formSrc.includes("{formatCurrencyINR(activeService.basePrice)} × {quantity}"),
    "explicit unit × quantity breakdown missing"
  );
  assert(
    formSrc.includes("activeService.basePrice * Math.max(1, quantity)"),
    "subtotal computation must remain canonical price × quantity"
  );
});

check("Deliverable context from Packages & Pricing is labelled indicative", () => {
  assert(
    formSrc.includes("Selected from Packages &amp; Pricing"),
    "catalogue context chip missing"
  );
  assert(
    formSrc.includes("Indicative catalogue price"),
    "indicative disclaimer missing"
  );
  assert(
    formSrc.includes("server re-validates at submission"),
    "server re-validation note missing"
  );
});

check("Frontend prices are never treated as authoritative", () => {
  assert(
    formSrc.includes("Charged amount is re-validated against the studio catalogue"),
    "canonical-authority note missing"
  );
  assert(
    formSrc.includes("basePrice: canonical.numericPrice"),
    "service prices must resolve from the canonical catalogue"
  );
  assert(
    formSrc.includes("price: canonical.numericPrice"),
    "package prices must resolve from the canonical catalogue"
  );
});

console.log("\n--> 4. No silent substitution of selections (requirement 5)...");

check("Deep-link resolution never falls back silently", () => {
  assert(
    formSrc.includes("resolveInitialSelection"),
    "centralised deep-link resolution missing"
  );
  assert(
    formSrc.includes("Nothing has been substituted"),
    "visible unresolved-selection notice missing"
  );
  assert(
    formSrc.includes("deepLinkNotice"),
    "notice state must render in the form"
  );
});

check("Unresolved selections block step 1 until an explicit choice", () => {
  assert(
    formSrc.includes("Please select a studio service to continue."),
    "service selection guard missing"
  );
  assert(
    formSrc.includes("Please select a package to continue."),
    "package selection guard missing"
  );
  assert(
    formSrc.includes("Select a package above to see its monthly price"),
    "empty package prompt missing"
  );
});

console.log("\n--> 5. Submission contract unchanged (requirements 1 & 7)...");

check("Order submission still POSTs the same payload to /api/orders", () => {
  assert(formSrc.includes("fetch(\"/api/orders\""), "endpoint changed or missing");
  assert(formSrc.includes("const orderPayload = {"), "payload builder missing");
});

check("Payload keeps every existing field and adds none", () => {
  const payloadStart = formSrc.indexOf("const orderPayload = {");
  assert(payloadStart !== -1, "payload not found");
  const payloadEnd = formSrc.indexOf("};", payloadStart);
  const payloadSrc = formSrc.slice(payloadStart, payloadEnd);
  for (const key of [
    "idempotencyKey",
    "sourceChannel",
    "client: {",
    "package: {",
    "tierId: resolvedTierId",
    "price: orderAmount",
    "quantity:",
    "serviceDetails: {",
    "payment: {",
    "amount: orderAmount",
    "totalAmount: orderAmount",
    "billingType",
    "paymentStatus",
  ]) {
    assert(payloadSrc.includes(key), `payload lost field: ${key}`);
  }
  assert(
    !/deliverable/i.test(payloadSrc),
    "payload must NOT contain the display-only deliverable field"
  );
});

check("Tier/price resolution still points at exactly the purchased item", () => {
  assert(
    formSrc.includes("activePackage?.id ?? \"\" : activeService.id"),
    "resolvedTierId must still be the canonical package/service id"
  );
  assert(
    formSrc.includes("activePackage?.billingCycle === \"monthly\" ? 1 : Math.max(1, quantity)"),
    "monthly quantity must remain 1"
  );
});

console.log("\n--> 6. No fake confirmation or payment success (requirement 9)...");

check("Success screen renders only after a real API response", () => {
  assert(formSrc.includes("{createdOrder ? ("), "success branch must be gated on createdOrder");
  assert(formSrc.includes("Order Placed Successfully"), "success copy missing");
  const createdIdx = formSrc.indexOf("{createdOrder ? (");
  const successIdx = formSrc.indexOf("Order Placed Successfully");
  assert(
    successIdx > createdIdx,
    "success UI must live inside the createdOrder branch"
  );
  assert(
    formSrc.includes("await fetch(\"/api/orders\""),
    "confirmation must follow the real submission call"
  );
});

console.log("\n--> 7. Packages/Pricing page hands off selections (requirement 2)...");

check("Fixed service rows deep-link New Order with service + deliverable", () => {
  assert(
    pricingPageSrc.includes("`/new-order?service=${group.serviceSlug}&deliverable=${item.id}`"),
    "per-item Start Order deep link missing"
  );
});

check("Service groups and monthly packages deep-link the New Order route", () => {
  assert(
    pricingPageSrc.includes("`/new-order?service=${group.serviceSlug}`"),
    "group-level Start Order link missing"
  );
  assert(
    pricingPageSrc.includes("`/new-order?package=${pkg.canonicalSlug}`"),
    "monthly package Start Order link missing"
  );
});

check("Scoped range services still hand off to the quote inquiry flow", () => {
  assert(pricingPageSrc.includes('href="/contact"'), "/contact quote flow missing");
});

console.log("\n========================================================");
console.log(`TOTAL TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log("========================================================\n");

if (passed === total) {
  console.log("ALL NEW ORDER PRICING DISPLAY TESTS PASSED CLEANLY!\n");
  process.exit(0);
} else {
  console.error("SOME TESTS FAILED!\n");
  process.exit(1);
}
