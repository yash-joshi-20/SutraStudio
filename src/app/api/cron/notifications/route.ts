import { NextResponse } from "next/server";
import { ScheduledNotificationEngine } from "@/lib/services/scheduledNotificationEngine";
import { authorizeScheduledCall } from "@/lib/api/cronAuth";

export const dynamic = "force-dynamic";

/**
 * Daily / on-demand scheduled job: order lifecycle, trial expiry, 5-day and
 * 1-day reminder windows. Invoked by n8n or an external cron with
 * `Authorization: Bearer <N8N_WEBHOOK_SECRET>` (or CRON_SECRET / an admin
 * session for the Admin "Run now" button).
 */
async function run(req: Request, input: { simulateDate?: string; dryRun?: boolean; orderId?: string }) {
  if (!(await authorizeScheduledCall(req))) {
    return NextResponse.json({ error: "Unauthorized scheduled execution." }, { status: 401 });
  }

  try {
    const result = await ScheduledNotificationEngine.runDailyJob(input);
    return NextResponse.json({ timestamp: new Date().toISOString(), ...result });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to execute scheduled notification job.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return run(req, {
    simulateDate: searchParams.get("simulateDate") ?? undefined,
    dryRun: searchParams.get("dryRun") === "true",
    orderId: searchParams.get("orderId") ?? undefined,
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    simulateDate?: string;
    dryRun?: boolean;
    orderId?: string;
  };
  return run(req, {
    simulateDate: body.simulateDate,
    dryRun: body.dryRun === true,
    orderId: body.orderId,
  });
}
