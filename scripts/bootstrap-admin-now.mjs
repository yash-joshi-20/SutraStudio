import * as fs from 'fs';
import * as path from 'path';
import firebaseAdmin from 'firebase-admin';

// Load .env.local
const envFile = path.resolve('.env.local');
if (fs.existsSync(envFile)) {
  for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin credentials in .env.local');
  process.exit(1);
}

const app = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({ projectId, clientEmail, privateKey }),
  projectId
});

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'yashjoshi20@zohomail.in').trim().toLowerCase();
  const password = 'Yash@7355AdminSecure!';

  console.log('Target Admin Email:', email);
  let user;
  try {
    user = await firebaseAdmin.auth(app).getUserByEmail(email);
    console.log('Found existing user:', user.uid);
    await firebaseAdmin.auth(app).updateUser(user.uid, {
      password,
      emailVerified: true,
      displayName: 'Yash Joshi'
    });
    console.log('✓ Password updated successfully & emailVerified marked true.');
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      user = await firebaseAdmin.auth(app).createUser({
        email,
        emailVerified: true,
        displayName: 'Yash Joshi',
        password
      });
      console.log('✓ Created new user:', user.uid);
    } else {
      throw e;
    }
  }

  await firebaseAdmin.auth(app).setCustomUserClaims(user.uid, {
    role: 'admin',
    admin: true,
    superAdmin: true
  });
  console.log('✓ Custom Claims set: { role: "admin", admin: true, superAdmin: true }');

  // Verify by listing users
  const list = await firebaseAdmin.auth(app).listUsers(5);
  console.log('Total verified users in Firebase Auth:', list.users.length);
  for (const u of list.users) {
    console.log(` - Email: ${u.email} | UID: ${u.uid} | Verified: ${u.emailVerified} | Claims:`, u.customClaims);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
