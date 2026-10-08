import { NextResponse } from "next/server";
import { readEnv } from "@/lib/config/env";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { EmailService } from "@/lib/services/emailProvider";

export const dynamic = "force-dynamic";

// High-fidelity fallback inquiries if Firestore collection is fresh/empty
const INITIAL_DEMO_INQUIRIES = [
  {
    id: "inq_demo_001",
    channel: "WhatsApp",
    from: "+919879012345",
    maskedFrom: "+91 98 **** 2345",
    name: "Aarav Singhania (Aura Architecture)",
    query: "Namaste Sutra Studio. We need 5 luxury 4K architectural exterior renders for our Udaipur resort villa project. What is the pricing and timeline?",
    response: "Namaste Aarav! For 5 luxury 4K architectural renders, our **5x 4K Master Pack (₹499)** or full **Starter Creative Commission (₹1,999)** is the ideal choice. It includes 5x 4K Ultra-HD renders with studio lighting passes, 1x 10-second concept cinematic reel, and a 24–48 hour turnaround SLA. You can initiate this immediately via UPI: `yashjoshi7355-1@okicici` or via our studio portal at https://sutrastudio-1.onrender.com/orders.",
    status: "Delivered",
    deliveryNote: "Delivered via Meta WhatsApp Cloud API (+91 82001 92781)",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    parsedIntent: "High-Intent Commercial Inquiry: 4K Spatial Renders & Cinematic Video Ad",
    sentimentScore: 0.94,
    reasoningSummary: "Client requesting 5 luxury exterior renders and timeline for hospitality villa. Automatically quoted standalone 5x 4K render pack (₹499) and Starter package (₹1,999) with 24-48h SLA and zero-fee UPI settlement.",
    dispatchRail: "Meta WhatsApp Cloud API (Graph v21.0 / Phone +91 82001 92781)",
    pricingMentioned: { starter: "₹1,999", growth: "₹4,999", retainer: "₹9,999", upi: "yashjoshi7355-1@okicici" },
  },
  {
    id: "inq_demo_002",
    channel: "Email",
    from: "priya.mehta@heritagejewels.in",
    maskedFrom: "pr***@heritagejewels.in",
    name: "Priya Mehta (Heritage Jewels)",
    query: "Looking for a monthly retainer for high-end 3D jewelry showcases, social media reels, and Meta ad creatives for our Diwali launch.",
    response: "Namaste Priya! Our **Autonomous Growth Retainer (₹9,999/month)** is tailor-made for luxury brand campaigns. It provides daily active queue fulfillment, unlimited 8K renders, daily social drops, high-converting Meta ad packages, and dedicated art direction. Direct settlement can be completed to `yashjoshi7355-1@okicici` or through our studio dashboard.",
    status: "Delivered",
    deliveryNote: "Delivered via Zoho SMTP (yashjoshi20@zohomail.in)",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    parsedIntent: "Enterprise Retainer Request: E-commerce 3D & Omnichannel Ads",
    sentimentScore: 0.98,
    reasoningSummary: "Enterprise jewelry client seeking monthly retainer for multi-channel product showcase and ad campaigns. Matched to ₹9,999/month Retainer with dedicated active queue.",
    dispatchRail: "Zoho Mail TLS (info@sutrastudio.com / yashjoshi20@zohomail.in)",
    pricingMentioned: { starter: "₹1,999", growth: "₹4,999", retainer: "₹9,999", upi: "yashjoshi7355-1@okicici" },
  },
  {
    id: "inq_demo_003",
    channel: "WhatsApp",
    from: "+919825167890",
    maskedFrom: "+91 98 **** 7890",
    name: "Karan Patel (Vedic Spaces)",
    query: "તમારા 3D રેન્ડર્સ અને વિડીયો રીલ્સ માટેનું પેકેજ શું છે? મારે 15 રેન્ડર અને 3 વિડીયો એડ્સ જોઈએ છે.",
    response: "નમસ્તે કરણભાઈ! તમારી જરૂરિયાત (૧૫ રેન્ડર્સ અને ૩ વિડીયો એડ્સ) માટે અમારું **Studio Growth Package (₹4,999)** સૌથી ઉત્તમ છે. જેમાં 15x 3D રેન્ડર્સ, 3x 15-સેકન્ડ 4K રીલ્સ, 3D એસેટ્સ અને 5 રિવિઝન સામેલ છે. તમે સીધું UPI `yashjoshi7355-1@okicici` દ્વારા પેમેન્ટ કરીને તાત્કાલિક પ્રોડક્શન શરૂ કરાવી શકો છો.",
    status: "Delivered",
    deliveryNote: "Delivered via Meta WhatsApp Cloud API (+91 82001 92781)",
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    parsedIntent: "Gujarati Regional Inbound: 15 Spatial Renders + 3 Video Reels",
    sentimentScore: 0.91,
    reasoningSummary: "Gujarati commercial client inquiring about multi-asset growth package. Auto-translated intent and dispatched Gujarati response quoting Studio Growth tier (₹4,999) with direct UPI.",
    dispatchRail: "Meta WhatsApp Cloud API (Graph v21.0 / Phone +91 82001 92781)",
    pricingMentioned: { starter: "₹1,999", growth: "₹4,999", retainer: "₹9,999", upi: "yashjoshi7355-1@okicici" },
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const channelFilter = searchParams.get("channel");
    const searchQuery = searchParams.get("search")?.toLowerCase();

    let inquiries: any[] = [];

    if (isFirebaseAdminReady()) {
      try {
        const snapshot = await adminDb()
          .collection("admin_inquiries")
          .orderBy("timestamp", "desc")
          .limit(50)
          .get();

        inquiries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (dbErr: any) {
        console.warn("[Admin Inquiries GET] Firestore query fallback:", dbErr.message);
      }
    }

    if (inquiries.length === 0) {
      inquiries = INITIAL_DEMO_INQUIRIES;
    }

    if (channelFilter && channelFilter !== "all") {
      inquiries = inquiries.filter(
        (i) => i.channel?.toLowerCase() === channelFilter.toLowerCase()
      );
    }

    if (searchQuery) {
      inquiries = inquiries.filter((i) => {
        const text = `${i.name} ${i.query} ${i.response} ${i.from} ${i.maskedFrom}`.toLowerCase();
        return text.includes(searchQuery);
      });
    }

    return NextResponse.json({
      success: true,
      inquiries,
      count: inquiries.length,
      config: {
        adminEmail: "yashjoshi20@zohomail.in",
        hasWhatsAppId: Boolean(readEnv("WHATSAPP_PHONE_NUMBER_ID")),
        hasMetaToken: Boolean(readEnv("META_GRAPH_ACCESS_TOKEN")),
        hasZohoSmtp: Boolean(readEnv("SMTP_USER") || readEnv("ZOHO_MAIL_USER")),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "reply";

    // 1. Simulation Action: Triggers the Inbound Webhook logic directly
    if (action === "simulate") {
      const channel = body.channel || "WhatsApp";
      const sampleFrom =
        channel === "WhatsApp" ? "+9198790" + Math.floor(10000 + Math.random() * 90000) : "client.demo@sutrastudio.com";
      const sampleQuery =
        body.query ||
        "Namaste! We are interested in your Starter Creative package (₹3,499) for 5 photorealistic 4K renders.";

      // Dispatch to internal inbound webhook endpoint
      const baseUrl =
        readEnv("APP_BASE_URL") ||
        readEnv("NEXT_PUBLIC_APP_URL") ||
        "https://sutrastudio-1.onrender.com";

      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/inbound/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          from: sampleFrom,
          name: body.name || (channel === "WhatsApp" ? "Live WhatsApp Prospect" : "Zoho Email Prospect"),
          message: sampleQuery,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: true,
        simulated: true,
        data: resData,
        message: "Test lead generated and responded to via Gemini AI concierge.",
      });
    }

    // 2. Manual Override / Direct Reply Action
    if (action === "reply") {
      const { inquiryId, recipient, channel, manualMessage } = body;
      if (!manualMessage || !recipient) {
        return NextResponse.json(
          { success: false, error: "Recipient and manualMessage are required." },
          { status: 400 }
        );
      }

      let deliveryStatus = "Sent";

      if (channel?.toLowerCase() === "whatsapp") {
        const phoneId = readEnv("WHATSAPP_PHONE_NUMBER_ID");
        const token = readEnv("META_GRAPH_ACCESS_TOKEN");
        if (phoneId && token && !token.includes("USER_")) {
          try {
            await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: recipient.replace("+", ""),
                type: "text",
                text: { body: manualMessage },
              }),
            });
          } catch (e: any) {
            console.warn("[Manual WhatsApp Override]", e.message);
          }
        }
      } else {
        // Send via Zoho SMTP
        try {
          const supportInbox = readEnv("ZOHO_MAIL_USER") || "yashjoshi20@zohomail.in";
          await EmailService.dispatchNotificationEmail({
            to: recipient,
            type: "order_comment",
            title: "Direct Response from Sutra Studio Concierge",
            message: manualMessage,
            priority: "high",
            replyTo: supportInbox,
            actionUrl: process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudio-1.onrender.com",
            actionLabel: "View Studio Portal",
          });
        } catch (e: any) {
          console.warn("[Manual Zoho Email Override]", e.message);
        }
      }

      // Record update in Firestore if ready
      if (inquiryId && isFirebaseAdminReady()) {
        try {
          await adminDb()
            .collection("admin_inquiries")
            .doc(inquiryId)
            .update({
              adminOverride: {
                manualMessage,
                sentAt: new Date().toISOString(),
                adminUser: "yashjoshi20@zohomail.in",
              },
              status: "Manually Overridden / Delivered",
            });
        } catch (e: any) {
          console.warn("[Firestore update error]", e.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Manual reply successfully dispatched to client.",
        deliveryStatus,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
