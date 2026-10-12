/**
 * SUTRA STUDIO — Creative Automation Pipeline Test Suite
 * 
 * Verifies all creative automation foundation modules:
 * - Capability discovery & status classification
 * - Master Prompt Library & variable schemas
 * - Keyword search & categorization engine
 * - Style presets & scene progression
 * - 14-Step workflow engine, step progression, and approval gates
 * - Multi-client tenant isolation & brand profiles
 * - Trend research & market observation synthesis
 */

import { getLiveCapabilityRegistry, getBestCapability } from "../src/lib/creative-automation/capabilityRegistry.ts";
import { MASTER_PROMPT_LIBRARY } from "../src/lib/creative-automation/promptLibrary.ts";
import { CREATIVE_KEYWORD_LIBRARY, queryKeywords } from "../src/lib/creative-automation/keywordLibrary.ts";
import { CREATIVE_STYLE_PRESETS } from "../src/lib/creative-automation/stylePresets.ts";
import {
  STANDARD_WORKFLOW_STEPS,
  DEFAULT_WORKFLOW_DEFINITIONS,
  createNewCreativeJob,
  advanceJobStep,
  failJobStep,
  retryJobStep,
  validateStepDependencies,
} from "../src/lib/creative-automation/workflowEngine.ts";
import { DEFAULT_SUTRA_STUDIO_BRAND, INITIAL_BRAND_PROFILES } from "../src/lib/creative-automation/brandProfiles.ts";
import { executeTrendResearch } from "../src/lib/creative-automation/trendResearchEngine.ts";

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runAutomationTestSuite() {
  console.log("\n========================================================");
  console.log("   SUTRA STUDIO — AI CREATIVE AUTOMATION TEST SUITE     ");
  console.log("========================================================\n");

  // -------------------------------------------------------------------------
  // 1. CAPABILITY REGISTRY & PROVIDER DISCOVERY
  // -------------------------------------------------------------------------
  console.log("--> 1. Validating Capability Registry & Provider Routing...");
  const capabilities = getLiveCapabilityRegistry();
  assert(capabilities.length >= 12, `Capability registry discovers >= 12 providers (found: ${capabilities.length})`);

  const geminiCap = capabilities.find((c) => c.id === "cap-gemini-core");
  assert(geminiCap !== undefined, "Google Gemini core cognitive capability exists");
  assert(geminiCap?.supportedCapabilities.includes("scriptwriting"), "Gemini supports scriptwriting");
  assert(geminiCap?.supportedCapabilities.includes("trend_research"), "Gemini supports trend_research");

  const pollinationsCap = capabilities.find((c) => c.id === "cap-pollinations-image");
  assert(pollinationsCap !== undefined, "Pollinations AI free-tier fallback capability exists");
  assert(pollinationsCap?.installedStatus === "installed", "Pollinations marked as ready/installed");

  const remotionCap = capabilities.find((c) => c.id === "cap-remotion-engine");
  assert(remotionCap !== undefined, "Remotion programmatic motion graphics engine exists");

  const bestScripting = getBestCapability("scriptwriting");
  assert(bestScripting !== null, "getBestCapability resolves best scriptwriting provider");

  // -------------------------------------------------------------------------
  // 2. MASTER CREATIVE PROMPT LIBRARY
  // -------------------------------------------------------------------------
  console.log("\n--> 2. Validating Master Creative Prompt Library...");
  assert(MASTER_PROMPT_LIBRARY.length >= 5, `Master prompt library contains >= 5 production blueprints (found: ${MASTER_PROMPT_LIBRARY.length})`);

  const categories = MASTER_PROMPT_LIBRARY.map((p) => p.category);
  assert(categories.includes("educational_reels"), "Category A: Educational Reels exists");
  assert(categories.includes("screen_ui_demo"), "Category B: Screen UI Demonstrations exists");
  assert(categories.includes("marketing_commercial"), "Category C: Marketing Commercial exists");
  assert(categories.includes("cinematic_video"), "Category D: Cinematic Video exists");
  assert(categories.includes("interior_3d_360"), "Category E: 3D & 360° Walkthrough exists");

  MASTER_PROMPT_LIBRARY.forEach((prompt) => {
    assert(prompt.negativeConstraints.length > 0, `Prompt ${prompt.id} specifies negative constraints`);
    assert(prompt.requiredInputs.length > 0, `Prompt ${prompt.id} specifies required input parameters`);
    assert(prompt.qualityChecks.length > 0, `Prompt ${prompt.id} specifies quality acceptance checks`);
  });

  // -------------------------------------------------------------------------
  // 3. CREATIVE KEYWORD & TECHNIQUE LIBRARY
  // -------------------------------------------------------------------------
  console.log("\n--> 3. Validating Creative Keyword & Technique Library...");
  assert(CREATIVE_KEYWORD_LIBRARY.length >= 25, `Keyword library contains >= 25 curated terms (found: ${CREATIVE_KEYWORD_LIBRARY.length})`);

  const cinematicKw = queryKeywords({ category: "cinematic" });
  assert(cinematicKw.length >= 5, `Cinematic keywords query returns >= 5 terms (found: ${cinematicKw.length})`);

  const searchResults = queryKeywords({ search: "orbit" });
  assert(searchResults.some((k) => k.keyword.includes("orbit")), "Keyword search query matches 'orbit'");

  const disabledQuery = queryKeywords({ onlyEnabled: true });
  assert(disabledQuery.every((k) => k.isEnabled), "Query with onlyEnabled returns exclusively enabled keywords");

  // -------------------------------------------------------------------------
  // 4. CREATIVE STYLE PRESETS
  // -------------------------------------------------------------------------
  console.log("\n--> 4. Validating Observable Style Presets...");
  assert(CREATIVE_STYLE_PRESETS.length >= 5, `Style preset library contains >= 5 observable presets (found: ${CREATIVE_STYLE_PRESETS.length})`);

  const reelPreset = CREATIVE_STYLE_PRESETS.find((p) => p.id === "preset-edu-kinetic-explainer");
  assert(reelPreset?.aspectRatio === "9/16", "Kinetic explainer preset configured as 9:16 vertical");
  assert(reelPreset?.sceneStructure.length >= 4, "Kinetic explainer contains 4-stage scene progression");

  const spatialPreset = CREATIVE_STYLE_PRESETS.find((p) => p.id === "preset-interior-3d-turntable");
  assert(spatialPreset?.recommendedWorkflow.includes("3D"), "Spatial preset maps to 3D pipeline workflow");

  // -------------------------------------------------------------------------
  // 5. 14-STEP WORKFLOW ENGINE & JOB STATE MACHINE
  // -------------------------------------------------------------------------
  console.log("\n--> 5. Validating 14-Step Workflow Engine & Job State Machine...");
  assert(STANDARD_WORKFLOW_STEPS.length === 14, `Standard workflow defines exactly 14 steps (found: ${STANDARD_WORKFLOW_STEPS.length})`);

  const approvalSteps = STANDARD_WORKFLOW_STEPS.filter((s) => s.requiresHumanApproval);
  assert(approvalSteps.length >= 3, `Workflow defines human approval gates on >= 3 critical stages (found: ${approvalSteps.length})`);

  // Job creation simulation (ZERO MEDIA GENERATED)
  const simulatedJob = createNewCreativeJob({
    brandId: "brand-sutra-flagship",
    clientUid: "admin-sutra-master",
    workflowId: "wf-standard-14-step",
    title: "Sutra Studio Autonomous Pipeline Verification",
    category: "educational_reels",
    brief: {
      topic: "Autonomous Creative Engineering",
      targetAudience: "Creative Directors",
      keyMessage: "Deliver bespoke digital experiences in 48 hours.",
      tone: "luxury_atelier",
    },
  });

  assert(simulatedJob.id.startsWith("job-"), `Simulated job generates valid ID format: ${simulatedJob.id}`);
  assert(simulatedJob.status === "in_progress", "Simulated job initializes with in_progress status");
  assert(simulatedJob.steps.length === 14, "Simulated job inherits all 14 pipeline steps");

  // Step advancement
  const advancedJob = advanceJobStep(simulatedJob, 2, { topic: "AI Automation" }, "Test Administrator");
  assert(advancedJob.currentStepIndex === 3, "advanceJobStep advances job to step 3");
  assert(advancedJob.steps[1].status === "completed", "Step 2 marked as completed");

  // Step failure & retry
  const failedJob = failJobStep(advancedJob, 3, "Simulated transient provider timeout");
  assert(failedJob.status === "paused_for_approval", "Job pauses for human approval upon step failure");
  assert(failedJob.steps[2].error !== undefined, "Error reason recorded on step");

  const retriedJob = retryJobStep(failedJob, 3);
  assert(retriedJob.steps[2].status === "running", "Step status resets to running upon retry");

  // Step dependencies
  const depCheckValid = validateStepDependencies(STANDARD_WORKFLOW_STEPS[1], advancedJob.steps);
  assert(depCheckValid.canExecute, "Step 2 executes when Step 1 is completed");

  const depCheckBlocked = validateStepDependencies(STANDARD_WORKFLOW_STEPS[10], simulatedJob.steps);
  assert(!depCheckBlocked.canExecute, "Step 11 cannot execute when Step 10 is incomplete");

  // -------------------------------------------------------------------------
  // 6. MULTI-CLIENT BRAND PROFILES
  // -------------------------------------------------------------------------
  console.log("\n--> 6. Validating Multi-Client Brand Profiles...");
  assert(INITIAL_BRAND_PROFILES.length >= 2, "Brand profile registry contains flagship master and client tenants");
  assert(DEFAULT_SUTRA_STUDIO_BRAND.contentPreferences.primaryColor === "#5C3A1E", "Sutra flagship primary color matches Deep Teak (#5C3A1E)");
  assert(DEFAULT_SUTRA_STUDIO_BRAND.contentPreferences.accentColor === "#A98B57", "Sutra flagship accent color matches Muted Brass (#A98B57)");
  assert(DEFAULT_SUTRA_STUDIO_BRAND.contentPreferences.negativeStyleRules.length >= 3, "Sutra flagship declares negative style rules");

  // -------------------------------------------------------------------------
  // 7. TREND RESEARCH ENGINE
  // -------------------------------------------------------------------------
  console.log("\n--> 7. Validating Trend Research & Marketing Intelligence...");
  const trendResult = await executeTrendResearch({
    industry: "Creative Technology",
    targetAudience: "Agency Founders",
    region: "India",
    language: "English",
    platform: "instagram_reels",
    campaignObjective: "brand_awareness",
    dateRange: "Last 30 Days",
  });

  assert(trendResult.totalFound > 0, `Trend research returns >= 1 observation (found: ${trendResult.totalFound})`);
  assert(trendResult.observations.some((o) => o.source === "verified_market_data"), "Trend research includes verified market observations");
  assert(trendResult.observations.some((o) => o.source === "ai_topic_synthesis"), "Trend research includes synthesized topic suggestions");

  const obs = trendResult.observations[0];
  assert(obs.suggestedHooks.length > 0, "Trend observation provides suggested hooks");
  assert(obs.scriptOutline.hook !== undefined, "Trend observation provides structured screenplay outline");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED: ${passedAssertions}`);
  console.log(`FAILED: ${failedAssertions}`);
  console.log("========================================================\n");

  if (failedAssertions > 0) {
    process.exit(1);
  } else {
    console.log("ALL CREATIVE AUTOMATION PIPELINE TESTS PASSED WITH 100% SUCCESS!\n");
    process.exit(0);
  }
}

runAutomationTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
