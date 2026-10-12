/**
 * SUTRA STUDIO — Dynamic Automation Engine (Step 06)
 * 
 * 14-Step Configurable Creative Production Pipeline with human-in-the-loop approval gates,
 * input/output schema validation, retry policies, and execution audit logging.
 * 
 * NOTE: IN ACCORDANCE WITH STRICT SYSTEM DIRECTIVES, STEP 09 PREPARES AND REGISTERS
 * THE JOB DEFINITION ONLY — NO EXTERNAL MEDIA RENDERING OR GENERATION OCCURS.
 */

import {
  WorkflowDefinition,
  WorkflowStepConfig,
  CreativeJob,
  JobStepRecord,
  StepExecutionStatus,
  CreativeCategory,
} from "./types";
import { getBestCapability } from "./capabilityRegistry";

/**
 * 14 Standard Workflow Steps Template
 */
export const STANDARD_WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    stepIndex: 1,
    stepId: "step-01-brand-selection",
    name: "Select Brand / Client Profile",
    description: "Load brand identity guidelines, approved palette tokens, fonts, and negative style rules.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 1000 },
    inputSchema: { brandId: "string", clientUid: "string" },
    outputSchema: { brandProfile: "object", toneRules: "array", colorTokens: "object" },
    configValues: {},
  },
  {
    stepIndex: 2,
    stepId: "step-02-topic-trend-research",
    name: "Topic Selection & Trend Research",
    description: "Analyze market keywords, search velocity, audience pain points, and rising cultural topics.",
    capabilityType: "trend_research",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 2, backoffMs: 2000 },
    inputSchema: { industry: "string", targetAudience: "string", platform: "string" },
    outputSchema: { topic: "string", trendVelocity: "string", recommendedHooks: "array" },
    configValues: { minRelevanceScore: 70 },
  },
  {
    stepIndex: 3,
    stepId: "step-03-content-format-selection",
    name: "Select Content Format & Aspect Ratio",
    description: "Determine target delivery aspect ratio (9:16, 16:9, 1:1, 4:5), target duration, and frame rate.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 500 },
    inputSchema: { category: "string", targetPlatform: "string" },
    outputSchema: { aspectRatio: "string", durationSeconds: "number", fps: "number" },
    configValues: { defaultRatio: "9/16" },
  },
  {
    stepIndex: 4,
    stepId: "step-04-reference-analysis",
    name: "Analyze Creative References & Style Presets",
    description: "Inspect uploaded screenshots, video examples, or layout wireframes to map camera movement and pacing.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 1000 },
    inputSchema: { presetId: "string", referenceAssetIds: "array" },
    outputSchema: { visualStyle: "string", pacingRules: "array", lightingProfile: "string" },
    configValues: { defaultPreset: "preset-edu-kinetic-explainer" },
  },
  {
    stepIndex: 5,
    stepId: "step-05-creative-brief",
    name: "Generate Creative Brief",
    description: "Synthesize hook, target audience persona, core value proposition, and key deliverables into a formal brief.",
    capabilityType: "scriptwriting",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: true, // Human approval gate
    retryPolicy: { maxRetries: 2, backoffMs: 2000 },
    inputSchema: { brandProfile: "object", topic: "string", format: "string" },
    outputSchema: { briefDocument: "string", approvedBy: "string" },
    configValues: { requireClientSignoff: false },
  },
  {
    stepIndex: 6,
    stepId: "step-06-scriptwriting",
    name: "Generate Script & Voiceover Dialogue",
    description: "Draft timed script containing scroll-stopping hook, body progression, kinetic typography cues, and closing CTA.",
    capabilityType: "scriptwriting",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 2, backoffMs: 2000 },
    inputSchema: { briefDocument: "string", durationSeconds: "number" },
    outputSchema: { scriptText: "string", wordCount: "number", voiceoverTimeline: "array" },
    configValues: { targetWPM: 155 },
  },
  {
    stepIndex: 7,
    stepId: "step-07-storyboard-creation",
    name: "Create Scene-by-Scene Storyboard",
    description: "Break script into discrete visual scenes with camera angle, lighting, overlays, and duration specifications.",
    capabilityType: "storyboard_generation",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: true, // Human approval gate
    retryPolicy: { maxRetries: 1, backoffMs: 1500 },
    inputSchema: { scriptText: "string", visualStyle: "string" },
    outputSchema: { scenes: "array", totalScenes: "number" },
    configValues: { maxScenes: 6 },
  },
  {
    stepIndex: 8,
    stepId: "step-08-tools-skills-selection",
    name: "Select AI Tools & Execution Skills",
    description: "Map each scene to optimal available capabilities (e.g., Gemini + Pollinations + Remotion + FFmpeg).",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 500 },
    inputSchema: { scenes: "array" },
    outputSchema: { executionPlan: "array", estimatedCostUsd: "number" },
    configValues: { enforceCostCap: true },
  },
  {
    stepIndex: 9,
    stepId: "step-09-generation-job-preparation",
    name: "Prepare Image/Video/3D Generation Jobs",
    description: "Compile compiled prompts, seeds, aspect ratios, and negative constraints into a queued job specification (NO GENERATION TRIGGERED).",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 1000 },
    inputSchema: { executionPlan: "array", scenes: "array" },
    outputSchema: { jobSpecifications: "array", jobStatus: "string" },
    configValues: { simulateOnly: true },
  },
  {
    stepIndex: 10,
    stepId: "step-10-rendering-workflow-prep",
    name: "Prepare Editing & Programmatic Rendering Workflow",
    description: "Prepare Remotion React composition parameters, FFmpeg transcode commands, audio mixing cues, and subtitle track styling.",
    capabilityType: "motion_graphics",
    preferredCapabilityId: "cap-remotion-engine",
    fallbackCapabilityId: "cap-ffmpeg-cli",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 1000 },
    inputSchema: { jobSpecifications: "array", scriptText: "string" },
    outputSchema: { renderManifest: "object", commandList: "array" },
    configValues: { burnSubtitles: true },
  },
  {
    stepIndex: 11,
    stepId: "step-11-output-validation",
    name: "Validate Specification & Quality Gate",
    description: "Check aspect ratio conformance, color token adherence, duration limits, and negative constraint compliance.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 500 },
    inputSchema: { renderManifest: "object" },
    outputSchema: { validationPassed: "boolean", score: "number", remarks: "array" },
    configValues: { minPassScore: 85 },
  },
  {
    stepIndex: 12,
    stepId: "step-12-human-approval-gate",
    name: "Admin / Client Approval Gate",
    description: "Present creative brief, storyboard, and job specifications to studio administrator or client for formal review.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: true, // Mandatory approval
    retryPolicy: { maxRetries: 1, backoffMs: 1000 },
    inputSchema: { validationPassed: "boolean", briefDocument: "string" },
    outputSchema: { approved: "boolean", approvedBy: "string", revisionNotes: "string" },
    configValues: { autoApproveAdminInternal: false },
  },
  {
    stepIndex: 13,
    stepId: "step-13-store-and-deliver",
    name: "Store Artifacts in Vault & Client Workspace",
    description: "Register job manifest in Google Drive Vault, record metadata in Firestore, and link deliverable to client portal.",
    capabilityType: "file_storage",
    preferredCapabilityId: "cap-gdrive-vault",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 3, backoffMs: 3000 },
    inputSchema: { jobSpecifications: "array", approved: "boolean" },
    outputSchema: { vaultDriveId: "string", deliveryUrl: "string" },
    configValues: { generatePublicShareLink: false },
  },
  {
    stepIndex: 14,
    stepId: "step-14-schedule-publishing",
    name: "Schedule Multi-Channel Publishing (Optional)",
    description: "When authorized, schedule n8n webhook dispatches for social publication across Instagram, YouTube, or LinkedIn.",
    capabilityType: "social_publishing",
    preferredCapabilityId: "cap-n8n-orchestrator",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: false, // Default disabled until explicit authorization
    requiresHumanApproval: true,
    retryPolicy: { maxRetries: 2, backoffMs: 5000 },
    inputSchema: { deliveryUrl: "string", scheduleDate: "string" },
    outputSchema: { publishJobId: "string", scheduledTimestamp: "string" },
    configValues: { channels: ["instagram_reels", "youtube_shorts"] },
  },
];

/**
 * Standard Default Creative Workflows
 */
export const DEFAULT_WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: "wf-standard-14-step",
    name: "Full 14-Step Master Creative Pipeline",
    description: "Comprehensive end-to-end creative automation with research, scriptwriting, storyboarding, job prep, quality check, and vault archival.",
    category: "educational_reels",
    isDefault: true,
    steps: STANDARD_WORKFLOW_STEPS,
    createdAt: "2026-10-13T00:00:00Z",
    updatedAt: "2026-10-13T00:00:00Z",
  },
  {
    id: "wf-rapid-ui-demo",
    name: "Rapid UI / Screen Walkthrough Pipeline",
    description: "Streamlined 6-step workflow for screen recordings, feature annotations, and Next.js interface walk-throughs.",
    category: "screen_ui_demo",
    isDefault: false,
    steps: STANDARD_WORKFLOW_STEPS.filter((s) => [1, 3, 6, 8, 9, 11, 12, 13].includes(s.stepIndex)),
    createdAt: "2026-10-13T00:00:00Z",
    updatedAt: "2026-10-13T00:00:00Z",
  },
  {
    id: "wf-cinematic-architectural",
    name: "Cinematic & 3D Spatial Walkthrough Pipeline",
    description: "High-fidelity pipeline with extensive reference inspection, physical camera movement specs, and 360 pano export manifests.",
    category: "cinematic_video",
    isDefault: false,
    steps: STANDARD_WORKFLOW_STEPS,
    createdAt: "2026-10-13T00:00:00Z",
    updatedAt: "2026-10-13T00:00:00Z",
  },
];

/**
 * Creative Job Engine: Initialise and simulate a creative pipeline run
 */
export function createNewCreativeJob(params: {
  brandId: string;
  clientUid: string;
  workflowId: string;
  title: string;
  category: CreativeCategory;
  brief: {
    topic: string;
    targetAudience: string;
    keyMessage: string;
    tone: string;
  };
}): CreativeJob {
  const workflow =
    DEFAULT_WORKFLOW_DEFINITIONS.find((w) => w.id === params.workflowId) ||
    DEFAULT_WORKFLOW_DEFINITIONS[0];

  const steps: JobStepRecord[] = workflow.steps.map((step) => ({
    stepIndex: step.stepIndex,
    stepId: step.stepId,
    name: step.name,
    status: step.stepIndex === 1 ? ("completed" as StepExecutionStatus) : ("pending" as StepExecutionStatus),
    inputPayload: {},
    costUsd: 0,
  }));

  return {
    id: `job-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    brandId: params.brandId,
    clientUid: params.clientUid,
    workflowId: params.workflowId,
    title: params.title,
    category: params.category,
    status: "in_progress",
    currentStepIndex: 2,
    steps,
    targetDeliverables: {
      aspectRatio: "9/16",
      format: "MP4 (H.264)",
      intendedPlatform: "instagram_reels",
    },
    brief: params.brief,
    script: {
      hook: `Stop doing ${params.brief.topic} manually in 2026.`,
      body: [
        "Traditional agencies take 3 weeks and charge unpredictable retainers.",
        "Sutra Studio automates the creative engineering pipeline into 48 hours.",
        "Precision design systems, continuous client isolation, and zero fluff.",
      ],
      cta: "Explore verified studio services starting at ₹99.",
      visualDirection: [
        "Warm ivory canvas (#FAF9F5)",
        "Kinetic bold typography in dark slate (#171717)",
        "Soft brass highlight boxes (#A98B57)",
      ],
    },
    totalCostUsd: 0.05,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
