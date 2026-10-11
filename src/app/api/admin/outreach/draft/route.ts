import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth/requestRole";
import { OrdersStore } from "@/lib/services/ordersStore";

interface DraftRequestPayload {
  leadName?: string;
  leadPhone?: string;
  leadEmail?: string;
  handle?: string;
  channel: "whatsapp" | "instagram" | "facebook" | "email";
  intent: "inquiry_followup" | "confirm_link" | "proposal" | "asset_delivery" | "custom";
  serviceOrPlan?: string;
  clientNote?: string;
  orderId?: string;
}

export async function POST(req: Request) {
  const auth = await assertAdminSession(req);
  if (!auth.ok) return auth.response;

  try {
    const body: DraftRequestPayload = await req.json();
    const {
      leadName = "Valued Patron",
      leadPhone = "",
      leadEmail = "",
      handle = "",
      channel = "whatsapp",
      intent = "inquiry_followup",
      serviceOrPlan = "Bespoke Creative Suite",
      clientNote = "",
      orderId,
    } = body;

    let targetOrder: any = null;
    let replyWindowActive = true;
    let replyWindowHoursRemaining = 24;
    let confirmLink = "";

    if (orderId) {
      targetOrder = await OrdersStore.findByIdAsync(orderId);
      if (targetOrder) {
        if (targetOrder.channelMetadata?.replyWindowExpiresAt) {
          const expiresAt = new Date(targetOrder.channelMetadata.replyWindowExpiresAt).getTime();
          const now = Date.now();
          if (now > expiresAt) {
            replyWindowActive = false;
            replyWindowHoursRemaining = 0;
          } else {
            replyWindowHoursRemaining = Math.max(0, Math.round((expiresAt - now) / (1000 * 3600)));
          }
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudios.in";
        if (targetOrder.confirmToken) {
          confirmLink = `${origin}/orders/confirm?orderId=${targetOrder.id}&token=${targetOrder.confirmToken}`;
        }
      }
    }

    const cleanPhone = leadPhone.replace(/[^0-9]/g, "");
    const firstName = leadName.split(" ")[0] || "there";

    // 1. Generate Option A: Concierge & Direct
    let draftA = "";
    if (intent === "confirm_link" || (targetOrder && targetOrder.isDraft)) {
      draftA = `Namaste ${firstName},\n\nThank you for reaching out to Sutra Studio. We have reserved your creative pipeline for ${serviceOrPlan}.\n\nTo review your order brief, authorize payment, and initiate production, please visit your private studio portal:\n${confirmLink || "https://sutrastudios.in/orders"}\n\nOur creative directors will commence your render pass immediately upon confirmation.\n\nWarm regards,\nSutra Studio Concierge`;
    } else if (intent === "proposal") {
      draftA = `Namaste ${firstName},\n\nWe have prepared an architectural overview for ${serviceOrPlan} tailored to your brand aesthetic.\n\nCould we arrange a 10-minute briefing session tomorrow, or would you prefer our private portfolio link for direct review?\n\nWarm regards,\nSutra Studio`;
    } else if (intent === "asset_delivery") {
      draftA = `Namaste ${firstName},\n\nYour 4K production deliverables for ${serviceOrPlan} are now rendered and vaulted in your private Google Drive.\n\nYou can access your master files directly in your client dashboard at https://sutrastudios.in/dashboard.\n\nWarm regards,\nSutra Studio`;
    } else {
      draftA = `Namaste ${firstName},\n\nThank you for connecting with Sutra Studio regarding ${serviceOrPlan}. We specialize in luxury architectural imagery, cinematic reels, and custom digital experiences.\n\nWould you like us to prepare a preliminary brief and schedule an exploration session?\n\nWarm regards,\nSutra Studio Team`;
    }

    // 2. Generate Option B: Aesthetic & Editorial (Luxury Brand Voice)
    let draftB = "";
    if (intent === "confirm_link" || (targetOrder && targetOrder.isDraft)) {
      draftB = `Greetings ${leadName},\n\nYour creative consultation for ${serviceOrPlan} has been cataloged at Sutra Studio. We have framed your production docket in our private client portal.\n\nPlease confirm your specifications and unlock the pipeline here:\n${confirmLink || "https://sutrastudios.in/orders"}\n\nWe look forward to translating your vision into classical luxury.\n\nSutra Studio | Curated Technology & Craft`;
    } else if (intent === "proposal") {
      draftB = `Greetings ${leadName},\n\nAt Sutra Studio, we bridge heritage visual elegance with high-speed AI pipelines. Following your interest in ${serviceOrPlan}, we would love to present our lookbook and bespoke tier options.\n\nLet us know your availability this week for an executive walkthrough.\n\nSutra Studio`;
    } else {
      draftB = `Greetings ${leadName},\n\nThank you for your inquiry about ${serviceOrPlan}. Every commission at Sutra Studio is guided by refined craftsmanship and meticulous detail.\n\n${clientNote ? `Note: ${clientNote}\n\n` : ""}We would be delighted to guide your next campaign. Shall we send our tailored lookbook?\n\nSutra Studio`;
    }

    // 3. Generate Option C: Action-Oriented & Fast (Direct WhatsApp/DM style)
    let draftC = "";
    if (intent === "confirm_link" || (targetOrder && targetOrder.isDraft)) {
      draftC = `Hi ${firstName}! Sutra Studio draft is ready for ${serviceOrPlan}. Click here to verify your brief and confirm on the website: ${confirmLink || "https://sutrastudios.in/orders"} — excited to begin!`;
    } else {
      draftC = `Hi ${firstName}! Great connecting with you regarding ${serviceOrPlan}. We're ready to spin up your creative renders. Let us know when you'd like to review the concept draft!`;
    }

    // Action Launchers
    const encodedA = encodeURIComponent(draftA);
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedA}` : `https://wa.me/?text=${encodedA}`;
    const mailtoLink = leadEmail ? `mailto:${leadEmail}?subject=${encodeURIComponent(`Sutra Studio — ${serviceOrPlan}`)}&body=${encodedA}` : "";
    const igInboxLink = "https://www.instagram.com/direct/inbox/";
    const fbInboxLink = "https://business.facebook.com/latest/inbox/";

    return NextResponse.json({
      success: true,
      metaCompliance: {
        replyWindowActive,
        replyWindowHoursRemaining,
        warning: !replyWindowActive
          ? "24-hour customer care window has elapsed. Meta & WhatsApp policy requires using pre-approved Message Templates or waiting for an inbound response."
          : null,
        policyNotice:
          "Meta Messaging Policy: All messages drafted here must be reviewed and sent manually by an operator. Automated scraping, bulk cold messaging, and automated spam are strictly forbidden.",
      },
      drafts: [
        {
          id: "concierge",
          title: "Concierge & Direct",
          text: draftA,
          tone: "Professional & Elegant",
        },
        {
          id: "editorial",
          title: "Aesthetic & Editorial",
          text: draftB,
          tone: "Luxury & Heritage-Inspired",
        },
        {
          id: "action",
          title: "Action-Oriented & Swift",
          text: draftC,
          tone: "Mobile & Fast Casual",
        },
      ],
      actions: {
        waLink,
        mailtoLink,
        igInboxLink,
        fbInboxLink,
      },
      order: targetOrder
        ? {
            id: targetOrder.id,
            orderNumber: targetOrder.orderNumber,
            clientName: targetOrder.clientName,
            status: targetOrder.status,
            isDraft: targetOrder.isDraft,
          }
        : null,
    });
  } catch (err: any) {
    console.error("[Outreach/Draft] Error generating draft:", err);
    return NextResponse.json(
      { error: "Failed to generate outreach drafts", details: err.message },
      { status: 500 }
    );
  }
}
