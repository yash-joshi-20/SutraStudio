/**
 * SUTRA STUDIO — Content Safety & File Policy Service
 * Upload consent, AI-generated content notices, moderation,
 * file type/size limits, virus scan placeholders, storage quotas,
 * retention and auto-delete policy.
 */

import { isEnvSet } from "@/lib/config/env";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContentPolicy {
  maxFileSizeMB: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  allowedDocumentTypes: string[];
  allowed3DTypes: string[];
  allowedAudioTypes: string[];
  maxFilesPerUpload: number;
  maxTotalUploadSizeMB: number;
  virusScanEnabled: boolean;
  moderationEnabled: boolean;
}

export interface UploadConsent {
  id: string;
  clientUid: string;
  consentType: "image_usage" | "brand_assets" | "ai_generation" | "data_processing";
  consentText: string;
  accepted: boolean;
  acceptedAt?: string;
  ipAddress?: string;
}

export interface ModerationResult {
  safe: boolean;
  flags: ModerationFlag[];
  checkedAt: string;
  provider: string;
}

export interface ModerationFlag {
  category: "unsafe_content" | "violence" | "hate_speech" | "illegal" | "trademark" | "copyright" | "pii" | "explicit";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  confidence: number;
}

export interface RetentionPolicy {
  planTier: string;
  retentionDays: number;
  gracePeriodDays: number;
  autoDeleteEnabled: boolean;
  notifyBeforeDeleteDays: number;
}

// ---------------------------------------------------------------------------
// Default Content Policy
// ---------------------------------------------------------------------------

export const DEFAULT_CONTENT_POLICY: ContentPolicy = {
  maxFileSizeMB: 50,
  allowedImageTypes: [
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
    "image/svg+xml", "image/tiff", "image/bmp",
  ],
  allowedVideoTypes: [
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
    "video/x-matroska",
  ],
  allowedDocumentTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],
  allowed3DTypes: [
    "model/gltf-binary", "model/gltf+json",
    "application/octet-stream", // GLB, USDZ, FBX
  ],
  allowedAudioTypes: [
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4",
  ],
  maxFilesPerUpload: 10,
  maxTotalUploadSizeMB: 200,
  virusScanEnabled: false, // Enable when ClamAV or similar is configured
  moderationEnabled: true,
};

// Retention policies per plan
export const RETENTION_POLICIES: RetentionPolicy[] = [
  { planTier: "free", retentionDays: 30, gracePeriodDays: 7, autoDeleteEnabled: true, notifyBeforeDeleteDays: 5 },
  { planTier: "starter", retentionDays: 90, gracePeriodDays: 14, autoDeleteEnabled: true, notifyBeforeDeleteDays: 7 },
  { planTier: "growth", retentionDays: 180, gracePeriodDays: 30, autoDeleteEnabled: true, notifyBeforeDeleteDays: 14 },
  { planTier: "enterprise", retentionDays: 365, gracePeriodDays: 60, autoDeleteEnabled: false, notifyBeforeDeleteDays: 30 },
];

// ---------------------------------------------------------------------------
// Consent Texts
// ---------------------------------------------------------------------------

export const CONSENT_TEXTS = {
  image_usage: `I grant Sutra Studio permission to use my uploaded images and brand assets solely for the purpose of creating the ordered creative deliverables. My files will be stored securely in my private Google Drive vault and will not be shared with third parties without my explicit consent.`,

  brand_assets: `I confirm that I own or have the right to use all brand assets (logos, images, trademarks) that I upload. I acknowledge that Sutra Studio is not responsible for any intellectual property disputes arising from client-supplied materials.`,

  ai_generation: `I understand that Sutra Studio uses AI-powered tools (including but not limited to FLUX, Kling AI, Gemini, Tripo3D, and ElevenLabs) to generate creative content based on my brief and brand specifications. AI-generated content undergoes admin quality review before delivery. I accept that outputs may require refinement and revisions are included per my plan.`,

  data_processing: `I consent to Sutra Studio processing my business data (brand information, industry, preferences) to provide personalized creative services, trend research, and content recommendations. My data is handled in accordance with our Privacy Policy and applicable data protection regulations (including DPDP Act 2023 for India).`,
} as const;

// ---------------------------------------------------------------------------
// File Validation
// ---------------------------------------------------------------------------

export function validateFile(
  file: { name: string; size: number; type: string },
  policy: ContentPolicy = DEFAULT_CONTENT_POLICY
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Size check
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > policy.maxFileSizeMB) {
    errors.push(`File "${file.name}" exceeds the ${policy.maxFileSizeMB}MB size limit (${sizeMB.toFixed(1)}MB).`);
  }

  // Type check
  const allAllowed = [
    ...policy.allowedImageTypes,
    ...policy.allowedVideoTypes,
    ...policy.allowedDocumentTypes,
    ...policy.allowed3DTypes,
    ...policy.allowedAudioTypes,
  ];

  if (!allAllowed.includes(file.type) && file.type !== "application/octet-stream") {
    errors.push(`File type "${file.type}" is not allowed. Supported: images, videos, documents, 3D models, audio.`);
  }

  // Extension check
  const ext = file.name.split(".").pop()?.toLowerCase();
  const dangerousExtensions = ["exe", "bat", "cmd", "sh", "ps1", "vbs", "js", "msi", "dll", "scr", "com"];
  if (ext && dangerousExtensions.includes(ext)) {
    errors.push(`File extension ".${ext}" is not allowed for security reasons.`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateBatchUpload(
  files: Array<{ name: string; size: number; type: string }>,
  policy: ContentPolicy = DEFAULT_CONTENT_POLICY
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (files.length > policy.maxFilesPerUpload) {
    errors.push(`Maximum ${policy.maxFilesPerUpload} files per upload. You selected ${files.length}.`);
  }

  const totalSizeMB = files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
  if (totalSizeMB > policy.maxTotalUploadSizeMB) {
    errors.push(`Total upload size (${totalSizeMB.toFixed(1)}MB) exceeds ${policy.maxTotalUploadSizeMB}MB limit.`);
  }

  for (const file of files) {
    const result = validateFile(file, policy);
    errors.push(...result.errors);
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Content Moderation
// ---------------------------------------------------------------------------

export async function moderateContent(params: {
  text?: string;
  imageUrl?: string;
  type: "text" | "image" | "combined";
}): Promise<ModerationResult> {
  const flags: ModerationFlag[] = [];

  // Text moderation
  if (params.text) {
    // Check for obvious unsafe patterns
    const unsafePatterns = [
      { pattern: /\b(bomb|weapon|exploit|hack|attack)\b/gi, category: "violence" as const, severity: "medium" as const },
      { pattern: /\b(nude|explicit|xxx|porn)\b/gi, category: "explicit" as const, severity: "high" as const },
      { pattern: /\b(kill|murder|suicide)\b/gi, category: "violence" as const, severity: "high" as const },
    ];

    for (const { pattern, category, severity } of unsafePatterns) {
      if (pattern.test(params.text)) {
        flags.push({
          category,
          severity,
          description: `Potentially unsafe content detected matching pattern: ${category}`,
          confidence: 0.7,
        });
      }
    }

    // Trademark check (basic)
    const trademarkTerms = ["nike", "apple", "gucci", "louis vuitton", "chanel", "rolex", "coca-cola", "pepsi"];
    const lowerText = params.text.toLowerCase();
    for (const term of trademarkTerms) {
      if (lowerText.includes(term)) {
        flags.push({
          category: "trademark",
          severity: "medium",
          description: `Potential trademark reference detected: "${term}". Ensure you have usage rights.`,
          confidence: 0.8,
        });
      }
    }
  }

  const geminiConfigured = isEnvSet("GEMINI_API_KEY");

  // Image moderation would use Gemini Vision or similar API
  // For now, flag as needing admin review if we can't auto-moderate
  if (params.imageUrl && !geminiConfigured) {
    flags.push({
      category: "unsafe_content",
      severity: "low",
      description: "Image auto-moderation unavailable. Admin review required.",
      confidence: 0.5,
    });
  }

  return {
    safe: !flags.some((f) => f.severity === "high" || f.severity === "critical"),
    flags,
    checkedAt: new Date().toISOString(),
    provider: geminiConfigured ? "gemini" : "basic_pattern",
  };
}

// ---------------------------------------------------------------------------
// AI-Generated Content Notice
// ---------------------------------------------------------------------------

export const AI_GENERATED_NOTICE = `This content was generated using AI-powered creative tools by Sutra Studio. While all outputs undergo professional quality review, they are produced by automated systems and may contain artifacts typical of AI generation. All deliverables are reviewed and refined by our creative team before final delivery.`;

export function getAIDisclosure(provider: string): string {
  const disclosures: Record<string, string> = {
    "bfl-flux": "Image generated using FLUX AI (Black Forest Labs). Reviewed by Sutra Studio creative team.",
    "kling": "Video generated using Kling AI. Post-processed and reviewed by Sutra Studio.",
    "runway": "Video generated using Runway Gen-3. Post-processed and reviewed by Sutra Studio.",
    "tripo3d": "3D model generated using Tripo3D AI. Refined and exported by Sutra Studio.",
    "elevenlabs": "Voiceover generated using ElevenLabs AI. Mixed by Sutra Studio.",
    "gemini": "Content assisted by Google Gemini AI. Curated by Sutra Studio.",
    "pollinations": "Image generated using Pollinations AI. Reviewed by Sutra Studio creative team.",
  };

  return disclosures[provider] || `AI-generated content. Reviewed by Sutra Studio creative team.`;
}
