import { NextResponse } from "next/server";
import { EmailService } from "@/lib/services/emailProvider";
import { readEnv } from "@/lib/config/env";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const inquiryId = `inq_${Date.now()}`;
    const supportInbox =
      readEnv("SUPPORT_INBOX_EMAIL") ||
      readEnv("ADMIN_EMAIL") ||
      readEnv("EMAIL_REPLY_TO") ||
      "concierge@sutrastudio.com";

    // 1. Record inquiry in Firestore
    try {
      await adminDb().collection("inquiries").doc(inquiryId).set({
        id: inquiryId,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        service: body.service || "General Inquiry",
        message: body.message,
        createdAt: new Date().toISOString(),
        status: "new",
      });
    } catch {
      // Non-blocking if running offline
    }

    // 2. Dispatch notification to studio support inbox with Reply-To set to the client's email
    await EmailService.dispatchNotificationEmail({
      to: supportInbox,
      type: "new_inquiry",
      title: `New Studio Inquiry: ${body.name}`,
      message: `A new client inquiry has been submitted by ${body.name} (${body.email}):\n\n"${body.message}"\n\nService: ${body.service || "General"}`,
      priority: "high",
      replyTo: body.email,
      actionUrl: `https://sutrastudio.com/admin/leads`,
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
