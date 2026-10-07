/**
 * SUTRA STUDIO - AI Knowledge Service (Server Only)
 *
 * Knowledge base CRUD, chat feedback inbox and AI system settings.
 *
 * Contracts and DEFAULT_SYSTEM_PROMPT live in ./aiKnowledgeTypes.ts so the
 * admin portal can type its UI without importing irebase-admin.
 */

import "server-only";
import { adminDb } from "@/lib/firebase/admin";

import {
  DEFAULT_SYSTEM_PROMPT,
  type AiSettingsConfig,
  type CommonQuestionInsight,
  type FeedbackItem,
  type KnowledgeBaseEntry,
  type KnowledgeCategory,
} from "@/lib/services/aiKnowledgeTypes";

export * from "@/lib/services/aiKnowledgeTypes";

const MEMORY_FEEDBACK: FeedbackItem[] = [
  {
    id: "fb_001",
    chatId: "cl-1",
    messageId: "msg_ai_101",
    rating: "good",
    userQuery: "Can we do 4K multi-angle lighting passes for our new catalog?",
    aiReply: "Yes, multi-angle dusk and midday lighting bakes are included in your 3D spatial deliverable package.",
    adminId: "usr_admin_001",
    adminName: "Raghavan Sharma (Lead Producer)",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "fb_002",
    chatId: "cl-3",
    messageId: "msg_ai_302",
    rating: "bad",
    correctedAnswer: "For interior lighting, we provide 3 HDR environment presets (Golden Hour, High Noon, Twilight) rendered in 4K with ACEScg color pipeline.",
    userQuery: "What color space and lighting setups are included in interior rendering?",
    aiReply: "We provide basic standard light passes.",
    adminId: "usr_admin_001",
    adminName: "Raghavan Sharma (Lead Producer)",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

let MEMORY_KNOWLEDGE: KnowledgeBaseEntry[] = [
  // 1. SERVICES & PER-SERVICE FAQS
  {
    id: "kb_srv_001",
    title: "Image Creation — Deliverables, Resolution & SLA",
    category: "service_details",
    question: "What is included in Image Creation and what is the turnaround time?",
    answer: "Image Creation starts at ₹3,499 with a 24–48 hour turnaround SLA. Includes 3–5 multi-angle 4K Ultra-HD renders (PNG/TIFF), studio lighting passes (Midday & Warm Sunset), 2 revision rounds, and commercial copyright license.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_002",
    title: "Video Creation — Specs, Audio & Turnaround",
    category: "service_details",
    question: "What is included in Video Creation and what are the audio options?",
    answer: "Video Creation starts at ₹7,999 with a 48–72 hour turnaround. Includes 10–30s commercial video ads or 9:16 Instagram Reels in 4K ProRes 422 HQ / MP4, DaVinci Resolve color grading, custom voiceover sync, licensed sound design, and 2 revision rounds.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_003",
    title: "3D Modeling — Formats, Web Embed & SLA",
    category: "service_details",
    question: "What 3D formats are delivered and what is the turnaround for 3D Modeling?",
    answer: "3D Modeling starts at ₹9,499 with a 48–72 hour delivery timeline. Deliverables include web-ready GLTF/GLB, Apple iOS AR QuickLook USDZ, Blender .blend source, 4K PBR material maps, 360 turntable render stills, and 2 revision cycles.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_004",
    title: "360 View — Virtual Tour Panoramas & Embed",
    category: "service_details",
    question: "How do 360 Virtual Tours work and what is the delivery timeline?",
    answer: "360 View starts at ₹11,999 with 2–4 business days delivery. Includes 4–8 interconnected 8K equirectangular HDR panoramic nodes, interactive hotspots, floorplan radar navigation, and one-click WebXR / iframe embed code.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_005",
    title: "Interior Design — Architectural Visualization & Lighting",
    category: "service_details",
    question: "What is included in Interior Design visualization?",
    answer: "Interior Design starts at ₹12,499 with 48–72 hour delivery. Includes photorealistic 4K render suites (daylight and warm twilight passes), furniture layout plans, material swatches (teak, brass, marble), and 2 revision rounds.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_006",
    title: "Window & Facade Design — Elevations & CAD",
    category: "service_details",
    question: "What is delivered for Window and Facade Design?",
    answer: "Window Design starts at ₹6,499 with 24–48 hour delivery. Delivers CAD DWG elevation profiles, glass material reflection bakes, and 4K exterior perspective renders with 2 revision cycles.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_007",
    title: "Digital Marketing — Strategy, Copywriting & Content Matrix",
    category: "service_details",
    question: "What is included in Digital Marketing Strategy?",
    answer: "Digital Marketing starts at ₹14,999 with 3–5 business days delivery. Includes a monthly 30-day multi-platform content matrix, high-converting copywriting deck, competitor trend analysis, and social posting blueprints.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_008",
    title: "Meta Ads Launcher — Creative Packs & Campaign Setup",
    category: "service_details",
    question: "What does the Meta Ads Launcher include?",
    answer: "Meta Ads Launcher starts at ₹13,499 with a 48-hour setup timeline. Includes 3 high-converting creative ad variations (1:1 and 9:16), copy hooks, audience targeting configurations, and pixel event setup.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_009",
    title: "Architectural Elevation — Exterior 3D Modeling",
    category: "service_details",
    question: "What is included in Architectural Elevation?",
    answer: "Architectural Elevation starts at ₹14,499 with 4 business days delivery. Delivers high-precision exterior 3D geometry, daytime and dusk lighting studies, material texture maps, and 4K exterior renderings.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_010",
    title: "Website Development — Next.js Full-Stack App",
    category: "service_details",
    question: "What are the specs and delivery time for Website Development?",
    answer: "Website Development starts at ₹16,999 with 7–10 days turnaround. Built using Next.js, React, and Tailwind with Lighthouse 98+ scores, mobile responsive layouts, SEO metadata, and Firebase authentication integration.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_011",
    title: "Mobile App Setup — React Native Expo iOS & Android",
    category: "service_details",
    question: "What is included in Mobile App Setup?",
    answer: "Mobile App Setup starts at ₹18,499 with 10–14 days delivery. Scaffolds cross-platform React Native / Expo apps for iOS and Android with unified Firebase Auth, push notifications, and store-ready build configurations.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "kb_srv_012",
    title: "AI Automation — Webhooks, n8n & Google Drive Routers",
    category: "service_details",
    question: "What is delivered in AI Automation pipelines?",
    answer: "AI Automation starts at ₹15,999 with 3 business days delivery. Delivers production-grade Cloud Functions, automated Google Drive routing scripts, HMAC webhook security, and error-tolerant data synchronization.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },

  // 2. PRICING RULES & CURRENCY
  {
    id: "kb_price_001",
    title: "Pricing Rules, Currency & Billing Cycles",
    category: "business_rules",
    question: "What currency does Sutra Studio use and what discounts apply to quarterly or annual plans?",
    answer: "All services and subscriptions are priced strictly in Indian Rupees (₹ INR). Subscriptions offer a 5% discount on quarterly billing (e.g. ₹37,047 for Growth) and a 15% discount on annual billing (e.g. ₹1,32,589 for Growth). Single commissions require upfront payment via Razorpay.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-16T11:00:00.000Z",
    updatedAt: "2026-09-16T11:00:00.000Z",
  },

  // 3. TRIAL AND RENEWAL POLICY
  {
    id: "kb_trial_001",
    title: "3-Day Free Trial & Cancellation Policy",
    category: "business_rules",
    question: "How does the 3-day free trial work and how do I cancel?",
    answer: "Starter Creative and Studio Growth retainer plans include a 3-Day Free Trial. Clients can test studio workflows with zero upfront charge. You can cancel anytime within 3 days directly in My Orders or by asking the AI ('Cancel my trial'). If not cancelled, normal retainer billing begins on day 4.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-16T12:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
  },
  {
    id: "kb_renew_001",
    title: "Monthly Retainer Renewal & Expiry Policy",
    category: "business_rules",
    question: "When does my monthly retainer renew and what happens if it expires?",
    answer: "Retainers renew every 30 days. You will receive reminder notifications in your portal and email 5 days and 1 day before expiry. If not renewed by the period end date, the plan transitions to 'expired / closed'. You can renew anytime with one click in My Orders or via AI Chat ('Renew plan') to resume production.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-16T13:00:00.000Z",
    updatedAt: "2026-09-16T13:00:00.000Z",
  },

  // 4. DELIVERY TIMELINES & VAULT ARCHITECTURE
  {
    id: "kb_vault_001",
    title: "Google Drive Media Vault & Delivery Timelines",
    category: "business_rules",
    question: "Where are files delivered and what are the standard turnaround times?",
    answer: "Every order automatically provisions a client Google Drive folder with dedicated subfolders (Raw_Assets, Production_Drafts, Final_Delivery). Delivery times range from 24–48 hours for Images, 48–72 hours for Videos and 3D models, to 7–14 days for full Web/App builds.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-16T14:00:00.000Z",
    updatedAt: "2026-09-16T14:00:00.000Z",
  },
  {
    id: "kb_rev_001",
    title: "Revision Policy & Art Director Review",
    category: "faq",
    question: "How many revisions are included and how do I request one?",
    answer: "Standard orders include 2 full revision rounds. Revisions can be submitted directly in My Orders or via AI Chat ('Request revision for order #ORD-...'). Additional revision passes beyond the quota can be added for ₹2,499 per round.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-09-20T10:00:00.000Z",
    updatedAt: "2026-09-20T10:00:00.000Z",
  },
];

let MEMORY_AI_SETTINGS: AiSettingsConfig = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  tone: "luxury_atelier",
  defaultPrompt: DEFAULT_SYSTEM_PROMPT,
  lastUpdated: new Date().toISOString(),
  updatedBy: "Raghavan Sharma (Lead Producer)",
};

const MEMORY_COMMON_QUESTIONS: CommonQuestionInsight[] = [
  {
    id: "cq_1",
    topic: "3D Render Turnaround Times & 4K Formats",
    querySample: "How fast can you deliver a 4K architectural exterior render?",
    frequency: 34,
    category: "service_details",
    avgRating: "good",
    status: "answered",
    suggestedAction: "Answered by Knowledge Base entry #kb_001",
  },
  {
    id: "cq_2",
    topic: "Sutra Cloud Vault Synchronization",
    querySample: "Where do I download my uncompressed render files?",
    frequency: 28,
    category: "business_rules",
    avgRating: "good",
    status: "answered",
    suggestedAction: "Answered by Knowledge Base entry #kb_002",
  },
  {
    id: "cq_3",
    topic: "Interior Lighting Presets & HDR passes",
    querySample: "What color space and lighting setups are included in interior rendering?",
    frequency: 19,
    category: "service_details",
    avgRating: "bad",
    status: "needs_improvement",
    suggestedAction: "Recent correction added by Raghavan Sharma. Ready to convert to KB rule.",
  },
  {
    id: "cq_4",
    topic: "Custom Enterprise Retainer Add-ons",
    querySample: "Can we bundle daily social reels with our monthly web maintenance plan?",
    frequency: 14,
    category: "faq",
    avgRating: "unrated",
    status: "unanswered",
    suggestedAction: "Create new Q&A rule for Atelier Enterprise custom add-on bundles.",
  },
];

export class AiKnowledgeService {
  // --------------------------------------------------------------------------
  // 1. FEEDBACK MANAGEMENT (Good / Bad Ratings & Corrections)
  // --------------------------------------------------------------------------
  static async saveFeedback(item: {
    chatId: string;
    messageId: string;
    rating: "good" | "bad";
    correctedAnswer?: string;
    adminId: string;
    adminName?: string;
    userQuery?: string;
    aiReply?: string;
  }): Promise<FeedbackItem> {
    const newEntry: FeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chatId: item.chatId,
      messageId: item.messageId,
      rating: item.rating,
      correctedAnswer: item.correctedAnswer?.trim() || undefined,
      adminId: item.adminId,
      adminName: item.adminName || "Studio Administrator",
      userQuery: item.userQuery,
      aiReply: item.aiReply,
      createdAt: new Date().toISOString(),
    };

    // Store in memory
    MEMORY_FEEDBACK.unshift(newEntry);

    // Save to Firestore adminDb
    try {
      await adminDb().collection("feedback").add({
        ...newEntry,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Memory store active
    }

    // If a high-value correction was provided, automatically generate or update knowledge
    if (newEntry.rating === "bad" && newEntry.correctedAnswer && newEntry.userQuery) {
      this.addKnowledgeEntry({
        title: `Correction: ${newEntry.userQuery.slice(0, 45)}...`,
        category: "qa",
        question: newEntry.userQuery,
        answer: newEntry.correctedAnswer,
        status: "active",
        source: "chat_correction",
      }).catch(() => {});
    }

    return newEntry;
  }

  static async getFeedbackList(): Promise<FeedbackItem[]> {
    return [...MEMORY_FEEDBACK];
  }

  // --------------------------------------------------------------------------
  // 2. KNOWLEDGE BASE MANAGEMENT (Editable Q&A / Business Rules / FAQ)
  // --------------------------------------------------------------------------
  static async getKnowledgeEntries(): Promise<KnowledgeBaseEntry[]> {
    return [...MEMORY_KNOWLEDGE];
  }

  static async getActiveKnowledgeEntries(): Promise<KnowledgeBaseEntry[]> {
    return MEMORY_KNOWLEDGE.filter((e) => e.status === "active");
  }

  static async addKnowledgeEntry(entry: {
    title: string;
    category: KnowledgeCategory;
    question?: string;
    answer: string;
    status?: "active" | "archived";
    source?: "admin_manual" | "chat_correction";
  }): Promise<KnowledgeBaseEntry> {
    const newEntry: KnowledgeBaseEntry = {
      id: `kb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: entry.title.trim(),
      category: entry.category,
      question: entry.question?.trim() || undefined,
      answer: entry.answer.trim(),
      status: entry.status || "active",
      source: entry.source || "admin_manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MEMORY_KNOWLEDGE.unshift(newEntry);

    try {
      await adminDb().collection("knowledgeBase").doc(newEntry.id).set({
        ...newEntry,
        serverCreated: new Date().toISOString(),
      });
    } catch {
      // Memory fallback active
    }

    return newEntry;
  }

  static async updateKnowledgeEntry(
    id: string,
    updates: Partial<KnowledgeBaseEntry>
  ): Promise<KnowledgeBaseEntry | null> {
    const idx = MEMORY_KNOWLEDGE.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    MEMORY_KNOWLEDGE[idx] = {
      ...MEMORY_KNOWLEDGE[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await adminDb().collection("knowledgeBase").doc(id).update({
        ...updates,
        serverUpdated: new Date().toISOString(),
      });
    } catch {
      // Memory fallback active
    }

    return MEMORY_KNOWLEDGE[idx];
  }

  static async deleteKnowledgeEntry(id: string): Promise<boolean> {
    const initialLen = MEMORY_KNOWLEDGE.length;
    MEMORY_KNOWLEDGE = MEMORY_KNOWLEDGE.filter((e) => e.id !== id);

    try {
      await adminDb().collection("knowledgeBase").doc(id).set({ deleted: true });
    } catch {
      // Memory fallback active
    }

    return MEMORY_KNOWLEDGE.length < initialLen;
  }

  // --------------------------------------------------------------------------
  // 3. RETRIEVAL FOR AI PROMPT / CONTEXT ENRICHMENT
  // --------------------------------------------------------------------------
  static async findRelevantKnowledge(
    userMessage: string
  ): Promise<{ matched: KnowledgeBaseEntry[]; relevance: number } | null> {
    const activeEntries = await this.getActiveKnowledgeEntries();
    const query = userMessage.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter((t) => t.length > 3);

    const scored = activeEntries.map((entry) => {
      let score = 0;
      const textToSearch = `${entry.title} ${entry.question || ""} ${entry.answer}`.toLowerCase();

      // Check for exact phrase
      if (textToSearch.includes(query)) {
        score += 10;
      }

      // Check token match
      tokens.forEach((t) => {
        if (textToSearch.includes(t)) {
          score += 2;
        }
      });

      return { entry, score };
    });

    const relevant = scored
      .filter((s) => s.score > 2)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.entry);

    if (relevant.length === 0) return null;

    return {
      matched: relevant.slice(0, 3),
      relevance: Math.min(1, relevant.length * 0.35),
    };
  }

  // --------------------------------------------------------------------------
  // 4. COMMON QUESTIONS & INSIGHTS ANALYTICS
  // --------------------------------------------------------------------------
  static async getCommonQuestions(): Promise<CommonQuestionInsight[]> {
    return [...MEMORY_COMMON_QUESTIONS];
  }

  // --------------------------------------------------------------------------
  // 5. SYSTEM PROMPT & TONE CONFIGURATION
  // --------------------------------------------------------------------------
  static async getAiSettings(): Promise<AiSettingsConfig> {
    return { ...MEMORY_AI_SETTINGS };
  }

  static async updateAiSettings(
    settings: Partial<AiSettingsConfig>,
    adminName: string
  ): Promise<AiSettingsConfig> {
    MEMORY_AI_SETTINGS = {
      ...MEMORY_AI_SETTINGS,
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: adminName,
    };

    try {
      await adminDb().collection("ai_settings").doc("global_config").set({
        ...MEMORY_AI_SETTINGS,
        serverUpdated: new Date().toISOString(),
      });
    } catch {
      // In-memory fallback
    }

    return { ...MEMORY_AI_SETTINGS };
  }

  static async resetAiSettingsToDefault(
    adminName: string
  ): Promise<AiSettingsConfig> {
    MEMORY_AI_SETTINGS = {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      tone: "luxury_atelier",
      defaultPrompt: DEFAULT_SYSTEM_PROMPT,
      lastUpdated: new Date().toISOString(),
      updatedBy: adminName,
    };

    try {
      await adminDb().collection("ai_settings").doc("global_config").set({
        ...MEMORY_AI_SETTINGS,
        serverUpdated: new Date().toISOString(),
      });
    } catch {
      // In-memory fallback
    }

    return { ...MEMORY_AI_SETTINGS };
  }
}