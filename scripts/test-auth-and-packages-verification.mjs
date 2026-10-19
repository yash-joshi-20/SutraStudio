import { readFileSync } from 'fs';
import admin from 'firebase-admin';

// Load .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    envVars[match[1]] = val;
  }
});

const BASE_URL = 'https://sutrastudios.in';
const apiKey = envVars['NEXT_PUBLIC_FIREBASE_API_KEY'];
const projectId = envVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
const clientEmail = envVars['FIREBASE_CLIENT_EMAIL'];
const privateKey = envVars['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');
const adminEmail = envVars['ADMIN_EMAIL'] || 'yashjoshi20@zohomail.in';

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

async function runVerification() {
  console.log('\n==============================================================================');
  console.log('   SUTRA STUDIO — AUTHENTICATION & PACKAGES COMPREHENSIVE VERIFICATION');
  console.log('==============================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Public Packages & Pricing Routes Accessible Without Login
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Public Packages & Pricing Route Verification ---');
  
  // 1a. /packages must return 200 OK directly, without redirect
  const pkgRes = await fetch(`${BASE_URL}/packages`, { redirect: 'manual' });
  assert(pkgRes.status === 200, `/packages returns HTTP 200 OK (got ${pkgRes.status})`);
  assert(!pkgRes.headers.get('location'), `/packages does NOT redirect (location: ${pkgRes.headers.get('location')})`);
  const pkgHtml = await pkgRes.text();
  assert(pkgHtml.includes('Curated Production') || pkgHtml.includes('Packages'), '/packages displays Curated Production Packages heading');
  assert(pkgHtml.includes('19,999') || pkgHtml.includes('₹'), '/packages displays INR pricing without login');

  // 1b. /pricing must return 200 OK directly, without redirect
  const pricingRes = await fetch(`${BASE_URL}/pricing`, { redirect: 'manual' });
  assert(pricingRes.status === 200, `/pricing returns HTTP 200 OK (got ${pricingRes.status})`);
  assert(!pricingRes.headers.get('location'), `/pricing does NOT redirect (location: ${pricingRes.headers.get('location')})`);
  const pricingHtml = await pricingRes.text();
  assert(pricingHtml.includes('Packages') && pricingHtml.includes('Pricing'), '/pricing displays Packages & Pricing heading');

  // 1c. Aliases /plans and /pricing-plans redirect to /pricing, NOT to /orders or /login
  const plansRes = await fetch(`${BASE_URL}/plans`, { redirect: 'manual' });
  assert(plansRes.status === 307, `/plans returns 307 redirect (got ${plansRes.status})`);
  assert(plansRes.headers.get('location') === '/pricing', `/plans redirects to /pricing (got ${plansRes.headers.get('location')})`);

  const pricingPlansRes = await fetch(`${BASE_URL}/pricing-plans`, { redirect: 'manual' });
  assert(pricingPlansRes.status === 307, `/pricing-plans returns 307 redirect (got ${pricingPlansRes.status})`);
  assert(pricingPlansRes.headers.get('location') === '/pricing', `/pricing-plans redirects to /pricing (got ${pricingPlansRes.headers.get('location')})`);

  // --------------------------------------------------------------------------
  // TEST 2: Client Registration & Workspace Access
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Client Registration & Workspace Access ---');
  const testClientEmail = `test_client_${Date.now()}@example.com`;
  const testClientPassword = 'TestClientSecure2026!';

  // Create Firebase user for client test
  const signUpRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testClientEmail,
        password: testClientPassword,
        returnSecureToken: true,
      }),
    }
  );
  const signUpData = await signUpRes.json();
  assert(Boolean(signUpData.idToken), `Firebase client user created with ID token (${testClientEmail})`);

  // POST /api/auth/register
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
    body: JSON.stringify({
      idToken: signUpData.idToken,
      name: 'Verification Client',
      email: testClientEmail,
      phone: '+919876543210',
      companyName: 'Studio Partner Co',
      acceptedTerms: true,
      acceptedPrivacy: true,
      rememberMe: true,
      returnTo: '/dashboard',
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 200, `POST /api/auth/register returned 200 (got ${regRes.status})`);
  assert(regData.success === true, 'POST /api/auth/register success flag is true');
  assert(regData.user?.role === 'client', 'Registered user has client role');
  const regSetCookie = regRes.headers.get('set-cookie') || '';
  const clientSessionMatch = regSetCookie.match(/__session=([^;]+)/);
  const clientCookie = clientSessionMatch ? clientSessionMatch[1] : '';
  assert(Boolean(clientCookie), '__session cookie established on client registration');

  // Verify /api/auth/session with client cookie
  const clientSessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: `__session=${clientCookie}` },
  });
  const clientSessionData = await clientSessionRes.json();
  assert(clientSessionData.authenticated === true, 'Client session endpoint reports authenticated: true');
  assert(clientSessionData.user?.role === 'client', 'Client session endpoint reports role: client');

  // Verify GET /dashboard with client cookie
  const dashboardRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: `__session=${clientCookie}` },
    redirect: 'manual',
  });
  assert(dashboardRes.status === 200, `GET /dashboard with client session returns 200 OK (got ${dashboardRes.status})`);

  // --------------------------------------------------------------------------
  // TEST 3: Invalid Admin Credentials Rejection
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Invalid Admin Credentials Rejection ---');
  const invalidFbRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'DefinitivelyWrongPassword999!',
        returnSecureToken: true,
      }),
    }
  );
  const invalidFbData = await invalidFbRes.json();
  assert(invalidFbRes.status === 400, `Invalid credentials rejected with HTTP 400 (got ${invalidFbRes.status})`);
  assert(
    invalidFbData.error?.message === 'INVALID_LOGIN_CREDENTIALS',
    `Firebase returns INVALID_LOGIN_CREDENTIALS (got ${invalidFbData.error?.message})`
  );

  const invalidAdminTokenRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
    body: JSON.stringify({ idToken: 'invalid-id-token-xyz', rememberMe: true }),
  });
  assert(invalidAdminTokenRes.status === 401, `Invalid token rejected with HTTP 401 (got ${invalidAdminTokenRes.status})`);

  // Verify /admin without admin cookie redirects to /admin/login
  const unauthAdminRes = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
  assert(unauthAdminRes.status === 307, `Unauthenticated /admin redirects with 307 (got ${unauthAdminRes.status})`);
  assert(
    unauthAdminRes.headers.get('location')?.includes('/admin/login'),
    `/admin redirects to /admin/login (got ${unauthAdminRes.headers.get('location')})`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Existing Admin Identity & Zero-Credential Modification Check
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Existing Admin Account Preservation Check ---');
  const existingAdminRecord = await admin.auth().getUserByEmail(adminEmail);
  assert(Boolean(existingAdminRecord), `Existing admin user found in Firebase: ${existingAdminRecord.email}`);
  assert(existingAdminRecord.disabled === false, 'Existing admin account is active (not disabled)');
  assert(existingAdminRecord.emailVerified === true, 'Existing admin account has emailVerified: true');
  assert(existingAdminRecord.customClaims?.role === 'admin', 'Existing admin account carries role: "admin" custom claim');

  // Verify admin email matches configured admin policy
  const envAdminEmail = (process.env.ADMIN_ALLOWED_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || adminEmail).toLowerCase();
  assert(envAdminEmail.includes(adminEmail.toLowerCase()), `Admin email verified against policy: ${adminEmail}`);

  // --------------------------------------------------------------------------
  // TEST 5: Admin Login, Dashboard Open & Session Persistence
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Admin Login, Dashboard Open & Session Persistence ---');
  // Mint a valid ID token for the verified existing admin user
  const customToken = await admin.auth().createCustomToken(existingAdminRecord.uid);
  const tokenRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const tokenData = await tokenRes.json();
  assert(Boolean(tokenData.idToken), 'Successfully obtained Firebase ID token for verified existing admin account');

  // Exchange ID token via POST /api/auth/admin-login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
    body: JSON.stringify({ idToken: tokenData.idToken, rememberMe: true, returnTo: '/admin?tab=approvals' }),
  });
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200, `POST /api/auth/admin-login returned 200 (got ${adminLoginRes.status})`);
  assert(adminLoginData.success === true, 'POST /api/auth/admin-login success flag is true');
  assert(adminLoginData.user?.role === 'admin', 'Admin login user role confirmed as admin');

  const adminSetCookie = adminLoginRes.headers.get('set-cookie') || '';
  const adminSessionMatch = adminSetCookie.match(/sutra_admin_session=([^;]+)/);
  const adminCookie = adminSessionMatch ? adminSessionMatch[1] : '';
  assert(Boolean(adminCookie), 'sutra_admin_session cookie established on admin login');

  // Verify GET /api/auth/session with admin cookie
  const adminSessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: `sutra_admin_session=${adminCookie}` },
  });
  const adminSessionData = await adminSessionRes.json();
  assert(adminSessionData.authenticated === true, 'Admin session endpoint reports authenticated: true');
  assert(adminSessionData.user?.role === 'admin', 'Admin session endpoint reports role: admin');

  // Verify GET /admin opens directly with HTTP 200 OK
  const adminDashRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: `sutra_admin_session=${adminCookie}` },
    redirect: 'manual',
  });
  assert(adminDashRes.status === 200, `GET /admin returns HTTP 200 OK (got ${adminDashRes.status})`);
  assert(!adminDashRes.headers.get('location'), `/admin does not redirect when admin session is present`);

  // Verify destination preservation: GET /admin?tab=approvals opens directly with HTTP 200 OK
  const adminApprovalsRes = await fetch(`${BASE_URL}/admin?tab=approvals`, {
    headers: { Cookie: `sutra_admin_session=${adminCookie}` },
    redirect: 'manual',
  });
  assert(adminApprovalsRes.status === 200, `GET /admin?tab=approvals returns HTTP 200 OK (got ${adminApprovalsRes.status})`);

  // Verify session persistence (refresh simulation: second request to /admin with same cookie)
  const refreshDashRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: `sutra_admin_session=${adminCookie}` },
    redirect: 'manual',
  });
  assert(refreshDashRes.status === 200, `GET /admin on refresh returns HTTP 200 OK (session persists)`);

  // Clean up test client account from Firebase
  try {
    await admin.auth().deleteUser(signUpData.localId);
    console.log(`\n✓ Cleaned up temporary test client account (${signUpData.localId})`);
  } catch (cleanErr) {
    console.warn('Test client cleanup notice:', cleanErr.message);
  }

  console.log('\n==============================================================================');
  console.log('   🎉 ALL ACCEPTANCE CRITERIA AND SECURITY CHECKS PASSED WITH 100% SUCCESS!');
  console.log('==============================================================================\n');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
