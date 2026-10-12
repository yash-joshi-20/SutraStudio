/**
 * SUTRA STUDIO — Master Creative Prompt Library (Step 03)
 * 
 * Versioned, multi-category creative prompt blueprints with strict negative constraints,
 * shot-by-scene instructions, input requirements, and quality checks.
 */

import { MasterPromptTemplate } from "./types";

export const MASTER_PROMPT_LIBRARY: MasterPromptTemplate[] = [
  // =========================================================================
  // CATEGORY A: Trending Educational Reels
  // =========================================================================
  {
    id: "prompt-edu-ai-tools-explained",
    version: "2.1.0",
    title: "AI Tools Explained in 30 Seconds",
    category: "educational_reels",
    subCategory: "AI Tools Explained",
    intendedAudience: "Creative agency owners, full-stack developers, design directors seeking productivity breakthroughs.",
    requiredInputs: ["tool_name", "primary_benefit", "problem_solved", "time_saved_percent"],
    researchInstructions: "Query latest product release notes and verify actual supported capabilities. Confirm zero fictional claims.",
    promptTemplate:
      "Vertical 9:16 high-impact educational reel about {{tool_name}}. Hook: 'Stop spending 4 hours doing {{problem_solved}} manually.' Visual style: clean warm ivory (#FAF9F5) canvas, dark charcoal UI cards (#171717), kinetic typography, animated cursor zoom onto {{tool_name}} workflow showing {{time_saved_percent}}% time reduction. Crisp sound effects on every bullet reveal. Conclude with bio CTA.",
    shotAndSceneInstructions: [
      "Scene 1 (0-3s): Punch-in title card with bold kinetic hook and problem statement.",
      "Scene 2 (3-12s): Split-screen comparing painful legacy manual workflow vs modern autonomous flow.",
      "Scene 3 (12-22s): 3 rapid step-by-step feature highlights with cursor zoom and yellow-gold highlight box (#A98B57).",
      "Scene 4 (22-30s): Clean summary card and CTA: 'Comment WORKFLOW for the complete setup guide.'",
    ],
    negativeConstraints: [
      "No generic AI buzzword fluff",
      "No low-resolution compressed UI artifacts",
      "No neon cyberpunk glow or dark-mode-first aesthetic",
      "No fake software buttons or fabricated claims",
    ],
    compatibleCapabilities: ["scriptwriting", "video_generation", "captions", "motion_graphics"],
    outputRequirements: {
      aspectRatio: "9/16",
      targetDurationSeconds: 30,
      recommendedFPS: 60,
      fileFormat: "MP4 (H.264) + WebM",
      resolution: "1080x1920",
    },
    qualityChecks: [
      "Subtitles are 100% synchronized with voiceover track",
      "Text does not overlap Instagram UI safe areas (top 15% and bottom 20%)",
      "Brand warm ivory (#FAF9F5) background strictly maintained",
    ],
    estimatedCost: { minUsd: 0.05, maxUsd: 0.25, unit: "per generated clip" },
    fallbackBehavior: "Fallback to Gemini scriptwriting and template Remotion animation if Kling/Runway are unavailable.",
    isDefault: true,
    isActive: true,
    updatedAt: "2026-10-13T00:00:00Z",
  },
  {
    id: "prompt-edu-mistakes-vs-best-practices",
    version: "1.4.0",
    title: "Common Mistakes vs Studio Best Practices",
    category: "educational_reels",
    subCategory: "Mistakes vs Best Practices",
    intendedAudience: "Startups, brands, and designers looking to elevate their brand presence.",
    requiredInputs: ["topic_name", "common_mistake", "studio_best_practice", "key_metric"],
    researchInstructions: "Audit common client friction points from real studio inquiries and knowledge base.",
    promptTemplate:
      "Vertical 9:16 comparison video about {{topic_name}}. Left column shows red-tinted mistake: '{{common_mistake}}'. Right column shows clean warm ivory best practice: '{{studio_best_practice}}'. Dynamic vertical dividing line wipes across screen. Clear typography showing resulting {{key_metric}} improvement.",
    shotAndSceneInstructions: [
      "Scene 1 (0-4s): 'DON'T DO THIS in {{topic_name}}' banner with quick error demonstration.",
      "Scene 2 (4-18s): Split view showing side-by-side comparison with green checkmark on Sutra recommended method.",
      "Scene 3 (18-26s): 2 key principles explaining why the best practice wins.",
      "Scene 4 (26-30s): Sutra Studio consultation CTA.",
    ],
    negativeConstraints: [
      "No aggressive shaming tone",
      "No unsubstantiated statistics",
      "No cluttered unreadable tables",
    ],
    compatibleCapabilities: ["scriptwriting", "image_generation", "motion_graphics"],
    outputRequirements: {
      aspectRatio: "9/16",
      targetDurationSeconds: 30,
      fileFormat: "MP4",
      resolution: "1080x1920",
    },
    qualityChecks: ["Clear two-column separation line", "High-contrast legible typography"],
    estimatedCost: { minUsd: 0.02, maxUsd: 0.15, unit: "per reel" },
    fallbackBehavior: "Use Remotion split-screen React composition with static asset captures.",
    isDefault: false,
    isActive: true,
    updatedAt: "2026-10-13T00:00:00Z",
  },

  // =========================================================================
  // CATEGORY B: Screen Recording and UI Demonstrations
  // =========================================================================
  {
    id: "prompt-screen-dashboard-walkthrough",
    version: "2.0.0",
    title: "Sutra Studio Dashboard Live Walkthrough",
    category: "screen_ui_demo",
    subCategory: "Dashboard Demonstration",
    intendedAudience: "Prospective enterprise and agency clients reviewing platform capabilities.",
    requiredInputs: ["feature_name", "target_url", "primary_action_step", "outcome_result"],
    researchInstructions: "Verify actual active routes on Sutra Studio (e.g. /admin, /orders, /media). Use authenticated real sessions.",
    promptTemplate:
      "16:9 / 9:16 smooth screen walkthrough of Sutra Studio's {{feature_name}}. Start on overview dashboard, pan camera toward {{primary_action_step}}, show smooth cursor path with soft gold click wave (#A98B5733), trigger execution, and zoom into real {{outcome_result}}. Floating pill tooltip explains workflow.",
    shotAndSceneInstructions: [
      "Scene 1 (0-5s): Wide viewport overview of desktop interface with subtle 4-degree perspective tilt.",
      "Scene 2 (5-18s): Camera tracks cursor directly to feature trigger button with 1.3x smooth zoom.",
      "Scene 3 (18-35s): Live state transformation displaying real-time feedback and completed order badge.",
      "Scene 4 (35-45s): Camera zooms back out to full studio frame with clean CTA watermark.",
    ],
    negativeConstraints: [
      "DO NOT fabricate fake UI buttons or fictitious screens",
      "DO NOT blur or distort essential UI text",
      "No rapid erratic mouse jitter",
      "No exposure of private API keys or user credentials",
    ],
    compatibleCapabilities: ["screen_recording_processing", "video_editing", "captions"],
    outputRequirements: {
      aspectRatio: "16/9",
      targetDurationSeconds: 45,
      recommendedFPS: 60,
      fileFormat: "MP4 (H.264) + WebM",
      resolution: "1920x1080",
    },
    qualityChecks: [
      "All displayed interface copy matches active codebase",
      "No personal data or tokens exposed in recording",
      "Smooth 60fps cursor interpolation",
    ],
    estimatedCost: { minUsd: 0.0, maxUsd: 0.1, unit: "per video composition" },
    fallbackBehavior: "Record authenticated headless browser session with smooth virtual cursor overlay.",
    isDefault: true,
    isActive: true,
    updatedAt: "2026-10-13T00:00:00Z",
  },

  // =========================================================================
  // CATEGORY C: Marketing and Advertising
  // =========================================================================
  {
    id: "prompt-mktg-brand-introduction",
    version: "3.0.0",
    title: "Sutra Studio Flagship Brand Anthem",
    category: "marketing_commercial",
    subCategory: "Brand Introduction",
    intendedAudience: "Luxury brands, architecture studios, and creative founders seeking bespoke creative tech partner.",
    requiredInputs: ["brand_ethos", "core_disciplines", "starting_price", "cta_destination"],
    researchInstructions: "Adhere strictly to Sutra Brand Prompt Pack: #FAF9F5 ivory base, #5C3A1E deep teak, #A98B57 muted brass, #171717 typography.",
    promptTemplate:
      "Cinematic 16:9 brand anthem for Sutra Studio. Theme: '{{brand_ethos}}'. Visuals blend tactile natural materials (sandstone, teak, hand-made paper) with sharp, autonomous digital interfaces. Gentle golden light diffusion. Clear presentation of disciplines: {{core_disciplines}}. Transparent pricing badge: Starting at {{starting_price}}.",
    shotAndSceneInstructions: [
      "Scene 1 (0-6s): Atmospheric macro opening: Chiseled stone tablet dissolving into glowing digital typography.",
      "Scene 2 (6-16s): Dynamic showcase of brand identity, 3D spatial renders, and automated client dashboards.",
      "Scene 3 (16-24s): Value proposition: 'Fixed scopes. Zero hidden retainers. Autonomous turnaround.'",
      "Scene 4 (24-30s): Sutra emblem lockup and CTA: '{{cta_destination}}'.",
    ],
    negativeConstraints: [
      "No generic corporate stock footage of business people shaking hands",
      "No cheesy upbeat ukulele music",
      "No pricing claims outside the verified ₹99 to ₹19,999 range",
    ],
    compatibleCapabilities: ["scriptwriting", "video_generation", "voiceover", "media_rendering"],
    outputRequirements: {
      aspectRatio: "16/9",
      targetDurationSeconds: 30,
      recommendedFPS: 24,
      fileFormat: "MP4 (ProRes / H.264)",
      resolution: "3840x2160 or 1920x1080",
    },
    qualityChecks: [
      "Accurate brand color token values used throughout",
      "Authentic logo lockup preserved without warping",
    ],
    estimatedCost: { minUsd: 0.2, maxUsd: 0.8, unit: "per commercial" },
    fallbackBehavior: "Assemble studio showcase still assets with Ken Burns slow parallax animation and voiceover.",
    isDefault: true,
    isActive: true,
    updatedAt: "2026-10-13T00:00:00Z",
  },

  // =========================================================================
  // CATEGORY D: Cinematic Video
  // =========================================================================
  {
    id: "prompt-cinematic-drone-architectural",
    version: "2.2.0",
    title: "Cinematic Drone Orbit & Architectural Reveal",
    category: "cinematic_video",
    subCategory: "Drone Orbit & Reveal",
    intendedAudience: "Architects, interior designers, luxury developers, creative directors.",
    requiredInputs: ["architectural_subject", "environment_setting", "lighting_condition", "camera_trajectory"],
    researchInstructions: "Check spatial proportions, daylight orientation, and material physics.",
    promptTemplate:
      "Ultra-photorealistic cinematic 16:9 drone shot orbiting {{architectural_subject}} set in {{environment_setting}}. Lighting: {{lighting_condition}}. Camera trajectory: {{camera_trajectory}}. Volumetric god rays filtering through travertine colonnades, natural depth of field, 35mm lens, 24fps motion blur, slow elegant orbit, 8k resolution, photoreal architectural materials.",
    shotAndSceneInstructions: [
      "Scene 1 (0-5s): Low-altitude establishing glide over landscape reflecting warm morning light.",
      "Scene 2 (5-15s): Slow continuous 90-degree orbital arc revealing primary architectural courtyard.",
      "Scene 3 (15-20s): Dolly-push through double-height portico into interior courtyard.",
    ],
    negativeConstraints: [
      "No unnatural drone jerky yaw movements",
      "No digital noise or flickering textures",
      "No distorted perspective lines or fish-eye warping",
    ],
    compatibleCapabilities: ["video_generation", "video_editing", "media_rendering"],
    outputRequirements: {
      aspectRatio: "16/9",
      targetDurationSeconds: 20,
      recommendedFPS: 24,
      fileFormat: "MP4 / WebM",
      resolution: "1920x1080",
    },
    qualityChecks: [
      "Vertical architectural lines remain straight and upright",
      "Consistent shadow casting throughout orbit",
    ],
    estimatedCost: { minUsd: 0.15, maxUsd: 0.5, unit: "per 5s generation" },
    fallbackBehavior: "Generate multi-perspective 3D isometric stills and composite via Three.js / camera projection.",
    isDefault: true,
    isActive: true,
    updatedAt: "2026-10-13T00:00:00Z",
  },

  // =========================================================================
  // CATEGORY E: 3D, Interior and 360°
  // =========================================================================
  {
    id: "prompt-interior-3d-transformation",
    version: "2.0.0",
    title: "Photorealistic 3D Interior Room Transformation",
    category: "interior_3d_360",
    subCategory: "Room Transformation & 360° Walkthrough",
    intendedAudience: "Interior architecture clients, luxury homeowners, commercial workspace planners.",
    requiredInputs: ["room_type", "initial_state", "transformed_design", "focal_elements"],
    researchInstructions: "Check spatial dimensions, furniture clearances, and accurate daylight angles.",
    promptTemplate:
      "Seamless photorealistic interior transformation of {{room_type}}. Begins with {{initial_state}}, followed by a dynamic wipe transitioning materials, lighting, and finishes into {{transformed_design}} featuring {{focal_elements}}. Warm teak wood, lime-wash plaster walls, soft brass trim, warm ambient daylight (3200K), wide-angle architectural perspective.",
    shotAndSceneInstructions: [
      "Scene 1 (0-6s): Wide perspective view of original empty space with grid lines.",
      "Scene 2 (6-16s): Material transition wave sweeping across room, dressing walls and laying custom furnishings.",
      "Scene 3 (16-25s): 360-degree virtual rotation exploring detailing and light reflection.",
      "Scene 4 (25-30s): Sutra Studio 3D Spatial Visualization badge and inquiry callout.",
    ],
    negativeConstraints: [
      "No floating ungrounded furniture",
      "No distorted perspective geometry",
      "No impossible lighting sources",
    ],
    compatibleCapabilities: ["asset_3d_generation", "visualization_360", "video_generation", "media_rendering"],
    outputRequirements: {
      aspectRatio: "16/9",
      targetDurationSeconds: 30,
      recommendedFPS: 30,
      fileFormat: "MP4 + 360 GLTF/GLB Viewer Asset",
      resolution: "1920x1080 & 4096x2048 Equirectangular",
    },
    qualityChecks: [
      "Accurate material scale and proportion",
      "Correct equirectangular 2:1 ratio for panoramic viewer export",
    ],
    estimatedCost: { minUsd: 0.25, maxUsd: 1.2, unit: "per 3D walkthrough" },
    fallbackBehavior: "Render 4 high-res perspective keyframes and assemble into an interactive Three.js 360 panorama viewer.",
    isDefault: true,
    isActive: true,
    updatedAt: "2026-10-13T00:00:00Z",
  },
];
