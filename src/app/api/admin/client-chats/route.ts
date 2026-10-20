import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth/requestRole";
import { OrdersStore } from "@/lib/services/ordersStore";
import { ClientChatStore } from "@/lib/services/clientChatStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const orders = OrdersStore.getAll();
    const conversations = ClientChatStore.getAllConversations(orders);

    const url = new URL(req.url);
    const clientKey = url.searchParams.get("clientKey")?.trim();

    if (clientKey) {
      const match = conversations.find(
        (c) =>
          c.clientKey.toLowerCase() === clientKey.toLowerCase() ||
          c.clientEmail.toLowerCase() === clientKey.toLowerCase()
      );
      return NextResponse.json({
        conversation: match || null,
        messages: match ? match.messages : [],
      });
    }

    return NextResponse.json(
      {
        totalClients: conversations.length,
        conversations,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve client chats" },
      { status: 500 }
    );
  }
}
