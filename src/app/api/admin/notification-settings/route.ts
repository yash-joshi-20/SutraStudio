import { NextResponse } from "next/server";
import { NotificationSettingsStore } from "@/lib/services/notificationSettingsStore";
import { assertAdminSession } from "@/lib/auth/requestRole";

export async function GET(req: Request) {
  try {
    const auth = await assertAdminSession(req);
    if (!auth.ok) return auth.response;

    const settings = NotificationSettingsStore.getSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch notification settings.", details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await assertAdminSession(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const updated = NotificationSettingsStore.updateSettings(body);

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Notification automation settings saved.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update notification settings.", details: err.message },
      { status: 500 }
    );
  }
}
