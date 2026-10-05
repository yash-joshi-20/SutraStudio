import { readFileSync } from "fs";
import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const envContent = readFileSync(".env.local", "utf-8");
const envVars: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
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

const auth = getAuth();
const db = getFirestore();

async function setAdminPassword() {
  const email = "yashjoshi20@zohomail.in";
  const password = "Yash@7355AdminSecure!";
  let uid = "";

  console.log(`Setting up admin account for: ${email}`);

  try {
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    await auth.updateUser(uid, {
      password: password,
      emailVerified: true,
      disabled: false,
    });
    console.log(`User already exists. Updated password to: ${password}`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: email,
        password: password,
        emailVerified: true,
        displayName: "Yash Joshi"
      });
      uid = newUser.uid;
      console.log(`Created new user with password: ${password}`);
    } else {
      console.error("Error fetching/creating user:", error);
      process.exit(1);
    }
  }

  // Set all custom claims for admin
  await auth.setCustomUserClaims(uid, {
    role: "admin",
    admin: true,
    superAdmin: true,
    staffRole: "admin",
  });
  console.log("Granted custom claims: { role: 'admin', admin: true, superAdmin: true, staffRole: 'admin' }");

  // Create or update admin record in Firestore
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    email,
    role: 'admin',
    updatedAt: new Date(),
    status: 'active'
  }, { merge: true });
  console.log("Admin record saved in Firestore 'users' collection.");

  console.log("-----------------------------------------");
  console.log(`Admin Email: ${email}`);
  console.log(`Admin Password: ${password}`);
  console.log("Password updated successfully in Firebase Auth.");
  process.exit(0);
}

setAdminPassword().catch(console.error);
