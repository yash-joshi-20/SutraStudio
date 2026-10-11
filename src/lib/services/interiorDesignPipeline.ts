import { readEnv } from "@/lib/config/env";

/**
 * SUTRA STUDIO — Interior Design Architectural Pipeline
 * Automates:
 * 1. Restyled room renders (photorealistic architectural visualization)
 * 2. Visual moodboard concept
 * 3. Material & color palette specification
 * 4. Architectural layout & lighting note
 * 5. Distinctly flags human team items (Physical sample verification, structural clearance)
 */

export interface InteriorDesignInput {
  orderId: string;
  clientId: string;
  roomType: "living_room" | "master_bedroom" | "dining_hall" | "luxury_kitchen" | "executive_office" | "penthouse_terrace" | string;
  aestheticStyle: "contemporary_minimalist" | "warm_ivory_brass" | "modern_japandi" | "indian_heritage_luxury" | "brutalist_chic" | string;
  brief: string;
  existingRoomImageUrl?: string;
  driveFolderId?: string;
}

export interface MaterialSpecification {
  category: "Flooring" | "Millwork" | "Metal Accents" | "Textiles" | "Lighting";
  name: string;
  code: string;
  finish: string;
  notes: string;
  physicalSampleRequired: boolean;
}

export interface InteriorDesignDeliverablePack {
  orderId: string;
  roomType: string;
  aestheticStyle: string;
  generatedRenders: Array<{
    viewAngle: string;
    url: string;
    resolution: string;
    caption: string;
  }>;
  moodboardUrl: string;
  materialPalette: MaterialSpecification[];
  architecturalLayoutNote: string;
  lightingStrategy: string;
  humanTeamActionRequired: {
    requiresPhysicalReview: boolean;
    assignedDepartment: "Senior Interior Architect" | "Spatial Design Lead";
    checklist: string[];
    status: "pending_architect_signoff";
  };
  generatedAt: string;
}

export class InteriorDesignPipelineService {
  /**
   * Synthesizes an interior design architectural package
   */
  public static async generateDesignPackage(input: InteriorDesignInput): Promise<InteriorDesignDeliverablePack> {
    const now = new Date().toISOString();
    const styleLabel = input.aestheticStyle.replace(/_/g, " ").toUpperCase();
    const roomLabel = input.roomType.replace(/_/g, " ").toUpperCase();

    // 1. Structured material specification
    const materialPalette: MaterialSpecification[] = [
      {
        category: "Flooring",
        name: "Calacatta Oro Honed Marble",
        code: "MAT-FL-01",
        finish: "Honed matte slip-resistant finish",
        notes: "Book-matched 1200x1200mm slabs with subtle golden veins.",
        physicalSampleRequired: true,
      },
      {
        category: "Millwork",
        name: "Handcrafted Smoked White Oak",
        code: "MAT-WD-04",
        finish: "Natural Danish oil, zero VOC",
        notes: "Fluted architectural panels for concealed joinery.",
        physicalSampleRequired: true,
      },
      {
        category: "Metal Accents",
        name: "Brushed Muted Brass (PVD Coated)",
        code: "MAT-MT-02",
        finish: "Satin brush with protective lacquer",
        notes: "Custom shadowlines, cabinet handles, and frame reveals.",
        physicalSampleRequired: false,
      },
      {
        category: "Textiles",
        name: "Raw Slub Linen & Bouclé",
        code: "MAT-TX-08",
        finish: "Scotchgard protected upholstery",
        notes: "Warm ivory tone #FAF9F5, tactile textured drape.",
        physicalSampleRequired: true,
      },
      {
        category: "Lighting",
        name: "Architectural Recessed Cove Strips",
        code: "LGT-3000K-C95",
        finish: "Deep baffle anti-glare diffuser",
        notes: "High CRI 95+, 3000K warm ambient illumination with 0-10V dimming.",
        physicalSampleRequired: false,
      },
    ];

    // 2. Architectural layout narrative
    const architecturalLayoutNote = `SPATIAL COMPOSITION (${roomLabel} — ${styleLabel}):\n` +
      `• Circulation: Primary axis maintained with 1100mm clear passage toward natural fenestration.\n` +
      `• Focal Anchor: Floating low-profile credenza anchored by smoked white oak wall cladding and diffused brass cove.\n` +
      `• Ergonomic Zoning: Seating cluster positioned perpendicular to glare angles to maximize indirect northern daylight.\n` +
      `• Acoustic Damping: Custom wool-silk area rug and acoustic slatted wall backing to control ambient reverberation.`;

    const lightingStrategy = `TRIPARTITE LIGHTING SCHEME:\n` +
      `1. Layer 1 (Ambient): Concealed 3000K LED perimeter cove grazing textured limestone.\n` +
      `2. Layer 2 (Task): Low-glare recessed directional spotlights (15° beam angle) targeted on curated coffee table sculptures.\n` +
      `3. Layer 3 (Accent): Custom brass sculptural wall sconce providing warm organic silhouette.`;

    // 3. Clean render assets (photorealistic architectural visualization prompts)
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const basePrompt = encodeURIComponent(
      `luxury interior architecture of ${input.roomType.replace(/_/g, " ")}, ${input.aestheticStyle.replace(/_/g, " ")}, calacatta gold marble, white oak woodwork, brushed brass accents, 3000K warm natural lighting, Hasselblad 8k photography, bespoke editorial design`
    );

    const generatedRenders = [
      {
        viewAngle: "Primary Wide Angle Perspective",
        url: `https://image.pollinations.ai/prompt/${basePrompt}%2C%20wide%20angle%20perspective?width=1920&height=1080&nologo=true&seed=${seed}`,
        resolution: "1920x1080 (FHD)",
        caption: `Spatial Overview of ${roomLabel}`,
      },
      {
        viewAngle: "Vignette & Material Junction Detail",
        url: `https://image.pollinations.ai/prompt/${basePrompt}%2C%20close%20up%20architectural%20vignette%20detail?width=1080&height=1350&nologo=true&seed=${seed + 1}`,
        resolution: "1080x1350 (4:5 Editorial)",
        caption: `Material Interface Detail (Marble + Brass + Fluted Wood)`,
      },
    ];

    const moodboardUrl = `https://image.pollinations.ai/prompt/${basePrompt}%2C%20architectural%20materials%20moodboard%20grid%20flatlay?width=1200&height=800&nologo=true&seed=${seed + 2}`;

    // 4. Clearly define what requires physical human architect clearance
    const humanTeamActionRequired = {
      requiresPhysicalReview: true,
      assignedDepartment: "Senior Interior Architect" as const,
      checklist: [
        "Review on-site structural load-bearing capacity for marble slab installation.",
        "Verify physical fabric swatches (MAT-TX-08) under client room lighting.",
        "Sign off on electrical junction box placements for 3000K low-voltage drivers.",
        "Prepare final CAD dimension drawing package for client approval.",
      ],
      status: "pending_architect_signoff" as const,
    };

    return {
      orderId: input.orderId,
      roomType: input.roomType,
      aestheticStyle: input.aestheticStyle,
      generatedRenders,
      moodboardUrl,
      materialPalette,
      architecturalLayoutNote,
      lightingStrategy,
      humanTeamActionRequired,
      generatedAt: now,
    };
  }
}
