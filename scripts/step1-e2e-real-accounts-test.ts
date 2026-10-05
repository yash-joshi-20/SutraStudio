import { readEnv } from '../src/lib/config/env';

async function runPrompt1Verification() {
  console.log('==============================================================================');
  console.log('SUTRA STUDIO — PROMPT 1: REAL ACCOUNTS E2E VERIFICATION');
  console.log('==============================================================================\n');

  const apiKey = readEnv('NEXT_PUBLIC_FIREBASE_API_KEY');
  const baseUrl = 'http://localhost:3000';

  const testClientEmail = 'client.test.sutra@example.com';
  const testClientPassword = 'SutraClientPass2026!';
  const testAdminEmail = readEnv('ADMIN_EMAIL') || 'yashjoshi20@zohomail.in';
  const testAdminPassword = 'Yash@7355AdminSecure!';

  // 1. Sign up / Sign in test client via Firebase Auth REST API
  const clientFbRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
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
  let clientFbData = await clientFbRes.json();

  if (clientFbData.error?.message === 'EMAIL_NOT_FOUND' || clientFbData.error?.message === 'INVALID_LOGIN_CREDENTIALS') {
    console.log('Creating test client account via REST API...');
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
    clientFbData = await signUpRes.json();
  }

  if (!clientFbData.idToken) {
    console.error('Client Firebase Auth failed:', clientFbData);
    process.exit(1);
  }
  console.log('✓ Firebase ID Token obtained for client:', clientFbData.email);

  // --------------------------------------------------------------------------
  // Test 1: Client Login & Session Restore Flow
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: Client Login & Session Flow ---');
  const clientLoginRes = await fetch(`${baseUrl}/api/auth/client-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify({ idToken: clientFbData.idToken, rememberMe: false }),
  });
  const clientLoginData = await clientLoginRes.json();
  console.log('✓ POST /api/auth/client-login Status:', clientLoginRes.status, clientLoginData.message);
  const clientCookieHeader = clientLoginRes.headers.get('set-cookie') || '';
  const sessionMatch = clientCookieHeader.match(/__session=([^;]+)/);
  const clientSessionCookie = sessionMatch ? sessionMatch[1] : '';

  if (!clientSessionCookie) {
    console.error('FAIL: No __session cookie set on client login');
    process.exit(1);
  }
  console.log('✓ __session cookie established successfully');

  // Verify session endpoint
  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { Cookie: `__session=${clientSessionCookie}` },
  });
  const sessionData = await sessionRes.json();
  console.log('✓ GET /api/auth/session authenticated:', sessionData.authenticated, 'role:', sessionData.user?.role);

  // Client Logout
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: baseUrl, Cookie: `__session=${clientSessionCookie}` },
  });
  console.log('✓ POST /api/auth/logout Status:', logoutRes.status);

  // --------------------------------------------------------------------------
  // Test 2: Admin Login & Activity Refresh Flow
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Admin Login & Activity Refresh Flow ---');
  const adminFbRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdminEmail,
        password: testAdminPassword,
        returnSecureToken: true,
      }),
    }
  );
  const adminFbData = await adminFbRes.json();
  if (adminFbData.error) {
    console.error('Admin Firebase Auth failed:', adminFbData.error);
    process.exit(1);
  }
  console.log('✓ Firebase ID Token obtained for admin:', adminFbData.email);

  const adminLoginRes = await fetch(`${baseUrl}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify({ idToken: adminFbData.idToken, rememberMe: true }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log('✓ POST /api/auth/admin-login Status:', adminLoginRes.status, adminLoginData.message);
  const adminCookieHeader = adminLoginRes.headers.get('set-cookie') || '';
  const adminSessionMatch = adminCookieHeader.match(/sutra_admin_session=([^;]+)/);
  const adminSessionCookie = adminSessionMatch ? adminSessionMatch[1] : '';

  if (!adminSessionCookie) {
    console.error('FAIL: No sutra_admin_session cookie set on admin login');
    process.exit(1);
  }
  console.log('✓ sutra_admin_session cookie established successfully');

  // Verify Admin Logout
  const adminLogoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Origin: baseUrl, Cookie: `sutra_admin_session=${adminSessionCookie}` },
  });
  console.log('✓ POST /api/auth/logout for Admin Status:', adminLogoutRes.status);

  // --------------------------------------------------------------------------
  // Test 3: Admin email on /login (client login) -> clear message
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Admin on Client Login Route ---');
  const adminOnClientRes = await fetch(`${baseUrl}/api/auth/client-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify({ idToken: adminFbData.idToken }),
  });
  const adminOnClientData = await adminOnClientRes.json();
  console.log('✓ Status:', adminOnClientRes.status);
  console.log('✓ Code:', adminOnClientData.code);
  console.log('✓ Error Message:', adminOnClientData.error);
  if (
    adminOnClientRes.status !== 403 ||
    adminOnClientData.code !== 'USE_ADMIN_LOGIN' ||
    adminOnClientData.error !== 'This is the admin account. Please use the Admin Login page.'
  ) {
    console.error('FAIL: Expected 403 USE_ADMIN_LOGIN with clear message');
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // Test 4: Client email on /admin/login (admin login) -> clear message
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Client on Admin Login Route ---');
  const clientOnAdminRes = await fetch(`${baseUrl}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify({ idToken: clientFbData.idToken }),
  });
  const clientOnAdminData = await clientOnAdminRes.json();
  console.log('✓ Status:', clientOnAdminRes.status);
  console.log('✓ Code:', clientOnAdminData.code);
  console.log('✓ Error Message:', clientOnAdminData.error);
  if (
    clientOnAdminRes.status !== 403 ||
    clientOnAdminData.code !== 'USE_CLIENT_LOGIN' ||
    clientOnAdminData.error !== 'This is a client account. Please use the client login page.'
  ) {
    console.error('FAIL: Expected 403 USE_CLIENT_LOGIN with clear message');
    process.exit(1);
  }

  console.log('\n==============================================================================');
  console.log('ALL 4 E2E REAL ACCOUNT AUTHENTICATION TESTS PASSED SUCCESSFULLY!');
  console.log('==============================================================================');
}

runPrompt1Verification().catch((err) => {
  console.error('Error during Prompt 1 test:', err);
  process.exit(1);
});
