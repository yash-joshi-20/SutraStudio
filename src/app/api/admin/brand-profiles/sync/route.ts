import { NextResponse } from "next/server";
import { readEnv } from "@/lib/config/env";
import { assertAdminSession } from "@/lib/auth/requestRole";

export async function POST(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const body = await req.json().catch(() => ({}));
    const { target } = body; // "facebook" | "whatsapp" | "both"

    const results: {
      facebook?: { success: boolean; message: string; data?: unknown; error?: unknown };
      whatsapp?: { success: boolean; message: string; data?: unknown; error?: unknown };
    } = {};

    // Canonical Text Payloads
    const canonicalFacebookAbout =
      "Creative & digital atelier delivering visual production, software engineering & brand growth.";
    const canonicalFacebookDescription = `Sutra Studios is a creative technology and digital production atelier. We partner with emerging and established brands to build distinctive visual identities, commercial visual assets, high-impact brand campaigns, and bespoke software solutions.

Our 12 integrated creative disciplines include Commercial & Product Image Creation (from ₹249), Promotional Video & Reel Production (from ₹199), 3D Product Modeling & Visualization (from ₹999), 360° Virtual Tours (from ₹2,999), Interior 3D Visualization (from ₹1,499), Exterior 3D Visualization (from ₹1,999), AI-Powered Digital Marketing (from ₹999), Meta Ads Campaign Management (from ₹4,999), Website Design & Development (from ₹4,999), Web Applications, Mobile App Prototypes, and Custom Systems.

We provide transparent standalone commission pricing alongside dedicated monthly retainer partnerships starting from ₹9,999/month (Starter Trend). Connect with our studio team to commission your next project.`;

    const canonicalWhatsAppAbout = "Sutra Studios — Creative & Software Atelier";
    const canonicalWhatsAppDescription =
      "Sutra Studios is a creative and software services atelier. We provide commercial visual production, spatial 3D modeling, web engineering, brand strategy, and dedicated monthly retainers.";

    // 1. Sync Facebook Page Profile (About & Description)
    if (target === "facebook" || target === "both") {
      const pageId = readEnv("FACEBOOK_PAGE_ID");
      const pageToken = readEnv("META_PAGE_ACCESS_TOKEN") || readEnv("META_GRAPH_ACCESS_TOKEN");

      if (!pageId || !pageToken || pageToken.startsWith("USER_")) {
        results.facebook = {
          success: false,
          message: "Facebook Page ID or Page Access Token is missing/not configured in environment.",
        };
      } else {
        try {
          const fbRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              about: canonicalFacebookAbout,
              description: canonicalFacebookDescription,
              access_token: pageToken,
            }),
          });
          const fbData = await fbRes.json();
          if (fbRes.ok && fbData.success) {
            results.facebook = {
              success: true,
              message: "Facebook Page About & Description updated successfully.",
              data: fbData,
            };
          } else {
            results.facebook = {
              success: false,
              message: fbData?.error?.message || "Failed to update Facebook Page metadata.",
              error: fbData,
            };
          }
        } catch (err: unknown) {
          results.facebook = {
            success: false,
            message: err instanceof Error ? err.message : "Network error updating Facebook Page.",
          };
        }
      }
    }

    // 2. Sync WhatsApp Business Profile
    if (target === "whatsapp" || target === "both") {
      const phoneId = readEnv("WHATSAPP_PHONE_NUMBER_ID");
      const waToken = readEnv("WHATSAPP_ACCESS_TOKEN") || readEnv("META_GRAPH_ACCESS_TOKEN");

      if (!phoneId || !waToken || waToken.startsWith("USER_")) {
        results.whatsapp = {
          success: false,
          message: "WhatsApp Phone Number ID or Access Token is missing/not configured in environment.",
        };
      } else {
        try {
          const waRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/whatsapp_business_profile`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${waToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              about: canonicalWhatsAppAbout,
              description: canonicalWhatsAppDescription,
              email: "concierge@sutrastudios.in",
              websites: ["https://sutrastudios.in"],
              vertical: "PROF_SERVICES",
            }),
          });
          const waData = await waRes.json();
          if (waRes.ok && waData.success) {
            results.whatsapp = {
              success: true,
              message: "WhatsApp Business Profile updated successfully.",
              data: waData,
            };
          } else {
            results.whatsapp = {
              success: false,
              message: waData?.error?.message || "Failed to update WhatsApp Business Profile.",
              error: waData,
            };
          }
        } catch (err: unknown) {
          results.whatsapp = {
            success: false,
            message: err instanceof Error ? err.message : "Network error updating WhatsApp Business Profile.",
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
