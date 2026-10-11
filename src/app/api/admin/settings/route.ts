import { NextResponse } from "next/server";
import { StudioSettingsStore } from "@/lib/services/studioSettingsStore";
import { requestRole, assertAdminSession } from "@/lib/auth/requestRole";

export async function GET(req: Request) {
  const userRole = await requestRole(req);
  const settings = StudioSettingsStore.getSettings();

  if (userRole === "admin") {
    return NextResponse.json({ success: true, settings });
  }

  // Public/Client view: only expose whether GST is enabled and client-facing policies
  return NextResponse.json({
    success: true,
    settings: {
      enableGst: settings.enableGst,
      gstPercentage: settings.enableGst ? settings.gstPercentage : 0,
      studioLegalName: settings.studioLegalName,
      couponsEnabled: settings.couponsEnabled,
      refundPolicy: settings.refundPolicy,
    },
  });
}

export async function POST(req: Request) {
  const auth = await assertAdminSession(req);
  if (!auth.ok) return auth.response;

  try {
    const updates = await req.json();
    const updated = StudioSettingsStore.updateSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update studio settings.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
