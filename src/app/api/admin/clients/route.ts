import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";
import { ClientsStore } from "@/lib/services/clientsStore";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user.isAdmin && user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Administrative privileges required to access client directory." },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const query = url.searchParams.get("query") || undefined;
  const tier = url.searchParams.get("tier") || undefined;
  const clientId = url.searchParams.get("clientId");

  if (clientId) {
    const dossier = ClientsStore.getDossier(clientId);
    if (!dossier) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, dossier });
  }

  const directory = ClientsStore.getDirectory(query, tier);

  return NextResponse.json({
    success: true,
    totalCount: directory.length,
    clients: directory,
  });
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user.isAdmin && user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Administrative privileges required to modify client records." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const adminUser = {
      uid: user.uid || "usr_admin_001",
      email: user.email || "admin@sutrastudio.com",
      name: user.name || "Executive Producer",
      role: "admin",
    };

    if (action === "toggle_status") {
      const newStatus = body.status as "Active" | "Disabled" | "Under Review";
      const res = ClientsStore.toggleClientStatus({
        clientId,
        newStatus,
        reason: body.reason,
        adminUser,
      });
      if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
      return NextResponse.json({ success: true, profile: res.profile });
    }

    if (action === "resend_verification") {
      const res = ClientsStore.resendVerification({ clientId, adminUser });
      if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
      return NextResponse.json({ success: true, message: res.message });
    }

    if (action === "add_note") {
      const res = ClientsStore.addAdminNote({
        clientId,
        noteText: body.note || body.text || "",
        adminUser,
      });
      if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
      return NextResponse.json({ success: true, note: res.note });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
