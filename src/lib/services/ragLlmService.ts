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

export const MASTER_SYSTEM_PROMPT = `You are the official AI Knowledge Concierge for Sutra Studio.

Strict Grounding Directives:
1. Answer visitor questions using only the verified and admin-approved studio knowledge provided.
2. Ground all pricing, timelines, 12 capabilities, n8n automations, and payment procedures in verified facts.
3. If information is missing from the knowledge base, state:
   "I don't have verified information about that yet. Please contact our team for the most accurate information."
4. Never hallucinate fake pricing, unapproved features, or private database keys.
5. Format answers in elegant, readable markdown with bullet points and bold text where helpful.`;

export const MASTER_RAG_KNOWLEDGE_STORE: KnowledgeRecord[] = [
  // 1. ALL 12 STUDIO CAPABILITIES & PRICING
  {
    id: "kb_12_studio_services",
    client_id: "client_sutra",
    category: "Services",
    title: "12 Specialized Studio Capabilities & Pricing Matrix",
    content: `Here are our official 12 Specialized Studio Capabilities and starting investment rates:

1. 🎨 **Image Creation** — Starting at **₹5,499**
   • Product imagery, luxury advertising visuals, 4K renders, multi-angle mockups.
2. 🎬 **Video Creation** — Starting at **₹7,999**
   • 10-30s cinematic video ads, social reels, AI motion sequences, studio voiceovers.
3. 🏛️ **3D Modeling & Visualization** — Starting at **₹9,499**
   • Spatial architectural renders, materials, lighting passes, GLTF/USDZ 3D models.
4. 🔄 **360° Virtual Tours & Web View** — Starting at **₹11,999**
   • Immersive 360-degree interactive digital showroom walkthroughs.
5. 🏡 **Interior Design & Space Planning** — Starting at **₹12,499**
   • Architectural space plans, CAD drawings, photo-real luxury interior passes.
6. 🪟 **Window & Facade Design** — Starting at **₹6,499**
   • Precision frame modeling, elevations, structural aesthetics.
7. 📈 **Digital Marketing & Growth** — Starting at **₹14,999**
   • Omni-channel strategy, viral content calendar, audience acquisition.
8. 🎯 **Meta Ads Autonomous Launcher** — Starting at **₹13,499**
   • Multi-ratio ad sets (9:16 Video, 1:1 Feed, 16:9 Banner) with conversion copy matrix.
9. 💻 **Website Development (Next.js)** — Starting at **₹19,999**
   • Turbopack compiled digital flagship, Lighthouse 98+, SEO & responsive design.
10. ⚡ **Web App Development** — Starting at **₹29,999**
    • Bespoke React/Next.js SaaS applications, Firebase/n8n integration, user auth.
11. 📱 **Mobile App Setup (Expo / React Native)** — Starting at **₹34,999**
    • Cross-platform iOS & Android mobile applications with offline storage.
12. 🤖 **AI Automation & n8n Workflows** — Starting at **₹17,999**
    • Autonomous multi-engine webhook pipelines, CRM sync, auto-social posters.`,
    source: "SUTRA_STUDIO_UI_MASTER_PROMPT_PACK / Services Specification",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. SUBSCRIPTION RETAINER PLANS
  {
    id: "kb_subscription_plans",
    client_id: "client_sutra",
    category: "Pricing",
    title: "Monthly Agency Retainers & Subscription Tiers",
    content: `We offer three transparent monthly subscription retainers:

1. 🚀 **Startup Tier** — **₹5,999 / month** ($750)
   • Up to 5,000 inquiries/month
   • 50 Approved Knowledge Chunks
   • Email & Lead Alerts
   • Standard Support & 48h Turnaround

2. ⚡ **Growth Enterprise Tier** — **₹12,999 / month** ($1,850) [Most Popular]
   • Unlimited Customer Inquiries
   • Instant Live Human Takeover & Lead Routing
   • Full Document Vector Processing (PDF/DOCX)
   • Dedicated Senior Account Lead

3. 🏛️ **Bespoke Enterprise Atelier** — **₹19,999+ / month** ($3,800+)
   • Custom Multi-Modal RAG Pipelines
   • Custom n8n Autonomous Automation Workflows
   • Private Google Drive 4K Media Vault with Dedicated SLA
   • Direct Art Director & Engineering Concierge`,
    source: "SUTRA_STUDIO_UI_MASTER_PROMPT_PACK / Commercial Pricing",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 2,
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

• **Merchant VPA**: \`yashj9428-1@oksbi\` (SUTRA STUDIO / SYNAPSE KINETIC)
• **Instant Mobile Deep-Linking**: 1-Click payment via Google Pay, PhonePe, Paytm, or BHIM.
• **Dynamic QR Codes**: Generated on-demand with exact order amount and order code.
• **UTR Verification**: Submit the 12-digit Bank Transaction Reference Number (UTR) from your GPay/UPI receipt to instantly verify payment and unlock production pipelines (T+0 instant settlement).
• **Razorpay & Credit Cards**: Standard credit cards and net banking available via Razorpay checkout.`,
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
    content: `**Sutra Studio** (Synapse Kinetic) is a premier Indian-inspired creative technology atelier blending ancient aesthetic harmony with cutting-edge digital engineering.

• **Core Focus**: Bespoke 3D Spatial Visualization, Cinematic 4K Video Commercials, High-Performance Next.js Digital Flagships, and Autonomous AI Workflows.
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

  // 6. N8N AUTOMATION PIPELINES
  {
    id: "kb_n8n_workflows",
    client_id: "client_sutra",
    category: "Custom Knowledge",
    title: "Master n8n Automation Workflows & Autonomous Engines",
    content: `Our studio operates 6 master n8n automated workflow pipelines:

1. **01. Master Agency Orchestrator** (\`POST /webhook/synapse-master-orchestrator\`):
   • Ingests client requirements, creates database ledger, and dispatches specialized child workflows.
2. **02. Client Intake & CRM Chat LLM Agent** (\`POST /webhook/synapse-client-intake-chat\`):
   • Collects brand guidelines, logo files, and color palettes with human escalation triggers.
3. **03. Trend Research & Viral Hook Analyzer** (\`POST /webhook/synapse-trend-research-engine\`):
   • Analyzes competitor social reels, scrapes viral hooks, and generates high-converting ad angles.
4. **04. Multi-Format Banner Synthesis Engine** (\`POST /webhook/synapse-brand-banner-generator\`):
   • Generates 4K banners across 1:1, 9:16, and 16:9 aspect ratios with custom logo overlays.
5. **05. AI Video Commercials Pipeline** (\`POST /webhook/synapse-video-reels-pipeline\`):
   • Produces 15-30s cinematic ads with neural voiceovers (ElevenLabs) and Runway Gen-3 Alpha.
6. **06. Meta Ads Autonomous Campaign Launcher** (\`POST /webhook/synapse-meta-ads-automation\`):
   • Configures Facebook Page, target audiences, budgets, and launches live ads with UTM tracking.`,
    source: "N8N_WORKFLOWS_BLUEPRINT_EN.md",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7. GOOGLE DRIVE VAULT & STUDIO POLICIES
  {
    id: "kb_drive_vault_policies",
    client_id: "client_sutra",
    category: "Policies",
    title: "Google Drive Vault Architecture & Studio Guarantees",
    content: `• **Google Drive Vault**: Every client is allocated an isolated Google Drive directory (\`drive_fld_sutra_001\`) where RAW 3D assets, 4K ProRes masters, vector packages, and contracts are automatically archived.
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

