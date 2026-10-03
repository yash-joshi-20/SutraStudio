import { NextResponse } from "next/server";
import { QuotesStore } from "@/lib/services/quotesStore";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { sanitizeInputText } from "@/lib/security/sanitize";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

export async function GET(req: Request) {
  const userRole = await requestRole(req);
  const userId = await requestUid(req);
  const all = QuotesStore.getAll();

  if (userRole === "admin") {
    return NextResponse.json({ success: true, quotes: all });
  }

  // Client view: filter by their own clientUid
  const userQuotes = all.filter((q) => q.clientUid === userId || q.clientEmail === req.headers.get("x-user-email"));
  return NextResponse.json({ success: true, quotes: userQuotes });
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`quote_req_${ip}`, { maxRequests: 20, windowSeconds: 60 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many quote submissions. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      action, // "request" | "send_proposal" | "accept"
      quoteId,
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      service,
      brief,
      requestedTimeline,
      estimatedBudgetINR,
      attachments,
      // Proposal params
      quotedAmountINR,
      scopeBreakdown,
      deliverables,
      validDays,
      adminNotes,
    } = body;

    const userRole = await requestRole(req);
    const userId = await requestUid(req);

    // Action A: Request Custom Quote (Client or Visitor)
    if (!action || action === "request") {
      if (!clientName || !clientEmail || !service || !brief) {
        return NextResponse.json(
          { error: "Missing required fields: clientName, clientEmail, service, brief." },
          { status: 400 }
        );
      }

      const quote = QuotesStore.requestQuote({
        clientUid: userId || undefined,
        clientName: sanitizeInputText(clientName),
        clientEmail: sanitizeInputText(clientEmail),
        clientPhone: sanitizeInputText(clientPhone),
        companyName: sanitizeInputText(companyName),
        service: sanitizeInputText(service),
        brief: sanitizeInputText(brief),
        requestedTimeline: sanitizeInputText(requestedTimeline),
        estimatedBudgetINR: typeof estimatedBudgetINR === "number" ? estimatedBudgetINR : undefined,
        attachments,
      });

      return NextResponse.json({ success: true, quote }, { status: 201 });
    }

    // Action B: Admin sends custom pricing proposal
    if (action === "send_proposal") {
      if (userRole !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
      }

      if (!quoteId || typeof quotedAmountINR !== "number") {
        return NextResponse.json(
          { error: "Missing quoteId or quotedAmountINR." },
          { status: 400 }
        );
      }

      const updated = QuotesStore.sendProposal({
        quoteId,
        quotedAmountINR,
        scopeBreakdown: Array.isArray(scopeBreakdown) ? scopeBreakdown : [scopeBreakdown],
        deliverables: Array.isArray(deliverables) ? deliverables : ["Custom High-Res Deliverables"],
        validDays: validDays || 14,
        adminNotes: sanitizeInputText(adminNotes),
      });

      if (!updated) {
        return NextResponse.json({ error: "Quote not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, quote: updated });
    }

    // Action C: Client accepts proposal and creates active order for payment
    if (action === "accept") {
      if (!quoteId) {
        return NextResponse.json({ error: "Missing quoteId." }, { status: 400 });
      }

      const result = QuotesStore.acceptQuoteAndCreateOrder({
        quoteId,
        clientUid: userId || undefined,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process quote request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
