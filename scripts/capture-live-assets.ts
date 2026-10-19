/**
 * SUTRA STUDIO — Automated Headless Browser Capture Pipeline
 * Captures authentic production assets from https://sutrastudios.in
 *
 * Deliverables:
 * 1. Desktop Full-Page: public/assets/showcase/live-home-desktop.png (1920x1080 @ 2x)
 * 2. Mobile Viewport: public/assets/showcase/live-home-mobile.png (390x844 iPhone 16 Pro)
 * 3. Authentic Showreel Video: public/assets/showcase/live-site-showreel.mp4 & .webm
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const TARGET_URL = process.env.CAPTURE_URL || "https://sutrastudios.in";
const OUTPUT_DIR = path.join(process.cwd(), "public", "assets", "showcase");

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function convertVideo(webmPath: string, mp4Path: string) {
  try {
    console.log(`[Showreel] Transcoding ${webmPath} -> ${mp4Path}...`);
    await execAsync(
      `ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${mp4Path}"`
    );
    console.log(`[Showreel] Successfully generated MP4 video at ${mp4Path}`);
  } catch (err: any) {
    console.warn(`[Showreel] FFmpeg not found, saving WebM directly to ${mp4Path}`);
    fs.copyFileSync(webmPath, mp4Path);
  }
}

export async function captureLiveAssets() {
  console.log(`[Asset Capture] Target URL: ${TARGET_URL}`);
  await ensureDir(OUTPUT_DIR);

  const desktopScreenshotPath = path.join(OUTPUT_DIR, "live-home-desktop.png");
  const mobileScreenshotPath = path.join(OUTPUT_DIR, "live-home-mobile.png");
  const showreelMp4Path = path.join(OUTPUT_DIR, "live-site-showreel.mp4");
  const showreelWebmPath = path.join(OUTPUT_DIR, "live-site-showreel.webm");
  const videoTempDir = path.join(OUTPUT_DIR, "temp_video");
  await ensureDir(videoTempDir);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // -------------------------------------------------------------
    // 1. DESKTOP CAPTURE & SHOWREEL RECORDING (1920x1080 @ 2x)
    // -------------------------------------------------------------
    console.log("[Desktop] Initializing 1920x1080 (Scale: 2) with video recorder...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2,
      recordVideo: {
        dir: videoTempDir,
        size: { width: 1920, height: 1080 },
      },
    });

    // Dismiss splash intro immediately
    await desktopContext.addInitScript(() => {
      sessionStorage.setItem("sutra_intro_dismissed", "true");
    });

    const desktopPage = await desktopContext.newPage();
    console.log(`[Desktop] Navigating to ${TARGET_URL}...`);
    try {
      await desktopPage.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 45000 });
    } catch {
      console.warn("[Desktop] Proceeding with domcontentloaded...");
      await desktopPage.waitForLoadState("domcontentloaded");
    }

    // Wait for animations and fonts to settle
    await desktopPage.waitForTimeout(3000);

    // Capture desktop hero screenshot
    console.log(`[Desktop] Capturing live desktop screenshot -> ${desktopScreenshotPath}`);
    await desktopPage.screenshot({
      path: desktopScreenshotPath,
      fullPage: false,
    });

    // Programmatic smooth scroll to record 8-10 second showreel
    console.log("[Desktop] Recording smooth scroll through Hero and Curated Services...");
    const scrollSteps = 24;
    const distancePerStep = 60;
    for (let i = 0; i < scrollSteps; i++) {
      await desktopPage.evaluate((y) => window.scrollBy({ top: y, behavior: "smooth" }), distancePerStep);
      await desktopPage.waitForTimeout(200);
    }
    // Pause on services section
    await desktopPage.waitForTimeout(2000);

    // Scroll back up to hero
    for (let i = 0; i < scrollSteps; i++) {
      await desktopPage.evaluate((y) => window.scrollBy({ top: -y, behavior: "smooth" }), distancePerStep);
      await desktopPage.waitForTimeout(150);
    }
    await desktopPage.waitForTimeout(1500);

    // Close desktop context to finalize the video recording file
    await desktopContext.close();

    // Locate the generated video
    const videoFiles = fs.readdirSync(videoTempDir).filter((f) => f.endsWith(".webm"));
    if (videoFiles.length > 0) {
      const generatedVideoPath = path.join(videoTempDir, videoFiles[0]);
      console.log(`[Showreel] Copying authentic video recording to ${showreelWebmPath}`);
      fs.copyFileSync(generatedVideoPath, showreelWebmPath);
      await convertVideo(generatedVideoPath, showreelMp4Path);
      // Clean up temp video folder
      fs.rmSync(videoTempDir, { recursive: true, force: true });
    }

    // -------------------------------------------------------------
    // 2. MOBILE VIEWPORT CAPTURE (390x844 iPhone 16 Pro)
    // -------------------------------------------------------------
    console.log("[Mobile] Initializing 390x844 (iPhone 16 Pro)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
    });

    await mobileContext.addInitScript(() => {
      sessionStorage.setItem("sutra_intro_dismissed", "true");
    });

    const mobilePage = await mobileContext.newPage();
    console.log(`[Mobile] Navigating to ${TARGET_URL}...`);
    try {
      await mobilePage.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 45000 });
    } catch {
      await mobilePage.waitForLoadState("domcontentloaded");
    }

    await mobilePage.waitForTimeout(2500);

    console.log(`[Mobile] Capturing live mobile screenshot -> ${mobileScreenshotPath}`);
    await mobilePage.screenshot({
      path: mobileScreenshotPath,
      fullPage: false,
    });

    await mobileContext.close();
    console.log("[Asset Capture] All authentic assets captured successfully!");
  } finally {
    await browser.close();
  }
}

// Execute standalone if invoked directly
if (require.main === module || process.argv[1]?.includes("capture-live-assets")) {
  captureLiveAssets()
    .then(() => {
      console.log("✓ Live capture pipeline completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("✗ Live capture pipeline encountered an error:", err);
      process.exit(1);
    });
}
