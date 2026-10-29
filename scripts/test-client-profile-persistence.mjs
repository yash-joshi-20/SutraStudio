/**
 * SUTRA STUDIO — Client Profile Persistence Verification Test Suite
 *
 * Validates:
 * 1. Profile retrieval for non-existent UID returns null.
 * 2. Profile creation & durable read-back from PostgreSQL User model.
 * 3. Whitelisted field updates persist to User table and metadata.
 * 4. Profile completeness calculation works accurately.
 * 5. Non-destructive partial updates: missing fields never wipe existing data.
 * 6. Nested billing partial updates preserve other billing attributes.
 * 7. Protected fields rejection (role, status, uid, email, emailVerified).
 * 8. Input validation rejection for invalid phone, colors, and URLs.
 * 9. Multi-tenant cross-client isolation (session UID enforcement).
 * 10. Database errors never produce false success.
 * 11. Admin status toggle persists to database.
 * 12. Clean teardown of all synthetic test records.
 */

import { prisma } from "../src/lib/prisma.ts";
import {
  getProfile,
  updateProfile,
  assertNoProtectedFields,
  validateProfilePatch,
  adminSetStatus,
} from "../src/lib/services/profileStore.ts";
import { syncAuthenticatedClientUser } from "../src/lib/auth/userPersistence.ts";

// Reusing shared Prisma singleton


const TEST_TIMESTAMP = Date.now();
const CLIENT_A_UID = `usr_profile_test_a_${TEST_TIMESTAMP}`;
const CLIENT_A_EMAIL = `profile_test_a_${TEST_TIMESTAMP}@sutrastudio.com`;

const CLIENT_B_UID = `usr_profile_test_b_${TEST_TIMESTAMP}`;
const CLIENT_B_EMAIL = `profile_test_b_${TEST_TIMESTAMP}@sutrastudio.com`;

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✔ PASS: ${message}`);
    testPassed++;
  } else {
    console.error(`✘ FAIL: ${message}`);
    testFailed++;
  }
}

async function runTests() {
  console.log("=== SUTRA STUDIO CLIENT PROFILE PERSISTENCE VERIFICATION TEST ===\n");

  try {
    // -------------------------------------------------------------------------
    // Test 1: Non-existent profile retrieval returns null
    // -------------------------------------------------------------------------
    console.log("[Test 1] Testing non-existent user profile retrieval...");
    const nonExistent = await getProfile(`usr_non_existent_${Date.now()}`);
    assert(nonExistent === null, "Non-existent profile returns null safely");

    // -------------------------------------------------------------------------
    // Test 2: Durable user creation and initial profile retrieval
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Testing durable client user profile bootstrap and read...");
    const createdUser = await syncAuthenticatedClientUser({
      uid: CLIENT_A_UID,
      email: CLIENT_A_EMAIL,
      name: "Kabir Sharma",
      phone: "+91 91234 56789",
      emailVerified: true,
      role: "client",
    });

    assert(createdUser && createdUser.id, "Initial user created in PostgreSQL");

    const initialProfile = await getProfile(CLIENT_A_UID);
    assert(initialProfile !== null, "Profile successfully retrieved from PostgreSQL User");
    assert(initialProfile.uid === CLIENT_A_UID, `UID matches: ${initialProfile.uid}`);
    assert(initialProfile.displayName === "Kabir Sharma", `Display name matches: ${initialProfile.displayName}`);
    assert(initialProfile.phone === "+91 91234 56789", `Phone matches: ${initialProfile.phone}`);
    assert(initialProfile.role === "client", `Role matches: ${initialProfile.role}`);
    assert(initialProfile.status === "active", `Status matches: ${initialProfile.status}`);
    assert(initialProfile.billing !== undefined, "Default billing object is initialized");

    // -------------------------------------------------------------------------
    // Test 3: Updating profile with whitelisted fields
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Testing profile update with valid client writable fields...");
    const sessionA = {
      uid: CLIENT_A_UID,
      email: CLIENT_A_EMAIL,
      name: "Kabir Sharma",
      role: "client",
      emailVerified: true,
    };

    const updatePayload1 = {
      displayName: "Kabir Sharma & Co.",
      companyName: "Sharma Architectural Atelier",
      website: "https://sharma-atelier.example.com",
      industry: "Interior & Furniture",
      brandColors: ["#D4A35A", "#1A1A1A"],
      socialLinks: {
        instagram: "https://instagram.com/sharma.atelier",
      },
      billing: {
        legalName: "Sharma Architectural Atelier LLP",
        addressLine1: "101 Heritage Boulevard",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "380015",
        country: "India",
      },
    };

    const updateResult1 = await updateProfile(sessionA, updatePayload1, { gstEnabledGlobally: true });
    assert(updateResult1.issues.length === 0, `Profile update succeeded without issues: ${JSON.stringify(updateResult1.issues)}`);
    assert(updateResult1.profile.displayName === "Kabir Sharma & Co.", `Display name updated to: ${updateResult1.profile.displayName}`);
    assert(updateResult1.profile.companyName === "Sharma Architectural Atelier", `Company updated to: ${updateResult1.profile.companyName}`);
    assert(updateResult1.profile.website === "https://sharma-atelier.example.com", `Website updated to: ${updateResult1.profile.website}`);
    assert(updateResult1.profile.brandColors.length === 2, `Brand colors count: ${updateResult1.profile.brandColors.length}`);
    assert(updateResult1.profile.billing.city === "Ahmedabad", `Billing city updated to: ${updateResult1.profile.billing.city}`);

    // Verify database read-back directly via Prisma
    const dbUserAfterUpdate = await prisma.user.findFirst({ where: { uid: CLIENT_A_UID } });
    assert(dbUserAfterUpdate !== null, "User found in database via direct Prisma query");
    assert(dbUserAfterUpdate.name === "Kabir Sharma & Co.", `Direct DB user.name matches: ${dbUserAfterUpdate.name}`);
    assert(dbUserAfterUpdate.company === "Sharma Architectural Atelier", `Direct DB user.company matches: ${dbUserAfterUpdate.company}`);
    assert(dbUserAfterUpdate.billingData !== null, "Direct DB user.billingData is populated");

    const parsedBillingData = JSON.parse(dbUserAfterUpdate.billingData);
    assert(parsedBillingData.billing.legalName === "Sharma Architectural Atelier LLP", "Direct DB billing.legalName matches");
    assert(parsedBillingData.billing.postalCode === "380015", "Direct DB billing.postalCode matches");
    assert(parsedBillingData.website === "https://sharma-atelier.example.com", "Direct DB website matches");

    // -------------------------------------------------------------------------
    // Test 4: Profile completeness calculation
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Testing profile completeness calculation...");
    assert(updateResult1.profile.profileCompleteness > 50, `Profile completeness score updated: ${updateResult1.profile.profileCompleteness}%`);

    // -------------------------------------------------------------------------
    // Test 5: Non-destructive partial updates (missing fields must NOT wipe data)
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Testing non-destructive partial updates...");
    const partialPayload = {
      displayName: "Kabir Sharma Studio",
      // phone, companyName, website, brandColors, billing are OMITTED
    };

    const updateResult2 = await updateProfile(sessionA, partialPayload, { gstEnabledGlobally: true });
    assert(updateResult2.issues.length === 0, "Partial update succeeded without issues");
    assert(updateResult2.profile.displayName === "Kabir Sharma Studio", `Display name changed to: ${updateResult2.profile.displayName}`);
    assert(updateResult2.profile.phone === "+91 91234 56789", `Phone preserved: ${updateResult2.profile.phone}`);
    assert(updateResult2.profile.companyName === "Sharma Architectural Atelier", `Company name preserved: ${updateResult2.profile.companyName}`);
    assert(updateResult2.profile.website === "https://sharma-atelier.example.com", `Website preserved: ${updateResult2.profile.website}`);
    assert(updateResult2.profile.brandColors.length === 2, `Brand colors preserved: ${updateResult2.profile.brandColors.length}`);
    assert(updateResult2.profile.billing.legalName === "Sharma Architectural Atelier LLP", `Billing legalName preserved: ${updateResult2.profile.billing.legalName}`);

    // -------------------------------------------------------------------------
    // Test 6: Nested billing partial updates
    // -------------------------------------------------------------------------
    console.log("\n[Test 6] Testing nested billing partial update preservation...");
    const billingPartialPayload = {
      billing: {
        city: "Vadodara",
        // legalName, addressLine1, state, postalCode are OMITTED
      },
    };

    const updateResult3 = await updateProfile(sessionA, billingPartialPayload, { gstEnabledGlobally: true });
    assert(updateResult3.profile.billing.city === "Vadodara", `Billing city updated to: ${updateResult3.profile.billing.city}`);
    assert(updateResult3.profile.billing.legalName === "Sharma Architectural Atelier LLP", `Billing legalName preserved: ${updateResult3.profile.billing.legalName}`);
    assert(updateResult3.profile.billing.postalCode === "380015", `Billing postalCode preserved: ${updateResult3.profile.billing.postalCode}`);
    assert(updateResult3.profile.billing.country === "India", `Billing country preserved: ${updateResult3.profile.billing.country}`);

    // -------------------------------------------------------------------------
    // Test 7: Protected fields rejection
    // -------------------------------------------------------------------------
    console.log("\n[Test 7] Testing rejection of protected fields in client payloads...");
    for (const protectedKey of ["role", "status", "uid", "email", "emailVerified"]) {
      const forbiddenPayload = { [protectedKey]: "malicious_override" };
      const issues = assertNoProtectedFields(forbiddenPayload);
      assert(issues.length > 0, `Protected field '${protectedKey}' was rejected`);
      assert(issues[0].field === protectedKey, `Issue field correctly identified as '${protectedKey}'`);
    }

    // -------------------------------------------------------------------------
    // Test 8: Input validation rules
    // -------------------------------------------------------------------------
    console.log("\n[Test 8] Testing client input validation...");
    // Invalid phone
    const invalidPhoneResult = validateProfilePatch({ phone: "not-a-phone-number" }, { gstEnabledGlobally: true });
    assert(invalidPhoneResult.issues.some((i) => i.field === "phone"), "Invalid phone format rejected");

    // Invalid hex color
    const invalidColorResult = validateProfilePatch({ brandColors: ["not-a-color"] }, { gstEnabledGlobally: true });
    assert(invalidColorResult.issues.some((i) => i.field === "brandColors"), "Invalid hex color rejected");

    // Invalid website URL
    const invalidUrlResult = validateProfilePatch({ website: "ftp://invalid-url" }, { gstEnabledGlobally: true });
    assert(invalidUrlResult.issues.some((i) => i.field === "website"), "Invalid website URL rejected");

    // Invalid Indian PIN code
    const invalidPinResult = validateProfilePatch({ billing: { country: "India", postalCode: "123" } }, { gstEnabledGlobally: true });
    assert(invalidPinResult.issues.some((i) => i.field === "billing.postalCode"), "Invalid 3-digit PIN code for India rejected");

    // -------------------------------------------------------------------------
    // Test 9: Multi-tenant cross-client isolation
    // -------------------------------------------------------------------------
    console.log("\n[Test 9] Testing multi-tenant cross-client isolation...");
    // Create second client B
    await syncAuthenticatedClientUser({
      uid: CLIENT_B_UID,
      email: CLIENT_B_EMAIL,
      name: "Deepa Nair",
      phone: "+91 99887 76655",
      emailVerified: true,
      role: "client",
    });

    // Client A attempts to pass B's UID in payload
    const attackerPayload = {
      uid: CLIENT_B_UID,
      displayName: "Hacked Display Name",
    };
    const protectedIssues = assertNoProtectedFields(attackerPayload);
    assert(protectedIssues.length > 0, "Smuggled UID in payload is strictly rejected with 403");

    // Client A's session can only update Client A
    await updateProfile(sessionA, { displayName: "Legitimate Client A Update" }, { gstEnabledGlobally: true });
    const profileB = await getProfile(CLIENT_B_UID);
    assert(profileB.displayName === "Deepa Nair", `Client B's profile remained completely untouched: ${profileB.displayName}`);

    // -------------------------------------------------------------------------
    // Test 10: Database errors never produce false success
    // -------------------------------------------------------------------------
    console.log("\n[Test 10] Testing database error handling...");
    try {
      const invalidSession = {
        uid: "non_existent_uid_12345",
        email: "",
        name: "Ghost",
        role: "client",
        emailVerified: false,
      };
      await updateProfile(invalidSession, { displayName: "Fail Expected" }, { gstEnabledGlobally: true });
      assert(false, "Should not succeed for non-existent user with no email");
    } catch (err) {
      assert(err instanceof Error, `Database update throws real error on failure: ${err.message}`);
    }

    // -------------------------------------------------------------------------
    // Test 11: Admin status management persists to database
    // -------------------------------------------------------------------------
    console.log("\n[Test 11] Testing admin status toggle persistence...");
    await adminSetStatus(CLIENT_A_UID, "suspended", "Policy review");
    const suspendedDbUser = await prisma.user.findFirst({ where: { uid: CLIENT_A_UID } });
    assert(suspendedDbUser.status === "Disabled", `User status updated to Disabled: ${suspendedDbUser.status}`);

    const suspendedProfile = await getProfile(CLIENT_A_UID);
    assert(suspendedProfile.status === "suspended", `Profile status reflects suspended: ${suspendedProfile.status}`);

    // Re-activate
    await adminSetStatus(CLIENT_A_UID, "active");
    const activeDbUser = await prisma.user.findFirst({ where: { uid: CLIENT_A_UID } });
    assert(activeDbUser.status === "Active", `User status restored to Active: ${activeDbUser.status}`);

    // -------------------------------------------------------------------------
    // Test 12: Clean teardown of test records
    // -------------------------------------------------------------------------
    console.log("\n[Test 12] Cleaning up synthetic test records...");
    await prisma.user.deleteMany({
      where: {
        uid: { in: [CLIENT_A_UID, CLIENT_B_UID] },
      },
    });

    const verifyCleanup = await prisma.user.findMany({
      where: {
        uid: { in: [CLIENT_A_UID, CLIENT_B_UID] },
      },
    });

    assert(verifyCleanup.length === 0, "All synthetic test records cleaned up safely from development database");

  } catch (err) {
    console.error("Test runner encountered an error:", err);
    testFailed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\nTests Summary: ${testPassed} passed, ${testFailed} failed.\n`);
  if (testFailed > 0) {
    process.exit(1);
  }
}

runTests();
