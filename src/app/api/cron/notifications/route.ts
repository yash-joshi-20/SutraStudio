import { NextResponse } from "next/server";
import { ScheduledNotificationEngine } from "@/lib/services/scheduledNotificationEngine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const simulateDate = searchParams.get("simulateDate") || undefined;
    const dryRun = searchParams.get("dryRun") === "true";
    const orderId = searchParams.get("orderId") || undefined;

    // Verify CRON_SECRET or Admin header if specified in production
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const userRole = req.headers.get("x-user-role");

    if (cronSecret && cronSecret !== "mock_secret" && authHeader !== `Bearer ${cronSecret}` && userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const result = await ScheduledNotificationEngine.runDailyJob({
      simulateDate,
      dryRun,
      orderId,
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to execute scheduled notification job.", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const simulateDate = body.simulateDate || undefined;
    const dryRun = body.dryRun === true;
    const orderId = body.orderId || undefined;

    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const userRole = req.headers.get("x-user-role");

    if (cronSecret && cronSecret !== "mock_secret" && authHeader !== `Bearer ${cronSecret}` && userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const result = await ScheduledNotificationEngine.runDailyJob({
      simulateDate,
      dryRun,
      orderId,
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to execute scheduled notification job.", details: err.message },
      { status: 500 }
    );
  }
}
