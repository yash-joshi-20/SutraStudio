/**
 * SUTRA STUDIO — Capability & Plugin Registry (Step 05)
 * 
 * Inspects all accessible AI engines, rendering utilities, CLI tools,
 * and orchestration systems. Dynamically registers capabilities, tracks credentials,
 * provides cost estimates, and configures fallback routes.
 */

import { isEnvSet, type EnvKey } from "@/lib/config/env";
import { CapabilityItem, CapabilityType } from "./types";

/**
 * Live capability provider evaluation reading active environment settings.
 */
export function getLiveCapabilityRegistry(): CapabilityItem[] {
  const geminiConfigured = isEnvSet("GEMINI_API_KEY");
  const openaiConfigured = isEnvSet("OPENAI_API_KEY");
  const bflConfigured = isEnvSet("BFL_API_KEY");
  const klingConfigured = isEnvSet("KLING_API_KEY");
  const runwayConfigured = isEnvSet("RUNWAY_API_KEY" as EnvKey);
  const elevenLabsConfigured = isEnvSet("ELEVENLABS_API_KEY");
  const tripo3dConfigured = isEnvSet("TRIPO3D_API_KEY");
  const serpapiConfigured = isEnvSet("SERPAPI_API_KEY");
  const googleDriveConfigured = isEnvSet("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  const n8nConfigured = isEnvSet("N8N_WEBHOOK_URL" as EnvKey);

  return [
    // -----------------------------------------------------------------------
    // 1. Text, Scriptwriting & Ideation Engine (Google Gemini)
    // -----------------------------------------------------------------------
    {
      id: "cap-gemini-core",
      name: "Google Gemini 2.0 Flash / Pro",
      type: "scriptwriting",
      provider: "Google Cloud",
      installedStatus: geminiConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: [
        "trend_research",
        "topic_ideation",
        "scriptwriting",
        "storyboard_generation",
        "prompt_enhancement",
      ],
      authRequirements: {
        envKey: "GEMINI_API_KEY",
        isConfigured: geminiConfigured,
        instructions: "Set GEMINI_API_KEY in .env.local or production server environment.",
      },
      inputOutputFormats: {
        acceptedInputs: ["text", "json", "images/vision", "brand_profiles"],
        producedOutputs: ["json_scripts", "storyboard_markdown", "enhanced_prompts"],
      },
      estimatedCost: {
        costPerUnit: 0.001,
        unit: "per 1K tokens",
      },
      rateLimits: {
        rpm: 30,
        dailyLimit: 1500,
      },
      errorHandling: "Exponential backoff on 429; graceful fallback to local template generator on timeout.",
      fallbackOptionId: "cap-local-template-engine",
      notes: "Primary studio cognitive brain for creative briefs, research synthesis, and screenplay timing.",
    },

    // -----------------------------------------------------------------------
    // 2. Open Source / Fallback Text Engine (OpenAI / OpenRouter)
    // -----------------------------------------------------------------------
    {
      id: "cap-openai-llm",
      name: "OpenAI GPT-4o / Mini",
      type: "scriptwriting",
      provider: "OpenAI",
      installedStatus: openaiConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["scriptwriting", "topic_ideation", "prompt_enhancement"],
      authRequirements: {
        envKey: "OPENAI_API_KEY",
        isConfigured: openaiConfigured,
        instructions: "Set OPENAI_API_KEY in .env.local.",
      },
      inputOutputFormats: {
        acceptedInputs: ["text", "system_prompt"],
        producedOutputs: ["text", "json"],
      },
      estimatedCost: {
        costPerUnit: 0.003,
        unit: "per 1K tokens",
      },
      rateLimits: {
        rpm: 60,
      },
      errorHandling: "Catch 401/429 and reroute to Gemini.",
      fallbackOptionId: "cap-gemini-core",
      notes: "Secondary LLM provider in router chain.",
    },

    // -----------------------------------------------------------------------
    // 3. Image Generation — Free Fallback Tier (Pollinations AI)
    // -----------------------------------------------------------------------
    {
      id: "cap-pollinations-image",
      name: "Pollinations FLUX Free Tier",
      type: "image_generation",
      provider: "Pollinations.ai",
      installedStatus: "installed",
      executionMethod: "api_cloud",
      supportedCapabilities: ["image_generation"],
      authRequirements: {
        isConfigured: true,
        instructions: "Zero-key public API endpoint available for development and initial prototyping.",
      },
      inputOutputFormats: {
        acceptedInputs: ["text_prompt", "width", "height", "seed"],
        producedOutputs: ["image/png", "image/jpeg", "image/webp"],
      },
      estimatedCost: {
        costPerUnit: 0.0,
        unit: "free tier",
      },
      rateLimits: {
        rpm: 10,
      },
      errorHandling: "Retry up to 2 times; on HTTP 500 fallback to curated studio asset catalog.",
      fallbackOptionId: "cap-studio-asset-vault",
      notes: "Always ready default image provider for preview mockups when premium keys are absent.",
    },

    // -----------------------------------------------------------------------
    // 4. Image Generation — High Fidelity (Black Forest Labs FLUX Pro)
    // -----------------------------------------------------------------------
    {
      id: "cap-bfl-flux-pro",
      name: "BFL FLUX.1 [pro]",
      type: "image_generation",
      provider: "Black Forest Labs",
      installedStatus: bflConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["image_generation", "image_editing"],
      authRequirements: {
        envKey: "BFL_API_KEY",
        isConfigured: bflConfigured,
        instructions: "Acquire API key from bfl.ml and configure BFL_API_KEY in server secrets.",
      },
      inputOutputFormats: {
        acceptedInputs: ["detailed_prompt", "aspect_ratio", "guidance_scale"],
        producedOutputs: ["image/png (high-res)", "image/webp"],
      },
      estimatedCost: {
        costPerUnit: 0.04,
        unit: "per image",
      },
      rateLimits: {
        rpm: 10,
      },
      errorHandling: "Asynchronous polling with 30s timeout; automatic fallback to Pollinations FLUX.",
      fallbackOptionId: "cap-pollinations-image",
      notes: "Premium enterprise tier for flagship website hero imagery and high-fashion client campaigns.",
    },

    // -----------------------------------------------------------------------
    // 5. Video Generation — High Dynamic Motion (Kling AI)
    // -----------------------------------------------------------------------
    {
      id: "cap-kling-video",
      name: "Kling AI 1.5 Video",
      type: "video_generation",
      provider: "Kuaishou / Kling",
      installedStatus: klingConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["video_generation"],
      authRequirements: {
        envKey: "KLING_API_KEY",
        isConfigured: klingConfigured,
        instructions: "Configure KLING_API_KEY in environment variables.",
      },
      inputOutputFormats: {
        acceptedInputs: ["text_prompt", "start_image_url", "aspect_ratio", "duration_seconds"],
        producedOutputs: ["video/mp4 (1080p 30fps)"],
      },
      estimatedCost: {
        costPerUnit: 0.1,
        unit: "per 5s generation",
      },
      rateLimits: {
        rpm: 3,
      },
      errorHandling: "Task queue status polling; fallback to Runway or Remotion composition.",
      fallbackOptionId: "cap-runway-video",
      notes: "Exceptional physical dynamics and natural cloth / fluid simulation.",
    },

    // -----------------------------------------------------------------------
    // 6. Video Generation — Cinematic Camera Control (Runway Gen-3 Alpha)
    // -----------------------------------------------------------------------
    {
      id: "cap-runway-video",
      name: "Runway Gen-3 Alpha",
      type: "video_generation",
      provider: "RunwayML",
      installedStatus: runwayConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["video_generation", "video_editing"],
      authRequirements: {
        envKey: "RUNWAY_API_KEY",
        isConfigured: runwayConfigured,
        instructions: "Configure RUNWAY_API_KEY in environment variables.",
      },
      inputOutputFormats: {
        acceptedInputs: ["prompt", "camera_motion_parameters", "seed"],
        producedOutputs: ["video/mp4 (4K/1080p)"],
      },
      estimatedCost: {
        costPerUnit: 0.15,
        unit: "per 5s generation",
      },
      rateLimits: {
        rpm: 3,
      },
      errorHandling: "Webhook notification callback; fallback to Remotion motion graphics pipeline.",
      fallbackOptionId: "cap-remotion-engine",
      notes: "Industry standard for aerial orbits, architectural fly-throughs, and controlled tracking shots.",
    },

    // -----------------------------------------------------------------------
    // 7. Voiceover & Acoustic Synthesis (ElevenLabs)
    // -----------------------------------------------------------------------
    {
      id: "cap-elevenlabs-voice",
      name: "ElevenLabs Neural Voice Synthesis",
      type: "voiceover",
      provider: "ElevenLabs",
      installedStatus: elevenLabsConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["voiceover"],
      authRequirements: {
        envKey: "ELEVENLABS_API_KEY",
        isConfigured: elevenLabsConfigured,
        instructions: "Set ELEVENLABS_API_KEY in server secrets.",
      },
      inputOutputFormats: {
        acceptedInputs: ["script_text", "voice_id", "stability", "clarity"],
        producedOutputs: ["audio/mp3", "audio/wav"],
      },
      estimatedCost: {
        costPerUnit: 0.03,
        unit: "per 100 characters",
      },
      rateLimits: {
        rpm: 20,
      },
      errorHandling: "Retry on socket error; fallback to browser speech synthesis preview.",
      fallbackOptionId: "cap-local-template-engine",
      notes: "Studio voice clones with warm, contemplative human timbre.",
    },

    // -----------------------------------------------------------------------
    // 8. 3D Model Generation & Mesh Reconstruction (Tripo3D)
    // -----------------------------------------------------------------------
    {
      id: "cap-tripo-3d",
      name: "Tripo3D Neural Mesh Engine",
      type: "asset_3d_generation",
      provider: "Tripo AI",
      installedStatus: tripo3dConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["asset_3d_generation", "visualization_360"],
      authRequirements: {
        envKey: "TRIPO3D_API_KEY",
        isConfigured: tripo3dConfigured,
        instructions: "Set TRIPO3D_API_KEY in server secrets.",
      },
      inputOutputFormats: {
        acceptedInputs: ["text_prompt", "reference_image_url"],
        producedOutputs: ["model/gltf-binary (.glb)", "model/obj", "textures/pbr"],
      },
      estimatedCost: {
        costPerUnit: 0.2,
        unit: "per 3D model draft",
      },
      rateLimits: {
        rpm: 5,
      },
      errorHandling: "Poll job status; fallback to Three.js procedural geometry generator.",
      fallbackOptionId: "cap-threejs-viewer",
      notes: "Generates watertight GLB meshes suitable for real-time WebGL interactive viewers.",
    },

    // -----------------------------------------------------------------------
    // 9. Programmatic Motion Graphics (Remotion Composition Adapter)
    // -----------------------------------------------------------------------
    {
      id: "cap-remotion-engine",
      name: "Remotion Programmatic Video Studio",
      type: "motion_graphics",
      provider: "Remotion (Local Next.js / Serverless)",
      installedStatus: "adapter_ready",
      executionMethod: "hybrid",
      supportedCapabilities: [
        "motion_graphics",
        "captions",
        "screen_recording_processing",
        "media_rendering",
      ],
      authRequirements: {
        isConfigured: true,
        instructions: "Runs React-based video compositions using headless Chrome.",
      },
      inputOutputFormats: {
        acceptedInputs: ["react_props", "subtitles_srt", "screen_recording_mp4"],
        producedOutputs: ["video/mp4", "video/webm"],
      },
      estimatedCost: {
        costPerUnit: 0.01,
        unit: "compute per minute",
      },
      rateLimits: {
        rpm: 12,
      },
      errorHandling: "Headless render timeout; fall back to FFmpeg static concatenation.",
      fallbackOptionId: "cap-ffmpeg-cli",
      notes: "Renders kinetic typography, progress bars, split screens, and UI zooms with 100% deterministic precision.",
    },

    // -----------------------------------------------------------------------
    // 10. Local Media Processing (FFmpeg Adapter)
    // -----------------------------------------------------------------------
    {
      id: "cap-ffmpeg-cli",
      name: "FFmpeg Media Processing Engine",
      type: "video_editing",
      provider: "Local Environment / Container",
      installedStatus: "adapter_ready",
      executionMethod: "cli_local",
      supportedCapabilities: [
        "video_editing",
        "media_rendering",
        "captions",
      ],
      authRequirements: {
        isConfigured: true,
        instructions: "Available in containerized production runtime or system PATH.",
      },
      inputOutputFormats: {
        acceptedInputs: ["raw_video", "raw_audio", "subtitles_ass"],
        producedOutputs: ["optimized_mp4", "webm_vp9", "hls_stream"],
      },
      estimatedCost: {
        costPerUnit: 0.0,
        unit: "local compute",
      },
      rateLimits: {
        rpm: 20,
      },
      errorHandling: "Stream pipe error check; fallback to web browser WebCodecs rendering.",
      fallbackOptionId: "cap-local-template-engine",
      notes: "Hardware-accelerated transcoding, watermark burn-in, audio normalization, and WebP poster generation.",
    },

    // -----------------------------------------------------------------------
    // 11. Workflow Orchestrator (n8n Service)
    // -----------------------------------------------------------------------
    {
      id: "cap-n8n-orchestrator",
      name: "n8n Workflow Automation Engine",
      type: "social_publishing",
      provider: "Self-Hosted / Render / Cloud",
      installedStatus: n8nConfigured ? "configured_api" : "missing_key",
      executionMethod: "n8n_webhook",
      supportedCapabilities: [
        "social_publishing",
        "file_storage",
        "trend_research",
      ],
      authRequirements: {
        envKey: "N8N_WEBHOOK_URL",
        isConfigured: n8nConfigured,
        instructions: "Set N8N_WEBHOOK_URL in environment variables.",
      },
      inputOutputFormats: {
        acceptedInputs: ["json_payload", "job_artifacts"],
        producedOutputs: ["webhook_response", "distribution_receipts"],
      },
      estimatedCost: {
        costPerUnit: 0.0,
        unit: "self-hosted webhook",
      },
      rateLimits: {
        rpm: 100,
      },
      errorHandling: "Retries with exponential backoff; logs failure into Firestore audit ledger.",
      fallbackOptionId: "cap-firestore-ledger",
      notes: "Handles scheduled dispatches, social publishing (Meta, YouTube, LinkedIn), and multi-step pipeline sync.",
    },

    // -----------------------------------------------------------------------
    // 12. Storage & Vault Vault (Google Drive API)
    // -----------------------------------------------------------------------
    {
      id: "cap-gdrive-vault",
      name: "Google Drive Enterprise Media Vault",
      type: "file_storage",
      provider: "Google Workspace / Cloud Console",
      installedStatus: googleDriveConfigured ? "configured_api" : "missing_key",
      executionMethod: "api_cloud",
      supportedCapabilities: ["file_storage"],
      authRequirements: {
        envKey: "GOOGLE_DRIVE_FOLDER_ID",
        isConfigured: googleDriveConfigured,
        instructions: "Configure Google Service Account credentials and root folder ID.",
      },
      inputOutputFormats: {
        acceptedInputs: ["multipart_binary", "metadata"],
        producedOutputs: ["drive_file_id", "stream_url", "direct_link"],
      },
      estimatedCost: {
        costPerUnit: 0.0,
        unit: "included storage",
      },
      rateLimits: {
        rpm: 60,
      },
      errorHandling: "Local buffer cache on connection drop; automatic resume upload.",
      fallbackOptionId: "cap-firestore-ledger",
      notes: "Master storage repository for raw 4K videos, heavy 3D GLB models, and uncompressed production assets.",
    },

    // -----------------------------------------------------------------------
    // 13. Three.js / WebGL 360° Interactive Viewer
    // -----------------------------------------------------------------------
    {
      id: "cap-threejs-viewer",
      name: "Three.js Spatial & 360° Panorama Viewer",
      type: "visualization_360",
      provider: "Client-side WebGL (Sutra Studio Core)",
      installedStatus: "installed",
      executionMethod: "in_browser",
      supportedCapabilities: ["visualization_360"],
      authRequirements: {
        isConfigured: true,
        instructions: "Native browser WebGL canvas integration.",
      },
      inputOutputFormats: {
        acceptedInputs: ["equirectangular_image_url", "gltf_model_url"],
        producedOutputs: ["interactive_3d_canvas", "spatial_coordinates"],
      },
      estimatedCost: {
        costPerUnit: 0.0,
        unit: "client device compute",
      },
      rateLimits: {
        rpm: 1000,
      },
      errorHandling: "Fallback to static image gallery if WebGL context is lost.",
      fallbackOptionId: "cap-studio-asset-vault",
      notes: "Powering interactive 360° virtual tours and orbital 3D product inspection directly on client dashboards.",
    },

    // -----------------------------------------------------------------------
    // 14. Local Deterministic Template Fallback Engine
    // -----------------------------------------------------------------------
    {
      id: "cap-local-template-engine",
      name: "Sutra Studio Core Script & Prompt Compiler",
      type: "prompt_enhancement",
      provider: "Local Codebase",
      installedStatus: "installed",
      executionMethod: "cli_local",
      supportedCapabilities: [
        "prompt_enhancement",
        "scriptwriting",
        "topic_ideation",
      ],
      authRequirements: {
        isConfigured: true,
        instructions: "Zero-dependency deterministic TypeScript engine.",
      },
      inputOutputFormats: {
        acceptedInputs: ["brand_profile", "user_parameters"],
        producedOutputs: ["structured_prompt", "timed_script_json"],
      },
      estimatedCost: {
        costPerUnit: 0.0,
        unit: "instant local execution",
      },
      rateLimits: {
        rpm: 10000,
      },
      errorHandling: "Guaranteed completion; zero runtime failures.",
      notes: "Ensures the entire creative automation platform operates smoothly even when external third-party APIs are offline.",
    },
  ];
}

/**
 * Find best capability for a specific task
 */
export function getBestCapability(type: CapabilityType): CapabilityItem | null {
  const all = getLiveCapabilityRegistry();
  const matching = all.filter((item) => item.supportedCapabilities.includes(type));
  // Sort installed/configured first
  const configured = matching.filter(
    (item) => item.installedStatus === "installed" || item.installedStatus === "configured_api" || item.installedStatus === "adapter_ready"
  );
  return configured[0] || matching[0] || null;
}
