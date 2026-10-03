/**
 * SUTRA STUDIO — Drive ownership authorisation (Server Only)
 *
 * One place decides who may touch a Drive file id, so the download, share and
 * metadata routes cannot drift apart. A client only ever reaches records whose
 * `clientId` equals their own uid; an administrator reaches anything.
 */

import "server-only";
import { ForbiddenError, requireUser, type SessionUser } from "@/lib/auth/session";
import { getFileRecord, type DriveFileRecord } from "@/lib/services/googleDriveService";

export interface DriveFileAccess {
  user: SessionUser;
  record: DriveFileRecord | null;
}

/**
 * @param fileId Drive file id from the URL.
 * @param opts.requireRecord when true, an unregistered file id is rejected
 *        outright (used by share, which must update a Firestore record).
 */
export async function authorizeDriveFile(
  fileId: string,
  opts: { requireRecord?: boolean } = {}
): Promise<DriveFileAccess> {
  const user = await requireUser();
  const record = await getFileRecord(fileId);

  if (user.role === "admin") {
    if (opts.requireRecord && !record) throw new ForbiddenError("That file is not registered with the studio vault.");
    return { user, record };
  }

  const owns = Boolean(record) && record!.clientId === user.uid && record!.state !== "trashed";
  if (!owns) {
    // Deliberately 403 rather than 404 for known-but-foreign files, and 404
    // semantics are handled by callers that need to avoid id enumeration.
    throw new ForbiddenError("This file does not belong to your account.");
  }

  return { user, record };
}
