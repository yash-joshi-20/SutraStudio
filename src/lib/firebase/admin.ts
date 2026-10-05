/**
 * SUTRA STUDIO — Firebase Admin SDK (Server Only)
 *
 * Replaces the previous in-memory stub. The stub resolved
 * verifyIdToken() to a hardcoded administrator for ANY token and reported
 * every document as non-existent, which silently faked all persistence.
 *
 * Contract:
 *  - `isFirebaseAdminReady()` tells you whether the Admin SDK can boot.
 *  - `adminDb()` THROWS a typed NotConfiguredError when it cannot. It never
 *    returns a fake database, because a fake database is indistinguishable
 *    from a real empty one and would silently discard writes.
 */

import "server-only";
import { cert, getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, FieldValue, type Firestore } from "firebase-admin/firestore";
import { readEnv, isFirebaseAdminConfigured } from "@/lib/config/env";

export class NotConfiguredError extends Error {
  readonly code = "NOT_CONFIGURED";
  constructor(public readonly integration: string, public readonly missingKeys: string[]) {
    super(
      `${integration} is not configured. Missing environment key(s): ${missingKeys.join(", ")}.`
    );
    this.name = "NotConfiguredError";
  }
}

export function isFirebaseAdminReady(): boolean {
  return isFirebaseAdminConfigured();
}

export function adminMissingKeys(): string[] {
  const missing: string[] = [];
  if (!readEnv("FIREBASE_CLIENT_EMAIL")) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!readEnv("FIREBASE_PRIVATE_KEY")) missing.push("FIREBASE_PRIVATE_KEY");
  if (!readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID")) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  return missing;
}

let appInstance: App | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getAdminApp(): App {
  if (appInstance) return appInstance;
  if (!isFirebaseAdminReady()) {
    throw new NotConfiguredError("Firebase Admin", adminMissingKeys());
  }

  if (getApps().length > 0) {
    appInstance = getApps()[0]!;
    return appInstance;
  }

  try {
    appInstance = initializeApp({
      credential: cert({
        projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
        clientEmail: readEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: readEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });
  } catch (initErr) {
    // Log the error CODE only — never the key value.
    const code = (initErr as { code?: string })?.code ?? "UNKNOWN";
    console.error(`[Firebase Admin] init failed — code: ${code}`);
    throw new NotConfiguredError("Firebase Admin", adminMissingKeys());
  }
  return appInstance;
}

export function adminDb(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getAdminApp());
  return dbInstance;
}

export function adminAuth(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(getAdminApp());
  return authInstance;
}

/**
 * Firestore server timestamp. Kept as an explicit helper so call sites do not
 * import firebase-admin directly and so it is obvious writes are server-stamped.
 */
export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

export function fieldDelete() {
  return FieldValue.delete();
}

export function arrayUnion(...items: unknown[]) {
  return FieldValue.arrayUnion(...items);
}

export function arrayRemove(...items: unknown[]) {
  return FieldValue.arrayRemove(...items);
}

export function increment(by: number) {
  return FieldValue.increment(by);
}

/** True when the error is a configuration gap rather than a real failure. */
export function isNotConfigured(err: unknown): boolean {
  return err instanceof NotConfiguredError;
}