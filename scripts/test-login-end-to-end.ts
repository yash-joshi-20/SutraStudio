import { readEnv } from '../src/lib/config/env';

async function testFullAuth() {
  const email = 'yashjoshi20@zohomail.in';
  const apiKey = readEnv('NEXT_PUBLIC_FIREBASE_API_KEY');
  console.log('Using Firebase Web API Key:', !!apiKey);

  const fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Yash@7355AdminSecure!',
      returnSecureToken: true
    })
  });

  const fbData = await fbRes.json();
  if (fbData.error) {
    console.error('Firebase Auth Failed:', fbData.error);
    return;
  }
  console.log('✓ Firebase ID Token obtained successfully for:', fbData.email);
  const idToken = fbData.idToken;

  // Test Admin Login API Route
  const adminRes = await fetch('http://localhost:3000/api/auth/admin-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({ idToken, rememberMe: true })
  });

  const adminData = await adminRes.json();
  console.log('✓ /api/auth/admin-login Response:', adminRes.status, adminData);
  console.log('✓ Set-Cookie:', adminRes.headers.get('set-cookie'));

  // Test Client Login API Route
  const clientRes = await fetch('http://localhost:3000/api/auth/client-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({ idToken, rememberMe: true })
  });

  const clientData = await clientRes.json();
  console.log('✓ /api/auth/client-login Response:', clientRes.status, clientData);
}

testFullAuth();
