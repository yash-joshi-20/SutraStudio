

import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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
  const password = "Password@123";
  let uid = "";

  console.log(`Setting up admin account for: ${email}`);

  try {
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    await auth.updateUser(uid, {
      password: password,
      emailVerified: true
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

  // Set custom claims for admin
  await auth.setCustomUserClaims(uid, { role: "admin" });
  console.log("Granted custom claim: { role: 'admin' }");

  // Create or update admin record in Firestore
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    email,
    role: 'admin',
    createdAt: new Date(),
    status: 'active'
  }, { merge: true });
  console.log("Admin record saved in Firestore 'users' collection.");

  console.log("-----------------------------------------");
  console.log(`Admin Email: ${email}`);
  console.log(`Admin Password: ${password}`);
  console.log("You can now login as admin.");
  process.exit(0);
}

setAdminPassword().catch(console.error);
