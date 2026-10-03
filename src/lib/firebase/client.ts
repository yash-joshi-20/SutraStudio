/**
 * SUTRA STUDIO — Firebase Client SDK (Browser)
 *
 * Boots the real Web SDK from NEXT_PUBLIC_* values only.
 * If configuration is incomplete the app degrades to an explicit
 * "not configured" state instead of pretending to be signed in.
 *
 * STEP 30: Firebase provides Authentication and Firestore ONLY. Object
 * storage lives in Google Drive — there is no Storage SDK here and no
 * Cloud Functions at all (no Blaze plan required).
 */

"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, browserLocalPersistence, browserSessionPersistence, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  readPublicEnv,
  isEnvSet,
  type EnvKey,
} from "@/lib/config/env";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let cached: {
  auth: Auth;
  db: Firestore;
  config: FirebaseClientConfig;
} | null = null;

export const FIREBASE_NOT_CONFIGURED =
  "Not configured — Firebase Web keys are missing. Sign-in is unavailable until NEXT_PUBLIC_FIREBASE_* keys are set.";

/** Client-safe presence check. Returns the message string when usable, else "". */
export function firebaseClientConfigured(): boolean {
  return (
    isEnvSet("NEXT_PUBLIC_FIREBASE_API_KEY") &&
    isEnvSet("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
    isEnvSet("NEXT_PUBLIC_FIREBASE_APP_ID")
  );
}

export function getFirebaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseClient() is browser-only.");
  }
  if (cached) return cached;
  if (!firebaseClientConfigured()) {
    throw new Error(FIREBASE_NOT_CONFIGURED);
  }

  const config: FirebaseClientConfig = {
    apiKey: readPublicEnv("NEXT_PUBLIC_FIREBASE_API_KEY" as EnvKey),
    authDomain: readPublicEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" as EnvKey),
    projectId: readPublicEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID" as EnvKey),
    messagingSenderId: readPublicEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" as EnvKey),
    appId: readPublicEnv("NEXT_PUBLIC_FIREBASE_APP_ID" as EnvKey),
  };

  app = getApps()[0] ?? initializeApp(config);

  cached = {
    auth: getAuth(app),
    db: getFirestore(app),
    config,
  };
  return cached;
}

export function getFirebaseAuth(): Auth {
  return getFirebaseClient().auth;
}

export function getFirebaseDb(): Firestore {
  return getFirebaseClient().db;
}

/** "Keep me signed in" → local persistence, otherwise session-only. */
export async function applyPersistence(rememberMe: boolean): Promise<void> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
}

export function getVapidPublicKey(): string {
  return readPublicEnv("NEXT_PUBLIC_FIREBASE_VAPID_KEY" as EnvKey);
}

export function pushConfigured(): boolean {
  return !!getVapidPublicKey();
}