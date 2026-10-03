/**
 * GET  /api/account/profile → the caller's own profile
 * PATCH /api/account/profile → whitelisted update
 * PUT  /api/account/profile → replace the editable fields
 *
 * There is no GET-by-id route. A client can only ever read itself, so a
 * crafted ?uid= query cannot be used to read another tenant's profile.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { badRequest, guarded, notFound, ok, sameOrigin } from "@/lib/api/response";
import {
  getProfile,
  updateProfile,
  assertNoProtectedFields,
  CLIENT_WRITABLE_FIELDS,
  INDUSTRIES,
  SOCIAL_PLATFORMS,
  LANGUAGES,
} from "@/lib/services/profileStore";
import { adminDb } from "@/lib/firebase/admin";
import { isEnvSet, readEnv } from "@/lib/config/env";

export const dynamic = "force-dynamic";

/** GST invoicing is a studio-wide toggle, stored in studio_config/gst. */
async function gstEnabledGlobally(): Promise<boolean> {
  try {
    const snap = await adminDb().collection("studio_config").doc("gst").get();
    return snap.exists ? Boolean(snap.data()?.enabled) : isEnvSet("ADMIN_EMAIL") && false;
  } catch {
    return false;
  }
}

export async function GET() {
  return guarded(async () => {
    const session = await requireUser();
    const profile = await getProfile(session.uid);
    if (!profile) return notFound("Profile not found for this account.");
    return ok({
      profile,
      emailVerified: session.emailVerified,
      editableFields: CLIENT_WRITABLE_FIELDS,
      referenceData: {
        industries: INDUSTRIES,
        socialPlatforms: SOCIAL_PLATFORMS,
        languages: LANGUAGES,
      },
      gstEnabled: await gstEnabledGlobally(),
    });
  });
}

async function applyUpdate(req: Request, mode: "patch" | "put") {
  const session = await requireUser();
  if (!sameOrigin(req)) throw new Error("Cross-origin request blocked.");

  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const gstEnabled = await gstEnabledGlobally();

  const rejected = assertNoProtectedFields(payload);
  if (rejected.length) {
    return NextResponse.json(
      {
        error: "Some fields are managed by Sutra Studio and cannot be edited.",
        code: "PROTECTED_FIELD",
        issues: rejected,
      },
      { status: 403 }
    );
  }

  const result = await updateProfile(session, mode === "put" ? payload : payload, { gstEnabledGlobally: gstEnabled });

  if (result.issues.length) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields.",
        code: "INVALID_INPUT",
        fieldErrors: Object.fromEntries(result.issues.map((i) => [i.field, i.message])),
        issues: result.issues,
      },
      { status: 400 }
    );
  }

  return ok({ success: true, profile: result.profile, gstEnabled });
}

export async function PATCH(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    return applyUpdate(req, "patch");
  });
}

export async function PUT(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    return applyUpdate(req, "put");
  });
}