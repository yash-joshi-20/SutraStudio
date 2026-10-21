import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/llm";
import { assertAdminSession } from "@/lib/auth/requestRole";

export interface GeneratedPromotionData {
  id: string;
  campaignType: string;
  platform: "instagram_reel" | "facebook_post" | "meta_carousel" | "meta_ad";
  language: "english" | "gujarati" | "hindi" | "hinglish";
  title: string;
  hook: string;
  caption: string;
  hashtags: string[];
  reelScript?: {
    openingHook: string;
    scenes: Array<{
      timestamp: string;
      visualCue: string;
      voiceoverOrText: string;
    }>;
    audioRecommendation: string;
    callToAction: string;
  };
  carouselSlides?: Array<{
    slideNumber: number;
    headline: string;
    bodyText: string;
    visualStyle: string;
  }>;
  metaAdCopy?: {
    primaryText: string;
    headline: string;
    description: string;
    targetAudienceInterests: string[];
  };
  mediaUrl?: string;
  mediaType?: "video" | "image";
  ctaUrl: string;
  whatsappUrl: string;
  createdAt: string;
}

const CAMPAIGN_INFO: Record<string, { name: string; price: string; description: string; targetAudience: string }> = {
  daily_trend_creator: {
    name: "Daily Trend Creator (Flagship Retainer)",
    price: "₹19,999/month",
    description: "30 Commercial Cinematic Video Reels & AI Motion Graphics delivered per month. 48-72h turnaround, dedicated creative director, 4K rendering.",
    targetAudience: "Luxury brands, D2C founders, high-growth startups, real estate developers, hospitality brands looking for daily viral presence.",
  },
  starter_trend: {
    name: "Starter Trend Retainer",
    price: "₹9,999/month",
    description: "15 High-engagement commercial social reels & branded carousels. Bi-weekly content roadmap, sound design, and custom brand visual language.",
    targetAudience: "Emerging businesses, boutique studios, regional luxury brands in Ahmedabad, Gujarat and Pan-India.",
  },
  commercial_video_reels: {
    name: "Cinematic 4K Commercial Reels",
    price: "₹499 - ₹1,999 per reel",
    description: "Scroll-stopping CGI motion reels, 3D product animations, and brand storytelling crafted with Vedic-modern proportion and computational rigor.",
    targetAudience: "Product designers, jewelry brands, watchmakers, cosmetics, automotive, and architecture firms.",
  },
  spatial_3d_render: {
    name: "3D Architectural & Spatial Visualization",
    price: "₹999 - ₹4,999 per view",
    description: "Photorealistic 4K interior & exterior architectural renders, lighting simulations, and 360-degree virtual space walkthroughs.",
    targetAudience: "Architects, interior designers, real estate developers, luxury villa builders in Gujarat and global ateliers.",
  },
  brand_identity_launch: {
    name: "Vedic-Modern Brand Identity & Creative Launch",
    price: "₹2,999 - ₹14,999",
    description: "Timeless brand identity uniting heritage Vedic proportion with cutting-edge digital aesthetics. Complete design system, social kit, and logo suite.",
    targetAudience: "Founders launching new luxury brands, heritage studios, spiritual technology, and design studios.",
  },
  custom: {
    name: "Sutra Studio Custom Promotion",
    price: "Bespoke Pricing",
    description: "High-precision computational design and luxury 3D visual engineering atelier.",
    targetAudience: "Discerning global brands seeking non-linear visual excellence.",
  },
};

export async function POST(req: Request) {
  const sessionCheck = await assertAdminSession(req);
  if (!sessionCheck.authorized) {
    return sessionCheck.response;
  }

  try {
    const body = await req.json();
    const {
      campaignType = "daily_trend_creator",
      platform = "instagram_reel",
      language = "english",
      mediaUrl = "/videos/services/ai-video-mobile.mp4",
      mediaType = "video",
      customPrompt = "",
    } = body;

    const campaign = CAMPAIGN_INFO[campaignType] || CAMPAIGN_INFO.daily_trend_creator;
    const promoId = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Build targeted LLM prompt
    const systemPrompt = `You are the Master Creative Director and Growth Marketing Lead at SUTRA STUDIO (https://sutrastudios.in).
Sutra Studio is a luxury creative technology atelier rooted in Ahmedabad, Gujarat, India, serving discerning global brands.
We craft:
- 3D Architectural Renders & Spatial CGI
- Cinematic 4K Commercial Video Reels (Instagram / Facebook)
- Autonomous Creative Retainers (Starter Trend ₹9,999, Daily Trend Creator ₹19,999)
- High-Converting Vedic-Modern Brand Identities

Your task: Generate an ultra-high-converting, viral promotional package for SUTRA STUDIO ITSELF to promote our services across Meta (Instagram and Facebook).

STRICT OUTPUT FORMAT: Return ONLY a valid JSON object with NO surrounding markdown backticks or commentary.
Required JSON Schema:
{
  "title": "Short punchy internal title for this promotion",
  "hook": "First 3-second viral hook or headline that stops scrolling immediately",
  "caption": "Full high-converting Instagram/Facebook caption with emoji bullet points, pricing transparency, value proposition, and CTA",
  "hashtags": ["list", "of", "15", "targeted", "viral", "and", "niche", "hashtags"],
  "reelScript": {
    "openingHook": "0-3s visual & voiceover direction",
    "scenes": [
      { "timestamp": "0:00 - 0:03", "visualCue": "Visual description", "voiceoverOrText": "Audio/text on screen" },
      { "timestamp": "0:03 - 0:08", "visualCue": "Visual description", "voiceoverOrText": "Audio/text on screen" },
      { "timestamp": "0:08 - 0:13", "visualCue": "Visual description", "voiceoverOrText": "Audio/text on screen" },
      { "timestamp": "0:13 - 0:15", "visualCue": "CTA Screen", "voiceoverOrText": "Call to action text" }
    ],
    "audioRecommendation": "Mood, BPM, style of trending background audio",
    "callToAction": "Direct action instruction for the viewer"
  },
  "carouselSlides": [
    { "slideNumber": 1, "headline": "Slide headline", "bodyText": "Slide copy", "visualStyle": "Design prompt" },
    { "slideNumber": 2, "headline": "Slide headline", "bodyText": "Slide copy", "visualStyle": "Design prompt" },
    { "slideNumber": 3, "headline": "Slide headline", "bodyText": "Slide copy", "visualStyle": "Design prompt" },
    { "slideNumber": 4, "headline": "Slide headline", "bodyText": "Slide copy", "visualStyle": "Design prompt" },
    { "slideNumber": 5, "headline": "Pricing & CTA", "bodyText": "Slide copy with pricing", "visualStyle": "Design prompt" }
  ],
  "metaAdCopy": {
    "primaryText": "Primary caption for Meta Ads Manager",
    "headline": "High-CTR Headline under 40 characters",
    "description": "Short description under 30 characters",
    "targetAudienceInterests": ["Interest 1", "Interest 2", "Interest 3", "Interest 4"]
  }
}`;

    const userPrompt = `Generate a self-promotion campaign for Sutra Studio:
- Campaign: ${campaign.name} (${campaign.price})
- Service Details: ${campaign.description}
- Target Audience: ${campaign.targetAudience}
- Target Platform: ${platform}
- Language: ${language}
${customPrompt ? `- Custom Focus / Instructions: ${customPrompt}` : ""}
${language === "gujarati" ? "IMPORTANT: Generate the hook, caption, and voiceover in natural, professional GUJARATI (ગુજરાતી) suitable for Gujarat business owners, architects, and luxury entrepreneurs." : ""}
${language === "hindi" ? "IMPORTANT: Generate the hook, caption, and voiceover in natural, modern HINDI (हिन्दी) for Pan-India D2C and luxury founders." : ""}
${language === "hinglish" ? "IMPORTANT: Generate the hook, caption, and voiceover in punchy, modern HINGLISH with high social media viral resonance." : ""}`;

    let parsedResult: any = null;

    try {
      const rawAiResponse = await generateChatResponse({
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
        maxTokens: 2200,
      });

      // Parse JSON
      const jsonStart = rawAiResponse.indexOf("{");
      const jsonEnd = rawAiResponse.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const cleanJson = rawAiResponse.substring(jsonStart, jsonEnd + 1);
        parsedResult = JSON.parse(cleanJson);
      }
    } catch (aiErr) {
      console.warn("[Promotions API] AI generation fallback triggered:", aiErr);
    }

    // High quality grounded fallback if LLM returned malformed JSON or errored
    if (!parsedResult || !parsedResult.hook) {
      if (language === "gujarati") {
        parsedResult = {
          title: `${campaign.name} — ગુજરાત સોશિયલ પ્રમોશન`,
          hook: "શું તમારા બિઝનેસ કે બ્રાન્ડ માટે હાઇ-એન્ડ 4K વિડિયો રીલ્સ અને 3D રેન્ડર્સ જોઈએ છે?",
          caption: `✨ સૂત્ર સ્ટુડિયો (Sutra Studio) સાથે તમારા બ્રાન્ડને આપો લક્ઝરી અને વાયરલ લુક!\n\nઅમે અમદાવાદ અને ગુજરાતના સિલેક્ટેડ બિઝનેસ અને રિયલ એસ્ટેટ આર્કિટેક્ટ્સ માટે તૈયાર કરીએ છીએ:\n• 🎬 4K સિનેમેટિક વિડિયો રીલ્સ\n• 🏛️ 3D આર્કિટેક્ચરલ & ઇન્ટિરિયર રેન્ડર્સ\n• ⚡ 48-72 કલાકમાં ફાસ્ટ ડિલિવરી\n• 💎 સત્તાવાર પેકેજ: ${campaign.price}\n\n👉 વધુ માહિતી માટે સીધો WhatsApp મેસેજ કરો અથવા પ્રોફાઇલ બાયોમાં લિંક તપાસો!\n📞 +91 82001 92781 | sutrastudios.in`,
          hashtags: [
            "#SutraStudio",
            "#AhmedabadBusiness",
            "#GujaratEntrepreneurs",
            "#CommercialReels",
            "#3DVisualization",
            "#ArchitecturalDesign",
            "#LuxuryBranding",
            "#SocialMediaMarketing",
            "#ContentCreation",
            "#VedicDesign",
            "#VisualEngineering",
            "#ReelsGujarat",
            "#DailyTrendCreator",
          ],
          reelScript: {
            openingHook: "ઝડપી 3D રેન્ડર કટ સાથે: 'તમારા બિઝનેસનો સોશિયલ મીડિયા લુક હવે સામાન્ય નહીં રહે.'",
            scenes: [
              { timestamp: "0:00 - 0:03", visualCue: "લક્ઝરી ગોલ્ડ-આઇવરી 3D મોડેલ સ્પિન", voiceoverOrText: "સામાન્ય પોસ્ટિંગ છોડો, તમારા બ્રાન્ડને આપો સિનેમેટિક એજ." },
              { timestamp: "0:03 - 0:07", visualCue: "4K વિડિયો રીલ અને પ્રોડક્ટ એનિમેશન મોશન", voiceoverOrText: "સૂત્ર સ્ટુડિયોનું 48 કલાકનું ઓટોનોમસ ક્રિએટિવ એન્જિન." },
              { timestamp: "0:07 - 0:11", visualCue: "પ્રાઇસિંગ ટેક્સ્ટ: ₹9,999 / ₹19,999 પ્રતિ મહિનો", voiceoverOrText: "કોઈ હિડન ચાર્જિસ નહીં, ફ્લેટ ટ્રાન્સપરન્ટ સ્ટુડિયો પ્રાઈસિંગ." },
              { timestamp: "0:11 - 0:15", visualCue: "WhatsApp નંબર અને બાયો લિંક સ્ક્રીન", voiceoverOrText: "આજે જ WhatsApp કરો: +91 82001 92781." },
            ],
            audioRecommendation: "Deep Luxury Ambient Beat with Subtle Sitar Strings, 118 BPM",
            callToAction: "Click WhatsApp Concierge Link to book 48h Studio Pipeline",
          },
          carouselSlides: [
            { slideNumber: 1, headline: "તમારા બ્રાન્ડનો સોશિયલ મીડિયા ગ્રોથ અટકી ગયો છે?", bodyText: "સામાન્ય ટેમ્પલેટ્સ તમારા ગ્રાહકોને પ્રભાવિત નથી કરી શકતા.", visualStyle: "Minimal dark brass typographic cover" },
            { slideNumber: 2, headline: "સૂત્ર સ્ટુડિયો સોલ્યુશન", bodyText: "વેદિક પ્રમાણ અને 4K કમ્પ્યુટેશનલ વિઝ્યુઅલ એન્જિનિયરિંગ.", visualStyle: "Studio render split showcase" },
            { slideNumber: 3, headline: "અમારી સ્પેશિયલાઇઝેશન", bodyText: "• 3D આર્કિટેક્ચર • સિનેમેટિક રીલ્સ • ઓટોનોમસ રીટેઇનર્સ.", visualStyle: "Iconic feature grid" },
            { slideNumber: 4, headline: "ટ્રાન્સપરન્ટ ઇન્ડિયન પ્રાઇસિંગ", bodyText: `સ્ટાર્ટર: ₹9,999/mo | ફ્લેગશિપ: ₹19,999/mo (30 રીલ્સ)`, visualStyle: "Clear luxury price card" },
            { slideNumber: 5, headline: "આજે જ શરૂ કરો", bodyText: "સીધો WhatsApp મેસેજ કરો: +91 82001 92781", visualStyle: "Warm ivory CTA slide" },
          ],
          metaAdCopy: {
            primaryText: `અમદાવાદ અને ગુજરાતના પ્રીમિયમ બિઝનેસ માટે 4K સિનેમેટિક વિડિયો રીલ્સ અને 3D રેન્ડર્સ. 48 કલાકમાં ડિલિવરી. પ્લાન શરૂ થાય છે ${campaign.price} થી.`,
            headline: "Sutra Studio • 4K Cinematic Reels & 3D CGI",
            description: "Direct Studio Retainers",
            targetAudienceInterests: ["Architecture", "Real Estate", "Luxury Goods", "Jewelry Design", "Ahmedabad Business"],
          },
        };
      } else {
        parsedResult = {
          title: `${campaign.name} — Meta Promotion Campaign`,
          hook: `Stop burning budget on generic content. Upgrade to high-precision 4K commercial reels and spatial 3D visuals.`,
          caption: `Transform your brand's digital presence with Sutra Studio.\n\nWe unite heritage Vedic aesthetics with computational rendering technology to produce scroll-stopping commercial assets:\n\n✨ 4K Cinematic Commercial Video Reels\n🏛️ Spatial 3D Architectural Renders & Walkthroughs\n⚡ Rapid 48–72 Hour Pipeline Delivery\n💎 Transparent Retainer Plans: ${campaign.price}\n\nNo bloated agency retainers. Zero guesswork. Direct studio engineering.\n\n👉 Book your creative slot directly via WhatsApp concierge: +91 82001 92781\nExplore catalog: https://sutrastudios.in/pricing`,
          hashtags: [
            "#SutraStudio",
            "#CommercialReels",
            "#3DVisualization",
            "#SpatialDesign",
            "#ArchitecturalCGI",
            "#LuxuryMarketing",
            "#BrandIdentity",
            "#CreativeAgency",
            "#DailyTrendCreator",
            "#VideoProduction",
            "#IndianDesign",
            "#AhmedabadCreative",
            "#MetaAds",
          ],
          reelScript: {
            openingHook: "Close-up cinematic 3D lighting pass: 'This is what separates 7-figure brands from the crowd.'",
            scenes: [
              { timestamp: "0:00 - 0:03", visualCue: "Rapid zoom into photorealistic 3D render with gold reflections", voiceoverOrText: "Most brand content looks the same. Here is how you dominate." },
              { timestamp: "0:03 - 0:07", visualCue: "Fast cuts between architectural spatial renders and luxury product CGI", voiceoverOrText: "At Sutra Studio, we engineer scroll-stopping 4K reels and 3D visualization." },
              { timestamp: "0:07 - 0:11", visualCue: "Screen display showing 48-hour delivery timeline and transparent pricing", voiceoverOrText: `Starting from ${campaign.price} with guaranteed 48-hour turnaround.` },
              { timestamp: "0:11 - 0:15", visualCue: "Clean brand outro card with Sutra Studio logo and WhatsApp concierge CTA", voiceoverOrText: "Claim your monthly retainer slot today. Tap link in bio." },
            ],
            audioRecommendation: "Punchy Cinematic Bass with Lo-Fi Percussion, 120 BPM",
            callToAction: "Tap Link in Bio or DM on WhatsApp to reserve monthly retainer",
          },
          carouselSlides: [
            { slideNumber: 1, headline: "Why Most Brand Visuals Fail to Convert in 2026", bodyText: "Stock templates and flat images get ignored. Your clients demand cinematic precision.", visualStyle: "Dark charcoal minimalist cover with brass serif accent" },
            { slideNumber: 2, headline: "The Computational Creative Pipeline", bodyText: "We merge Vedic proportion (Pramana) with 4K CGI rendering.", visualStyle: "Split comparison: Generic post vs Sutra Studio 3D master" },
            { slideNumber: 3, headline: "What Discerning Ateliers Get", bodyText: "• 30 Viral Video Reels/Month • High-Res 4K Deliverables • Direct Google Drive Vault.", visualStyle: "Bento box feature layout" },
            { slideNumber: 4, headline: "Transparent Studio Pricing", bodyText: `Flagship Retainer: ${campaign.price}\nGuaranteed 48h turnaround on revisions.`, visualStyle: "Warm ivory pricing card with gold border" },
            { slideNumber: 5, headline: "Ready to Upgrade?", bodyText: "WhatsApp Concierge: +91 82001 92781\nVisit sutrastudios.in", visualStyle: "Final CTA slide with verified badge" },
          ],
          metaAdCopy: {
            primaryText: `Scale your brand with high-precision 4K video reels and spatial 3D architectural renders. Fast 48-hour turnaround from Sutra Studio. Retainers starting at ${campaign.price}.`,
            headline: "Sutra Studio • 4K Reels & 3D Spatial Visuals",
            description: "Direct Studio Retainers",
            targetAudienceInterests: ["Architecture", "Interior Design", "Luxury Lifestyle", "Direct-to-Consumer", "Commercial Photography"],
          },
        };
      }
    }

    const whatsappText = encodeURIComponent(
      `Hello Sutra Studio! I am reviewing your official promotional campaign: "${parsedResult.title}". I would like to book this creative retainer for my brand.`
    );
    const whatsappUrl = `https://wa.me/918200192781?text=${whatsappText}`;
    const ctaUrl = "https://sutrastudios.in/pricing";

    const responsePayload: GeneratedPromotionData = {
      id: promoId,
      campaignType,
      platform,
      language,
      title: parsedResult.title || campaign.name,
      hook: parsedResult.hook || "Experience High-Precision Creative Technology",
      caption: parsedResult.caption || "",
      hashtags: Array.isArray(parsedResult.hashtags) ? parsedResult.hashtags : ["#SutraStudio", "#3DDesign", "#CommercialReels"],
      reelScript: parsedResult.reelScript,
      carouselSlides: parsedResult.carouselSlides,
      metaAdCopy: parsedResult.metaAdCopy,
      mediaUrl,
      mediaType,
      ctaUrl,
      whatsappUrl,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      promotion: responsePayload,
    });
  } catch (error: any) {
    console.error("[Promotions API] Error generating promotion:", error);
    return NextResponse.json(
      { error: `Promotion generation failed: ${error?.message || error}` },
      { status: 500 }
    );
  }
}
