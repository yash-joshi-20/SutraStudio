import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.isAuthenticated || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required to view leads." },
        { status: 401 }
      );
    }

    if (!isFirebaseAdminReady()) {
      return NextResponse.json({ leads: [] });
    }

    const snapshot = await adminDb().collection("leads").orderBy("createdAt", "desc").get();
    const leads: any[] = [];
    snapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ leads, totalCount: leads.length });
  } catch (error) {
    console.error("[Leads API] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`lead_${ip}`, { maxRequests: 10, windowSeconds: 300 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many lead submissions from this connection. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.resetInSeconds) } }
      );
    }

    const body = await req.json();

    // Honeypot check: reject bots silently
    if (body.website_hp || body.honeypot || body._gotcha) {
      return NextResponse.json(
        { success: true, lead: { id: `lead_${Date.now()}`, name: body.name || "Lead" } },
        { status: 201 }
      );
    }

    const name = String(body.name || "").trim().slice(0, 100);
    const email = body.email ? String(body.email).trim().toLowerCase().slice(0, 120) : "";
    const phone = body.phone ? String(body.phone).trim().slice(0, 30) : "";
    const company = body.company ? String(body.company).trim().slice(0, 120) : "";
    const requirement = body.requirement ? String(body.requirement).trim().slice(0, 4000) : "";

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name and either email or phone number are required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lead = {
      id: leadId,
      name,
      email,
      phone,
      company,
      requirement,
      status: body.status || "New",
      source: body.source || "chatbot",
      client_id: body.client_id || "",
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseAdminReady()) {
      await adminDb().collection("leads").doc(leadId).set(lead);
    }

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 400 });
  }
}
