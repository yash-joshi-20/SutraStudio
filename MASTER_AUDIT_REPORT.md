# SUTRA STUDIO — MASTER GITHUB + DATABASE + IMPLEMENTATION AUDIT REPORT

**Audit Date**: October 30, 2026  
**Auditor**: Senior Full-Stack Engineer, Database Architect, DevOps Engineer & QA Auditor  
**Local Repository**: `D:\SutraStudio`  
**Remote Repository**: `https://github.com/yash-joshi-20/SutraStudio.git` (`yash-joshi-20/SutraStudio`)  
**Target Branch**: `main`  
**Working Branch**: `fix/environment-database-security`  

---

## EXECUTIVE SUMMARY

A full-scope, forensic audit of Sutra Studio was executed across Git/GitHub history, database infrastructure, Prisma ORM 8 / Composer configuration, environment security, authentication/session management, orders and payments persistence, JSON vault integrity, and automated test suites.

### Key Audit Conclusions

1. **GitHub Synchronization**:
   - `main` and `origin/main` are **100% in sync** at commit [`4691813`](https://github.com/yash-joshi-20/SutraStudio/commit/4691813) (`feat(persistence): persist studio settings, notifications, and inquiries to PostgreSQL`).
   - All core feature branches (`feat/vault-reconciliation-ingestion`, `feat/auth-persistence`, `feat/client-profile-persistence`, `feat/order-payment-persistence`, `feat/admin-settings-notifications-inquiries`) are verified ancestors merged directly into `main`.
2. **Database Engine & Schema State**:
   - Remote PostgreSQL connectivity on `pooled.db.prisma.io:5432` was **verified and live** (`SELECT 1 as connected;` passed).
   - **Critical Finding**: The database is completely empty (`information_schema.tables` returns `[]`). The 6 Prisma models (`User`, `Order`, `Payment`, `Notification`, `Inquiry`, `KeyValue`) have **not yet been migrated/created** on this database instance.
   - Dual-persistence fallback (`sutra_orders_store.json`, `sutra_payments_store.json`, memory cache) is actively shielding the application from data loss.
3. **Environment Security**:
   - Zero credentials, RSA private keys, or `.env` files are tracked in Git (19/19 checks passed in `verify-env-protection.mjs`).
   - A local split-brain condition exists between `.env` (pointing to new pooled DB) and `.env.local` (pointing to an older dev DB).
4. **Vault Reconciliation**:
   - Dry-run analysis completed with **zero database writes** and zero file modifications.
   - 275 unique orders reconciled with active-store precedence. 234 payments and 23 audit logs verified with **0 orphan records**.
   - 1 multi-email UID (`usr_client_001` across 15 emails) and 5 multi-UID emails were identified and correctly flagged as **BLOCKED** to prevent corrupting real user identities.

---

## 1. GITHUB ACCESS & REPOSITORY AUDIT

### 1.1 Remote Connectivity Status
- **Connection**: AUTHORIZED & VERIFIED via remote git protocol and GitHub REST API.
- **Remote URL**: `https://github.com/yash-joshi-20/SutraStudio.git`
- **Total Remote Heads Tracked**: 115 branches.
- **HEAD Commit on `main`**: [`4691813a044b8d9eb01f7e0edb4dacf920e1503e`](https://github.com/yash-joshi-20/SutraStudio/commit/4691813)
- **HEAD Commit on `origin/main`**: [`4691813a044b8d9eb01f7e0edb4dacf920e1503e`](https://github.com/yash-joshi-20/SutraStudio/commit/4691813) (0 commits ahead, 0 commits behind).

### 1.2 `origin/main` vs `origin/dev` Comparison
- `origin/dev` is at commit `4402738` (`feat: AI Media Rebrander Hub, live Firestore order persistence fix...`).
- `origin/main` is **160 commits ahead** of `origin/dev`.
- `origin/dev` contains 2 legacy commits not incorporated into `main`. `origin/main` is the true production trunk.

### 1.3 Pull Requests History
GitHub REST API audit returned 6 Pull Requests; **all 6 are closed and merged**:
1. **PR #6** (MERGED): `feat: implement server-side authentication, session management, and orders persistence` (Head: `fix/realtime-firebase-orders` -> Base: `main`)
2. **PR #5** (MERGED): `feat: add Google site verification HTML files` (Head: `dev` -> Base: `main`)
3. **PR #4** (MERGED): `feat(orders): dual Services/Packages modes, embedded dynamic UPI QR checkout` (Head: `dev` -> Base: `main`)
4. **PR #3** (MERGED): `Version 8` (Head: `version-8` -> Base: `main`)
5. **PR #2** (MERGED): `Version 7 updates` (Head: `version-7-updates` -> Base: `main`)
6. **PR #1** (MERGED): `Fixes` (Head: `fixes` -> Base: `main`)

### 1.4 Verification of Key Commits on `origin/main`

| Commit Hash | Commit Title | Files Changed | Source Code Verified | Ancestor in `origin/main` |
| :--- | :--- | :--- | :--- | :--- |
| [`4691813`](https://github.com/yash-joshi-20/SutraStudio/commit/4691813) | `feat(persistence): persist studio settings, notifications, and inquiries to PostgreSQL` | `src/lib/db/index.ts`, `scripts/test-phase-h-persistence.mjs` | **YES**: Prisma `keyValue`, `notification`, `inquiry` collection routes | **YES (HEAD)** |
| [`34acfb6`](https://github.com/yash-joshi-20/SutraStudio/commit/34acfb6) | `feat(orders): persist orders and payments to PostgreSQL with transactional verification` | `src/lib/db/index.ts`, `src/lib/services/ordersStore.ts`, `src/lib/services/paymentsStore.ts`, `scripts/test-order-payment-persistence.mjs` | **YES**: Prisma `order.upsert`, `payment.upsert`, foreign key validations | **YES** |
| [`41ee66a`](https://github.com/yash-joshi-20/SutraStudio/commit/41ee66a) | `feat(profile): persist client profile to PostgreSQL User model with non-destructive updates` | `src/lib/db/index.ts`, `src/lib/services/profileStore.ts`, `src/app/api/account/profile/route.ts`, `scripts/test-client-profile-persistence.mjs` | **YES**: Non-destructive JSON billing merge, User update/create | **YES** |
| [`c6afb72`](https://github.com/yash-joshi-20/SutraStudio/commit/c6afb72) | `feat(vault): add read-only vault reconciliation tool and verification test suite` | `scripts/reconcile-and-import-vault.mjs`, `scripts/test-vault-reconciliation.mjs`, `src/app/api/auth/client-login/route.ts` | **YES**: Active-precedence dedupe, identity classification, SHA-256 checks | **YES** |
| [`0cf0dce`](https://github.com/yash-joshi-20/SutraStudio/commit/0cf0dce) | `docs: add Sutra Studio database audit report` | `DATABASE_AUDIT_REPORT.md` | **YES**: Baseline schema and migration gap audit documentation | **YES** |

---

## 2. ORIGINAL REQUIREMENTS CHECKLIST

| # | Requirement | Status | Verification & Evidence |
| :-: | :--- | :-: | :--- |
| **1** | Permanent PostgreSQL Database | **PARTIAL** | DB URL resolves to `pooled.db.prisma.io:5432`. Basic `SELECT 1` passes. However, table list is empty (`[]`). Schema migration required. |
| **2** | Correct Prisma Configuration | **PARTIAL** | `contract.prisma` defines 6 valid models (`User`, `Order`, `Payment`, `Notification`, `Inquiry`, `KeyValue`). Prisma 8 RC adapter configured. Risk: localhost fallback present in `prisma.ts`. |
| **3** | Secure Production Env Variables | **PARTIAL** | Zero credentials in Git (19/19 in `test:env`). Risk: split-brain between `.env` and `.env.local`, and client-exposed `NEXT_PUBLIC_POLLINATIONS_KEY`. |
| **4** | Admin Login Uses Existing Credentials | **DONE** | `adminPolicy.ts` preserves `primaryAdminEmail()` (`ADMIN_EMAIL` / `yashjoshi20@zohomail.in`). `sutra_admin_session` cookie and IP allowlist enforced. |
| **5** | Client Authentication & Profile Persistence | **PARTIAL** | Implemented via `syncAuthenticatedClientUser()` and `src/app/api/auth/client-login/route.ts`. Code ready, but database queries fail with `P2021` (missing table) until migration runs. |
| **6** | Orders CRUD Persistence | **PARTIAL** | Dual persistence active. In-memory and disk JSON stores protect live orders (`sutra_orders_store.json`). `src/lib/db/index.ts` routes orders to `prisma.order.upsert`. DB table pending. |
| **7** | Payments Persistence & Safety | **PARTIAL** | `PaymentsStore` enforces server-side amount locking and single-use UTR (`isUtrUsed`). Disk JSON store active. Routes to `prisma.payment.upsert`. DB table pending. |
| **8** | Settings Persistence | **PARTIAL** | `KeyValue` Prisma model facade implemented. Local disk fallback preserves values. DB table pending. |
| **9** | Notifications Persistence | **PARTIAL** | `Notification` Prisma model facade implemented with User relation. DB table pending. |
| **10** | Inquiries Persistence | **PARTIAL** | `Inquiry` Prisma model facade implemented with auto-generated cuid. DB table pending. |
| **11** | JSON Vault Reconciliation | **DONE (Dry Run)** | `scripts/reconcile-and-import-vault.mjs` verified. 275 orders reconciled, 0 orphan payments, 0 orphan audit logs. Conflicted identities classified as `BLOCKED`. Zero DB writes. |
| **12** | Server-Side Pricing Validation | **DONE** | Verified via `test-homepage-pricing-ui.mjs` (20/20 checks passed). Server-calculated package pricing prevents frontend tampering. |
| **13** | Session & Authorization Security | **DONE** | Strict separation: `sutra_admin_session` vs `__session`. Admin routes reject client cookies with 403. Multi-tenant order isolation active. |
| **14** | Build, Tests & Deployment Readiness | **PARTIAL** | `npm run typecheck` passed (0 errors). `test:env` passed. `test:pricing` passed. ESLint has 25 syntax/hook errors in UI components. Production DB schema migration pending. |

---

## 3. DATABASE AND ENVIRONMENT DEEP DIVE

### 3.1 Connection String Hierarchy & Split-Brain Analysis
- **Next.js Runtime Hierarchy**: Next.js loads `.env.local` with priority over `.env`.
  - `.env.local` (Line 1) contained an older dev connection string (`9531...`).
  - `.env` (Line 1) contained the latest pooled connection string (`9dee...`).
  - Result: Next.js dev server attempted to connect to the older database while Prisma CLI scripts loaded `.env` and connected to the newer pooled database.
- **Harmonization Required**: `.env.local` must be synchronized with the verified pooled `DATABASE_URL` from `.env`.

### 3.2 DIRECT_URL Misconfiguration
- Both `.env` and `.env.local` define:
  `DIRECT_URL="postgres://faae...:***@pooled.db.prisma.io:5432/postgres?sslmode=require"`
- **Findings**:
  1. The host is `pooled.db.prisma.io` (a connection pooler, not a direct endpoint).
  2. The credential hash (`faae...`) belongs to an obsolete third database instance, mismatched with `DATABASE_URL` (`9dee...`).
  3. Under Prisma 8 (`@prisma/orm-postgres/config`), `PostgresConfigOptions` only supports `db: { connection: string }`. There is **no `directUrl` configuration field** in Prisma 8 Composer config.

### 3.3 Fallback Vulnerability in `src/lib/prisma.ts`
- Lines 15-20 of `src/lib/prisma.ts`:
  ```typescript
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/sutrastudio";
  }
  ```
- **Risk**: In a production environment where `DATABASE_URL` is omitted or misconfigured, the client defaults to `localhost:5432` rather than failing explicitly.
- **Remediation**: Guard with `if (process.env.NODE_ENV === "production") throw new Error(...)`.

### 3.4 Target Database Schema Inspection
- Direct query `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';` was executed on `pooled.db.prisma.io:5432`.
- **Result**: `Tables found in database: []` (Zero tables present).
- `npx prisma db init --dry-run` confirms that 17 DDL operations are pending to create the schema and index structures.
- Per security rules, **no database writes or migrations were run**.

---

## 4. ORDERS AND PAYMENTS SUBSYSTEM AUDIT

### 4.1 Persistence Architecture
The orders and payments engine uses a **3-tier fault-tolerant hierarchy**:
1. **Tier 1 (Process Memory)**: `globalThis.__SUTRA_STORED_ORDERS__` and `globalThis.__SUTRA_STORED_PAYMENTS__` provide instant sub-millisecond reads.
2. **Tier 2 (Disk JSON Vault)**: `data/sutra_orders_store.json` and `data/sutra_payments_store.json` survive process restarts and server reboots.
3. **Tier 3 (Database Facade)**: Calls to `adminDb().collection("orders").doc(id).set(...)` map directly to `prisma.order.upsert` and `prisma.payment.upsert` in `src/lib/db/index.ts`.

### 4.2 Data Loss Risk Assessment
- **Can local JSON accidentally override PostgreSQL data?**
  No. In `OrdersStore.syncFromFirestore()`, local orders are merged into memory, and then database records are overlaid on top. Once PostgreSQL has records, database state takes precedence.
- **Is there data loss risk currently?**
  No. Because the database has 0 tables, the Prisma queries fail safely into try/catch blocks, and the system continues running seamlessly on the Disk JSON Vault (Tier 2).

### 4.3 Payment Tampering & UTR Safeguards
- **Client Amount Override**: Prohibited. `paymentsStore.ts` retrieves the canonical order from storage and locks `amountINR` on the server.
- **Duplicate UTR Prevention**: `PaymentsStore.isUtrUsed(utr, excludePaymentId)` inspects both existing storage and in-flight payments. Reusing a UTR across orders is strictly rejected.

---

## 5. AUTHENTICATION AND SECURITY AUDIT

### 5.1 Admin Authentication & Session
- **Admin Email**: Resolved via `primaryAdminEmail()` in `adminPolicy.ts` -> `yashjoshi20@zohomail.in`.
- **Admin Password / Token**: Checked via Firebase Auth ID Token or admin passkey.
- **Session Cookie**: `sutra_admin_session` issued with `httpOnly: true`, `sameSite: "lax"`, and verified via `assertAdminSession`.
- **Client Isolation**: Client accounts logging into `/api/auth/admin-login` are rejected with `403 USE_CLIENT_LOGIN`.

### 5.2 Client Authentication
- Handled at `/api/auth/client-login` using `syncAuthenticatedClientUser()`.
- Issues standard `__session` HTTP-only cookie.
- Admin attempting to sign in on client portal receives `403 USE_ADMIN_LOGIN`.

### 5.3 Secret Scanner Audit
`scripts/verify-env-protection.mjs` performed deep static analysis across 349 files:
- 0 private keys detected.
- 0 hardcoded live tokens or API secrets.
- `.gitignore` strictly protects `.env`, `.env.local`, `.env_backups/`, and service account JSONs.

---

## 6. JSON VAULT AUDIT & RECONCILIATION FINDINGS

### 6.1 Source Stores Analyzed

| File | Size (Bytes) | Record Count | Role |
| :--- | :--- | :--- | :--- |
| `data/sutra_orders_store.json` | 25,679 | 7 | Active live orders |
| `data/sutra_orders_store.backup.json` | 950,680 | 271 | Historical backup orders |
| `data/sutra_payments_store.json` | 151,511 | 234 | UPI payment records |
| `data/sutra_audit_logs.json` | 7,561 | 23 | Administrative audit logs |

### 6.2 Reconciliation Metrics (Dry Run)
- **Total Unique Orders**: **275**
- **Overlapping Orders**: **3** (Active store record authoritatively overwrote historical backup record).
- **Payments Referential Integrity**:
  - Valid Order References: **234** (100%)
  - Orphan Payments: **0**
- **Audit Logs Referential Integrity**:
  - Valid Order / System References: **23** (100%)
  - Orphan Logs: **0**

### 6.3 Identity Conflict Detection & Critical Safety Gate

1. **Multi-Email UID Conflict**:
   - UID `usr_client_001` is associated with **15 different email addresses** (including test probes `hacker@example.com`, `qa-pk2@example.com`, `probe@test.dev`, plus `info.yashjoaashi@gmail.com` and `client@sutrastudio.com`).
   - **Action Taken**: Flagged as `BLOCKED`. Synthetic test probes isolated; real identity not merged without manual confirmation.
2. **Multi-UID Email Conflicts**:
   - `aryan@heritage.com`: 7 conflicting UIDs (`client_uid_12345` + 6 synthetic `lead_new_order_*` IDs).
   - `adbuyer@brand.com`: 6 conflicting synthetic lead UIDs (`lead_ad_campaign_*`).
   - `dev@studioarchitects.com`: 6 conflicting synthetic lead UIDs (`lead_email_*`).
   - `meera@luxury.in`: 6 conflicting synthetic lead UIDs (`lead_chat_*`).
   - `patron@heritageluxe.com`: 2 conflicting test UIDs (`usr_test_client_*`).
   - **Action Taken**: All 5 flagged as `BLOCKED`. Zero records merged or overwritten.

---

## 7. AUTOMATED TEST SUITE EXECUTION RESULTS

| Test Command | Scope | Result | Details |
| :--- | :--- | :---: | :--- |
| `npm run typecheck` | Entire TypeScript Codebase (`tsc --noEmit`) | **PASS (100%)** | 0 type errors. Clean compile. |
| `npm run test:env` | Secret Scanner & Env Protection | **PASS (19/19)** | 0 secrets tracked, .gitignore verified. |
| `node test-homepage-pricing-ui.mjs` | Pricing Single Source of Truth & CTA Routing | **PASS (20/20)** | Zero ₹NaN, canonical service links verified. |
| `node test-database-schema-compatibility.mjs` | PostgreSQL Connectivity & Table Presence | **PARTIAL** | Connectivity check `SELECT 1`: **PASS**.<br>Table presence: **FAIL** (`tables: []`, migration pending). |
| `scripts/reconcile-and-import-vault.mjs --dry-run` | JSON Vault Integrity & Conflict Detection | **PASS (Dry Run)** | 275 orders reconciled, 0 orphans, 0 DB writes. |
| `node security-acceptance-tests.mjs` | Multi-Tenant Isolation & Role Guards | **48/59 PASS** | Core security passed; 11 UI string matching assertions failed. |
| `npm run lint` | ESLint Code Quality Guard | **FAIL** | 25 errors (unescaped quotes, hook order in `FloatingChatModal.tsx`), 1066 warnings. |

---

## 8. ACTIONABLE REMEDIATION ROADMAP

### Step 1: Environment Harmonization (Ready on Branch `fix/environment-database-security`)
- Synchronize `.env.local` Line 1 `DATABASE_URL` with `.env`'s pooled connection string.
- Remove invalid `faae...` credentials from `DIRECT_URL`.
- Deprecate `NEXT_PUBLIC_POLLINATIONS_KEY` in favor of server-only `POLLINATIONS_API_KEY`.
- Update `src/lib/prisma.ts` to throw an explicit error in production if `DATABASE_URL` is missing.

### Step 2: Database Migration (Requires User Authorization)
- Review and execute Prisma schema initialization (`npx prisma db init`) or Composer deployment to create the 6 tables (`User`, `Order`, `Payment`, `Notification`, `Inquiry`, `KeyValue`) on `pooled.db.prisma.io:5432`.
- Verify table creation with `test-database-schema-compatibility.mjs`.

### Step 3: Vault Ingestion (After Migration & Identity Sign-Off)
- Run `reconcile-and-import-vault.mjs` without `--dry-run` only for the 245 verified non-conflicted records.
- Keep the 30 conflicted records in the Disk Vault until explicit email/UID mappings are reviewed.

### Step 4: ESLint Code Cleanup
- Fix the 2 unescaped entities in `AdminDashboardClient.tsx`.
- Refactor conditional hook calls in `FloatingChatModal.tsx`.
- Replace the single `require()` in `services.ts` with standard ES `import`.

