import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      comments: order.comments || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const callerId = await requestUid(req);
    const callerRole = await requestRole(req);
    const body = await req.json();

    const { orderId, text, authorName, attachmentUrl, attachmentName } = body;

    if (!orderId || !text?.trim()) {
      return NextResponse.json(
        { error: "orderId and non-empty text are required." },
        { status: 400 }
      );
    }

    const result = OrdersStore.addOrderComment({
      orderId,
      sender: callerRole === "admin" ? "admin" : "client",
      authorName: authorName || (callerRole === "admin" ? "Studio Executive Producer" : "Studio Client"),
      text,
      attachmentUrl,
      attachmentName,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to add comment" }, { status: 400 });
    }

    // Persist to Firestore if available
    try {
      const db = adminDb();
      if (db) {
        const order = OrdersStore.findById(orderId);
        if (order) {
          await db.collection("orders").doc(order.id).set(
            {
              comments: order.comments,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }
    } catch (dbErr) {
      console.warn("[Orders Comments API] Firestore sync warning:", dbErr);
    }

    // Dispatch asynchronous email copy to the recipient
    setTimeout(async () => {
      try {
        const { EmailService } = await import("@/lib/services/emailProvider");
        const provider = EmailService.getProvider();
        const order = OrdersStore.findById(orderId);
        if (order) {
          const adminMailbox = process.env.ADMIN_EMAIL?.trim() || "";
          const recipientEmail =
            callerRole === "admin"
              ? order.clientEmail?.trim() || ""
              : adminMailbox;

          // No real recipient means no email. A placeholder address would
          // silently deliver order notes to a stranger, so we skip instead.
          if (!recipientEmail) return;

          await provider.sendEmail({
            to: recipientEmail,
            subject: `New Note on Order #${order.orderNumber || order.code} — Sutra Studio`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #171717; background: #FAF9F5; padding: 24px; border-radius: 12px; border: 1px solid #E5E1D8;">
                <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">New Discussion Note</h2>
                <p style="color: #737373; font-size: 14px;"><strong>Order:</strong> #${order.orderNumber || order.code} (${order.service})</p>
                <p style="color: #737373; font-size: 14px;"><strong>Author:</strong> ${authorName || callerRole}</p>
                <div style="background: #FFFFFF; padding: 16px; border-radius: 8px; border: 1px solid #E5E1D8; margin: 16px 0; font-size: 14px; line-height: 1.6;">
                  ${text.replace(/\n/g, "<br/>")}
                  ${attachmentUrl ? `<p style="margin-top: 12px; font-size: 13px;"><a href="${attachmentUrl}" style="color: #A98B57; text-decoration: underline;">📎 View Attachment (${attachmentName || "File"})</a></p>` : ""}
                </div>
                <p style="font-size: 13px; color: #737373;">Reply directly in the Sutra Studio Portal.</p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.warn("[Orders Comments API] Email dispatch warning:", emailErr);
      }
    }, 50);

    return NextResponse.json({
      success: true,
      comment: result.comment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post comment" }, { status: 500 });
  }
}
