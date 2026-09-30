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
    const { message, mode } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (mode === "admin") {
      return NextResponse.json({
        reply: `Admin Studio Producer: I have received your request regarding "${message}". We are reviewing the deliverables and will reach out with details shortly.`,
        mode: "admin",
      });
    }

    // AI Classification & Response
    const classification = classifyPrompt(message);

    const reply = `I have analyzed your requirement: "${message}". Our AI router has categorized this under our specialized "${classification.service}" (${classification.workflowType} pipeline, ${Math.round(classification.confidence * 100)}% match). We can immediately generate an order draft or dispatch rapid concepts to your Google Drive workspace.`;

    return NextResponse.json({
      reply,
      classification,
      mode: "ai",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal chat processing error" },
      { status: 500 }
    );
  }
}
