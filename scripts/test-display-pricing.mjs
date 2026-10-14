/**
 * Verification Test: Display Pricing Configuration & Packages/Pricing Page (STEP 4)
 * Run with: node scripts/test-display-pricing.mjs (uses tsx via import)
 *
 * Validates that:
 *  1. Section A / Section B prices live once in src/config/displayPricing.ts
 *  2. Every proposed amount matches the mandated Step 4 catalogue exactly
 *  3. Monthly display prices stay aligned with the canonical retainer packages
 *  4. All service/package slugs resolve to existing catalog entries & routes
 *  5. /pricing renders both sections, filters, and all mandated CTA buttons
 *  6. The pricing catalogue is NOT consumed by Home, Services or Chat
 */

import assert from "assert";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

console.log("\n========================================================");
console.log("   DISPLAY PRICING — CONFIGURATION & PAGE VERIFICATION");
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

// Dynamic imports (TypeScript resolved via tsx runner)
const displayPricingUrl = pathToFileURL(
  path.join(ROOT, "src", "config", "displayPricing.ts")
).href;
const servicesUrl = pathToFileURL(
  path.join(ROOT, "src", "config", "services.ts")
).href;
const packagesUrl = pathToFileURL(
  path.join(ROOT, "src", "config", "packages.ts")
).href;

const {
  DISPLAY_FIXED_PRICE_ITEMS,
  DISPLAY_SCOPED_PRICE_ITEMS,
  DISPLAY_MONTHLY_PACKAGES,
  getDisplayPriceCategories,
  getFixedPriceServiceGroups,
  getLowestFixedPrice,
  getCanonicalMonthlyPackage,
} = await import(displayPricingUrl);
const { findServiceBySlug } = await import(servicesUrl);
const { findPackageById } = await import(packagesUrl);

console.log("--> 1. Mandated single-service prices (Section A) exact match...");

const EXPECTED_FIXED = [
  // IMAGE CREATION
  ["Social media post", 299, "per design"],
  ["Premium promotional design", 499, "per design"],
  ["Ad banner", 499, "per design"],
  ["Thumbnail / Reel cover", 299, "per design"],
  ["AI product visual", 499, "per image"],
  ["Logo concept", 999, "per concept"],
  ["Three logo concepts", 1999, "per pack"],
  ["Five social posts", 1499, "per pack"],
  ["Ten social posts", 2499, "per pack"],
  // VIDEO CREATION
  ["10–15 second AI Reel", 999, "per video"],
  ["30-second promotional Reel", 1499, "per video"],
  ["30–40 second AI advertisement", 1999, "per video"],
  ["60-second promotional video", 2999, "per video"],
  ["Premium 60-second advertisement", 4999, "per video"],
  ["Five 15-second Reels", 3999, "per pack"],
  ["Ten 15-second Reels", 7499, "per pack"],
];

check("All 16 mandated fixed-price items exist with exact prices & units", () => {
  assert.strictEqual(
    DISPLAY_FIXED_PRICE_ITEMS.length,
    16,
    `expected 16 fixed items, got ${DISPLAY_FIXED_PRICE_ITEMS.length}`
  );
  for (const [item, price, unit] of EXPECTED_FIXED) {
    const match = DISPLAY_FIXED_PRICE_ITEMS.find((f) => f.item === item);
    assert(match, `missing fixed item: "${item}"`);
    assert.strictEqual(
      match.price,
      price,
      `"${item}" expected ₹${price}, got ₹${match.price}`
    );
    assert.strictEqual(match.unit, unit, `"${item}" unit mismatch`);
    assert(Number.isInteger(match.price), `"${item}" price must be whole INR`);
  }
});

check("Fixed items belong to the two mandated services only", () => {
  const slugs = [...new Set(DISPLAY_FIXED_PRICE_ITEMS.map((f) => f.serviceSlug))];
  assert.deepStrictEqual(slugs, ["image-creation", "video-creation"]);
});

const EXPECTED_SCOPED = [
  ["3D Modeling", "3d-modeling", 1999, 9999],
  ["360° View", "360-view", 2999, 9999],
  ["Web Designing", "website-development", 2999, 9999],
  ["Digital Marketing", "digital-marketing", 4999, 9999],
  ["Web Development", "web-app-development", 9999, 19999],
  ["App Development", "mobile-app-setup", 4999, 19999],
];

check("All 6 mandated scoped services exist with exact price ranges", () => {
  assert.strictEqual(DISPLAY_SCOPED_PRICE_ITEMS.length, 6);
  for (const [name, slug, min, max] of EXPECTED_SCOPED) {
    const match = DISPLAY_SCOPED_PRICE_ITEMS.find((s) => s.serviceName === name);
    assert(match, `missing scoped service: "${name}"`);
    assert.strictEqual(match.serviceSlug, slug, `"${name}" slug mismatch`);
    assert.strictEqual(match.minPrice, min, `"${name}" min price mismatch`);
    assert.strictEqual(match.maxPrice, max, `"${name}" max price mismatch`);
    assert(match.scopeNote, `"${name}" needs a scope note`);
  }
});

console.log("\n--> 2. Mandated monthly packages (Section B) exact match...");

const EXPECTED_PACKAGES = [
  ["starter-creative", "starter-trend", "Starter Creative", 9999, 12, 4, "up to 15 seconds each"],
  ["growth-creative", "growth-trend", "Growth Creative", 14999, 20, 8, "up to 15–30 seconds each"],
  ["daily-creative-pro", "daily-trend-creator", "Daily Creative Pro", 19999, 30, 30, "up to 10–15 seconds each"],
];

check("All 3 mandated monthly packages exist with exact quotas & prices", () => {
  assert.strictEqual(DISPLAY_MONTHLY_PACKAGES.length, 3);
  for (const [
    id,
    canonicalSlug,
    name,
    price,
    images,
    videos,
    duration,
  ] of EXPECTED_PACKAGES) {
    const pkg = DISPLAY_MONTHLY_PACKAGES.find((p) => p.id === id);
    assert(pkg, `missing monthly package: "${id}"`);
    assert.strictEqual(pkg.canonicalSlug, canonicalSlug, `${id} canonicalSlug mismatch`);
    assert.strictEqual(pkg.name, name, `${id} name mismatch`);
    assert.strictEqual(pkg.monthlyPrice, price, `${id} price mismatch`);
    assert.strictEqual(pkg.imageCount, images, `${id} image quota mismatch`);
    assert.strictEqual(pkg.videoCount, videos, `${id} video quota mismatch`);
    assert.strictEqual(pkg.videoDurationLimit, duration, `${id} duration limit mismatch`);
    assert(
      Array.isArray(pkg.inclusions) && pkg.inclusions.length >= 3,
      `${id} needs customer-facing inclusions`
    );
  }
});

check("Monthly display prices stay aligned with canonical retainer packages", () => {
  for (const pkg of DISPLAY_MONTHLY_PACKAGES) {
    const canonical = findPackageById(pkg.canonicalSlug);
    assert(canonical, `${pkg.id}: canonical slug "${pkg.canonicalSlug}" must resolve`);
    assert.strictEqual(
      pkg.monthlyPrice,
      canonical.numericPrice,
      `${pkg.id}: display ₹${pkg.monthlyPrice} != canonical ₹${canonical.numericPrice}`
    );
    assert.notStrictEqual(canonical.active, false, `${pkg.canonicalSlug} must be active`);
    assert(canonical.revisionPolicy, `${pkg.canonicalSlug} must define revisions`);
    assert(
      Array.isArray(canonical.exclusions) && canonical.exclusions.length > 0,
      `${pkg.canonicalSlug} must define exclusions`
    );
  }
});

console.log("\n--> 3. Catalog resolution & helper integrity...");

check("Every fixed/scoped slug resolves to an active canonical service", () => {
  for (const item of [...DISPLAY_FIXED_PRICE_ITEMS, ...DISPLAY_SCOPED_PRICE_ITEMS]) {
    const service = findServiceBySlug(item.serviceSlug);
    assert(service, `slug "${item.serviceSlug}" must resolve in catalog`);
    assert.notStrictEqual(service.active, false, `"${item.serviceSlug}" must be active`);
  }
});

check("getFixedPriceServiceGroups() groups items by service", () => {
  const groups = getFixedPriceServiceGroups();
  assert.strictEqual(groups.length, 2, `expected 2 groups, got ${groups.length}`);
  const image = groups.find((g) => g.serviceSlug === "image-creation");
  const video = groups.find((g) => g.serviceSlug === "video-creation");
  assert.strictEqual(image.items.length, 9, "image group needs 9 items");
  assert.strictEqual(video.items.length, 7, "video group needs 7 items");
});

check("getDisplayPriceCategories() covers all four filter categories", () => {
  const cats = getDisplayPriceCategories();
  for (const cat of ["Creative", "Design", "Marketing", "Development"]) {
    assert(cats.includes(cat), `missing category filter "${cat}"`);
  }
});

check("getLowestFixedPrice() resolves comparison floor per service", () => {
  assert.strictEqual(getLowestFixedPrice("image-creation"), 299);
  assert.strictEqual(getLowestFixedPrice("video-creation"), 999);
  assert.strictEqual(getLowestFixedPrice("3d-modeling"), null);
});

check("getCanonicalMonthlyPackage() maps to approved retainers", () => {
  for (const pkg of DISPLAY_MONTHLY_PACKAGES) {
    assert(
      getCanonicalMonthlyPackage(pkg.canonicalSlug),
      `${pkg.id} must resolve its canonical package`
    );
  }
});

console.log("\n--> 4. /pricing page renders the dedicated two-section catalogue...");

const pricingPageContent = fs.readFileSync(
  path.join(ROOT, "src", "app", "(public)", "pricing", "page.tsx"),
  "utf8"
);

check("Page reads every price from the centralized display configuration", () => {
  assert(
    pricingPageContent.includes("from \"@/config/displayPricing\""),
    "must import the display pricing configuration"
  );
  assert(pricingPageContent.includes("getFixedPriceServiceGroups"));
  assert(pricingPageContent.includes("DISPLAY_SCOPED_PRICE_ITEMS"));
  assert(pricingPageContent.includes("DISPLAY_MONTHLY_PACKAGES"));
  assert(
    pricingPageContent.includes("formatCurrencyINR"),
    "must format amounts via the shared INR formatter"
  );
});

check("Page renders two clearly separated sections", () => {
  assert(pricingPageContent.includes("id=\"single-service-pricing\""), "Section A anchor missing");
  assert(pricingPageContent.includes("id=\"monthly-packages\""), "Section B anchor missing");
  assert(pricingPageContent.includes("Section A — One-Time Services"));
  assert(pricingPageContent.includes("Section B — Monthly Packages"));
});

check("Page provides category filters for one-time services", () => {
  assert(pricingPageContent.includes("setActiveCategory"), "must manage filter state");
  assert(pricingPageContent.includes("aria-pressed"), "filter pills must expose pressed state");
  assert(pricingPageContent.includes("filterPills"), "must render filter pills");
});

check("Page allows price comparison across services", () => {
  assert(pricingPageContent.includes("Compare All Service Prices"), "comparison table missing");
  assert(pricingPageContent.includes("comparisonRows"), "comparison rows must be derived");
});

check("Page includes all mandated CTA buttons", () => {
  assert(pricingPageContent.includes("Select Service"), "Select Service CTA missing");
  assert(pricingPageContent.includes("Choose Package"), "Choose Package CTA missing");
  assert(pricingPageContent.includes("Start Order"), "Start Order CTA missing");
  assert(pricingPageContent.includes("Request Quote"), "Request Quote CTA missing (range services)");
});

check("Package CTAs use existing checkout routes (no new order flow)", () => {
  assert(
    pricingPageContent.includes("`/new-order?package=${pkg.canonicalSlug}`"),
    "Start Order must deep-link the existing /new-order package flow"
  );
  assert(
    pricingPageContent.includes("`/packages/${pkg.canonicalSlug}`"),
    "Choose Package must deep-link the existing /packages detail route"
  );
  assert(
    pricingPageContent.includes("`/new-order?service=${group.serviceSlug}`"),
    "fixed services must deep-link the existing /new-order service flow"
  );
  assert(
    pricingPageContent.includes(
      "`/new-order?service=${group.serviceSlug}&deliverable=${item.id}`"
    ),
    "fixed items must carry the selected deliverable into /new-order"
  );
});

check("Monthly cards display quantities, durations, revisions, exclusions & billing", () => {
  assert(pricingPageContent.includes("videoDurationLimit"), "video duration limits missing");
  assert(pricingPageContent.includes("pkg.inclusions"), "quota inclusions missing");
  assert(pricingPageContent.includes("Revisions:"), "revision policy missing");
  assert(pricingPageContent.includes("Not included:"), "exclusions missing");
  assert(pricingPageContent.includes("Billed every 30 days"), "billing frequency missing");
  assert(pricingPageContent.includes("Billed every 30 days, renewable monthly"), "billing cadence line missing");
});

check("Page keeps one-time and monthly prices visually & semantically separate", () => {
  assert(pricingPageContent.includes("One-Time Services"), "one-time badge missing");
  assert(pricingPageContent.includes("Monthly Packages"), "monthly badge missing");
  assert(
    pricingPageContent.includes("Monthly subscription"),
    "monthly cards must be labeled as subscriptions"
  );
});

check("Page discloses that prices are proposed frontend displays", () => {
  assert(
    pricingPageContent.includes("Proposed display prices for review"),
    "review disclaimer missing"
  );
  assert(
    pricingPageContent.includes("not a confirmed checkout price"),
    "range disclaimers must state ranges are not confirmed prices"
  );
});

check("Pricing catalogue is NOT consumed by Home, Services page or Chat", () => {
  for (const [name, relPath] of [
    ["HomeClient", path.join("src", "app", "HomeClient.tsx")],
    ["Services page", path.join("src", "app", "(public)", "services", "page.tsx")],
    ["Chat widget", path.join("src", "components", "chat", "FloatingChatModal.tsx")],
  ]) {
    const content = fs.readFileSync(path.join(ROOT, relPath), "utf8");
    assert(
      !content.includes("displayPricing"),
      `${name} must not import the display pricing catalogue`
    );
  }
});

console.log("\n========================================================");
console.log(`TOTAL TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log("========================================================\n");

if (passed === total) {
  console.log("ALL DISPLAY PRICING TESTS PASSED CLEANLY!\n");
  process.exit(0);
} else {
  console.error("SOME TESTS FAILED!\n");
  process.exit(1);
}
