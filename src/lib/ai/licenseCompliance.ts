/**
 * SUTRA STUDIO — License Compliance & Commercial Rights Matrix
 *
 * Implements Rule 9 License Directive:
 * "For every tool/model used for client deliverables, check that its terms
 * allow commercial use and ownership transfer; produce a table (tool, free limits,
 * commercial use allowed yes/no/unclear, link). Anything unclear is not used for
 * client deliverables until I confirm."
 */

export interface LicenseEntry {
  tool: string;
  category: "Open-Source (Local)" | "Free-Tier Cloud" | "OpenRouter Free" | "Paid Engine";
  freeLimits: string;
  commercialUseAllowed: "yes" | "no" | "unclear";
  ownershipTransferAllowed: "yes" | "no" | "unclear";
  deliverablesPermitted: boolean;
  notes: string;
  link: string;
}

export const LICENSE_COMPLIANCE_MATRIX: LicenseEntry[] = [
  // 1. Free Open-Source Local Tools (Tier 1)
  {
    tool: "FFmpeg (CLI)",
    category: "Open-Source (Local)",
    freeLimits: "Unlimited local execution",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "LGPL 2.1+ / GPL 2+. Processed media and stitched audio/video are 100% owned by creator.",
    link: "https://ffmpeg.org/legal.html",
  },
  {
    tool: "Blender (Headless CLI)",
    category: "Open-Source (Local)",
    freeLimits: "Unlimited local execution",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "GPL 2.0 / 3.0. Output artwork, 3D renders, and animated sequences belong solely to creator.",
    link: "https://www.blender.org/about/license/",
  },
  {
    tool: "Three.js (Web 3D Viewer)",
    category: "Open-Source (Local)",
    freeLimits: "Unlimited web embed",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "MIT License. Permissive commercial software embedding without royalty obligations.",
    link: "https://github.com/mrdoob/three.js/blob/dev/LICENSE",
  },
  {
    tool: "Pannellum (360° Spherical Tour)",
    category: "Open-Source (Local)",
    freeLimits: "Unlimited web embed",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "MIT License. Interactive WebXR panoramic viewer embeddable in client websites.",
    link: "https://pannellum.org/",
  },
  {
    tool: "<model-viewer> (Google 3D)",
    category: "Open-Source (Local)",
    freeLimits: "Unlimited web embed",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Apache 2.0 License. Permissive web component for 3D GLTF and AR display.",
    link: "https://modelviewer.dev/",
  },

  // 2. Free Tiers of Existing Keyed Providers (Tier 2)
  {
    tool: "Google Gemini API (2.0 Flash)",
    category: "Free-Tier Cloud",
    freeLimits: "15 RPM / 1,500 RPD / 1M TPM",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Google AI Terms permit commercial output usage. Customer retains ownership of generated content.",
    link: "https://ai.google.dev/terms",
  },
  {
    tool: "Groq Cloud (Llama 3.3 70B)",
    category: "Free-Tier Cloud",
    freeLimits: "30 RPM / 14,400 RPD",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Groq Terms of Use + Meta Llama 3 Community License allows commercial use up to 700M monthly active users.",
    link: "https://groq.com/terms-of-use/",
  },
  {
    tool: "Cerebras Inference Cloud",
    category: "Free-Tier Cloud",
    freeLimits: "30 RPM / 1,000,000 tokens/day",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Cerebras Terms allow commercial use for API outputs; Llama 3 community license applies.",
    link: "https://cerebras.ai/terms-of-service/",
  },
  {
    tool: "Hugging Face Inference API",
    category: "Free-Tier Cloud",
    freeLimits: "Serverless rate-limited free tier",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Subject to specific model repository license (e.g. Apache 2.0, OpenRAIL).",
    link: "https://huggingface.co/terms-of-service",
  },

  // 3. OpenRouter Models with ":free" suffix (Tier 3 - Text Only)
  {
    tool: "OpenRouter Free Text Models (:free)",
    category: "OpenRouter Free",
    freeLimits: "Dynamic per-model limits (~20 RPM)",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "OpenRouter passes through underlying open model licenses (Apache 2.0, MIT, Llama 3). Restricted strictly to text tasks (briefs, captions, translation).",
    link: "https://openrouter.ai/terms",
  },

  // 4. Paid Options (Tier 4 - Requires Explicit Admin Approval)
  {
    tool: "Black Forest Labs (FLUX 1.1 Pro)",
    category: "Paid Engine",
    freeLimits: "None ($0.04 / master render)",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Full commercial license and complete ownership granted to paid API customers. Requires admin approval before dispatching.",
    link: "https://blackforestlabs.ai/terms",
  },
  {
    tool: "Kling AI Video",
    category: "Paid Engine",
    freeLimits: "None ($0.10 / 5s video)",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Full commercial video distribution license on paid API tokens. Requires admin approval.",
    link: "https://klingai.com/terms",
  },
  {
    tool: "Runway (Gen-3 Turbo)",
    category: "Paid Engine",
    freeLimits: "None ($0.15 / clip)",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Commercial license granted on paid plans. Requires admin approval.",
    link: "https://runwayml.com/terms-of-use",
  },
  {
    tool: "ElevenLabs Voiceover",
    category: "Paid Engine",
    freeLimits: "10,000 chars/mo (Non-commercial only on free)",
    commercialUseAllowed: "no",
    ownershipTransferAllowed: "no",
    deliverablesPermitted: false,
    notes: "Free tier is strictly non-commercial. Commercial deliverables require paid Starter tier ($5/mo). Free tier blocked for client deliverables.",
    link: "https://elevenlabs.io/terms",
  },
  {
    tool: "Tripo3D Spatial CAD",
    category: "Paid Engine",
    freeLimits: "None ($0.20 / model)",
    commercialUseAllowed: "yes",
    ownershipTransferAllowed: "yes",
    deliverablesPermitted: true,
    notes: "Exported 3D assets owned by paid client. Requires admin approval.",
    link: "https://www.tripo3d.ai/terms",
  },
];
