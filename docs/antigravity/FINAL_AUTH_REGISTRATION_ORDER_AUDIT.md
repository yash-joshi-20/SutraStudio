# SUTRA STUDIO — FINAL AUTH, REGISTRATION & ORDER AUDIT
**Audit Date:** 2026-10-13  
**Auditor:** Senior Next.js 16, Firebase, Backend Security & QA Engineer  
**Reference Document:** SUTRA STUDIO Final Master Fix / Directive  

---

## 1. Executive Summary & Status

This comprehensive audit inspects and verifies the full security, authentication, client registration, order lifecycle, and administrative governance mechanisms inside the Sutra Studio codebase.

| Area | Verified State | Resolution / Mechanism |
| :--- | :---: | :--- |
| **Admin Credentials** | **PRESERVED & AUTHORITATIVE** | Hardcoded/configured admin account (`yashjoshi20@zohomail.in`, UID `Cehizz6pRDg4XGGuvBhyaFcZ0wE2`) holds `role=admin` claims. No resets or replacements occurred. |
| **Admin Login & Dashboard** | **VERIFIED** | `/admin/login` authenticates via Firebase Auth, verifies admin claims on `/api/auth/admin-login`, and issues an HTTP-only `sutra_admin_session` cookie granting immediate entry to `/admin`. |
| **Client Registration** | **VERIFIED & PERSISTED** | `/api/auth/register` creates Firebase Auth user, persists profile into Firestore `users/{uid}`, and registers directly with `ClientsStore` cache. |
| **Orders Persistence** | **VERIFIED & PERSISTED** | `/api/orders` recalculates and validates server-side pricing against catalog, creates Firestore `orders/{orderId}`, backs up to JSON store, and prevents client tampering. |
| **Dashboard Synchronization** | **VERIFIED** | Admin Dashboard reads both `OrdersStore` and `ClientsStore.syncFromFirestore()`, rendering live real-time or synced data without mock arrays. |
| **Multi-Tenant Security** | **VERIFIED** | Non-admin clients can only query orders matching their own UID (`clientUid === user.uid`). Client tokens cannot access `/admin/*`. |

---

## 2. Admin Credentials & Authentication Architecture

### 2.1 Approved Admin Identity
- **Authorized Email:** `yashjoshi20@zohomail.in`
- **Authorized UID:** `Cehizz6pRDg4XGGuvBhyaFcZ0wE2`
- **Role Claim:** `{ role: "admin" }` verified via `firebase-admin/auth`.
- **Status:** Actively verified via `scripts/set-admin-claim.ts --verify`. Email verified: `true`.
- **Integrity Rule:** Zero credential reset, rotation, password disclosure, or overwriting. Plaintext passwords are never logged, committed, or transmitted in reports.

### 2.2 Admin Session Lifecycle
- **Entrypoint:** `/admin/login` form.
- **Client Action:** Signs in with Firebase client SDK (`signInWithEmailAndPassword`).
- **Token Exchange:** ID token sent to `/api/auth/admin-login`.
- **Server Guard:**
  1. Checks if email belongs to `ADMIN_ALLOWED_EMAILS`.
  2. Verifies ID token with `adminAuth().verifyIdToken()`.
  3. Validates that `decoded.role === "admin"` or `isAdminClaim(decoded) === true`.
  4. Issues HTTP-only, secure `sutra_admin_session` cookie with 12-hour TTL (`ADMIN_SESSION_TTL_MS`).
- **Route Protection:**
  - `src/middleware.ts` inspects requests to `/admin/*`. Redirects unauthenticated requests or client-only sessions to `/admin/login`.
  - Server components under `/admin/*` invoke `requireAdmin()` verifying the cookie signature and role claim.

---

## 3. Client Registration & Directory Persistence

### 3.1 Registration Workflow
1. **User Action:** Client submits registration form (`/register`) with full name, email, password, and phone number.
2. **Account Creation:** Created in Firebase Auth.
3. **Database Write:**
   - Server-side `createProfileOnSignup()` writes to Firestore `users/{uid}` with fields:
     - `uid`: Firebase Auth UID
     - `email`: Authenticated email
     - `displayName` / `name`: Client name
     - `phoneNumber`: Contact number
     - `role`: `"client"` (Never allows client to claim `"admin"`)
     - `createdAt`: ISO timestamp
     - `status`: `"active"`
4. **Directory Synchronization:**
   - Newly registered clients are immediately synced to `ClientsStore` cache and Firestore `users` collection.
   - `GET /api/admin/clients` invokes `ClientsStore.syncFromFirestore()` prior to returning the roster, guaranteeing the Admin Dashboard displays newly created accounts immediately.

---

## 4. Orders Lifecycle & Pricing Integrity

### 4.1 Order Creation & Server-Side Anti-Tamper
- **Client Payload:** Client selects service (`serviceId`, tier, add-ons) and submits order.
- **Server Validation (`/api/orders` POST):**
  - Requires valid client session (`__session` or Bearer token).
  - Retrieves service item from the authoritative catalog (`src/lib/pricing/catalog.ts`).
  - Recalculates exact base price, add-ons, and taxes on the server.
  - Rejects orders where client-provided total diverges from server calculation.
  - Generates unique order ID (`ORD-...`).
  - Sets initial `status = "pending"`, `paymentStatus = "pending"`.
- **Persistence (`OrdersStore.addAsync`):**
  - Writes to Firestore collection `orders` under document ID `order.id`.
  - Atomically writes to local JSON fallback store (`data/sutra_orders_store.json`).
  - Returns `{ success: true, order: persistedOrder }`.

### 4.2 Multi-Tenant Read Isolation (`/api/orders` GET)
- If caller is **Admin**: Returns all orders in the system.
- If caller is **Client**: Filters strictly by `clientUid === user.uid`.
- If caller is **Unauthenticated**: Returns `401 Unauthorized`.

---

## 5. End-to-End Verification Matrix

| Test Requirement | Method | Result | Notes |
| :--- | :--- | :---: | :--- |
| Admin Claims Verification | CLI script verification | **PASS** | `yashjoshi20@zohomail.in` has valid `role: admin`. |
| Zero Credential Leakage | Static code & log review | **PASS** | No credentials logged, displayed, or exposed in git. |
| Production Build Compilation | Turbopack `next build` | **PASS** | Zero compile errors, all routes statically/dynamically generated. |
| Client Profile Creation | Firestore `users` mapping | **PASS** | Auth UID used as immutable key; role default is `"client"`. |
| Admin Directory Listing | `/api/admin/clients` sync | **PASS** | Real-time fetch from Firestore `users` with fallback. |
| Order Price Tamper Prevention | Backend recalculation | **PASS** | Server overrides/rejects forged amounts. |
| Role Separation | Session & middleware checks | **PASS** | Client sessions cannot view admin portals or other clients' orders. |
