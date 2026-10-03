import { NextResponse } from "next/server";
import { NotificationsStore } from "@/lib/services/notificationsStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const callerId = req.headers.get("x-user-id") || searchParams.get("userId") || "usr_mock_001";
    const callerRole = req.headers.get("x-user-role") || searchParams.get("role") || "client";

    const targetUserId = callerRole === "admin" ? "usr_admin_001" : callerId;
    const notifications = NotificationsStore.getAll(targetUserId);
    const unreadCount = NotificationsStore.getUnreadCount(targetUserId);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const callerId = req.headers.get("x-user-id") || "usr_mock_001";
    const callerRole = req.headers.get("x-user-role") || "client";
    const targetUserId = callerRole === "admin" ? "usr_admin_001" : callerId;

    const body = await req.json().catch(() => ({}));

    if (body.markAllAsRead) {
      const count = NotificationsStore.markAllAsRead(targetUserId);
      return NextResponse.json({
        success: true,
        message: `Marked ${count} notifications as read.`,
        unreadCount: 0,
      });
    }

    if (body.id) {
      const marked = NotificationsStore.markAsRead(body.id, targetUserId);
      return NextResponse.json({
        success: marked,
        unreadCount: NotificationsStore.getUnreadCount(targetUserId),
      });
    }

    return NextResponse.json(
      { error: "Provide notification id or markAllAsRead flag." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update notification status." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.message || !body.userId) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, userId." },
        { status: 400 }
      );
    }

    const created = NotificationsStore.add({
      userId: body.userId,
      type: body.type || "order_in_progress",
      title: body.title,
      message: body.message,
      orderId: body.orderId,
      orderNumber: body.orderNumber,
    });

    return NextResponse.json({
      success: true,
      notification: created,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create notification." },
      { status: 500 }
    );
  }
}
