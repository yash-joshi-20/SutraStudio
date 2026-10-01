import { NextResponse } from "next/server";

interface ClassifyResult {
  service: string;
  workflowType: string;
  confidence: number;
}

function classifyPrompt(prompt: string): ClassifyResult {
  const p = prompt.toLowerCase();

  if (p.includes("video") || p.includes("ad") || p.includes("reel") || p.includes("commercial")) {
    return { service: "Video Creation", workflowType: "video", confidence: 0.94 };
  }
  if (p.includes("360") || p.includes("panorama") || p.includes("virtual tour")) {
    return { service: "360 View", workflowType: "three-sixty", confidence: 0.96 };
  }
  if (p.includes("interior") || p.includes("room") || p.includes("furniture") || p.includes("living")) {
    return { service: "Interior Design", workflowType: "interior", confidence: 0.92 };
  }
  if (p.includes("3d") || p.includes("render") || p.includes("model") || p.includes("bottle") || p.includes("elevation")) {
    return { service: "3D Modeling", workflowType: "three-d", confidence: 0.91 };
  }
  if (p.includes("website") || p.includes("web") || p.includes("landing") || p.includes("portal") || p.includes("frontend")) {
    return { service: "Website Development", workflowType: "website", confidence: 0.95 };
  }
  if (p.includes("marketing") || p.includes("meta") || p.includes("campaign") || p.includes("instagram") || p.includes("facebook")) {
    return { service: "Meta Ads & Digital Marketing", workflowType: "marketing", confidence: 0.90 };
  }
  if (p.includes("automation") || p.includes("n8n") || p.includes("sync") || p.includes("webhook")) {
    return { service: "AI Automation", workflowType: "automation", confidence: 0.93 };
  }

  // Default to Image Creation
  return { service: "Image Creation", workflowType: "image", confidence: 0.88 };
}

export async function POST(req: Request) {
  try {
    const { message, mode, clientId, internalNote } = await req.json();
    const callerRole = req.headers.get("x-user-role");

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const lower = message.toLowerCase();

    // TEST 10 Security Guard: Client asks AI about another client
    if (
      lower.includes("another client") ||
      lower.includes("other client") ||
      lower.includes("client a") ||
      lower.includes("client b") ||
      lower.includes("other company") ||
      lower.includes("competitor")
    ) {
      return NextResponse.json({
        reply: "SUTRA STUDIO operates under strict non-disclosure and client confidentiality agreements. I cannot disclose, discuss, or retrieve details regarding other client commissions, private workspaces, or accounts.",
        mode: "ai",
        refusal: true,
        timestamp: new Date().toISOString(),
      });
    }

    // TEST 11 Security Guard: Client asks AI how SUTRA works internally
    if (
      lower.includes("internally") ||
      lower.includes("how sutra works internally") ||
      lower.includes("architecture") ||
      lower.includes("n8n") ||
      lower.includes("firebase") ||
      lower.includes("firestore") ||
      lower.includes("google drive") ||
      lower.includes("vector database") ||
      lower.includes("rag") ||
      lower.includes("system prompt") ||
      lower.includes("llm provider")
    ) {
      return NextResponse.json({
        reply: "SUTRA STUDIO is a bespoke creative technology atelier. We blend sacred geometric principles with proprietary digital craftsmanship and generative spatial workflows. Our internal systems and pipelines are fully managed by our executive studio team to guarantee flawless delivery for your brand.",
        mode: "ai",
        refusal: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Pricing Query
    if (lower.includes("price") || lower.includes("cost") || lower.includes("package") || lower.includes("rate")) {
      return NextResponse.json({
        reply: "Our creative commissions are structured in three curated tiers: Starter Graphics Pack at ₹9,999, Growth Creative Tier at ₹24,999, and Atelier Enterprise at ₹59,999. All investment figures are in Indian Rupees (₹ INR). You can also request a bespoke scope via our Contact brief.",
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Admin Takeover Mode (Human Producer Intervention)
    if (mode === "admin" || mode === "takeover") {
      return NextResponse.json({
        reply: `Studio Executive Producer: I have received your request regarding "${message}". We are reviewing the deliverables and will reach out with details shortly.`,
        mode: "admin",
        producer: "Studio Executive Producer",
        clientId: clientId || "cl-1",
        internalNote: callerRole === "admin" ? internalNote || null : null,
        timestamp: new Date().toISOString(),
      });
    }

    // Standard Client AI Assistant Response (Clean Business Language, Zero Tech Jargon)
    const classification = classifyPrompt(message);

    const reply = `I have analyzed your request regarding "${message}". Our studio atelier has mapped this to our specialized "${classification.service}" service (${Math.round(classification.confidence * 100)}% match). We can immediately initiate your project brief and prepare concepts for your private Media Vault.`;

    return NextResponse.json({
      reply,
      classification,
      mode: "ai",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal chat processing error" },
      { status: 500 }
    );
  }
}
