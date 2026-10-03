/**
 * SUTRA STUDIO — Brand Kit Store
 * Reusable brand profiles per client. Multiple brands allowed.
 * Every order and daily content job references a Brand Kit.
 */

import { adminDb } from "@/lib/firebase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BrandColor {
  name: string;
  hex: string;
  usage: "primary" | "secondary" | "accent" | "background" | "text";
}

export interface BrandSocialLink {
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "youtube" | "tiktok" | "pinterest" | "website" | "other";
  url: string;
}

export interface BrandKit {
  id: string;
  clientUid: string;
  brandName: string;
  companyName: string;
  industry: string;
  subIndustry?: string;
  language: string;
  region?: string;
  tone: string;
  tagline?: string;
  description?: string;

  // Visual identity
  logoUrl?: string;
  logoFileId?: string;
  brandImages: Array<{ url: string; fileId: string; label: string }>;
  colors: BrandColor[];
  fonts: Array<{ name: string; usage: "heading" | "body" | "accent"; url?: string }>;

  // Links
  websiteUrl?: string;
  socialLinks: BrandSocialLink[];
  referenceLinks: string[];

  // Content preferences
  contentKeywords: string[];
  avoidKeywords: string[];
  targetAudience?: string;
  competitorBrands?: string[];

  // Metadata
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BrandKitCreateInput = Omit<BrandKit, "id" | "createdAt" | "updatedAt">;

// Industry options for UI select
export const INDUSTRY_OPTIONS = [
  "Real Estate & Architecture",
  "Interior Design & Home Décor",
  "Fashion & Luxury Goods",
  "Food & Beverages",
  "Beauty & Wellness",
  "Technology & SaaS",
  "Education & E-Learning",
  "Healthcare & Pharma",
  "Automotive",
  "Hospitality & Travel",
  "E-Commerce & Retail",
  "Finance & Banking",
  "Entertainment & Media",
  "Sports & Fitness",
  "Agriculture & Organic",
  "Manufacturing & Industrial",
  "Non-Profit & Social",
  "Other",
] as const;

export const TONE_OPTIONS = [
  "Professional & Corporate",
  "Luxury & Premium",
  "Warm & Friendly",
  "Bold & Energetic",
  "Minimalist & Clean",
  "Traditional & Cultural",
  "Playful & Creative",
  "Technical & Authoritative",
  "Inspirational & Aspirational",
  "Casual & Conversational",
] as const;

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
] as const;

// ---------------------------------------------------------------------------
// Store Operations
// ---------------------------------------------------------------------------

const COLLECTION = "brand_kits";

export class BrandKitStore {
  /**
   * Create a new Brand Kit
   */
  static async create(input: BrandKitCreateInput): Promise<BrandKit> {
    const db = adminDb();
    const now = new Date().toISOString();
    const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const kit: BrandKit = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // If this is the first or default kit, unset default on others
    if (kit.isDefault) {
      await BrandKitStore.unsetDefaultForClient(kit.clientUid);
    }

    await db.collection(COLLECTION).doc(id).set(kit);
    return kit;
  }

  /**
   * Get a single Brand Kit by ID, verifying ownership
   */
  static async getById(kitId: string, clientUid: string): Promise<BrandKit | null> {
    const db = adminDb();
    const doc = await db.collection(COLLECTION).doc(kitId).get();
    if (!doc.exists) return null;
    const data = doc.data() as BrandKit;
    if (data.clientUid !== clientUid) return null;
    return data;
  }

  /**
   * List all Brand Kits for a client
   */
  static async listByClient(clientUid: string): Promise<BrandKit[]> {
    const db = adminDb();
    const snap = await db
      .collection(COLLECTION)
      .where("clientUid", "==", clientUid)
      .orderBy("createdAt", "desc")
      .get();

    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as BrandKit);
  }

  /**
   * Update a Brand Kit
   */
  static async update(kitId: string, clientUid: string, updates: Partial<BrandKit>): Promise<BrandKit | null> {
    const existing = await BrandKitStore.getById(kitId, clientUid);
    if (!existing) return null;

    const merged: BrandKit = {
      ...existing,
      ...updates,
      id: kitId,
      clientUid,
      updatedAt: new Date().toISOString(),
    };

    if (updates.isDefault) {
      await BrandKitStore.unsetDefaultForClient(clientUid);
    }

    const db = adminDb();
    await db.collection(COLLECTION).doc(kitId).set(merged);
    return merged;
  }

  /**
   * Delete a Brand Kit
   */
  static async delete(kitId: string, clientUid: string): Promise<boolean> {
    const existing = await BrandKitStore.getById(kitId, clientUid);
    if (!existing) return false;

    const db = adminDb();
    await db.collection(COLLECTION).doc(kitId).delete();
    return true;
  }

  /**
   * Get the default Brand Kit for a client
   */
  static async getDefault(clientUid: string): Promise<BrandKit | null> {
    const kits = await BrandKitStore.listByClient(clientUid);
    return kits.find((k) => k.isDefault && k.isActive) || kits[0] || null;
  }

  /**
   * Unset default flag on all client kits
   */
  private static async unsetDefaultForClient(clientUid: string): Promise<void> {
    const kits = await BrandKitStore.listByClient(clientUid);
    const db = adminDb();
    for (const kit of kits) {
      if (kit.isDefault) {
        await db.collection(COLLECTION).doc(kit.id).update({ isDefault: false });
      }
    }
  }

  /**
   * Admin: List all Brand Kits (for admin directory)
   */
  static async listAll(limit = 100): Promise<BrandKit[]> {
    const db = adminDb();
    const snap = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as BrandKit);
  }
}
