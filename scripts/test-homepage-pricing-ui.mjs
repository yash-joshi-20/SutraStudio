#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — HOMEPAGE & PRICING PAGE CANONICAL UI VERIFICATION
 * ==============================================================================
 * Verifies:
 * 1. Homepage contains Daily Trend Creator (₹19,999 / 30d, 30 images + 30 videos)
 * 2. Homepage features 5-step daily pipeline (research -> prompt -> prod -> QA -> Drive)
 * 3. Homepage ServiceCard links directly to /services#<slug> and /orders?service=<slug>
 * 4. Homepage HERO_DISCIPLINES has canonical starting prices and zero automation promotion
 * 5. Pricing page separates monthly retainers, individual services, and bulk packs
 * 6. Pricing page contains clear production exclusions policy
 * 7. Pricing page CTAs pass correct package/service IDs to /orders flow
 * ==============================================================================
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("   HOMEPAGE & PRICING PAGE CANONICAL UI VERIFICATION");
console.log("========================================================\n");

// Read file contents
const homeClientPath = path.join(ROOT, "src", "app", "HomeClient.tsx");
const pricingPagePath = path.join(ROOT, "src", "app", "(public)", "pricing", "page.tsx");
const serviceCardPath = path.join(ROOT, "src", "components", "services", "ServiceCard.tsx");

const homeClientSrc = fs.readFileSync(homeClientPath, "utf-8");
const pricingPageSrc = fs.readFileSync(pricingPagePath, "utf-8");
const serviceCardSrc = fs.readFileSync(serviceCardPath, "utf-8");

// ------------------------------------------------------------------------------
// CHECK 1: Homepage Daily Trend Creator Flagship & 5-Step Pipeline
// ------------------------------------------------------------------------------
console.log("--> 1. Verifying Homepage Daily Trend Creator Feature...");
assert(
  homeClientSrc.includes("FLAGSHIP: DAILY CREATIVE QUEUE"),
  "Homepage features Daily Trend Creator flagship badge"
);
assert(
  homeClientSrc.includes("Daily Trend Creator at ₹19,999 / 30 days"),
  "Homepage mentions ₹19,999 / 30 days"
);
assert(
  homeClientSrc.includes("5-Step Daily Production Engine:"),
  "Homepage features 5-step daily production engine header"
);
assert(
  homeClientSrc.includes("Daily Trend Research") &&
    homeClientSrc.includes("Brand-Specific Prompt") &&
    homeClientSrc.includes("Dual Asset Production") &&
    homeClientSrc.includes("Rigorous Studio QA") &&
    homeClientSrc.includes("Private Google Drive Vault Delivery"),
  "Homepage explains full 5-step daily pipeline (research -> prompt -> prod -> QA -> delivery)"
);

// ------------------------------------------------------------------------------
// CHECK 2: Homepage Hero Disciplines & Starting Prices
// ------------------------------------------------------------------------------
console.log("\n--> 2. Verifying Homepage Hero Disciplines & Starting Prices...");
assert(
  homeClientSrc.includes('"From ₹99"') && homeClientSrc.includes('"From ₹199"'),
  "Hero disciplines show canonical starting rates (From ₹99, From ₹199)"
);
assert(
  !homeClientSrc.includes('id: "workflow-automation", label: "Automation"'),
  "Hero disciplines strictly omit internal workflow automation"
);
assert(
  homeClientSrc.includes('href: "/services#image-creation"') &&
    homeClientSrc.includes('href: "/services#video-creation"'),
  "Hero disciplines link directly to existing /services#<slug> detail routes"
);

// ------------------------------------------------------------------------------
// CHECK 3: ServiceCard Detail Route & Order Flow Links
// ------------------------------------------------------------------------------
console.log("\n--> 3. Verifying ServiceCard links...");
assert(
  serviceCardSrc.includes('const detailHref = `/services#${service.slug}`'),
  "ServiceCard constructs detail route `/services#${service.slug}`"
);
assert(
  serviceCardSrc.includes('const orderHref = `/orders?service=${service.slug}`'),
  "ServiceCard constructs order route `/orders?service=${service.slug}`"
);
assert(
  serviceCardSrc.includes('href={detailHref}') && serviceCardSrc.includes('href={orderHref}'),
  "ServiceCard provides distinct clickable routes for both Details and Order"
);

// ------------------------------------------------------------------------------
// CHECK 4: Pricing Page Tab Separation
// ------------------------------------------------------------------------------
console.log("\n--> 4. Verifying Pricing Page Tab Separation...");
assert(
  pricingPageSrc.includes('30-Day Retainers') &&
    pricingPageSrc.includes('Individual Services') &&
    pricingPageSrc.includes('Bulk Deliverable Packs'),
  "Pricing page separates Monthly Retainers, Individual Services, and Bulk Deliverable Packs"
);
assert(
  pricingPageSrc.includes('APPROVED_MONTHLY_PACKAGES') &&
    pricingPageSrc.includes('APPROVED_STANDALONE_PACKAGES') &&
    pricingPageSrc.includes('CANONICAL_SERVICES'),
  "Pricing page imports canonical catalog configurations directly"
);

// ------------------------------------------------------------------------------
// CHECK 5: Pricing Page Scope Exclusions & Disclaimers
// ------------------------------------------------------------------------------
console.log("\n--> 5. Verifying Scope Exclusions & Guardrails...");
assert(
  pricingPageSrc.includes("Studio Production Scope & Exclusion Guardrails") ||
    pricingPageSrc.includes("Studio Production Scope &amp; Exclusion Guardrails"),
  "Pricing page contains prominent Production Scope & Exclusion Guardrails section"
);
assert(
  pricingPageSrc.includes("Paid Advertising Media Spend") &&
    pricingPageSrc.includes("Physical On-Site Video Crews") &&
    (pricingPageSrc.includes("Actor &amp; Talent") || pricingPageSrc.includes("Actor & Talent")) &&
    pricingPageSrc.includes("Raw Working Project Files"),
  "Pricing page clearly details excluded items (Ad spend, live shoots, actors, raw files)"
);

// ------------------------------------------------------------------------------
// CHECK 6: Pricing Page CTA Order Parameters
// ------------------------------------------------------------------------------
console.log("\n--> 6. Verifying Order CTA Query Parameters...");
assert(
  pricingPageSrc.includes('href={`/orders?package=${tier.id}&cycle=monthly`}'),
  "Monthly Retainer CTAs pass correct package ID and cycle=monthly"
);
assert(
  pricingPageSrc.includes('href={`/orders?package=${pkg.id}`}'),
  "Bulk Pack CTAs pass correct package ID (/orders?package=...)"
);
assert(
  pricingPageSrc.includes('href={`/orders?service=${service.slug}`}'),
  "Individual Service CTAs pass correct service slug (/orders?service=...)"
);

// ------------------------------------------------------------------------------
// CHECK 7: Zero NaN or Corrupted Price Strings
// ------------------------------------------------------------------------------
console.log("\n--> 7. Verifying Price String Hygiene...");
assert(!homeClientSrc.includes("₹NaN"), "Homepage free from ₹NaN");
assert(!pricingPageSrc.includes("₹NaN"), "Pricing page free from ₹NaN");
assert(!homeClientSrc.includes("undefined"), "Homepage free from undefined text artifacts");

// ------------------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL HOMEPAGE & PRICING UI TESTS PASSED CLEANLY!\n");
  process.exit(0);
}
