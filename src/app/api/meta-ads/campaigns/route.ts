import { NextResponse } from "next/server";
import { requestRole } from "@/lib/auth/requestRole";

const campaigns: any[] = [];

export async function GET() {
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    // HARD GUARD: Meta ads must ONLY EVER be created in PAUSED status
    const camp = {
      id: `camp_${Date.now()}`,
      client_id: body.client_id || "client_default",
      name: body.name || "Meta Campaign",
      status: "PAUSED", // Meta ads must always be initialized as PAUSED
      budget: body.budget || 10000,
      currency: body.currency || "INR",
      created_at: now,
      updated_at: now,
    };
    campaigns.push(camp);
    return NextResponse.json({ success: true, campaign: camp, status: "PAUSED" });
  } catch {
    return NextResponse.json({ error: "Failed to register paused Meta campaign" }, { status: 400 });
  }
}
