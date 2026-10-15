import { readFileSync } from "fs";
import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const envContent = readFileSync(".env.local", "utf-8");
const envVars: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1]] = val;
  }
});

const projectId = envVars["NEXT_PUBLIC_FIREBASE_PROJECT_ID"];
const clientEmail = envVars["FIREBASE_CLIENT_EMAIL"];
const privateKey = envVars["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = getFirestore();

async function run() {
  console.log("Checking adminLoginAttempts in Firestore...");
  const snap = await db.collection("adminLoginAttempts").get();
  console.log(`Found ${snap.size} attempt record(s):`);
  for (const doc of snap.docs) {
    console.log(`- Doc ${doc.id}:`, JSON.stringify(doc.data()));
  }

  if (process.argv.includes("--clear")) {
    console.log("Clearing all adminLoginAttempts records...");
    for (const doc of snap.docs) {
      await doc.ref.delete();
      console.log(`Deleted ${doc.id}`);
    }
    console.log("adminLoginAttempts successfully cleared!");
  }
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
