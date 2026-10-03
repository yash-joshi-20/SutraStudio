/**
 * Admin → AI Console
 *
 * Server-side proxy for the knowledge base, feedback inbox, common-question
 * insights and AI system settings.
 *
 * Why this exists: `AiKnowledgeService` imports `firebase-admin`, so the admin
 * portal could never call it from a browser. Everything now goes through this
 * admin-gated route. The admin's uid and name are taken from the verified
 * session, never from the request body, so audit attribution cannot be forged.
 *
 * Shape: one `action` per request keeps a single authorisation check for all
 * nineteen call sites the admin UI previously made directly.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, notFound, ok, sameOrigin } from "@/lib/api/response";
import { AiKnowledgeService } from "@/lib/services/aiKnowledgeService";

export const dynamic = "force-dynamic";

const ACTIONS = [
  "getKnowledgeEntries",
  "getFeedbackList",
  "getCommonQuestions",
  "getAiSettings",
  "saveFeedback",
  "addKnowledgeEntry",
  "updateKnowledgeEntry",
  "deleteKnowledgeEntry",
  "updateAiSettings",
  "resetAiSettingsToDefault",
] as const;

type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && (ACTIONS as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as {
      action?: unknown;
      payload?: Record<string, unknown>;
    };

    if (!isAction(body.action)) {
      return badRequest(`action must be one of: ${ACTIONS.join(", ")}.`);
    }
    const action = body.action;
    const p = body.payload ?? {};

    switch (action) {
      case "getKnowledgeEntries":
        return ok({ entries: await AiKnowledgeService.getKnowledgeEntries() });

      case "getFeedbackList":
        return ok({ feedback: await AiKnowledgeService.getFeedbackList() });

      case "getCommonQuestions":
        return ok({ questions: await AiKnowledgeService.getCommonQuestions() });

      case "getAiSettings":
        return ok({ settings: await AiKnowledgeService.getAiSettings() });

      case "saveFeedback": {
        const rating = String(p.rating ?? "");
        if (rating !== "good" && rating !== "bad") {
          return badRequest("rating must be good or bad.");
        }
        if (!p.chatId || !p.messageId) {
          return badRequest("chatId and messageId are required.");
        }
        const saved = await AiKnowledgeService.saveFeedback({
          chatId: String(p.chatId),
          messageId: String(p.messageId),
          rating,
          correctedAnswer: p.correctedAnswer ? String(p.correctedAnswer) : undefined,
          // Attribution comes from the session, not the body.
          adminId: admin.uid,
          adminName: admin.name,
          userQuery: p.userQuery ? String(p.userQuery) : undefined,
          aiReply: p.aiReply ? String(p.aiReply) : undefined,
        });
        return ok({ feedback: saved });
      }

      case "addKnowledgeEntry": {
        if (!p.title || !p.answer || !p.category) {
          return badRequest("title, category and answer are required.");
        }
        const entry = await AiKnowledgeService.addKnowledgeEntry({
          title: String(p.title),
          category: p.category as never,
          question: p.question ? String(p.question) : undefined,
          answer: String(p.answer),
          status: p.status as never,
          source: "admin_manual",
        });
        return ok({ entry });
      }

      case "updateKnowledgeEntry": {
        const id = String(p.id ?? "");
        if (!id) return badRequest("id is required.");
        const updates = (p.updates ?? {}) as Record<string, unknown>;
        if (Object.keys(updates).length === 0) return badRequest("No changes supplied.");
        const entry = await AiKnowledgeService.updateKnowledgeEntry(id, updates as never);
        if (!entry) return notFound("That knowledge entry no longer exists.");
        return ok({ entry });
      }

      case "deleteKnowledgeEntry": {
        const id = String(p.id ?? "");
        if (!id) return badRequest("id is required.");
        const deleted = await AiKnowledgeService.deleteKnowledgeEntry(id);
        if (!deleted) return notFound("That knowledge entry no longer exists.");
        return ok({ deleted: true, id });
      }

      case "updateAiSettings": {
        const settings = (p.settings ?? {}) as Record<string, unknown>;
        if (Object.keys(settings).length === 0) return badRequest("No settings supplied.");
        const updated = await AiKnowledgeService.updateAiSettings(settings as never, admin.name);
        return ok({ settings: updated });
      }

      case "resetAiSettingsToDefault": {
        const settings = await AiKnowledgeService.resetAiSettingsToDefault(admin.name);
        return ok({ settings });
      }

      default:
        return NextResponse.json(
          { error: "Unsupported action.", code: "INVALID_ACTION" },
          { status: 400 }
        );
    }
  });
}
