import { NextResponse } from "next/server";
import { NotificationSettingsStore } from "@/lib/services/notificationSettingsStore";
import { requestRole } from "@/lib/auth/requestRole";

export async function GET(req: Request) {
  try {
    const role = await requestRole(req);
    if (role && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access to admin settings." }, { status: 403 });
    }

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
    const role = await requestRole(req);
    if (role && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access to update admin settings." }, { status: 403 });
    }

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
