/**
 * SUTRA STUDIO — Renew the short-lived Drive upload token (STEP 30)
 *
 * A very large file can outlive the 1-hour access token. The browser calls this
 * mid-upload instead of failing. The session URI itself stays valid for days;
 * only the Authorization bearer needs refreshing.
 */

import { guarded, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/session";
import { mintUploadToken } from "@/lib/services/googleDriveService";

export const dynamic = "force-dynamic";

export async function POST() {
  return guarded(async () => {
    await requireUser();
    const token = await mintUploadToken();
    return ok(token);
  });
}
