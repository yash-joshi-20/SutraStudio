import { NextRequest, NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth/requestRole";

export const dynamic = "force-dynamic";

interface GenerateAdRequest {
  client: {
    id: string;
    name: string;
    company: string;
    email?: string;
    tier?: string;
    colors?: Array<{ hex: string; usage: string }>;
    industry?: string;
    services?: string[];
  };
  product: string;
  goal: string;
  location: string;
  budget: string;
  tone?: string;
}

export async function POST(req: NextRequest) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const body: GenerateAdRequest = await req.json();
    const { client, product, goal, location, budget, tone = "Luxury Atelier" } = body;

    if (!client || !product || !goal) {
      return NextResponse.json(
        { error: "Missing required fields: client, product, or goal" },
        { status: 400 }
      );
    }

    const companyName = client.company || client.name || "Client Atelier";
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const slug = product.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const campaignName = `[Sutra] ${companyName} - ${product} - ${goal.split(" ")[0]} - ${dateStr}`;

    // Select Objective based on Goal
    let suggestedObjective = "Leads (Instant Forms + WhatsApp Chat)";
    let ctaButton = "Learn More";
    if (goal.toLowerCase().includes("sales") || goal.toLowerCase().includes("conversion")) {
      suggestedObjective = "Sales (Website Conversions & Catalog Purchases)";
      ctaButton = "Shop Now";
    } else if (goal.toLowerCase().includes("traffic")) {
      suggestedObjective = "Traffic (Landing Page Link Clicks)";
      ctaButton = "Explore Work";
    } else if (goal.toLowerCase().includes("whatsapp")) {
      suggestedObjective = "Engagement / Leads (Click-to-WhatsApp Conversation)";
      ctaButton = "Send WhatsApp Message";
    }

    // Curate Interests based on Industry & Product
    const industryLower = (client.industry || product).toLowerCase();
    let interestGroup = ["Luxury lifestyle", "High-net-worth individuals", "Design", "Aesthetics"];
    if (industryLower.includes("perfume") || industryLower.includes("fragrance") || industryLower.includes("beauty")) {
      interestGroup = ["Niche perfume", "Luxury goods", "Vogue", "Fine fragrance", "Cosmetics", "Aromatherapy"];
    } else if (industryLower.includes("architect") || industryLower.includes("interior") || industryLower.includes("decor") || industryLower.includes("spatial")) {
      interestGroup = ["Architectural Digest", "Interior design", "Luxury real estate", "Elle Decor", "Modern architecture", "Custom homes"];
    } else if (industryLower.includes("software") || industryLower.includes("app") || industryLower.includes("tech") || industryLower.includes("web")) {
      interestGroup = ["Small business owners", "E-commerce", "SaaS", "Digital marketing", "Tech startups", "Web design"];
    } else if (industryLower.includes("jewelry") || industryLower.includes("gem") || industryLower.includes("fashion")) {
      interestGroup = ["Fine jewelry", "Haute couture", "Luxury goods", "Fashion design", "Vogue India"];
    }

    // Construct 3 Meta Ad Policy Compliant Primary Text Variants
    // Strict Meta Policy: No personal attributes, no false claims, true studio benefits
    const variantA = `Experience the refined craft of ${product} by ${companyName}. Meticulously created with deliberate attention to detail, materials, and form.\n\nWhether exploring bespoke solutions or elevating your brand presence, our studio atelier delivers uncompromised excellence. Connect with our dedicated team today.\n\n✦ Structured milestones • Transparent deliverables`;

    const variantB = `Exceptional brands require distinctive vision. ${companyName} presents ${product}—engineered to command attention and deliver lasting distinction.\n\nFrom concept to final execution, experience how deliberate craftsmanship transforms your digital presence.\n\nInquire online to review available slots and tailored project packages.`;

    const variantC = `Discover ${product} from ${companyName}. Tailored for forward-thinking clients who value precision, timeless aesthetic standards, and reliable delivery.\n\nExplore our curated portfolio and schedule a discovery consultation directly with our executive team.`;

    // 3 Headlines (Under 40 chars each)
    const headline1 = `Bespoke ${product.slice(0, 22)}`;
    const headline2 = `${companyName.slice(0, 20)} | Atelier Craft`;
    const headline3 = `Discover ${product.slice(0, 25)}`;

    // Newsfeed Description (Under 30 chars)
    const description = `Transparent Delivery • Sutra`;

    // Destination URL & WhatsApp Link
    const destinationUrl = `https://sutrastudios.in/services?utm_source=meta&utm_medium=paid&utm_campaign=${slug}&utm_content=${encodeURIComponent(client.id)}`;
    const whatsappLink = `https://wa.me/918200192781?text=${encodeURIComponent(
      `Hello ${companyName}, I saw your Meta campaign for ${product} and would like to inquire about project details.`
    )}`;

    // 5-10 Curated Instagram Hashtags
    const cleanBrandTag = companyName.replace(/[^a-zA-Z0-9]/g, "");
    const cleanProductTag = product.replace(/[^a-zA-Z0-9]/g, "");
    const hashtags = [
      `#${cleanBrandTag}`,
      `#${cleanProductTag}`,
      "#SutraStudios",
      "#CreativeAtelier",
      "#BrandDesign",
      "#LuxuryAesthetic",
      "#DigitalProduction",
      "#DesignExcellence",
    ].join(" ");

    // Creative briefs
    const imageBrief = `High-contrast editorial composition highlighting ${product} against a warm ivory (#FAF9F5) and deep charcoal background. Ambient directional 3000K lighting with subtle brass reflections. The central 60% of the canvas contains the subject with ample negative space at top and bottom to satisfy Meta Reels and Story safe zones. Zero busy overlay text.`;

    const altText = `Editorial luxury composition of ${product} with warm ambient studio lighting, bespoke branding for ${companyName}.`;

    // Generate Visual URLs across 1:1, 4:5, 9:16
    const promptQuery = encodeURIComponent(
      `editorial product photography of ${product}, luxury brand atelier, warm ivory aesthetic, dramatic studio lighting, hasselblad 8k, photorealistic, minimal background`
    );
    const seed = Math.floor(Math.random() * 900000) + 100000;

    const creative1x1 = "/images/services/meta-ads-launcher.webp";
    const creative4x5 = "/images/services/image-creation.webp";
    const creative9x16 = "/images/services/video-creation.webp";

    const campaignPackage = {
      id: `ad_camp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      clientId: client.id,
      clientName: companyName,
      product,
      goal,
      location,
      budget,
      tone,
      campaignName,
      suggestedObjective,
      audience: {
        location: `${location} (Radius: 15 km around urban hubs; Exclude unserviceable postal codes)`,
        age: "25 - 54 years",
        gender: "All (or tailored by product affinity)",
        interests: interestGroup.join(", "),
      },
      placements: "Advantage+ Placements (Facebook Feed, Instagram Feed, Instagram Reels, Stories)",
      primaryTextVariants: [
        { label: "Variant A: Direct Benefit & Value", text: variantA },
        { label: "Variant B: Editorial Hook & Agitation", text: variantB },
        { label: "Variant C: Social Proof & Atelier Craft", text: variantC },
      ],
      headlines: [headline1, headline2, headline3],
      description,
      ctaButton,
      destinationUrl,
      whatsappLink,
      hashtags,
      imageBrief,
      altText,
      creatives: {
        square1x1: {
          ratio: "1:1 Square (1080x1080)",
          url: creative1x1,
          placement: "Facebook & Instagram Feeds, Desktop",
        },
        vertical4x5: {
          ratio: "4:5 Vertical (1080x1350)",
          url: creative4x5,
          placement: "Instagram Mobile Feed",
        },
        fullScreen9x16: {
          ratio: "9:16 Full Screen (1080x1920)",
          url: creative9x16,
          placement: "Instagram Reels, Facebook Reels, Stories",
        },
      },
    };

    return NextResponse.json({
      success: true,
      campaign: campaignPackage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate ad campaign package";
    console.error("Ad Desk Generation Error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
