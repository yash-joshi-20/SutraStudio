/**
 * SUTRA STUDIO — AI Creative Automation Platform
 * Core Data Contracts & System Interfaces
 * 
 * Defines schemas for Style Presets, Master Prompts, Keywords, Capabilities,
 * Dynamic Workflows, Multi-Client Brand Profiles, and Creative Jobs.
 */

// ---------------------------------------------------------------------------
// 1. Creative Style Presets (Step 02)
// ---------------------------------------------------------------------------

export type CreativeCategory =
  | "educational_reels"
  | "screen_ui_demo"
  | "marketing_commercial"
  | "cinematic_video"
  | "interior_3d_360";

export type AspectRatio = "9/16" | "16/9" | "1/1" | "4/5" | "2/1";

export interface CreativeStylePreset {
  id: string;
  name: string;
  category: CreativeCategory;
  visualStyle: string;
  sceneStructure: string[];
  cameraMovement: string;
  editingTechniques: string[];
  typographyOverlays: {
    fontStyle: string;
    placement: string;
    kineticEffects: string;
    colors: string[];
  };
  transitions: string[];
  motionGraphics: string[];
  hookStrategy: string;
  closingCta: string;
  durationSecondsRange: [number, number];
  aspectRatio: AspectRatio;
  audioNarrationStyle: string;
  recommendedWorkflow: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// 2. Master Creative Prompt Library (Step 03)
// ---------------------------------------------------------------------------

export type PromptCategory =
  | "educational_reels"
  | "screen_ui_demo"
  | "marketing_commercial"
  | "cinematic_video"
  | "interior_3d_360";

export interface MasterPromptTemplate {
  id: string;
  version: string;
  title: string;
  category: PromptCategory;
  subCategory: string;
  intendedAudience: string;
  requiredInputs: string[];
  researchInstructions: string;
  promptTemplate: string;
  shotAndSceneInstructions: string[];
  negativeConstraints: string[];
  compatibleCapabilities: string[];
  outputRequirements: {
    aspectRatio: AspectRatio;
    targetDurationSeconds?: number;
    recommendedFPS?: number;
    fileFormat: string;
    resolution: string;
  };
  qualityChecks: string[];
  estimatedCost: {
    minUsd: number;
    maxUsd: number;
    unit: string;
  };
  fallbackBehavior: string;
  isDefault: boolean;
  isActive: boolean;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 3. Keyword and Technique Library (Step 04)
// ---------------------------------------------------------------------------

export type KeywordCategory =
  | "cinematic"
  | "educational_reel"
  | "motion_graphics"
  | "interior_3d"
  | "marketing";

export interface CreativeKeyword {
  id: string;
  keyword: string;
  category: KeywordCategory;
  description: string;
  recommendedCapabilities: string[];
  contextRules: string;
  usageExample: string;
  isEnabled: boolean;
  weight: number; // 1 to 5
}

// ---------------------------------------------------------------------------
// 4. Capability and Plugin Registry (Step 05)
// ---------------------------------------------------------------------------

export type CapabilityType =
  | "trend_research"
  | "topic_ideation"
  | "scriptwriting"
  | "storyboard_generation"
  | "prompt_enhancement"
  | "image_generation"
  | "image_editing"
  | "video_generation"
  | "video_editing"
  | "screen_recording_processing"
  | "motion_graphics"
  | "voiceover"
  | "captions"
  | "asset_3d_generation"
  | "visualization_360"
  | "media_rendering"
  | "file_storage"
  | "social_publishing";

export type ExecutionMethod = "api_cloud" | "cli_local" | "n8n_webhook" | "in_browser" | "hybrid";

export interface CapabilityItem {
  id: string;
  name: string;
  type: CapabilityType;
  provider: string;
  installedStatus: "installed" | "configured_api" | "missing_key" | "optional_cli_absent" | "adapter_ready";
  executionMethod: ExecutionMethod;
  supportedCapabilities: string[];
  authRequirements: {
    envKey?: string;
    isConfigured: boolean;
    instructions: string;
  };
  inputOutputFormats: {
    acceptedInputs: string[];
    producedOutputs: string[];
  };
  estimatedCost: {
    costPerUnit: number;
    unit: string;
  };
  rateLimits: {
    rpm: number;
    dailyLimit?: number;
  };
  errorHandling: string;
  fallbackOptionId?: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// 5. Dynamic Automation Engine & Workflows (Step 06)
// ---------------------------------------------------------------------------

export type StepExecutionStatus =
  | "pending"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "skipped"
  | "failed";

export interface WorkflowStepConfig {
  stepIndex: number;
  stepId: string;
  name: string;
  description: string;
  capabilityType: CapabilityType;
  preferredCapabilityId: string;
  fallbackCapabilityId?: string;
  isEnabled: boolean;
  requiresHumanApproval: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  configValues: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: CreativeCategory;
  isDefault: boolean;
  steps: WorkflowStepConfig[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 6. Creative Job Queue & Tracing (Step 06 & 07)
// ---------------------------------------------------------------------------

export interface JobStepRecord {
  stepIndex: number;
  stepId: string;
  name: string;
  status: StepExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  inputPayload: Record<string, any>;
  outputPayload?: Record<string, any>;
  capabilityUsed?: string;
  costUsd?: number;
  error?: string;
  reviewedBy?: string;
  approvalNotes?: string;
}

export interface CreativeJob {
  id: string;
  brandId: string;
  clientUid: string;
  workflowId: string;
  title: string;
  category: CreativeCategory;
  status: "queued" | "in_progress" | "paused_for_approval" | "completed" | "failed" | "cancelled";
  currentStepIndex: number;
  steps: JobStepRecord[];
  targetDeliverables: {
    aspectRatio: AspectRatio;
    format: string;
    intendedPlatform: string;
  };
  brief: {
    topic: string;
    targetAudience: string;
    keyMessage: string;
    tone: string;
    referenceAssetIds?: string[];
  };
  script?: {
    hook: string;
    body: string[];
    cta: string;
    visualDirection: string[];
  };
  storyboard?: Array<{
    sceneNumber: number;
    durationSeconds: number;
    visualDescription: string;
    audioVoiceover: string;
    onScreenText: string;
  }>;
  totalCostUsd: number;
  createdAt: string;
  updatedAt: string;
  publishedUrl?: string;
}

// ---------------------------------------------------------------------------
// 7. Multi-Client Brand Profiles (Step 08 & 09)
// ---------------------------------------------------------------------------

export interface BrandProfile {
  id: string;
  clientUid: string;
  brandName: string;
  tagline: string;
  industry: string;
  region: string;
  website: string;
  targetAudience: string;
  productsAndServices: string[];
  contentPreferences: {
    voiceTone: "luxury_atelier" | "minimal_modern" | "authoritative_expert" | "energetic_bold" | "warm_educational";
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
    negativeStyleRules: string[];
  };
  referenceAssets: Array<{
    id: string;
    title: string;
    fileUrl: string;
    driveFileId?: string;
    mediaType: "video" | "image" | "document" | "3d_model";
    notes: string;
  }>;
  approvedPromptIds: string[];
  contentCalendar: Array<{
    id: string;
    scheduledDate: string;
    topic: string;
    format: CreativeCategory;
    status: "planned" | "in_production" | "approved" | "published";
  }>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 8. Trend Research Engine (Step 10)
// ---------------------------------------------------------------------------

export interface TrendResearchQuery {
  industry: string;
  targetAudience: string;
  region: string;
  language: string;
  platform: "instagram_reels" | "youtube_shorts" | "linkedin" | "meta_ads" | "website";
  campaignObjective: "brand_awareness" | "lead_generation" | "client_education" | "service_launch";
  dateRange: string;
}

export interface TrendObservation {
  id: string;
  topic: string;
  category: string;
  source: "verified_market_data" | "studio_curated_insight" | "ai_topic_synthesis";
  observationDate: string;
  relevanceScore: number; // 0 to 100
  trendVelocity: "rising" | "peak" | "evergreen";
  suggestedHooks: string[];
  recommendedFormats: CreativeCategory[];
  scriptOutline: {
    hook: string;
    point1: string;
    point2: string;
    callToAction: string;
  };
  creativeStyleRecommendation: string;
  targetKeywords: string[];
  proposedPublishingWindow: string;
}
