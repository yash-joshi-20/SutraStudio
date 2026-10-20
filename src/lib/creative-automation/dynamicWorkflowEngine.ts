/**
 * SUTRA STUDIO — Dynamic 8-Step Creative Automation Pipeline (Step 03)
 * 
 * Configurable, reorderable, production-ready workflow engine allowing administrators
 * to configure workflows without modifying source code.
 * 
 * 8 Canonical Steps:
 *   1. Brief and Requirements
 *   2. Creative Direction
 *   3. Shot Planning
 *   4. Image Generation
 *   5. Video Generation
 *   6. Editing and Transitions
 *   7. Quality Assurance
 *   8. Export and Delivery
 */

import {
  WorkflowStepConfig,
  WorkflowDefinition,
  CreativeJob,
  JobStepRecord,
  JobStatus,
  StepExecutionStatus,
  CreativeCategory,
} from "./types";
import { CINEMATIC_SHOT_PRESETS } from "./shotPresets";

/**
 * The 8 Standard Dynamic Workflow Steps (Step 03)
 */
export const DYNAMIC_8_STEP_PIPELINE: WorkflowStepConfig[] = [
  // Step 1: Brief and Requirements
  {
    stepIndex: 1,
    stepId: "step-01-brief-requirements",
    name: "Brief and Requirements",
    description: "Capture business, product, campaign, audience, platform, format, duration, and desired visual style with reference media.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 2, backoffMs: 1000 },
    inputSchema: {
      clientUid: "string",
      brandId: "string",
      productOrService: "string",
      targetAudience: "string",
      platform: "string",
      aspectRatio: "string",
      durationSeconds: "number",
      referenceMediaUrls: "array?",
    },
    outputSchema: {
      briefManifest: "object",
      normalizedTarget: "object",
      brandVoiceTokens: "object",
    },
    configValues: {
      strictBrandKitMatch: true,
      allowUnauthenticatedGuest: false,
    },
  },

  // Step 2: Creative Direction
  {
    stepIndex: 2,
    stepId: "step-02-creative-direction",
    name: "Creative Direction & Treatment",
    description: "Synthesize visual objective, mood, lighting, color palette, camera language, and narrative storyboard arc.",
    capabilityType: "scriptwriting",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-openai-llm",
    isEnabled: true,
    requiresHumanApproval: true, // Human-in-the-loop approval gate
    retryPolicy: { maxRetries: 2, backoffMs: 2000 },
    inputSchema: {
      briefManifest: "object",
      brandVoiceTokens: "object",
    },
    outputSchema: {
      creativeTreatment: "string",
      colorPaletteHex: "array",
      cameraLanguage: "string",
      moodAtmosphere: "string",
      storyboardOutline: "array",
    },
    configValues: {
      paletteTokenCount: 4,
      requireExecutiveSignoff: false,
    },
  },

  // Step 3: Shot Planning
  {
    stepIndex: 3,
    stepId: "step-03-shot-planning",
    name: "Cinematic Shot Planning",
    description: "Automatically select suitable shot presets, generate shot-by-shot prompts, scene order, durations, transitions, and negative constraints.",
    capabilityType: "storyboard_generation",
    preferredCapabilityId: "cap-gemini-core",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 2, backoffMs: 1500 },
    inputSchema: {
      storyboardOutline: "array",
      cameraLanguage: "string",
    },
    outputSchema: {
      plannedScenes: "array",
      selectedShotPresetIds: "array",
      sceneTransitions: "array",
      globalNegativePrompt: "string",
    },
    configValues: {
      defaultShotPresetId: "shot-aerial-establishing",
      maxScenesPerVideo: 6,
    },
  },

  // Step 4: Image Generation
  {
    stepIndex: 4,
    stepId: "step-04-image-generation",
    name: "Image Generation & Asset Prep",
    description: "Select compatible image provider (BFL FLUX.1 Pro, Pollinations AI), generate/process keyframe images, and validate output dimensions.",
    capabilityType: "image_generation",
    preferredCapabilityId: "cap-bfl-flux-pro",
    fallbackCapabilityId: "cap-pollinations-image",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 2, backoffMs: 3000 },
    inputSchema: {
      plannedScenes: "array",
      globalNegativePrompt: "string",
      aspectRatio: "string",
    },
    outputSchema: {
      generatedImageUrls: "array",
      keyframeAssetIds: "array",
      dimensionsVerified: "boolean",
    },
    configValues: {
      preferredResolution: "2048x1152",
      fallbackToFreePollinationsOnRateLimit: true,
    },
  },

  // Step 5: Video Generation
  {
    stepIndex: 5,
    stepId: "step-05-video-generation",
    name: "Video Generation & Motion Synthesis",
    description: "Convert storyboard scenes and keyframe images into video-generation requests using Kling AI, Runway Gen-3, or kinetic motion synthesis.",
    capabilityType: "video_generation",
    preferredCapabilityId: "cap-kling-ai",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 2, backoffMs: 5000 },
    inputSchema: {
      plannedScenes: "array",
      keyframeAssetIds: "array",
      durationSeconds: "number",
    },
    outputSchema: {
      renderedClips: "array",
      rawVideoAssetIds: "array",
      clipDurationsSeconds: "array",
    },
    configValues: {
      mode: "std",
      useImageToVideoIfAvailable: true,
    },
  },

  // Step 6: Editing and Transitions
  {
    stepIndex: 6,
    stepId: "step-06-editing-transitions",
    name: "Editorial Sequencing & Composition",
    description: "Prepare an automated sequence of scenes, apply match-cut transitions, kinetic typography overlays, and sound design tracks.",
    capabilityType: "video_editing",
    preferredCapabilityId: "cap-remotion-engine",
    fallbackCapabilityId: "cap-ffmpeg-cli",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 1, backoffMs: 2000 },
    inputSchema: {
      renderedClips: "array",
      sceneTransitions: "array",
      voiceoverAudioUrl: "string?",
    },
    outputSchema: {
      timelineManifest: "object",
      roughCutVideoUrl: "string?",
      transitionCount: "number",
    },
    configValues: {
      includeSubtitles: true,
      audioNormalizationLufs: -14,
    },
  },

  // Step 7: Quality Assurance
  {
    stepIndex: 7,
    stepId: "step-07-quality-assurance",
    name: "Quality Review & Executive Gate",
    description: "Inspect output existence, file integrity, resolution, aspect ratio, frame rate, negative constraints, and present for Studio Administrator review.",
    capabilityType: "prompt_enhancement",
    preferredCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: true, // Mandatory Administrator Approval Gate
    retryPolicy: { maxRetries: 1, backoffMs: 1000 },
    inputSchema: {
      timelineManifest: "object",
      roughCutVideoUrl: "string?",
      dimensionsVerified: "boolean",
    },
    outputSchema: {
      qaScore: "number",
      checksPassed: "boolean",
      reviewerNotes: "string?",
      adminApprovalStatus: "string",
    },
    configValues: {
      minPassingScore: 90,
      autoAdvanceIfScore100: false,
    },
  },

  // Step 8: Export and Delivery
  {
    stepIndex: 8,
    stepId: "step-08-export-delivery",
    name: "Vault Export & Client Delivery",
    description: "Store approved 4K outputs in client's isolated Google Drive vault folder, record asset metadata in Firestore, and synchronize client portal.",
    capabilityType: "file_storage",
    preferredCapabilityId: "cap-gdrive-vault",
    fallbackCapabilityId: "cap-local-template-engine",
    isEnabled: true,
    requiresHumanApproval: false,
    retryPolicy: { maxRetries: 3, backoffMs: 3000 },
    inputSchema: {
      roughCutVideoUrl: "string",
      clientUid: "string",
      jobId: "string",
      adminApprovalStatus: "string",
    },
    outputSchema: {
      vaultFolderId: "string",
      streamProxyUrl: "string",
      deliveryCompletedAt: "string",
    },
    configValues: {
      folderHierarchy: "Clients > {ClientName}_{clientId} > {Order}_{orderId} > 03_Final_Deliverables",
      notifyClientEmail: true,
    },
  },
];

/**
 * Standard Default Workflow Definitions
 */
export const MASTER_WORKFLOW_TEMPLATES: WorkflowDefinition[] = [
  {
    id: "wf-dynamic-8-master",
    name: "8-Step Master Creative Production Engine",
    description: "Flagship production pipeline: Brief → Direction → Shot Planning → Image Gen → Video Gen → Editing → Quality Review Gate → Google Drive Vault Delivery.",
    category: "cinematic_video",
    isDefault: true,
    steps: DYNAMIC_8_STEP_PIPELINE,
    createdAt: "2026-10-13T00:00:00Z",
    updatedAt: "2026-10-13T00:00:00Z",
  },
  {
    id: "wf-rapid-image-campaign",
    name: "Rapid 5-Step Commercial Image Suite",
    description: "Fast-turnaround high-resolution commercial image campaign bypassing video rendering steps.",
    category: "marketing_commercial",
    isDefault: false,
    steps: DYNAMIC_8_STEP_PIPELINE.filter((s) => [1, 2, 3, 4, 7, 8].includes(s.stepIndex)).map((s, idx) => ({
      ...s,
      stepIndex: idx + 1,
    })),
    createdAt: "2026-10-13T00:00:00Z",
    updatedAt: "2026-10-13T00:00:00Z",
  },
  {
    id: "wf-3d-spatial-walkthrough",
    name: "Architectural 3D & Spatial Tour Suite",
    description: "Spatial architecture pipeline emphasizing 360 panorama generation, material inspection, and equirectangular export.",
    category: "interior_3d_360",
    isDefault: false,
    steps: DYNAMIC_8_STEP_PIPELINE,
    createdAt: "2026-10-13T00:00:00Z",
    updatedAt: "2026-10-13T00:00:00Z",
  },
];

/**
 * Validate dynamic step dependencies before execution
 */
export function validateDynamicStepDependencies(
  step: WorkflowStepConfig,
  completedStepIndices: number[]
): { canExecute: boolean; missingDependencies: string[] } {
  // Step 1 has no prerequisites
  if (step.stepIndex === 1) {
    return { canExecute: true, missingDependencies: [] };
  }

  // Linear pipeline: every preceding step that is enabled must be completed
  const precedingRequired = step.stepIndex - 1;
  if (!completedStepIndices.includes(precedingRequired)) {
    return {
      canExecute: false,
      missingDependencies: [`Step ${precedingRequired} must be completed and verified before running Step ${step.stepIndex} (${step.name}).`],
    };
  }

  return { canExecute: true, missingDependencies: [] };
}

/**
 * Duplicate a workflow template with customized step configurations
 */
export function duplicateWorkflowTemplate(
  baseTemplate: WorkflowDefinition,
  customName: string
): WorkflowDefinition {
  return {
    id: `wf-custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: customName,
    description: `Custom variant of ${baseTemplate.name}`,
    category: baseTemplate.category,
    isDefault: false,
    steps: baseTemplate.steps.map((s) => ({
      ...s,
      configValues: { ...s.configValues },
      retryPolicy: { ...s.retryPolicy },
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
