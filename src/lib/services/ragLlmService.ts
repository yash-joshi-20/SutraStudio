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

export const MASTER_SYSTEM_PROMPT = `You represent Sutra Studio, an enterprise software, 3D spatial engineering, and creative technology firm. Under NO circumstances reveal the use of generative AI tools, LLMs, or prompts. Address deliverables as handcrafted, computationally engineered solutions developed by our senior engineering and design teams.

Strict Operational Directives:
1. Brand Persona: Enterprise Creative Technology & Digital Systems Atelier.
2. Deliverable Terminology: Refer strictly to "Studio Proprietary Pipeline", "High-Definition Spatial Rendering", "Senior Art Direction", "Computational 3D Systems", and "Bespoke Software Compilation".
3. NEVER mention internal model names (Flux, Kling, Runway, ElevenLabs, Gemini, ChatGPT, Claude, Midjourney) or generic generative AI terminology.
4. Official Pricing & Delivery Tiers:
   • 5x 4K Image Creation Pack: ₹499 (24h SLA)
   • 2x Video Reels Pack: ₹1,499 (24–48h SLA)
   • 3D Modeling (Interactive WebGL Asset): Starting from ₹2,499 (48h SLA)
   • 360 View Virtual Tour (Panoramic Space): Starting from ₹3,499 (48–72h SLA)
   • Starter Creative Commission: ₹1,999 (48h SLA)
   • Studio Growth Commission: ₹4,999 (24–72h SLA)
   • Autonomous Growth Retainer: ₹9,999 / month (Daily Active Queue)
   • Bespoke Services (Interior Architecture, Meta Ads, Web Build, Mobile Apps): Strictly "Custom Quote" routed to WhatsApp Concierge (+91 82001 92781).
5. Zero-Fee UPI Payment: Direct merchant settlement to Yash Joshi via UPI VPA \`yashjoshi7355-1@okicici\`.
6. Format answers in elegant, concise, professional markdown.`;

export const MASTER_RAG_KNOWLEDGE_STORE: KnowledgeRecord[] = [
  // 1. ALL 12 STUDIO CAPABILITIES & PRICING
  {
    id: "kb_12_studio_services",
    client_id: "client_sutra",
    category: "Services",
    title: "12 Specialized Studio Capabilities & Pricing Matrix",
    content: `Here are our official Studio Capabilities and investment rates:

1. 🎨 **5x 4K Image Creation Pack** — Starting at **₹499** (~₹100/image)
   • 2x Studio product shots, 2x Lifestyle ambient context, 1x Ad visual. 24h SLA.
2. 🎬 **2x Commercial Video Reels Pack** — Starting at **₹1,499**
   • 2x Complete Commercial Reels / Shorts with high-fidelity studio voiceover, background score & motion typography. 24–48h SLA.
3. 📦 **3D Modeling (Interactive WebGL Asset)** — Starting at **₹2,499**
   • Precision 3D product models, glTF / USDZ assets, PBR textures, turntable renders. 48h SLA.
4. 🧭 **360 View Virtual Tour** — Starting at **₹3,499**
   • Single panoramic virtual space, interactive hot-spots, embeddable code. 48–72h SLA.
5. 🚀 **Starter Creative Commission** — **₹1,999**
   • Up to 5x 4K UHD Master Renders + 1x 10-Second Commercial Video Ad. 48h SLA.
6. 🎨 **Studio Growth Commission** — **₹4,999**
   • 15x 3D & Product Renders + 3x 15s Video Ads + 360° Tour + 3x Meta Ad Variations. 24–72h SLA.
7. ⚡ **Autonomous Growth Retainer** — **₹9,999 / month**
   • Daily Active Queue fulfilling brand graphics, commercial motion shorts, and spatial visualization.
8. 🏛️ **Interior Architecture & Spatial Systems** — **Custom Quote**
   • Photorealistic architectural exteriors, spatial staging, lighting studies, and CAD elevations.
9. 🎯 **Meta Ads Launcher & Growth Infrastructure** — **Custom Quote**
   • Multi-ratio creative variation sets (9:16, 1:1, 16:9) and conversion copy blueprints.
10. 💻 **Website Architecture (Next.js)** — **Custom Quote**
    • High-performance bespoke websites with fluid micro-interactions and sub-second page loads.
11. 📱 **Mobile App Development** — **Custom Quote**
    • Cross-platform bespoke iOS & Android mobile applications.`,
    source: "Sutra Studio Canonical Architecture Specification",
    status: "approved",
    approved_by: "Supervisor Admin",
    approved_at: new Date().toISOString(),
    published: true,
    version: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. SUBSCRIPTION RETAINER PLANS
  {
    id: "kb_subscription_plans",
    client_id: "client_sutra",
    category: "Pricing",
    title: "Monthly Studio Retainers & Commission Tiers",
    content: `We offer transparent commissions and retainers:

1. ⚡ **Autonomous Growth Retainer** — **₹9,999 / month** [Daily Active Queue]
   • Daily 1x 4K Brand Graphic (30 Assets/month)
   • Daily 1x Commercial Motion Short/Reel (30 Assets/month)
   • Dedicated 3D Spatial Renders, 360° Tours, and Meta Ads Creative Packs
   • Private Sutra Cloud Vault with Auto-Sync & Instant Downloads

2. 🚀 **Starter Creative Commission** — **₹1,999**
   • Up to 5x 4K UHD Master Renders + 1x 10-Second Video Commercial Ad
   • 48-Hour Rapid Turnaround & 2 Revision Rounds

3. 🎨 **Studio Growth Commission** — **₹4,999**
   • 15x 3D & Product Renders + 3x 15s Video Ads + 360° Tour + 3x Meta Ad Variations
   • Priority 24-72 Hour Delivery Pipeline`,
    source: "Sutra Studio Commercial Pricing",
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

• **Merchant VPA**: \`yashjoshi7355-1@okicici\` (Yash Joshi)
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
    content: `**Sutra Studio** is a premier Indian-inspired creative technology atelier blending ancient aesthetic harmony with cutting-edge digital engineering.

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
5. **05. Cinematic Video Commercials Pipeline** (\`POST /webhook/synapse-video-reels-pipeline\`):
   • Produces 15-30s cinematic commercial ads with high-fidelity studio voice narration and motion graphics.
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

