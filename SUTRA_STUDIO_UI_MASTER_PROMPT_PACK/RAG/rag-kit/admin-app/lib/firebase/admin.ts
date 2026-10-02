import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function app(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin env vars are missing (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).");
  }
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }),
  });
}

export const adminAuth = () => getAuth(app());
export const adminDb = () => getFirestore(app());
