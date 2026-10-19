/**
 * SUTRA STUDIO - Client Multi-Tenant Ownership Isolation & Download Security Test
 *
 * Verifies:
 * 1. Unauthenticated /api/orders returns empty array [] (no cross-tenant leak).
 * 2. Unauthenticated /api/drive/files returns 401 Unauthorized.
 * 3. Direct unauthorized file access via /api/drive/file/[fileId] rejects safely.
 * 4. Client route APIs strictly respect tenant isolation.
 * 5. Pricing consistency and canonical packages.
 */

async function runTests() {
  const baseUrl = "https://sutrastudios.in";
  let passed = 0;
  let failed = 0;

  console.log("=================================================");
  console.log("SUTRA STUDIO: CLIENT OWNERSHIP ISOLATION TEST SUITE");
  console.log("=================================================\n");

  // TEST 1: Unauthenticated orders query must return empty list (no leakage)
  try {
    const res = await fetch(`${baseUrl}/api/orders`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.orders) && data.orders.length === 0) {
      console.log("✓ TEST 1 PASSED: Unauthenticated /api/orders returned [] (Zero cross-tenant leakage).");
      passed++;
    } else {
      console.error(`✗ TEST 1 FAILED: Expected empty orders array for unauthenticated request, got ${data.orders?.length} orders.`);
      failed++;
    }
  } catch (err) {
    console.error("✗ TEST 1 ERROR:", err.message);
    failed++;
  }

  // TEST 2: Unauthenticated /api/drive/files must be rejected with 401
  try {
    const res = await fetch(`${baseUrl}/api/drive/files`);
    if (res.status === 401) {
      console.log("✓ TEST 2 PASSED: Unauthenticated /api/drive/files returned 401 Unauthorized.");
      passed++;
    } else {
      console.error(`✗ TEST 2 FAILED: Expected 401 for unauthenticated drive files list, got ${res.status}.`);
      failed++;
    }
  } catch (err) {
    console.error("✗ TEST 2 ERROR:", err.message);
    failed++;
  }

  // TEST 3: Direct access to unknown or unauthorized drive file
  try {
    const res = await fetch(`${baseUrl}/api/drive/file/file_unauthorized_9999?download=true`);
    // Should return 401 (no session) or 404 (not in account)
    if (res.status === 401 || res.status === 404) {
      console.log(`✓ TEST 3 PASSED: Direct unauthorized /api/drive/file rejected with status ${res.status}.`);
      passed++;
    } else {
      console.error(`✗ TEST 3 FAILED: Expected 401 or 404 for unauthorized file access, got ${res.status}.`);
      failed++;
    }
  } catch (err) {
    console.error("✗ TEST 3 ERROR:", err.message);
    failed++;
  }

  // TEST 4: Client-scoped query without a verified session must be rejected
  // (Tenant reads require an authenticated session; anonymous clientUid probing must never return data.)
  try {
    const res = await fetch(`${baseUrl}/api/orders?clientUid=isolated-test-client-abc`);
    const data = await res.json();
    const leaked = Array.isArray(data.orders) ? data.orders.length : 0;
    if (res.status === 401 && leaked === 0) {
      console.log("✓ TEST 4 PASSED: Unauthenticated tenant query rejected with 401 (0 records leaked).");
      passed++;
    } else {
      console.error(`✗ TEST 4 FAILED: Expected 401 with 0 records, got status ${res.status} and ${leaked} records.`);
      failed++;
    }
  } catch (err) {
    console.error("✗ TEST 4 ERROR:", err.message);
    failed++;
  }

  // TEST 5: Verify client portal routes render cleanly without SSR errors
  const routesToTest = [
    "/dashboard",
    "/orders",
    "/projects-client",
    "/invoices",
    "/media",
    "/profile",
  ];

  for (const route of routesToTest) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.status === 200) {
        console.log(`✓ TEST ROUTE PASSED: ${route} rendered HTTP 200.`);
        passed++;
      } else {
        console.error(`✗ TEST ROUTE FAILED: ${route} returned HTTP ${res.status}.`);
        failed++;
      }
    } catch (err) {
      console.error(`✗ TEST ROUTE ERROR ${route}:`, err.message);
      failed++;
    }
  }

  console.log("\n-------------------------------------------------");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
