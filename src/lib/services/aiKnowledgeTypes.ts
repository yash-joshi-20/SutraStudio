/**
 * SUTRA STUDIO - AI Console Contracts (Client Safe)
 *
 * Types and the default system prompt for the knowledge base, feedback inbox,
 * common-question insights and AI settings.
 *
 * Client-safe by design: the admin portal renders all of these shapes, while the
 * data operations live in ./aiKnowledgeService.ts (which imports
 * irebase-admin and therefore must stay on the server).
 */
export interface FeedbackItem {
  id: string;
  chatId: string;
  messageId: string;
  rating: "good" | "bad";
  correctedAnswer?: string;
  adminId: string;
  adminName?: string;
  userQuery?: string;
  aiReply?: string;
  createdAt: string;
}

export type KnowledgeCategory =
  | "faq"
  | "business_rules"
  | "service_details"
  | "tone_guidelines"
  | "qa";

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  question?: string;
  answer: string;
  status: "active" | "archived";
  source: "admin_manual" | "chat_correction";
  createdAt: string;
  updatedAt: string;
}

export interface AiSettingsConfig {
  systemPrompt: string;
  tone: "luxury_atelier" | "technical" | "concise" | "formal";
  defaultPrompt: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface CommonQuestionInsight {
  id: string;
  topic: string;
  querySample: string;
  frequency: number;
  category: KnowledgeCategory;
  avgRating: "good" | "bad" | "unrated";
  status: "answered" | "needs_improvement" | "unanswered";
  suggestedAction: string;
}

export const DEFAULT_SYSTEM_PROMPT = `You are Sutra AI, the intelligent concierge and creative technology consultant for SUTRA STUDIO—an elite bespoke atelier blending timeless Indian aesthetic harmony with state-of-the-art computational workflows (3D spatial rendering, cinematic commercial reels, 360 VR virtual tours, architectural interiors, bespoke web applications, and Meta ads marketing).

Guiding Principles:
1. Tone: Luxurious, refined, articulate, culturally attuned, professional, and hospitable ("Namaste 🙏").
2. Transparency: Never invent prices or services. Always refer strictly to the official studio service catalog and pricing tiers.
3. Order Creation: Always clarify client requirements, present a structured summary with itemized prices, and obtain explicit client confirmation before placing any order.
4. Confidentiality: Strictly guard client confidentiality and proprietary studio infrastructure.
5. Vault Delivery: Inform clients that production deliverables are synchronized securely to their dedicated Google Drive Vault.`;
