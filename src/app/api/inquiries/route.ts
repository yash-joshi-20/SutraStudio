import { NextResponse } from "next/server";

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

    // In production, stores in Firestore `inquiries` and dispatches notification
    return NextResponse.json({
      success: true,
      inquiryId,
      message: "Inquiry received and assigned to client concierge.",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
