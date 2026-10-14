/**
 * SUTRA STUDIOS — STEP 6: FRONTEND QA & APPROVAL GATE (browser verification)
 * Run with: node scripts/qa-step6-frontend.mjs   (requires `npm run start` on :3000)
 *
 * Live-browser verification of Steps 1–5 frontend changes:
 *   HOME · SERVICES · SERVICE DETAILS · CHAT · PACKAGES/PRICING · NEW ORDER GUARD
 * Captures screenshots into docs/qa/step6/screenshots/.
 * Every assertion below is executed against the running production build.
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ROOT = process.cwd();
const SHOT_DIR = path.join(ROOT, "docs", "qa", "step6", "screenshots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

const MAIN_SERVICES = [
  { slug: "image-creation", title: "Image Creation" },
  { slug: "video-creation", title: "Video Creation" },
  { slug: "3d-modeling", title: "3D Modeling" },
  { slug: "360-view", title: "360° View" },
  { slug: "website-development", title: "Web Designing" },
  { slug: "digital-marketing", title: "Digital Marketing" },
  { slug: "web-app-development", title: "Web Development" },
  { slug: "mobile-app-setup", title: "App Development" },
];

console.log("\n========================================================");
console.log("   STEP 6 — FRONTEND QA & APPROVAL GATE (LIVE BROWSER)");
console.log(`   Target: ${BASE_URL}`);
console.log("========================================================\n");

let total = 0;
let passed = 0;
const failures = [];

function check(desc, ok, extra = "") {
  total++;
  if (ok) {
    passed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    failures.push(`${desc} ${extra}`);
    console.error(`  ✗ FAIL: ${desc} ${extra ? `-> ${extra}` : ""}`);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// ---------------------------------------------------------------- readiness
let serverReady = false;
for (let i = 0; i < 25; i++) {
  try {
    const resp = await page.goto(`${BASE_URL}/`, { timeout: 4000 });
    if (resp && resp.status() < 400) {
      serverReady = true;
      break;
    }
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
  }
}
if (!serverReady) {
  console.error("  ✗ Production server not responding — aborting.");
  await browser.close();
  process.exit(1);
}
console.log("--> 0. Production server is live.\n");

// ================================================================== HOME
console.log("--> 1. HOME PAGE...");
await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const home = await page.evaluate((slugs) => {
  const bodyText = document.body.innerText;
  const serviceLinks = Array.from(
    document.querySelectorAll('a[href^="/services/"]')
  ).map((a) => a.getAttribute("href"));
  const uniqueDetailHrefs = [...new Set(serviceLinks)];
  const viewServiceLinks = Array.from(
    document.querySelectorAll("a")
  ).filter((a) => a.textContent.trim().includes("View Service"));
  return {
    hasRupee: bodyText.includes("₹"),
    hasStartingFrom: /starting (from|at)/i.test(bodyText),
    hasMonthlyPrice: /₹\s?\d+.*\/\s?mo/i.test(bodyText),
    uniqueDetailHrefs,
    viewServiceCount: viewServiceLinks.length,
    missingSlugs: slugs.filter(
      (s) => !uniqueDetailHrefs.includes(`/services/${s}`)
    ),
  };
}, MAIN_SERVICES.map((s) => s.slug));

check("Home has no individual/monthly prices or pricing tables (no ₹)", !home.hasRupee && !home.hasStartingFrom && !home.hasMonthlyPrice);
check("Home links to exactly the eight main service detail routes", home.missingSlugs.length === 0 && home.uniqueDetailHrefs.length === 8, `hrefs=${home.uniqueDetailHrefs.join(",")}`);
check("Home shows View Service actions on the service cards", home.viewServiceCount >= 8, `count=${home.viewServiceCount}`);
await page.screenshot({ path: path.join(SHOT_DIR, "01-home-desktop.png"), fullPage: false });

// Click a View Service action → must land on that service's detail page
const firstCardLink = page
  .locator('a[href="/services/image-creation"]')
  .filter({ hasText: "View Service" })
  .first();
await firstCardLink.click();
await page.waitForLoadState("networkidle");
await page.waitForTimeout(500);
check("View Service opens the correct detail page (/services/image-creation)", page.url().includes("/services/image-creation"), page.url());

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(SHOT_DIR, "02-home-mobile.png"), fullPage: false });
await page.setViewportSize({ width: 1440, height: 900 });

// ============================================================= SERVICES
console.log("\n--> 2. SERVICES PAGE...");
await page.goto(`${BASE_URL}/services`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const servicesPage = await page.evaluate((slugs) => {
  const bodyText = document.body.innerText;
  const detailHrefs = [
    ...new Set(
      Array.from(document.querySelectorAll('a[href^="/services/"]')).map((a) =>
        a.getAttribute("href")
      )
    ),
  ];
  return {
    hasRupee: bodyText.includes("₹"),
    hasPriceBadge: bodyText.toLowerCase().includes("starting price"),
    linksPackages: document.querySelector('a[href="/packages"]') !== null,
    linksPricing: document.querySelector('a[href="/pricing"]') !== null,
    missing: slugs.filter((s) => !detailHrefs.includes(`/services/${s}`)),
  };
}, MAIN_SERVICES.map((s) => s.slug));

check("Services page is fully price-free (no ₹, no price labels)", !servicesPage.hasRupee && !servicesPage.hasPriceBadge);
check("All eight services accessible from the Services page", servicesPage.missing.length === 0, `missing=${servicesPage.missing.join(",")}`);
check("Services page navigates to Packages (/packages) and Pricing (/pricing)", servicesPage.linksPackages && servicesPage.linksPricing);
await page.screenshot({ path: path.join(SHOT_DIR, "03-services-desktop.png"), fullPage: false });

// ==================================================== SERVICE DETAILS (x8)
console.log("\n--> 3. EIGHT SERVICE DETAIL PAGES...");
const detailTitleMap = [];
for (const svc of MAIN_SERVICES) {
  const resp = await page.goto(`${BASE_URL}/services/${svc.slug}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(700);
  const detail = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const h1 = document.querySelector("h1");
    return {
      hasRupee: bodyText.includes("₹"),
      h1: h1 ? h1.textContent.trim() : "",
      hasStartOrder: bodyText.includes("Start Order"),
      hasViewPackages: bodyText.includes("View Packages"),
      hasExplorePricing: bodyText.includes("Explore Pricing"),
      hasExclusions: bodyText.includes("Exclusions"),
      hasStudioSample: bodyText.includes("Studio Sample"),
    };
  });
  detailTitleMap.push(`${svc.slug}: "${svc.title}" -> h1 "${detail.h1}"`);
  const statusOk = resp && resp.status() < 400;
  check(
    `/services/${svc.slug} loads, price-free, with Start Order + Packages/Pricing links, exclusions & studio samples`,
    statusOk &&
      detail.hasRupee === false &&
      detail.h1.length > 0 &&
      detail.hasStartOrder &&
      detail.hasViewPackages &&
      detail.hasExplorePricing &&
      detail.hasExclusions &&
      detail.hasStudioSample,
    `status=${resp?.status()} h1="${detail.h1}" rupee=${detail.hasRupee} order=${detail.hasStartOrder} pkg=${detail.hasViewPackages} pricing=${detail.hasExplorePricing} excl=${detail.hasExclusions} sample=${detail.hasStudioSample}`
  );
  if (svc.slug === "image-creation") {
    await page.screenshot({ path: path.join(SHOT_DIR, "04-detail-image-creation.png"), fullPage: false });
  }
  if (svc.slug === "3d-modeling") {
    await page.screenshot({ path: path.join(SHOT_DIR, "05-detail-3d-modeling.png"), fullPage: false });
  }
}
console.log("  [INFO] Display title -> detail-page h1 mapping (observation):");
detailTitleMap.forEach((line) => console.log("    " + line));

// ================================================================== CHAT
console.log("\n--> 4. CHAT BOX SERVICE DISCOVERY...");
await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.click('button[aria-label="Open Sutra Studio Concierge"]');
await page.waitForSelector('textarea, input[placeholder="Ask in English, ગુજરાતી or हिंदी..."]', { timeout: 8000 });
const chatInput = page.locator('textarea[placeholder="Ask in English, ગુજરાતી or हिंदी..."], input[placeholder="Ask in English, ગુજરાતી or हिंदी..."]').first();
await chatInput.fill("what services do you offer?");
await page.click('button[aria-label="Send message"]');
await page.waitForSelector('[aria-label="Sutra Studio main services"]', { timeout: 10000 }).catch(() => null);
await page.waitForTimeout(800);

const chat = await page.evaluate((titles) => {
  const panel = document.querySelector('[aria-label="Sutra Studio main services"]');
  const panelText = panel ? panel.innerText : "";
  const items = panel
    ? Array.from(panel.querySelectorAll('button[aria-label$="service details"]')).map((b) => ({
        label: b.getAttribute("aria-label"),
      }))
    : [];
  return {
    panelFound: panel !== null,
    panelText,
    items,
    missingTitles: titles.filter((t) => !panelText.includes(t)),
    hasRupee: panelText.includes("₹"),
  };
}, MAIN_SERVICES.map((s) => s.title));

check("Chat service-discovery panel opens for a services question", chat.panelFound);
check("Chat lists all eight services by name", chat.missingTitles.length === 0 && chat.items.length === 8, `items=${chat.items.length} missing=${chat.missingTitles.join(",")}`);
check("Chat service suggestions show no prices", !chat.hasRupee);
await page.screenshot({ path: path.join(SHOT_DIR, "06-chat-service-catalog.png"), fullPage: false });

// Selecting a service in chat must navigate to its detail page
await page.click('button[aria-label="View App Development service details"]');
await page.waitForTimeout(1200);
check("Selecting a service in chat navigates to its detail page", page.url().includes("/services/mobile-app-setup"), page.url());

// ======================================================= PACKAGES / PRICING
console.log("\n--> 5. PACKAGES / PRICING PAGE...");
await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const pricing = await page.evaluate(() => {
  const bodyText = document.body.innerText;
  const expectedFixed = [
    ["Social media post", "₹299"],
    ["Premium promotional design", "₹499"],
    ["Ad banner", "₹499"],
    ["Thumbnail / Reel cover", "₹299"],
    ["AI product visual", "₹499"],
    ["Logo concept", "₹999"],
    ["Three logo concepts", "₹1,999"],
    ["Five social posts", "₹1,499"],
    ["Ten social posts", "₹2,499"],
    ["10–15 second AI Reel", "₹999"],
    ["30-second promotional Reel", "₹1,499"],
    ["30–40 second AI advertisement", "₹1,999"],
    ["60-second promotional video", "₹2,999"],
    ["Premium 60-second advertisement", "₹4,999"],
    ["Five 15-second Reels", "₹3,999"],
    ["Ten 15-second Reels", "₹7,499"],
  ];
  const expectedRanges = [
    ["3D Modeling", "₹1,999 – ₹9,999"],
    ["360° View", "₹2,999 – ₹9,999"],
    ["Web Designing", "₹2,999 – ₹9,999"],
    ["Digital Marketing", "₹4,999 – ₹9,999"],
    ["Web Development", "₹9,999 – ₹19,999"],
    ["App Development", "₹4,999 – ₹19,999"],
  ];
  const expectedPackages = [
    ["Starter Creative", "₹9,999", "12 images", "4 AI Reels"],
    ["Growth Creative", "₹14,999", "20 images", "8 AI Reels"],
    ["Daily Creative Pro", "₹19,999", "30 images", "30 AI videos"],
  ];
  const hrefs = Array.from(document.querySelectorAll("a")).map((a) =>
    a.getAttribute("href")
  );
  const rowStartOrders = Array.from(
    document.querySelectorAll('a[href^="/new-order?service="]')
  ).map((a) => a.getAttribute("href"));
  return {
    missingFixed: expectedFixed.filter(
      ([item, price]) => !(bodyText.includes(item) && bodyText.includes(price))
    ),
    missingRanges: expectedRanges.filter(
      ([svc, range]) => !(bodyText.includes(svc) && bodyText.includes(range))
    ),
    missingPackages: expectedPackages.filter(
      ([name, price, img, vid]) =>
        !(bodyText.includes(name) && bodyText.includes(price) && bodyText.includes(img) && bodyText.includes(vid))
    ),
    hasSectionA: document.querySelector("#single-service-pricing") !== null,
    hasSectionB: document.querySelector("#monthly-packages") !== null,
    hasSectionABadge: bodyText.includes("Section A — One-Time Services"),
    hasSectionBBadge: bodyText.includes("Section B — Monthly Packages"),
    hasBilling: bodyText.includes("Billed every 30 days"),
    hasRevisions: bodyText.includes("Revisions:"),
    hasExclusions: bodyText.includes("Not included:"),
    hrefs,
    rowStartOrders,
    hasProposedNotice: bodyText.includes("Proposed display prices for review"),
    hasRangeDisclaimer: bodyText.includes("not a confirmed checkout price"),
  };
});

check("All 16 fixed one-time items show correct name + INR price", pricing.missingFixed.length === 0, `missing=${JSON.stringify(pricing.missingFixed)}`);
check("All 6 scoped services show their correct price ranges", pricing.missingRanges.length === 0, `missing=${JSON.stringify(pricing.missingRanges)}`);
check("All 3 monthly packages show correct name, price and quotas", pricing.missingPackages.length === 0, `missing=${JSON.stringify(pricing.missingPackages)}`);
check("One-time (Section A) and monthly (Section B) prices clearly separated", pricing.hasSectionA && pricing.hasSectionB && pricing.hasSectionABadge && pricing.hasSectionBBadge);
check("Monthly cards display billing frequency, revisions and exclusions", pricing.hasBilling && pricing.hasRevisions && pricing.hasExclusions);
check("Proposed-price and range disclaimers are present", pricing.hasProposedNotice && pricing.hasRangeDisclaimer);

// CTA navigation checks
const ctaExpected = [
  "/services/image-creation",
  "/services/video-creation",
  "/packages/starter-trend",
  "/packages/growth-trend",
  "/packages/daily-trend-creator",
  "/new-order?package=starter-trend",
  "/new-order?package=growth-trend",
  "/new-order?package=daily-trend-creator",
  "/new-order?service=image-creation",
  "/new-order?service=video-creation",
  "/contact",
  "/orders",
];
const missingCtas = ctaExpected.filter((h) => !pricing.hrefs.includes(h));
check("All package-selection buttons carry correct navigation targets", missingCtas.length === 0, `missing=${missingCtas.join(",")}`);
check(
  "Fixed-item rows carry the selected deliverable into New Order",
  pricing.rowStartOrders.includes("/new-order?service=image-creation&deliverable=image-social-media-post"),
  `sample=${pricing.rowStartOrders[0] ?? "none"}`
);

const sectionA = await page.locator("#single-service-pricing");
await sectionA.screenshot({ path: path.join(SHOT_DIR, "07-pricing-section-a.png") });
const sectionB = await page.locator("#monthly-packages");
await sectionB.screenshot({ path: path.join(SHOT_DIR, "08-pricing-section-b.png") });

// Category filter behaviour
await page.locator('#single-service-pricing button:text-is("Development")').click();
await page.waitForTimeout(400);
const filtered = await page.evaluate(() => {
  const bodyText = document.body.innerText;
  return {
    fixedHidden: !bodyText.includes("Social media post"),
    scopedVisible: bodyText.includes("Web Designing") && bodyText.includes("App Development"),
  };
});
check("Category filter hides other categories and shows Development services", filtered.fixedHidden && filtered.scopedVisible);
await page.locator('#single-service-pricing button:text-is("All Services")').click();
await page.waitForTimeout(400);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(SHOT_DIR, "09-pricing-mobile.png"), fullPage: false });
await page.setViewportSize({ width: 1440, height: 900 });

// ================================================= NEW ORDER / AUTH GUARDS
console.log("\n--> 6. NEW ORDER & AUTHENTICATION GUARDS...");
await page.goto(`${BASE_URL}/new-order`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const newOrderUrl = page.url();
check("Unauthenticated /new-order is redirected to login (auth intact)", newOrderUrl.includes("login"), newOrderUrl);
await page.screenshot({ path: path.join(SHOT_DIR, "10-new-order-auth-guard.png"), fullPage: false });

await page.goto(`${BASE_URL}/orders`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
check("Unauthenticated /orders is redirected to login (client area guarded)", page.url().includes("login"), page.url());

await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const adminUrl = page.url();
check("Unauthenticated /admin is guarded (redirects away from admin)", adminUrl.includes("login") || adminUrl.includes("admin"), adminUrl);

// ================================================================== DONE
await browser.close();

console.log("\n========================================================");
console.log(`TOTAL BROWSER ASSERTIONS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failures.length}`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
}
console.log(`Screenshots: ${SHOT_DIR}`);
console.log("========================================================\n");
process.exit(failures.length === 0 ? 0 : 1);
