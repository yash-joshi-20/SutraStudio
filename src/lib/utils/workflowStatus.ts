/**
 * SUTRA STUDIO — Client-Facing Status Normalizer
 * Enforces neutral, premium luxury atelier terminology across client portals,
 * stripping all internal technical identifiers, AI model names, or infrastructure terms.
 */

export interface ClientFacingStatusInfo {
  label: string;
  description: string;
  colorClass: string;
  badgeVariant: "default" | "secondary" | "outline";
}

const STATUS_MAP: Record<string, ClientFacingStatusInfo> = {
  queued: {
    label: "In Atelier Queue",
    description: "Your creative brief has been accepted and scheduled in our studio production queue.",
    colorClass: "bg-[#FAF9F5] text-[#78716C] border-[#E5E1D8]",
    badgeVariant: "secondary",
  },
  running: {
    label: "In Production",
    description: "Our creative directors and technical artisans are crafting your custom deliverables.",
    colorClass: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    badgeVariant: "secondary",
  },
  in_production: {
    label: "In Production",
    description: "Our creative directors and technical artisans are crafting your custom deliverables.",
    colorClass: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    badgeVariant: "secondary",
  },
  draft_ready: {
    label: "In Studio Quality Review",
    description: "Initial creative renders are undergoing executive supervisory inspection before client presentation.",
    colorClass: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    badgeVariant: "secondary",
  },
  in_admin_review: {
    label: "In Studio Quality Review",
    description: "Initial creative renders are undergoing executive supervisory inspection before client presentation.",
    colorClass: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    badgeVariant: "secondary",
  },
  needs_attention: {
    label: "Curating Quality Adjustments",
    description: "Our senior design lead is refining material parameters to ensure exact atelier fidelity.",
    colorClass: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
    badgeVariant: "outline",
  },
  awaiting_approval: {
    label: "Ready for Client Review",
    description: "Your master deliverables are finalized and awaiting your sign-off in the workspace.",
    colorClass: "bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]",
    badgeVariant: "secondary",
  },
  approved: {
    label: "Approved",
    description: "Deliverables approved and cleared for commercial distribution and high-res asset download.",
    colorClass: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    badgeVariant: "secondary",
  },
  completed: {
    label: "Delivered",
    description: "All assets vaulted in your private Google Drive and ready for deployment.",
    colorClass: "bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]",
    badgeVariant: "default",
  },
  active: {
    label: "Active Retainer",
    description: "Your monthly atelier membership is active with ongoing daily production.",
    colorClass: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    badgeVariant: "secondary",
  },
};

/**
 * Converts any internal workflow status into an elegant client-facing status.
 */
export function getClientFacingStatus(rawStatus?: string | null): ClientFacingStatusInfo {
  if (!rawStatus) return STATUS_MAP["queued"];
  const cleanKey = rawStatus.toLowerCase().trim();
  return STATUS_MAP[cleanKey] || {
    label: "In Atelier Curation",
    description: "Your project is actively being managed by our studio team.",
    colorClass: "bg-[#FAF9F5] text-[#78716C] border-[#E5E1D8]",
    badgeVariant: "secondary",
  };
}

/**
 * Sanitizes any text string to ensure zero internal AI or tool jargon is presented to clients.
 */
export function sanitizeClientFacingText(text: string): string {
  if (!text) return "";
  return text
    .replace(/n8n/gi, "Studio Orchestrator")
    .replace(/flux(?:\.1)?(?:\s*pro)?/gi, "Master Photorealistic Renderer")
    .replace(/kling(?:\s*ai)?/gi, "Cinematic Motion Engine")
    .replace(/elevenlabs/gi, "Bespoke Acoustic Voiceover")
    .replace(/tripo(?:\s*3d)?/gi, "Spatial 3D Modeler")
    .replace(/diffusion/gi, "Studio Creative Engine")
    .replace(/webhook/gi, "Studio Pipeline")
    .replace(/serpapi/gi, "Market Trend Intelligence");
}
