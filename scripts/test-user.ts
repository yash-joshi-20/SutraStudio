import * as fs from "node:fs";
import * as path from "node:path";
import * as firebaseAdmin from "firebase-admin";

const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

const app = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({ projectId, clientEmail, privateKey }),
  projectId,
});

async function checkAndSetupAdmin() {
  const email = (process.env.ADMIN_EMAIL || "yashjoshi20@zohomail.in").trim().toLowerCase();
  console.log("Checking Admin user:", email);

  try {
    let user;
    try {
      user = await firebaseAdmin.auth(app).getUserByEmail(email);
      console.log("✅ User found in Firebase Auth:");
      console.log({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        customClaims: user.customClaims,
        disabled: user.disabled,
      });
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        console.log("Creating new admin user in Firebase Auth...");
        user = await firebaseAdmin.auth(app).createUser({
          email,
          emailVerified: true,
          displayName: "Yash Joshi",
          password: "Yash@7355AdminSecure!",
        });
        console.log("Created user with UID:", user.uid);
      } else {
        throw e;
      }
    }

    // Ensure emailVerified: true and custom claims: role='admin', role='superAdmin', admin: true
    await firebaseAdmin.auth(app).updateUser(user.uid, {
      emailVerified: true,
      displayName: "Yash Joshi",
    });

    await firebaseAdmin.auth(app).setCustomUserClaims(user.uid, {
      role: "admin",
      admin: true,
      superAdmin: true,
    });

    const refreshed = await firebaseAdmin.auth(app).getUser(user.uid);
    console.log("🎉 Updated User record:");
    console.log({
      uid: refreshed.uid,
      email: refreshed.email,
      emailVerified: refreshed.emailVerified,
      customClaims: refreshed.customClaims,
    });
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
  process.exit(0);
}

checkAndSetupAdmin();
