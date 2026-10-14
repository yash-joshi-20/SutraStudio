#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — HOMEPAGE & PRICING PAGE CANONICAL UI VERIFICATION
 * ==============================================================================
 * Verifies (current post-Step-2/3/4 reality):
 * 1. Homepage renders the eight main services price-free from the shared config
 * 2. Homepage hero disciplines derive from MAIN_SERVICES and omit automation
 * 3. ServiceCard links to existing /services#<slug> and /orders?service=<slug>
 * 4. Pricing page separates Section A (one-time services) from Section B (monthly)
 * 5. Pricing page contains clear production exclusions policy
 * 6. Pricing page CTAs pass correct package/service IDs to existing order flows
 * 7. Zero NaN or corrupted price strings
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
// CHECK 1: Homepage renders the eight main services price-free
// ------------------------------------------------------------------------------
console.log("--> 1. Verifying Homepage Unified Service Catalogue...");
assert(
  homeClientSrc.includes("getMainServices") && homeClientSrc.includes("MAIN_SERVICES"),
  "Homepage renders the eight main services from the shared configuration"
);
assert(
  !homeClientSrc.includes("₹"),
  "Homepage is fully price-free (no ₹ amounts shown)"
);
assert(
  homeClientSrc.includes("`/services/${service.slug}`") ||
    homeClientSrc.includes('href="/services/'),
  "Homepage service cards link to real /services/<slug> detail routes"
);
assert(
  !homeClientSrc.includes("/services#"),
  "Homepage no longer links to legacy /services# anchors"
);

// ------------------------------------------------------------------------------
// CHECK 2: Homepage Hero Disciplines derive from the shared configuration
// ------------------------------------------------------------------------------
console.log("\n--> 2. Verifying Homepage Hero Disciplines...");
assert(
  homeClientSrc.includes("HERO_DISCIPLINES = MAIN_SERVICES.map"),
  "Hero disciplines derive from MAIN_SERVICES (single source of truth)"
);
assert(
  !homeClientSrc.includes('id: "workflow-automation", label: "Automation"'),
  "Hero disciplines strictly omit internal workflow automation"
);

// ------------------------------------------------------------------------------
// CHECK 3: ServiceCard Detail Route & Order Flow Links (legacy component)
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
// CHECK 4: Pricing Page Section Separation (One-Time vs Monthly)
// ------------------------------------------------------------------------------
console.log("\n--> 4. Verifying Pricing Page Section Separation...");
assert(
  pricingPageSrc.includes("id=\"single-service-pricing\"") &&
    pricingPageSrc.includes("Section A — One-Time Services"),
  "Pricing page has Section A for one-time single-service pricing"
);
assert(
  pricingPageSrc.includes("id=\"monthly-packages\"") &&
    pricingPageSrc.includes("Section B — Monthly Packages"),
  "Pricing page has Section B for monthly creative packages"
);
assert(
  pricingPageSrc.includes("@/config/displayPricing"),
  "Pricing page reads prices from the centralized display configuration"
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
  pricingPageSrc.includes('href={`/new-order?package=${pkg.canonicalSlug}`}'),
  "Monthly package CTAs pass the canonical package ID (/new-order?package=...)"
);
assert(
  pricingPageSrc.includes('href={`/new-order?service=${group.serviceSlug}`}'),
  "Fixed one-time service CTAs pass the service slug (/new-order?service=...)"
);
assert(
  pricingPageSrc.includes('href="/contact"'),
  "Scoped range services offer a quote inquiry via the existing /contact flow"
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
