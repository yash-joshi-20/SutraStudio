/**
 * SUTRA STUDIO / SYNAPSE KINETIC — Master RAG LLM Engine
 * Grounded in verified knowledge from SUTRA_STUDIO_UI_MASTER_PROMPT_PACK
 */

import { KnowledgeRecord } from "@/lib/types/knowledge";

export interface RagResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    category: string;
    source: string;
  }>;
  matchedCategory: string;
  system_prompt: string;
  isFallback: boolean;
  confidenceScore: number;
  timestamp: string;
}

export const MASTER_SYSTEM_PROMPT = `You are the Studio Assistant for Sutra Studio, an enterprise marketing, creative atelier, and digital engineering company.
You speak with calm luxury, executive precision, and warmth.

Neutral Identity Directives:
1. Persona: Studio Assistant.
2. Honesty: If asked whether you are a human or an AI/virtual assistant, state honestly that you are Sutra Studio's virtual assistant dedicated to helping clients review capabilities, scope deliverables, understand investment tiers, and initiate orders. Never pretend to be a human staff member or invent team member names.
3. Terminology: Address studio work as production-grade solutions crafted by our creative and engineering atelier. Do not disclose internal tool names (Flux, Kling, Runway, ElevenLabs, Gemini, ChatGPT, Claude, n8n).

Official Canonical Investment Rates (All rates in INR):
Image Creation:
• Basic Template Image: ₹299 each
• Branded Social Media Image: ₹199 each
• Product Creative Design: ₹299 each
• Basic Image Pack: 3 for ₹249
• Branded Image Pack: 3 for ₹499 | 5 for ₹799 | 10 for ₹1,499
• Banner & Cover Design: ₹299
• Carousel Design (5 slides): ₹499
• Caption & Hashtag Set: ₹299 per post
• Product Image Cleanup: ₹199 each

Video Production:
• Basic Video Edit (up to 10s): ₹199
• Promotional Reel (15–30s): ₹499
• Product Reel Production (15–30s): ₹799
• Basic Video Edit Pack (3 videos): ₹499
• Promotional Reel Pack: 3 for ₹1,299 | 5 for ₹1,999 | 10 for ₹3,499

3D & Spatial Visualization:
• 3D Render from Existing Model: ₹999 per view
• Simple 3D Product Model: Starting at ₹2,999
• Simple 3D Product Animation (up to 10s): ₹4,999
• Digital 360° Tour (supplied panoramas): Starting at ₹2,999
• Local 360° Capture and Tour: Starting at ₹7,999
• Interior 3D Visualization: ₹1,499 per view
• Single-Room Visualization Starter: ₹4,999
• 3D Floor Plan: ₹1,499
• Facade / Elevation Render: ₹1,999 per view

Marketing & Digital Services:
• 30-Day Content Calendar: ₹999
• Trend Research Only: ₹1,499 / month
• Brand Identity Starter: ₹2,999
• Social Media Management: ₹9,999 / month
• Meta Ads Management: ₹4,999 / month (ad spend excluded)
• SEO Starter: ₹4,999 / month

Web & Application Development:
• Landing Page Starter: ₹4,999 (one page, limited scope)
• Business Website: ₹14,999 (up to 5 pages)
• Starter E-commerce: ₹19,999 (limited catalog, scoped checkout)
• Mobile App UI Prototype: ₹9,999 (design/prototype only)
• Web App Prototype: ₹19,999 (limited MVP scope)
• Larger websites, production mobile apps, complex 3D, and custom integrations: Request a Quote

Monthly Retainers (30-Day Continuous Creative Production):
• Starter Trend: ₹9,999 / 30 days (15 branded images + 15 short videos, calendar, hashtags, 1 revision round)
• Growth Trend: ₹14,999 / 30 days (20 branded images + 20 short videos, daily trend research, creative direction, calendar, 1 revision round)
• Daily Trend Creator: ₹19,999 / 30 days (Flagship: 30 branded images + 30 short videos, daily trend research, brand review, organized delivery, 1 revision round per deliverable)

Payment: Google Pay (GPay) direct merchant settlement / UPI QR upon scope review.
Format answers in elegant, concise, professional markdown.`;

export const MASTER_RAG_KNOWLEDGE_STORE: KnowledgeRecord[] = [
  // 1. ALL 12 STUDIO CAPABILITIES & PRICING
  {
    id: "kb_12_studio_services",
    client_id: "client_sutra",
    category: "Services",
    title: "12 Specialized Studio Capabilities & Pricing Matrix",
    content: `Here are our official Studio Capabilities and verified investment rates:

1. 🎨 **Commercial & Product Image Creation** — Single from ₹299 | 3 for ₹249 | Branded 3 for ₹499 | 5 for ₹799 | 10 for ₹1,499
   • 4K Photorealistic brand imagery, studio product shots, ambient staging. 24–48h SLA.
2. 🎬 **Promotional Video & Reel Production** — Basic 10s Edit from ₹199 | Promo Reel from ₹499 | Product Reel from ₹799 | 3 Edits for ₹499 | 3 Reels for ₹1,299 | 5 for ₹1,999 | 10 for ₹3,499
   • 15–30s Commercial Reels with high-fidelity voiceover, sound design, and motion typography. 24–48h SLA.
3. 📦 **3D Product Modeling & Visualization** — 3D Render from Model at ₹999 | Simple 3D Model starting at ₹2,999 | 3D Animation (10s) at ₹4,999
   • Precision 3D CAD modeling, glTF / USDZ web-ready assets, 4K PBR textures. 48h SLA.
4. 🧭 **360° Virtual Tours** — Digital-Only (Supplied Panoramas) starting at ₹2,999 | Local Capture + Tour starting at ₹7,999
   • Immersive 360 virtual spaces, interactive hot-spots, embeddable HTML5 viewer. 48–72h SLA.
5. 🏛️ **Interior 3D Visualization** — ₹1,499 per view | Single-Room Starter at ₹4,999 | 3D Floor Plan at ₹1,499
   • Photorealistic interior architecture, spatial staging, daylight simulations. 48–72h SLA.
6. 🏢 **Exterior 3D Visualization** — Facade / Elevation Render at ₹1,999 per view
   • Exterior perspective visualizations, elevation profiles, architectural glazing simulations. 48–72h SLA.
7. 📈 **Digital Marketing & Strategy** — 30-Day Content Calendar at ₹999 | Trend Research at ₹1,499 / month | Social Media Management at ₹9,999 / month
   • Strategic content matrices, copywriting angles, audience blueprints. 48–72h SLA.
8. 🎯 **Meta Ads Campaign Management** — ₹4,999 / month (Ad spend excluded)
   • Multi-ratio creative sets (9:16, 1:1), hook copy, and campaign blueprint setup. 48h SLA.
9. 🌐 **Website Design & Development** — Landing Page Starter at ₹4,999 | Business Website (up to 5 pages) at ₹14,999 | Starter E-Commerce at ₹19,999
   • High-performance Next.js websites, mobile-first responsive architecture, on-page SEO. 3–7 Days SLA.
10. 💻 **Web Application & Client Portal MVP** — Starting at ₹19,999 (Prototype / MVP Scope)
    • Full-stack client portals, Firebase authentication, real-time database, checkout workflows. 10–14 Days SLA.
11. 📱 **Mobile App UI Prototype** — Starting at ₹9,999 (Design / Prototype Only)
    • Interactive cross-platform mobile UI prototypes, component tokens, Expo setups. 5–10 Days SLA.
12. ⚡ **Enterprise & Complex Custom Work** — Request a Quote
    • Custom multi-system integrations, larger production web/mobile platforms, complex organic 3D modeling.`,
    source: "Sutra Studio Canonical Architecture Specification",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. SUBSCRIPTION RETAINER PLANS
  {
    id: "kb_subscription_plans",
    client_id: "client_sutra",
    category: "Pricing",
    title: "Monthly Studio Retainers & Commission Tiers",
    content: `We offer 3 transparent 30-day continuous creative packages:

1. 🚀 **Starter Trend** — **₹9,999 / 30 days**
   • 15 Branded Social & Product Images across 30 days
   • 15 Commercial Short Videos / Reels (up to 15s)
   • Trend topic research & brand relevance review
   • Custom tailored creative direction, captions, and hashtag bundles
   • 1 consolidated revision round per deliverable
   • Organized private Google Drive Vault staging

2. 📈 **Growth Trend** — **₹14,999 / 30 days**
   • 20 Branded Social & Product Images across 30 days
   • 20 Commercial Short Videos / Reels (15–30s)
   • Daily trending-topic research & brand alignment
   • 30-Day strategic editorial content calendar
   • Tailored creative direction, captions, and hashtag bundles
   • 1 consolidated revision round per deliverable
   • Organized private Google Drive Vault staging

3. ⚡ **Daily Trend Creator (Flagship Package)** — **₹19,999 / 30 days** [Daily Active Creative Queue]
   • Daily 1x 4K Brand Image / Graphic (30 Assets/month)
   • Daily 1x Commercial Motion Short / Reel (30 Assets/month)
   • Daily trending-topic research tailored to your brand
   • Brand relevance review & creative direction planning
   • Complete captions, hooks, and targeted hashtag sets
   • 30-Day coordinated content calendar
   • Rigorous studio QA & 1 consolidated revision round per deliverable
   • Organized private Google Drive Vault delivery`,
    source: "Sutra Studio Commercial Pricing",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 3. ZERO-COMMISSION GPAY & DYNAMIC UPI ENGINE
  {
    id: "kb_payment_gpay_upi",
    client_id: "client_sutra",
    category: "Pricing",
    title: "GPay & Dynamic UPI Zero-Commission Payment System",
    content: `Our studio supports 100% direct bank settlement with zero gateway commissions:

• **Merchant VPA**: \`yashjoshi7355-1@okicici\` (Yash Joshi)
• **Instant Mobile Deep-Linking**: 1-Click payment via Google Pay, PhonePe, Paytm, or BHIM.
• **Dynamic QR Codes**: Generated on-demand with exact order amount and order code.
• **Zero Gateway Fees**: 100% direct merchant settlement via Pay by UPI QR.`,
    source: "GPAY_AND_UPI_PAYMENT_ENGINE_SPEC.md",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 4. ABOUT SUTRA STUDIO
  {
    id: "kb_about_sutra_studio",
    client_id: "client_sutra",
    category: "About",
    title: "About Sutra Studio — Creative Technology & Digital Craftsmanship",
    content: `**Sutra Studio** is a premier Indian-inspired creative technology atelier blending ancient aesthetic harmony with cutting-edge digital engineering.

• **Core Focus**: Bespoke 3D Spatial Visualization, Cinematic 4K Video Commercials, High-Performance Next.js Digital Flagships, and Digital Systems & Workflows.
• **Design Philosophy**: Sacred geometric proportions, minimalist warm-ivory aesthetics, and zero-compromise precision.
• **Our Clients**: Luxury brands, architectural firms, D2C leaders, and high-growth technology enterprises worldwide.`,
    source: "SUTRA_STUDIO_UI_MASTER_PROMPT_PACK / Brand Architecture",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 5. OFFICE & CONTACT
  {
    id: "kb_office_contact",
    client_id: "client_sutra",
    category: "Contact",
    title: "Office Location, Direct Studio Contact & Handoff",
    content: `• **Studio Headquarters**: Tech Heritage Park, Sector 62, Noida, NCR, India.
• **Business Hours**: Monday to Saturday, 9:30 AM – 7:30 PM IST.
• **Direct Inquiries**: Connect with our Senior Producer via the "Talk to Human" option in this chat or through our Contact portal.
• **Turnaround Commitment**: All client briefs receive an initial creative response within 24 hours.`,
    source: "SUTRA_STUDIO_UI_MASTER_PROMPT_PACK / Studio Contact",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 6. STUDIO PRODUCTION WORKFLOWS
  {
    id: "kb_studio_workflows",
    client_id: "client_sutra",
    category: "Custom Knowledge",
    title: "Studio Production Process & Dedicated Service Workflows",
    content: `Our studio operates 6 streamlined production workflows:

1. **01. Master Project Management & Client Brief Ingestion**:
   • Reviews requirements, structures project milestones, and activates specialized studio teams.
2. **02. Creative Discovery & Brand Alignment**:
   • Collects brand visual guidelines, logo files, and color palettes with direct creative director consultation.
3. **03. Trend Research & Campaign Planning**:
   • Evaluates high-performing industry benchmarks, content hooks, and high-converting creative angles.
4. **04. Multi-Format Brand Visual Production**:
   • Produces 4K branded imagery across 1:1, 9:16, and 16:9 aspect ratios with custom brand layouts.
5. **05. Cinematic Video Commercials & Motion Production**:
   • Produces 15–30s commercial video reels with high-fidelity studio voiceover and motion typography.
6. **06. Digital Campaign Strategy & Ad Setup**:
   • Prepares audience targeting blueprints, campaign structures, and performance tracking.`,
    source: "Studio Workflow Standards",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7. SUTRA CLOUD VAULT & STUDIO POLICIES
  {
    id: "kb_drive_vault_policies",
    client_id: "client_sutra",
    category: "Policies",
    title: "Sutra Cloud Vault Architecture & Studio Guarantees",
    content: `• **Sutra Cloud Vault**: Every client is allocated an isolated Sutra Cloud Vault directory (\`drive_fld_sutra_001\`) where RAW 3D assets, 4K ProRes masters, vector packages, and contracts are automatically archived.
• **Security & Privacy**: Strict tenant isolation with end-to-end cloud encryption. Zero cross-client data leakage.
• **SLA Guarantee**: 24 to 48 hours delivery turnaround on draft review passes.
• **Revisions**: Up to 2 comprehensive revision rounds included on all standard deliverables.
• **Headquarters**: Tech Heritage Park, Sector 62, Noida, UP, India.`,
    source: "Studio Infrastructure & SLA Policy",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export class RagLlmEngine {
  /**
   * Retrieves matching knowledge chunks from the store using semantic scoring.
   */
  public static retrieveChunks(query: string, records: KnowledgeRecord[]): { record: KnowledgeRecord; score: number }[] {
    const q = query.trim().toLowerCase();
    const queryTokens = q.split(/[\s,?.!]+/).filter((t) => t.length >= 2);

    return records
      .map((record) => {
        let score = 0;
        const titleLower = record.title.toLowerCase();
        const contentLower = record.content.toLowerCase();
        const categoryLower = record.category.toLowerCase();

        // Direct category or title hits
        if (q.includes(categoryLower)) score += 15;
        if (q.includes(titleLower) || titleLower.includes(q)) score += 20;

        // Multilingual Domain keywords (English, Gujarati, Hindi, Hinglish)
        const pricingKeywords = [
          "price", "pricing", "cost", "how much", "rate", "plan", "retainer", "subscription", "fee", "starting", "quote",
          "ભાવ", "કિંમત", "ખર્ચ", "રૂપિયા", "પ્લાન", "રેટ",
          "दाम", "कीमत", "खर्च", "रुपये", "प्लान", "रेट", "kitna", "bhav", "kimat"
        ];
        const serviceKeywords = [
          "service", "services", "capability", "capabilities", "3d", "video", "image", "photo", "interior", "window", "website", "app", "marketing", "ads", "render",
          "સર્વિસ", "સેવા", "કામ", "ઇમેજ", "વિડિયો", "મોડેલિંગ", "વેબસાઇટ", "એપ",
          "सेवाएं", "सर्विस", "काम", "वीडियो", "इमेज", "वेबसाइट", "sarvis", "seva", "kaam"
        ];
        const paymentKeywords = [
          "payment", "gpay", "upi", "qr", "utr", "razorpay", "bank", "transfer", "pay", "google pay", "phonepe", "paytm",
          "પેમેન્ટ", "ચુકવણી", "ગુગલ પે", "ફોન પે", "પેટીએમ",
          "पेमेंट", "भुगतान", "गूगल पे", "फोन पे"
        ];
        const automationKeywords = [
          "n8n", "automation", "workflow", "orchestrator", "trend", "banner", "reels", "webhook", "pipeline",
          "ઓટોમેશન", "પાઈપલાઈન", "વેબહુક", "ઓટોમેટેડ",
          "ऑटोमेशन", "पाइपलाइन", "वेबहुक"
        ];
        const policyKeywords = [
          "drive", "vault", "sla", "policy", "guarantee", "refund", "security", "turnaround",
          "ડ્રાઈવ", "વોલ્ટ", "સુરક્ષા", "ગેરંટી",
          "ड्राइव", "वॉल्ट", "सुरक्षा", "गारंटी"
        ];
        const aboutKeywords = [
          "about", "company", "studio", "background", "expertise", "who are you", "sutra", "synapse",
          "વિશે", "કંપની", "સ્ટુડિયો",
          "के बारे में", "कंपनी", "स्टूडियो"
        ];
        const contactKeywords = [
          "contact", "office", "location", "address", "phone", "email", "reach", "where are you",
          "સંપર્ક", "ઓફિસ", "સરનામું",
          "संपर्क", "पता", "ऑफिस", "फोन"
        ];

        if (pricingKeywords.some((w) => q.includes(w)) && record.category === "Pricing") score += 25;
        if (serviceKeywords.some((w) => q.includes(w)) && record.category === "Services") score += 25;
        if (paymentKeywords.some((w) => q.includes(w)) && (record.title.includes("Payment") || record.title.includes("UPI") || record.category === "Pricing")) score += 30;
        if (automationKeywords.some((w) => q.includes(w)) && (record.title.includes("n8n") || record.category === "Custom Knowledge")) score += 25;
        if (policyKeywords.some((w) => q.includes(w)) && record.category === "Policies") score += 20;
        if (aboutKeywords.some((w) => q.includes(w)) && record.category === "About") score += 25;
        if (contactKeywords.some((w) => q.includes(w)) && record.category === "Contact") score += 25;

        // Individual tokens
        queryTokens.forEach((token) => {
          if (titleLower.includes(token)) score += 6;
          if (contentLower.includes(token)) score += 3;
        });

        return { record, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Generates a grounded RAG answer from user query.
   */
  public static async answerQuery(query: string, customRecords?: KnowledgeRecord[]): Promise<RagResponse> {
    const q = query.trim().toLowerCase();

    // Natural greeting detector
    const greetingWords = [
      "hi", "hello", "hey", "namaste", "kem cho", "halo",
      "good morning", "good evening", "good afternoon",
      "kemcho", "hii", "helo", "hi there", "hey there", "namaskar", "pranam"
    ];
    const isExactGreeting =
      greetingWords.includes(q) ||
      greetingWords.some((g) => q === `${g}!` || q === `${g}.` || q === `${g} sutra` || q.startsWith(`${g} `));

    if (isExactGreeting) {
      const isGujarati = q.includes("kem cho") || q.includes("kemcho") || q.includes("halo");
      return {
        answer: isGujarati
          ? "નમસ્તે! 🙏 સૂત્ર સ્ટુડિયોમાં આપનું સ્વાગત છે.\n\nઅમે 3D સ્પેશિયલ વિઝ્યુઅલાઈઝેશન, 4K સિનેમેટિક વિડિયો, Next.js ડિજિટલ ફ્લેગશિપ્સ અને ઓટોનોમસ AI વર્કફ્લો પ્રોવાઇડ કરીએ છીએ.\n\nઆજે હું તમારા પ્રોજેક્ટ માટે કઈ સર્વિસમાં મદદ કરી શકું?"
          : "Namaste! 🙏 Welcome to **Sutra Studio**.\n\nWe are a premier creative technology atelier specializing in **3D Spatial Visualization**, **4K Video Creation**, **Next.js Digital Flagships**, and **Autonomous AI Workflows**.\n\nHow can I assist you with your project or pricing inquiries today?",
        sources: [
          {
            id: "kb_12_studio_services",
            title: "12 Specialized Studio Capabilities",
            category: "Services",
            source: "SUTRA_STUDIO_UI_MASTER_PROMPT_PACK",
          },
        ],
        matchedCategory: "Services",
        system_prompt: MASTER_SYSTEM_PROMPT,
        isFallback: false,
        confidenceScore: 100,
        timestamp: new Date().toISOString(),
      };
    }

    const records = customRecords && customRecords.length > 0 ? customRecords : MASTER_RAG_KNOWLEDGE_STORE;
    const scored = this.retrieveChunks(query, records);

    if (scored.length === 0) {
      return {
        answer: "I don't have verified information about that yet. Please contact our team for the most accurate information.",
        sources: [],
        matchedCategory: "None",
        system_prompt: MASTER_SYSTEM_PROMPT,
        isFallback: true,
        confidenceScore: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const topItem = scored[0];
    const topRecord = topItem.record;

    const sources = scored.slice(0, 3).map((s) => ({
      id: s.record.id,
      title: s.record.title,
      category: s.record.category,
      source: s.record.source,
    }));

    let answer = topRecord.content;
    if (scored.length > 1 && scored[1].score > 14) {
      answer += `\n\n---\n**Related Knowledge:**\n${scored[1].record.content}`;
    }

    return {
      answer,
      sources,
      matchedCategory: topRecord.category,
      system_prompt: MASTER_SYSTEM_PROMPT,
      isFallback: false,
      confidenceScore: Math.min(topItem.score, 100),
      timestamp: new Date().toISOString(),
    };
  }
}

