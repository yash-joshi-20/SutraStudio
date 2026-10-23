/**
 * SUTRA STUDIO - AI Knowledge Service (Server Only)
 *
 * Knowledge base CRUD, chat feedback inbox and AI system settings.
 *
 * Contracts and DEFAULT_SYSTEM_PROMPT live in ./aiKnowledgeTypes.ts so the
 * admin portal can type its UI without importing irebase-admin.
 */

import "server-only";
import { adminDb } from "@/lib/db";

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
    title: "Commercial & Product Image Creation — Deliverables, Resolution & SLA",
    category: "service_details",
    question: "What is included in Commercial & Product Image Creation and what is the turnaround time?",
    answer: "Commercial & Product Image Creation starts at ₹249 for a 3-pack (or ₹299 single image, Branded Image Pack 3 for ₹499, 5 for ₹799, 10 for ₹1,499) with a 24–48 hour turnaround SLA. Includes 4K Ultra-HD master deliverables (PNG/TIFF), studio lighting passes, lifestyle ambient staging, up to 2 revision rounds, and full commercial copyright license.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_002",
    title: "Promotional Video & Reel Production — Specs, Audio & Turnaround",
    category: "service_details",
    question: "What is included in Promotional Video & Reel Production and what are the audio options?",
    answer: "Promotional Video & Reel Production starts at ₹199 for a 10-second edit and ₹499 for a 15–30s promotional reel (Basic Video Pack 3 for ₹499, Promotional Reel Pack 3 for ₹1,299, 5 for ₹1,999, 10 for ₹3,499) with 24–48 hour delivery. Includes vertical 9:16 and 16:9 formats, color grading, studio voiceover synchronization, licensed sound design, and up to 2 revision rounds.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_003",
    title: "3D Product Modeling & Visualization — Formats, Web Embed & SLA",
    category: "service_details",
    question: "What 3D formats are delivered and what is the turnaround for 3D Product Modeling?",
    answer: "3D Product Modeling & Visualization starts at ₹999 per render view and ₹2,999 for a complete 3D model (₹4,999 for a 10s product animation) with a 48–72 hour delivery timeline. Deliverables include web-ready GLTF/GLB, Apple iOS AR QuickLook USDZ, 4K PBR material maps, turntable render stills, and 2 revision cycles.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_004",
    title: "360° Virtual Tours — Virtual Tour Panoramas & Embed",
    category: "service_details",
    question: "How do 360° Virtual Tours work and what is the delivery timeline?",
    answer: "360° Virtual Tours start at ₹2,999 using supplied panoramas (or starting at ₹7,999 for local on-site capture) with 48–72 hour delivery. Includes interconnected 8K equirectangular HDR panoramic nodes, interactive hotspots, spatial navigation, and embeddable HTML5 WebXR viewer code.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_005",
    title: "Interior 3D Visualization — Architectural Staging & Lighting",
    category: "service_details",
    question: "What is included in Interior 3D Visualization?",
    answer: "Interior 3D Visualization starts at ₹1,499 per view using supplied plans (₹4,999 for single-room starter visualization, ₹1,499 for 3D floor plan) with 48–72 hour delivery. Includes photorealistic 4K render suites (daylight and warm twilight passes), furniture layout staging, material specifications, and 2 revision rounds.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_006",
    title: "Exterior 3D Visualization — Elevations & Facades",
    category: "service_details",
    question: "What is delivered for Exterior 3D Visualization?",
    answer: "Exterior 3D Visualization starts at ₹1,999 per view with 48–72 hour delivery. Delivers architectural elevation profiles, framing and glass material reflection bakes, and 4K exterior perspective renders with 2 revision cycles.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_007",
    title: "Digital Marketing Services — Strategy, Content Calendar & Management",
    category: "service_details",
    question: "What is included in Digital Marketing Services?",
    answer: "Digital Marketing Services include a 30-Day Content Calendar at ₹999, Trend Research at ₹1,499 per month, and complete Social Media Management at ₹9,999 per month with 48–72 hour delivery. Includes strategic content matrices, direct-response copywriting angles, and demographic targeting frameworks.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_008",
    title: "Meta Ads Campaign Management — Creative Variations & Campaign Setup",
    category: "service_details",
    question: "What does Meta Ads Campaign Management include?",
    answer: "Meta Ads Campaign Management is ₹4,999 per month (direct ad spend paid to Meta is excluded) with a 48-hour setup timeline. Includes 5 high-converting creative ad variations (1:1 and 9:16), copy hooks, audience targeting configurations, and pixel event setup.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_009",
    title: "Brand Identity Starter — Visual Identity & Design Guidelines",
    category: "service_details",
    question: "What is included in Brand Identity Starter?",
    answer: "Brand Identity Starter is ₹2,999 with 3–5 business days delivery. Delivers vector logo mark (SVG/AI/PNG), typography hierarchy, luxury color palette, and foundational brand guidelines deck.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_010",
    title: "Website Design & Development — High-Performance Digital Platforms",
    category: "service_details",
    question: "What are the specs and delivery time for Website Design & Development?",
    answer: "Website Design & Development starts at ₹4,999 for a high-converting single landing page and ₹14,999 for a multi-page business website (up to 5 standard pages; starter e-commerce at ₹19,999) with 5–7 days turnaround. Built using Next.js with high performance, mobile responsive design, technical SEO metadata, and production deployment.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_011",
    title: "Web Application & Mobile App Prototypes — Full-Stack Architecture",
    category: "service_details",
    question: "What is included in Web Application and Mobile App Prototypes?",
    answer: "Mobile App UI Prototype is ₹9,999 (design/prototype only) and Web Application & Client Portal MVP is ₹19,999 with 7–14 days delivery. Scaffolds full-stack application MVP architecture with unified authentication, client dashboard, and payment workflow.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: "kb_srv_012",
    title: "Monthly Content Packages — 30-Day Managed Production",
    category: "service_details",
    question: "What monthly content packages are available and what is included?",
    answer: "Sutra Studio offers 3 dedicated 30-day content packages capped at or under ₹20,000:\n• **Starter Trend (₹9,999/mo)**: 15 branded images + 15 short videos across 30 days, content calendar, captions/hashtags, and 1 revision round.\n• **Growth Trend (₹14,999/mo)**: 20 branded images + 20 short videos across 30 days, daily trend research, content calendar, captions/hashtags, and 1 revision round.\n• **Daily Trend Creator (₹19,999/mo - Flagship)**: 30 branded images + 30 short videos (1 delivered daily), daily trend research, brand relevance review, custom creative direction, captions/hashtags, and organized Google Drive vault delivery.",
    status: "active",
    source: "admin_manual",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-12T10:00:00.000Z",
  },

  // 2. PRICING RULES & CURRENCY
  {
    id: "kb_price_001",
    title: "Pricing Rules, Currency & Billing Cycles",
    category: "business_rules",
    question: "What currency does Sutra Studio use and what discounts apply to quarterly or annual plans?",
    answer: "All services and subscriptions are priced strictly in Indian Rupees (₹ INR). Subscriptions offer a 5% discount on quarterly billing (e.g. ₹37,047 for Growth) and a 15% discount on annual billing (e.g. ₹1,32,589 for Growth). Single commissions require upfront payment via Pay by UPI QR.",
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