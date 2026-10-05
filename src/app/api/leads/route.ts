import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

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
    const body = await req.json();
    if (!body.name || (!body.email && !body.phone)) {
      return NextResponse.json(
        { error: "Name and either email or phone number are required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lead = {
      id: leadId,
      name: String(body.name).trim(),
      email: body.email ? String(body.email).trim().toLowerCase() : "",
      phone: body.phone ? String(body.phone).trim() : "",
      company: body.company ? String(body.company).trim() : "",
      requirement: body.requirement ? String(body.requirement).trim() : "",
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
