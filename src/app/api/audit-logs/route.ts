import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";
import { AuditLogService } from "@/lib/services/auditLogService";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user.isAdmin && user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Administrative privileges required to inspect audit logs." },
      { status: 403 }
    );
  }

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
}
