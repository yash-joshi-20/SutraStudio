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

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  readPublicEnv,
  isPublicEnvSet,
  type EnvKey,
} from "@/lib/config/env";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const FIREBASE_NOT_CONFIGURED =
  "Not configured — Firebase Web keys are missing. Sign-in is unavailable until NEXT_PUBLIC_FIREBASE_* keys are set.";

/** Client-safe presence check. Returns true when usable. */
export function firebaseClientConfigured(): boolean {
  return (
    isPublicEnvSet("NEXT_PUBLIC_FIREBASE_API_KEY") &&
    isPublicEnvSet("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
    isPublicEnvSet("NEXT_PUBLIC_FIREBASE_APP_ID")
  );
}

// SSR-safe initialization
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

export function getFirebaseClient() {
  return {
    auth,
    db,
    config: firebaseConfig as FirebaseClientConfig,
  };
}

export function getFirebaseAuth(): Auth {
  return auth;
}

export function getFirebaseDb(): Firestore {
  return db;
}

/** "Keep me signed in" → local persistence, otherwise session-only. */
export async function applyPersistence(rememberMe: boolean): Promise<void> {
  if (typeof window === "undefined") return;
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
}

export function getVapidPublicKey(): string {
  return readPublicEnv("NEXT_PUBLIC_FIREBASE_VAPID_KEY" as EnvKey);
}

export function pushConfigured(): boolean {
  return !!getVapidPublicKey();
}