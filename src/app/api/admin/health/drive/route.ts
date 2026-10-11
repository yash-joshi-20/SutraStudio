/**
 * GET /api/admin/health/drive
 *
 * Administrative System Health: Verifies Google Drive connectivity, token validity,
 * and quota status using environment keys only.
 * Returns HTTP 503 + triggers studio admin notification alert if token exchange or ping fails.
 */

import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth/requestRole";
import { checkDriveHealth } from "@/lib/services/googleDriveService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const health = await checkDriveHealth();

    if (!health.healthy) {
      return NextResponse.json(
        {
          success: false,
          status: "unhealthy",
          ...health,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: "healthy",
        ...health,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: err.message || "Drive health verification failed",
        checkedAt: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
