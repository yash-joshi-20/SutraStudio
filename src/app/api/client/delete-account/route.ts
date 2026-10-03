import { NextResponse } from "next/server";
import { ClientsStore } from "@/lib/services/clientsStore";
import { NotificationsStore } from "@/lib/services/notificationsStore";
import { AuditLogService } from "@/lib/services/auditLogService";
import { sanitizeInputText } from "@/lib/security/sanitize";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Authentication required to submit an account deletion request." },
        { status: 401 }
      );
    }

    const { reason, confirmText } = await req.json();

    if (confirmText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Please type 'DELETE MY ACCOUNT' to confirm your deletion request." },
        { status: 400 }
      );
    }

    const client = ClientsStore.findById(userId || "") ||
      ClientsStore.getAll().find((c: any) => c.email === userEmail);

    if (client) {
      // Mark account as pending deletion / disabled
      client.status = "Disabled";
      if (!client.adminNotes) client.adminNotes = [];
      client.adminNotes.push({
        id: `note_del_${Date.now()}`,
        authorName: "Security Compliance System",
        text: `[Account Deletion Requested on ${new Date().toISOString()}]: Reason: ${sanitizeInputText(reason || "None provided")}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Record in immutable security audit log
    AuditLogService.record({
      who: {
        uid: userId || "usr_client",
        email: userEmail || "client@sutrastudio.com",
        name: client?.name || "Studio Client",
        role: "client",
      },
      what: "CLIENT_STATUS_TOGGLED",
      targetType: "client",
      targetId: userId || userEmail || "usr_delete",
      targetTitle: client?.name || userEmail || "Client Account",
      note: `Account deletion requested by client. Reason: ${sanitizeInputText(reason || "None provided")}`,
      type: "warning",
    });

    // Alert Studio Admin
    NotificationsStore.add({
      userId: "usr_admin_001",
      type: "status_update",
      title: "Account Deletion Request",
      message: `Client ${client?.name || userEmail} requested account deletion. Account has been disabled.`,
      actionUrl: `/admin`,
      actionLabel: "Review in Directory",
    });

    return NextResponse.json({
      success: true,
      message:
        "Your account deletion request has been registered. Your account is now disabled and personal data will be purged in compliance with DPDP & GDPR standards.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to submit account deletion request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
