import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { ClientsStore } from "@/lib/services/clientsStore";
import { QuotesStore } from "@/lib/services/quotesStore";
import { AuditLogService } from "@/lib/services/auditLogService";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Authentication required to export personal studio records." },
        { status: 401 }
      );
    }

    const client = ClientsStore.findById(userId || "") ||
      ClientsStore.getAll().find((c: any) => c.email === userEmail);

    const clientOrders = OrdersStore.getAll().filter(
      (o) => o.clientUid === userId || o.clientId === userId || o.clientEmail === userEmail
    );

    const clientQuotes = QuotesStore.getAll().filter(
      (q) => q.clientUid === userId || q.clientEmail === userEmail
    );

    const clientLogs = AuditLogService.getAll().filter(
      (l) => l.who.uid === userId || l.who.email.toLowerCase() === (userEmail || "").toLowerCase()
    );

    const exportBundle = {
      exportTimestamp: new Date().toISOString(),
      studio: "Sutra Studio",
      compliance: "DPDP Act (India) & GDPR Data Portability Bundle",
      clientProfile: client || {
        uid: userId,
        email: userEmail,
      },
      ordersCount: clientOrders.length,
      orders: clientOrders,
      quotesCount: clientQuotes.length,
      quotes: clientQuotes,
      securityAuditTrail: clientLogs,
    };

    // Log the data export event
    AuditLogService.record({
      who: {
        uid: userId || "usr_client",
        email: userEmail || "client@sutrastudio.com",
        name: client?.name || "Studio Client",
        role: "client",
      },
      what: "SYSTEM_CONFIG_UPDATED",
      targetType: "client",
      targetId: userId || userEmail || "usr_export",
      targetTitle: client?.name || "Personal Data Export",
      note: `Personal data package exported under DPDP / GDPR data portability provisions.`,
      type: "info",
    });

    return new Response(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="SutraStudio_Data_Export_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to compile personal data export.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
