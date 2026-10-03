/**
 * SUTRA STUDIO — Daily Content Engine API
 * Manage daily plans, content calendar, topic history.
 */

import { NextResponse } from "next/server";
import { DailyPlanStore, ContentCalendarStore, generateWeeklyCalendar, checkPlanAlerts, processCarryForward } from "@/lib/services/dailyEngine";
import { BrandKitStore } from "@/lib/services/brandKitStore";

export async function POST(req: Request) {
  try {
    const clientUid = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "get_plan": {
        const plan = await DailyPlanStore.getActiveForClient(clientUid);
        if (!plan) {
          return NextResponse.json({ plan: null, alerts: [] });
        }
        const alerts = checkPlanAlerts(plan);
        return NextResponse.json({ plan, alerts });
      }

      case "generate_calendar": {
        const plan = await DailyPlanStore.getActiveForClient(clientUid);
        if (!plan) {
          return NextResponse.json({ error: "No active daily plan." }, { status: 400 });
        }

        const brandKit = await BrandKitStore.getById(plan.brandKitId, clientUid);
        if (!brandKit) {
          return NextResponse.json({ error: "Brand Kit not found." }, { status: 400 });
        }

        const startDate = body.startDate || new Date().toISOString().split("T")[0];
        const calendar = await generateWeeklyCalendar(plan, brandKit, startDate);
        return NextResponse.json({ calendar });
      }

      case "get_calendar": {
        const plan = await DailyPlanStore.getActiveForClient(clientUid);
        if (!plan) {
          return NextResponse.json({ calendar: [] });
        }
        const startDate = body.startDate || new Date().toISOString().split("T")[0];
        const calendar = await ContentCalendarStore.getWeek(plan.id, startDate);
        return NextResponse.json({ calendar });
      }

      case "approve_topic": {
        const { dayId, topicIndex } = body;
        const day = await ContentCalendarStore.getDay(body.dailyPlanId, body.date);
        if (!day) {
          return NextResponse.json({ error: "Calendar day not found." }, { status: 404 });
        }

        const topics = [...day.topics];
        if (topicIndex < topics.length) {
          topics[topicIndex].approved = true;
        }

        await ContentCalendarStore.upsertDay({ ...day, topics, updatedAt: new Date().toISOString() });
        return NextResponse.json({ success: true });
      }

      case "change_topic": {
        const { dayId: cDayId, topicIndex: cIdx, newTopic, newKeyword } = body;
        const cDay = await ContentCalendarStore.getDay(body.dailyPlanId, body.date);
        if (!cDay) {
          return NextResponse.json({ error: "Calendar day not found." }, { status: 404 });
        }

        const cTopics = [...cDay.topics];
        if (cIdx < cTopics.length) {
          cTopics[cIdx] = {
            ...cTopics[cIdx],
            topic: newTopic,
            keyword: newKeyword || newTopic,
            source: "client_override",
            approved: true,
          };
        }

        await ContentCalendarStore.upsertDay({ ...cDay, topics: cTopics, updatedAt: new Date().toISOString() });
        return NextResponse.json({ success: true });
      }

      case "process_carry_forward": {
        const plan = await DailyPlanStore.getActiveForClient(clientUid);
        if (!plan) {
          return NextResponse.json({ error: "No active daily plan." }, { status: 400 });
        }
        const result = await processCarryForward(plan);
        return NextResponse.json({ success: true, ...result });
      }

      // Admin actions
      case "pause_plan": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await DailyPlanStore.pause(body.planId, body.reason || "Paused by admin");
        return NextResponse.json({ success: true });
      }

      case "resume_plan": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await DailyPlanStore.resume(body.planId);
        return NextResponse.json({ success: true });
      }

      case "list_all_active": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        const plans = await DailyPlanStore.listAllActive();
        return NextResponse.json({ plans });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Daily engine error." }, { status: 500 });
  }
}
