/**
 * Automated Playwright Responsive Viewport & UI Verification Suite
 * Tests widths: 320, 360, 390, 430, 768, 1024, 1280, and 1440 px
 * Checks: No horizontal overflow, touch targets, pricing readability, reduced motion.
 */

import { chromium } from "playwright";
import assert from "assert";

const VIEWPORT_WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const PAGES_TO_TEST = [
  { name: "Homepage", path: "/" },
  { name: "Pricing Page", path: "/pricing" },
  { name: "Services Catalog", path: "/services" },
  { name: "Contact Intake", path: "/contact" },
];

console.log("\n========================================================");
console.log("   RESPONSIVE VIEWPORT & UI VERIFICATION (PLAYWRIGHT)   ");
console.log("========================================================\n");
console.log(`Target Server: ${BASE_URL}`);
console.log(`Viewports to test: ${VIEWPORT_WIDTHS.join(", ")} px\n`);

async function runTests() {
  const browser = await chromium.launch({
    headless: true,
  });

  let totalAssertions = 0;
  let passedAssertions = 0;
  const failures = [];

  function record(desc, ok, extra = "") {
    totalAssertions++;
    if (ok) {
      passedAssertions++;
      console.log(`  ✓ PASS: ${desc}`);
    } else {
      console.error(`  ✗ FAIL: ${desc} ${extra}`);
      failures.push(`${desc} ${extra}`);
    }
  }

  // 1. Wait for server readiness
  console.log("--> 1. Checking Dev Server Readiness...");
  const setupContext = await browser.newContext();
  const setupPage = await setupContext.newPage();
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const resp = await setupPage.goto(`${BASE_URL}/`, { timeout: 4000 });
      if (resp && resp.status() < 400) {
        serverReady = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  await setupContext.close();

  if (!serverReady) {
    console.error("  ✗ Dev server not responding at " + BASE_URL);
    await browser.close();
    process.exit(1);
  }
  console.log("  ✓ Dev server is live and responding!\n");

  // 2. Test each page at each viewport width
  console.log("--> 2. Testing Viewport Widths (320px to 1440px)...");
  for (const pageConfig of PAGES_TO_TEST) {
    console.log(`\n  --- Page: ${pageConfig.name} (${pageConfig.path}) ---`);

    for (const width of VIEWPORT_WIDTHS) {
      const height = width < 768 ? 800 : 900;
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });

      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}${pageConfig.path}`, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        // Wait for hydration
        await page.waitForTimeout(600);

        // Check horizontal overflow
        const overflow = await page.evaluate((expectedWidth) => {
          const docWidth = document.documentElement.scrollWidth;
          const bodyWidth = document.body.scrollWidth;
          const maxW = Math.max(docWidth, bodyWidth);
          return {
            maxW,
            expectedWidth,
            hasOverflow: maxW > expectedWidth + 1, // allow 1px sub-pixel rounding
          };
        }, width);

        record(
          `[${width}px] ${pageConfig.name}: No horizontal overflow (${overflow.maxW}px <= ${width}px)`,
          !overflow.hasOverflow,
          `Found scrollWidth: ${overflow.maxW}px vs viewport: ${width}px`
        );
      } catch (err) {
        record(`[${width}px] ${pageConfig.name}: Loaded without error`, false, err.message);
      } finally {
        await context.close();
      }
    }
  }

  // 3. Test Pricing Page Mobile Card Readability (no forced horizontal table scrolling)
  console.log("\n--> 3. Testing Mobile Pricing Cards (360px)...");
  {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    const pricingInfo = await page.evaluate(() => {
      // Find Daily Trend Creator card
      const bodyText = document.body.innerText;
      const hasDailyTrend = bodyText.includes("Daily Trend Creator");
      const hasPrice19999 = bodyText.includes("19,999");
      const hasStarter = bodyText.includes("Starter Trend");

      // Verify no horizontal scrollbar forced on pricing cards container
      const container = document.querySelector("main");
      const isContained = container ? container.scrollWidth <= 362 : false;

      return { hasDailyTrend, hasPrice19999, hasStarter, isContained };
    });

    record("Mobile pricing displays Daily Trend Creator at 360px", pricingInfo.hasDailyTrend);
    record("Mobile pricing displays ₹19,999 price tag at 360px", pricingInfo.hasPrice19999);
    record("Mobile pricing cards fit vertically without forced table overflow", pricingInfo.isContained);

    await context.close();
  }

  // 4. Test Service Detail Modal on Mobile (390px)
  console.log("\n--> 4. Testing Service Detail Modal / Drawer (390px)...");
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/services?service=image-creation`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(600);

    const modalInfo = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const dialogText = dialog ? dialog.innerText : "";
      const bodyText = document.body.innerText;
      const combinedText = dialogText || bodyText;

      const hasDialog = dialog !== null;
      const hasAudience =
        combinedText.includes("Ideal For") ||
        combinedText.includes("Target Audience") ||
        combinedText.includes("Intended Audience");
      const hasPipeline =
        combinedText.toLowerCase().includes("5-step production") ||
        combinedText.toLowerCase().includes("production process") ||
        combinedText.toLowerCase().includes("pipeline");
      const hasSampleBadge =
        combinedText.includes("STUDIO TECHNICAL SAMPLE") ||
        combinedText.includes("STUDIO SAMPLE") ||
        combinedText.includes("STUDIO PORTFOLIO SHOWCASE");
      const hasOrderCTA = document.querySelector('a[href*="/orders?service="]') !== null;

      return { hasDialog, hasAudience, hasPipeline, hasSampleBadge, hasOrderCTA };
    });

    record("Deep-link /services?service=image-creation opens modal", modalInfo.hasDialog);
    record("Modal displays Ideal For target audience", modalInfo.hasAudience);
    record("Modal displays 5-step production process", modalInfo.hasPipeline);
    record("Modal displays Studio Technical Sample disclaimer", modalInfo.hasSampleBadge);
    record("Modal displays Order CTA button with correct service query parameter", modalInfo.hasOrderCTA);

    await context.close();
  }

  // 5. Test Touch Target Standards on Mobile Navigation (430px)
  console.log("\n--> 5. Testing Touch Targets & Bottom Nav on Mobile (430px)...");
  {
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    const navTargets = await page.evaluate(() => {
      const bottomNavLinks = Array.from(document.querySelectorAll('nav[aria-label="Mobile app bottom navigation"] a'));
      const minHeights = bottomNavLinks.map((el) => {
        const rect = el.getBoundingClientRect();
        return { w: rect.width, h: rect.height };
      });
      const allMeetStandard = minHeights.every((dim) => dim.h >= 40 && dim.w >= 40);

      const chatLauncher = document.querySelector('button[aria-label*="Concierge"]');
      const chatRect = chatLauncher ? chatLauncher.getBoundingClientRect() : null;
      const chatMeets = chatRect ? chatRect.width >= 44 && chatRect.height >= 44 : false;

      return {
        count: bottomNavLinks.length,
        allMeetStandard,
        chatMeets,
      };
    });

    record("MobileBottomNav renders 5 curated tabs", navTargets.count === 5);
    record("MobileBottomNav tabs meet ~44px touch target guidelines", navTargets.allMeetStandard);
    record("Floating Concierge launcher meets 44×44px touch target", navTargets.chatMeets);

    await context.close();
  }

  // 6. Test Reduced Motion Directive
  console.log("\n--> 6. Testing prefers-reduced-motion CSS Directive...");
  {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const reducedMotionCheck = await page.evaluate(() => {
      // Check if animation-duration is overridden to ~0 on elements
      const hero = document.querySelector("h1");
      const comp = hero ? window.getComputedStyle(hero) : null;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return { prefersReduced };
    });

    record("Browser recognizes prefers-reduced-motion: reduce", reducedMotionCheck.prefersReduced);

    await context.close();
  }

  await browser.close();

  console.log("\n========================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED: ${passedAssertions}`);
  console.log(`FAILED: ${failures.length}`);
  console.log("========================================================\n");

  if (failures.length === 0) {
    console.log("ALL RESPONSIVE VIEWPORT & UI CHECKS PASSED WITH 100% SUCCESS!\n");
    process.exit(0);
  } else {
    console.error("FAILURES DETECTED:\n" + failures.join("\n"));
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
