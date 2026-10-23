import { NextResponse } from "next/server";
import { EmailService } from "@/lib/services/emailProvider";
import { readEnv } from "@/lib/config/env";
import { adminDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`inquiry_${ip}`, { maxRequests: 5, windowSeconds: 300 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many inquiries submitted from this connection. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.resetInSeconds) } }
      );
    }

    const body = await req.json();

    // Honeypot check: reject spam bots silently
    if (body.website || body.honeypot || body._gotcha || body.company_url_hp) {
      return NextResponse.json({
        success: true,
        inquiryId: `inq_${Date.now()}`,
        message: "Inquiry received and assigned to client concierge.",
        createdAt: new Date().toISOString(),
      });
    }

    const name = String(body.name || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
    const message = String(body.message || "").trim().slice(0, 4000);
    const phone = body.phone ? String(body.phone).trim().slice(0, 30) : null;
    const service = body.service ? String(body.service).trim().slice(0, 100) : "General Inquiry";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const inquiryId = `inq_${Date.now()}`;
    const supportInbox =
      readEnv("SUPPORT_INBOX_EMAIL") ||
      readEnv("ADMIN_EMAIL") ||
      readEnv("EMAIL_REPLY_TO") ||
      "yashjoshi20@zohomail.in";

    // 1. Record inquiry in Firestore
    try {
      await adminDb().collection("inquiries").doc(inquiryId).set({
        id: inquiryId,
        name,
        email,
        phone,
        service,
        message,
        createdAt: new Date().toISOString(),
        status: "new",
      });
    } catch {
      // Non-blocking if running offline
    }

    // 2. Dispatch real-time in-app notification to Admin
    try {
      const { NotificationsStore } = await import("@/lib/services/notificationsStore");
      NotificationsStore.add({
        userId: "usr_admin_001",
        type: "order_comment",
        title: `New Contact Inquiry: ${body.name}`,
        message: `${body.name} (${body.email}) sent an inquiry: "${body.message.slice(0, 100)}..."`,
        actionUrl: "/admin",
        actionLabel: "Inspect Inquiries",
      });
    } catch {}

    // 3. Dispatch notification to studio support inbox with Reply-To set to the client's email
    await EmailService.dispatchNotificationEmail({
      to: supportInbox,
      type: "new_inquiry",
      title: `New Studio Inquiry: ${body.name}`,
      message: `A new client inquiry has been submitted by ${body.name} (${body.email}):\n\n"${body.message}"\n\nService: ${body.service || "General"}`,
      priority: "high",
      replyTo: body.email,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudios.in"}/admin/leads`,
      actionLabel: "View Inquiries in Studio Admin",
    });

    return NextResponse.json({
      success: true,
      inquiryId,
      message: "Inquiry received and assigned to client concierge.",
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process inquiry", details: error.message },
      { status: 500 }
    );
  }
}
