import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { guarded } from "@/lib/api/response";
import { AuditLogService } from "@/lib/services/auditLogService";

export async function GET(req: Request) {
  return guarded(async () => {
    // Step 1.5 — the audit trail is readable only through the admin cookie.
    await requireAdmin();

  const url = new URL(req.url);
  const targetType = url.searchParams.get("targetType") || undefined;
  const targetId = url.searchParams.get("targetId") || undefined;
  const action = url.searchParams.get("action") || undefined;
  const query = url.searchParams.get("query") || undefined;

  const logs = AuditLogService.filter({
    targetType,
    targetId,
    action,
    query,
  });

return NextResponse.json({
      success: true,
      totalCount: logs.length,
      logs,
    });
  });
}
