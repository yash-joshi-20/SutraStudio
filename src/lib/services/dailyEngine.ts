/**
 * SUTRA STUDIO — Monthly Daily Content Engine
 * Scheduler in client's timezone, 7-day content calendar,
 * topic history to avoid repeats, per-plan daily credits/cost caps,
 * delivery mode (admin review first or auto-deliver), pause on failed payment,
 * carry-forward for missed days, failure alerts.
 */

import { adminDb } from "@/lib/firebase/admin";
import type { BrandKit } from "./brandKitStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyPlan {
  id: string;
  clientUid: string;
  brandKitId: string;
  subscriptionId: string;

  // Schedule
  timezone: string; // e.g. "Asia/Kolkata"
  deliveryTime: string; // e.g. "09:00" (24h format)
  deliveryMode: "admin_review" | "auto_deliver";

  // Credits & limits
  dailyImageCredits: number; // e.g. 1
  dailyVideoCredits: number; // e.g. 1
  dailyCostCapUSD: number; // e.g. 1.00
  monthlyBudgetCapUSD: number; // e.g. 25.00
  currentMonthCostUSD: number;

  // Carry-forward
  carryForwardEnabled: boolean;
  carriedImageCredits: number;
  carriedVideoCredits: number;

  // Status
  status: "active" | "paused" | "expired" | "cancelled" | "trial" | "payment_failed";
  pauseReason?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  renewalDate?: string;
  expiryDate?: string;

  // Content preferences
  contentTypes: ("image" | "video" | "banner")[];
  excludeWeekends: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ContentCalendarDay {
  id: string;
  dailyPlanId: string;
  clientUid: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0-6

  // Planned content
  topics: Array<{
    topic: string;
    keyword: string;
    source: string;
    approved: boolean;
  }>;

  // Generation status per content type
  imageStatus: "planned" | "generating" | "draft_ready" | "approved" | "delivered" | "failed" | "skipped";
  videoStatus: "planned" | "generating" | "draft_ready" | "approved" | "delivered" | "failed" | "skipped";

  // Output references
  imageOutputId?: string;
  videoOutputId?: string;
  bannerOutputId?: string;

  // Cost
  totalCostUSD: number;

  // Notes
  clientNote?: string;
  adminNote?: string;

  createdAt: string;
  updatedAt: string;
}

export interface TopicHistory {
  id: string;
  clientUid: string;
  brandKitId: string;
  topic: string;
  keyword: string;
  usedAt: string;
  orderId?: string;
  dailyPlanId?: string;
}

export interface DailyEngineConfig {
  // Reminder settings
  trialReminderDays: 3; // days before trial expires
  renewalReminderDays: 5; // days before renewal
  expiryReminderDays: 5; // days before expiry

  // Default credits
  defaultImageCreditsPerDay: 1;
  defaultVideoCreditsPerDay: 1;

  // Cost caps
  defaultDailyCostCapUSD: 1.0;
  defaultMonthlyCostCapUSD: 25.0;

  // Carry-forward
  maxCarryForwardDays: 3;
}

export const DEFAULT_ENGINE_CONFIG: DailyEngineConfig = {
  trialReminderDays: 3,
  renewalReminderDays: 5,
  expiryReminderDays: 5,
  defaultImageCreditsPerDay: 1,
  defaultVideoCreditsPerDay: 1,
  defaultDailyCostCapUSD: 1.0,
  defaultMonthlyCostCapUSD: 25.0,
  maxCarryForwardDays: 3,
};

// ---------------------------------------------------------------------------
// Daily Plan Store
// ---------------------------------------------------------------------------

const PLANS_COLLECTION = "daily_plans";
const CALENDAR_COLLECTION = "content_calendar";
const TOPIC_HISTORY_COLLECTION = "topic_history";

export class DailyPlanStore {
  static async create(plan: DailyPlan): Promise<DailyPlan> {
    const db = adminDb();
    await db.collection(PLANS_COLLECTION).doc(plan.id).set(plan);
    return plan;
  }

  static async getById(planId: string): Promise<DailyPlan | null> {
    const db = adminDb();
    const doc = await db.collection(PLANS_COLLECTION).doc(planId).get();
    if (!doc.exists) return null;
    return doc.data() as DailyPlan;
  }

  static async getActiveForClient(clientUid: string): Promise<DailyPlan | null> {
    const db = adminDb();
    const snap = await db
      .collection(PLANS_COLLECTION)
      .where("clientUid", "==", clientUid)
      .where("status", "in", ["active", "trial"])
      .limit(1)
      .get();
    if (!snap || !snap.docs || snap.docs.length === 0) return null;
    return snap.docs[0].data() as DailyPlan;
  }

  static async update(planId: string, updates: Partial<DailyPlan>): Promise<void> {
    const db = adminDb();
    await db.collection(PLANS_COLLECTION).doc(planId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  static async pause(planId: string, reason: string): Promise<void> {
    await DailyPlanStore.update(planId, {
      status: "paused",
      pauseReason: reason,
    });
  }

  static async resume(planId: string): Promise<void> {
    await DailyPlanStore.update(planId, {
      status: "active",
      pauseReason: undefined,
    });
  }

  /** Admin: list all active plans */
  static async listAllActive(): Promise<DailyPlan[]> {
    const db = adminDb();
    const snap = await db
      .collection(PLANS_COLLECTION)
      .where("status", "in", ["active", "trial"])
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as DailyPlan);
  }
}

// ---------------------------------------------------------------------------
// Content Calendar Store
// ---------------------------------------------------------------------------

export class ContentCalendarStore {
  static async upsertDay(day: ContentCalendarDay): Promise<void> {
    const db = adminDb();
    await db.collection(CALENDAR_COLLECTION).doc(day.id).set(day);
  }

  static async getDay(dailyPlanId: string, date: string): Promise<ContentCalendarDay | null> {
    const id = `${dailyPlanId}_${date}`;
    const db = adminDb();
    const doc = await db.collection(CALENDAR_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as ContentCalendarDay;
  }

  static async getWeek(dailyPlanId: string, startDate: string): Promise<ContentCalendarDay[]> {
    const db = adminDb();
    const endDate = new Date(new Date(startDate).getTime() + 7 * 86400000)
      .toISOString()
      .split("T")[0];

    const snap = await db
      .collection(CALENDAR_COLLECTION)
      .where("dailyPlanId", "==", dailyPlanId)
      .where("date", ">=", startDate)
      .where("date", "<", endDate)
      .orderBy("date", "asc")
      .get();

    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as ContentCalendarDay);
  }

  static async updateDayStatus(
    dayId: string,
    field: "imageStatus" | "videoStatus",
    status: ContentCalendarDay["imageStatus"],
    outputId?: string
  ): Promise<void> {
    const db = adminDb();
    const updates: Record<string, any> = {
      [field]: status,
      updatedAt: new Date().toISOString(),
    };
    if (outputId) {
      updates[field.replace("Status", "OutputId")] = outputId;
    }
    await db.collection(CALENDAR_COLLECTION).doc(dayId).update(updates);
  }
}

// ---------------------------------------------------------------------------
// Topic History (avoid repeats)
// ---------------------------------------------------------------------------

export class TopicHistoryStore {
  static async record(entry: TopicHistory): Promise<void> {
    const db = adminDb();
    await db.collection(TOPIC_HISTORY_COLLECTION).doc(entry.id).set(entry);
  }

  static async getRecentTopics(
    clientUid: string,
    brandKitId: string,
    limit = 30
  ): Promise<string[]> {
    const db = adminDb();
    const snap = await db
      .collection(TOPIC_HISTORY_COLLECTION)
      .where("clientUid", "==", clientUid)
      .where("brandKitId", "==", brandKitId)
      .orderBy("usedAt", "desc")
      .limit(limit)
      .get();

    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => (d.data() as TopicHistory).topic);
  }
}

// ---------------------------------------------------------------------------
// Daily Engine Scheduler Logic
// ---------------------------------------------------------------------------

/**
 * Generate a 7-day content calendar with unique topics
 */
export async function generateWeeklyCalendar(
  plan: DailyPlan,
  brandKit: BrandKit,
  startDate: string
): Promise<ContentCalendarDay[]> {
  // Get recent topics to avoid
  const recentTopics = await TopicHistoryStore.getRecentTopics(
    plan.clientUid,
    plan.brandKitId,
    60
  );

  // Import trend research (dynamic import to avoid circular deps)
  const { researchTrends } = await import("./aiPipeline");
  const trends = await researchTrends(
    brandKit.industry,
    brandKit.region || "India",
    brandKit.contentKeywords
  );

  // Filter out recently used topics
  const availableTopics = trends.filter(
    (t) => !recentTopics.includes(t.topic)
  );

  const calendar: ContentCalendarDay[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start.getTime() + i * 86400000);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    // Skip weekends if configured
    if (plan.excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue;
    }

    const dayTopic = availableTopics[i % Math.max(availableTopics.length, 1)] || {
      topic: `${brandKit.industry} content for ${dateStr}`,
      keyword: brandKit.industry,
      source: "fallback",
    };

    const dayId = `${plan.id}_${dateStr}`;
    const day: ContentCalendarDay = {
      id: dayId,
      dailyPlanId: plan.id,
      clientUid: plan.clientUid,
      date: dateStr,
      dayOfWeek,
      topics: [
        {
          topic: dayTopic.topic,
          keyword: dayTopic.keyword || dayTopic.topic,
          source: dayTopic.source || "trend",
          approved: false,
        },
      ],
      imageStatus: plan.contentTypes.includes("image") ? "planned" : "skipped",
      videoStatus: plan.contentTypes.includes("video") ? "planned" : "skipped",
      totalCostUSD: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    calendar.push(day);
    await ContentCalendarStore.upsertDay(day);
  }

  return calendar;
}

/**
 * Check if plan needs attention (trial expiring, renewal due, etc.)
 */
export function checkPlanAlerts(plan: DailyPlan): Array<{
  type: "trial_expiring" | "renewal_due" | "expiry_warning" | "payment_failed" | "budget_exceeded" | "credits_exhausted";
  message: string;
  daysLeft?: number;
  severity: "info" | "warning" | "critical";
}> {
  const alerts: Array<{
    type: any;
    message: string;
    daysLeft?: number;
    severity: "info" | "warning" | "critical";
  }> = [];
  const now = new Date();

  // Trial expiry check
  if (plan.status === "trial" && plan.trialEndDate) {
    const daysLeft = Math.ceil(
      (new Date(plan.trialEndDate).getTime() - now.getTime()) / 86400000
    );
    if (daysLeft <= DEFAULT_ENGINE_CONFIG.trialReminderDays && daysLeft > 0) {
      alerts.push({
        type: "trial_expiring",
        message: `Free trial expires in ${daysLeft} day(s). Subscribe to continue daily content.`,
        daysLeft,
        severity: daysLeft <= 1 ? "critical" : "warning",
      });
    }
  }

  // Renewal reminder
  if (plan.status === "active" && plan.renewalDate) {
    const daysLeft = Math.ceil(
      (new Date(plan.renewalDate).getTime() - now.getTime()) / 86400000
    );
    if (daysLeft <= DEFAULT_ENGINE_CONFIG.renewalReminderDays && daysLeft > 0) {
      alerts.push({
        type: "renewal_due",
        message: `Subscription renews in ${daysLeft} day(s).`,
        daysLeft,
        severity: "info",
      });
    }
  }

  // Expiry warning
  if (plan.expiryDate) {
    const daysLeft = Math.ceil(
      (new Date(plan.expiryDate).getTime() - now.getTime()) / 86400000
    );
    if (daysLeft <= DEFAULT_ENGINE_CONFIG.expiryReminderDays && daysLeft > 0) {
      alerts.push({
        type: "expiry_warning",
        message: `Plan expires in ${daysLeft} day(s). Renew to keep daily content.`,
        daysLeft,
        severity: daysLeft <= 2 ? "critical" : "warning",
      });
    }
  }

  // Payment failed
  if (plan.status === "payment_failed") {
    alerts.push({
      type: "payment_failed",
      message: "Daily content is paused due to failed payment. Please update your payment method.",
      severity: "critical",
    });
  }

  // Budget exceeded
  if (plan.currentMonthCostUSD >= plan.monthlyBudgetCapUSD) {
    alerts.push({
      type: "budget_exceeded",
      message: `Monthly cost cap reached ($${plan.currentMonthCostUSD.toFixed(2)} / $${plan.monthlyBudgetCapUSD.toFixed(2)}).`,
      severity: "warning",
    });
  }

  return alerts;
}

/**
 * Process carry-forward credits for missed days
 */
export async function processCarryForward(plan: DailyPlan): Promise<{
  carriedImages: number;
  carriedVideos: number;
}> {
  if (!plan.carryForwardEnabled) {
    return { carriedImages: 0, carriedVideos: 0 };
  }

  // Check last N days for missed content
  const today = new Date().toISOString().split("T")[0];
  const maxDays = DEFAULT_ENGINE_CONFIG.maxCarryForwardDays;
  let missedImages = 0;
  let missedVideos = 0;

  for (let i = 1; i <= maxDays; i++) {
    const pastDate = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    const day = await ContentCalendarStore.getDay(plan.id, pastDate);

    if (day) {
      if (day.imageStatus === "failed" || day.imageStatus === "skipped") {
        missedImages++;
      }
      if (day.videoStatus === "failed" || day.videoStatus === "skipped") {
        missedVideos++;
      }
    }
  }

  // Update plan with carry-forward credits
  if (missedImages > 0 || missedVideos > 0) {
    await DailyPlanStore.update(plan.id, {
      carriedImageCredits: Math.min(missedImages, maxDays),
      carriedVideoCredits: Math.min(missedVideos, maxDays),
    });
  }

  return {
    carriedImages: Math.min(missedImages, maxDays),
    carriedVideos: Math.min(missedVideos, maxDays),
  };
}
