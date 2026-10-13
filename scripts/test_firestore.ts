import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

import { isFirebaseAdminReady, adminDb } from "../src/lib/firebase/admin";

async function main() {
  console.log("Checking isFirebaseAdminReady():", isFirebaseAdminReady());
  if (!isFirebaseAdminReady()) {
    console.log("Firebase Admin is NOT ready. Check missing keys.");
    process.exit(1);
  }
  try {
    const db = adminDb();
    const snapshot = await db.collection("orders").get();
    console.log("SUCCESS: Firestore orders collection fetched! Total documents:", snapshot.size);
    snapshot.forEach((doc) => {
      const d = doc.data();
      console.log(` - Doc [${doc.id}]:`, d?.orderNumber || d?.title, "| clientEmail:", d?.clientEmail, "| clientUid:", d?.clientUid);
    });
  } catch (err: any) {
    console.error("FIRESTORE ERROR:", err?.message || err);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
