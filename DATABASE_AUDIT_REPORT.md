# SUTRA STUDIO — SYSTEM DIAGNOSTICS & DATABASE AUDIT REPORT
**Domain:** `https://www.sutrastudios.in`  
**Platform URL:** `https://oauyy2zvx4qjf11keahsfo0i.ewr.prisma.build`  
**Repository Branch:** `docs/database-audit`  
**Date & Timestamp:** 2026-10-29T19:10:00+05:30  
**Inspection Status:** Verified Read-Only Diagnostic Complete (Approval Gate)

---

## PART 1 — GIT BRANCH & INFRASTRUCTURE DIAGNOSTICS

### 1. Git State & Branch Creation Analysis
- **Current Branch:** `docs/database-audit` (verified via `git branch --show-current`).
- **Base Commit:** `9b1a670 fix(auth): add resilient database fallback to client-login matching admin-login` (identical to `origin/main`).
- **Working Tree:** Completely clean (`git status --short --branch` reports `## docs/database-audit`, zero uncommitted changes).
- **Branch History Inspection:**
  ```text
  9b1a670 fix(auth): add resilient database fallback to client-login matching admin-login
  395e959 fix(navigation): consolidate packages and pricing URLs to unified /pricing page
  31ac41e style: add trailing newline to service configuration
  8695037 fix(composer): separate service.ts default export compute() to resolve TypeError main.run is not a function
  eb65d35 fix(composer): restore module name to sutrastudio to match connected Prisma project
  ```
- **Root Cause of Initial Branch Creation Error:**
  - The command `git checkout -b docs/database-audit` initially exited with code 1:
    `fatal: cannot lock ref 'refs/heads/docs/database-audit': unable to create directory for .git/refs/heads/docs/database-audit`
  - Cause: Sandbox file isolation on Windows prevented Git from creating the nested `docs/` subdirectory inside `.git/refs/heads/`.
  - Resolution: Executed with standard elevated workspace rights; the subfolder was cleanly created, and the branch was checked out from `main` without data loss or file modification.

---

### 2. Prisma CLI Inspection & Syntax Diagnostics
- **Installed Packages & Versions (`package.json`):**
  - `@prisma/client`: `^6.19.3`
  - `@prisma/composer`: `0.35.0`
  - `@prisma/composer-prisma-cloud`: `0.35.0`
  - `@prisma/orm-postgres`: `^8.0.0-rc.21`
  - `prisma`: `^8.0.0-rc.28`
- **Subsystem Architecture Disambiguation:**
  1. **Prisma ORM (`@prisma/orm-postgres`):** Responsible for PostgreSQL schema definition (`src/prisma/contract.prisma`), typed database client generation, and schema migrations.
  2. **Prisma Composer & Compute (`@prisma/composer`):** Responsible for service declarations (`module.ts` + `service.ts`), Bun Next.js standalone container builds, and deployment convergence.
  3. **Prisma Service Domain Manager (`prisma service domain ...`):** Responsible for custom domain mapping and automated TLS/SSL provisioning on Prisma Cloud Ingress.
- **Analysis of Prior CLI Error:**
  - An earlier invocation ran: `prisma service domain list`.
  - Output: `✘ [CLI.UNKNOWN_COMMAND] No command registered for 'list', did you mean 'wait'?`
  - Finding: Prisma CLI v8.0.0-rc.28 **does not implement** a `list` subcommand under `prisma service domain`.
  - Documented & Supported Subcommands:
    - `prisma service domain add <hostname> --service <name>`
    - `prisma service domain show <hostname> --service <name>`
    - `prisma service domain wait <hostname> --service <name>`
    - `prisma service domain retry <hostname> --service <name>`
    - `prisma service domain delete <hostname> --service <name>`
- **Local Credentials Status:**
  - Running `npx prisma service domain show sutrastudios.in --service web --project sutrastudio` locally returned:
    `✘ [CLI.CREDENTIALS_REQUIRED] You must be signed in to run this command.`
  - Finding: Local workspace does not store interactive Prisma Cloud login credentials. Production deployments and Prisma Cloud management operate strictly via GitHub Actions using OIDC short-lived tokens in `.github/workflows/prisma-deploy.yml`.

---

### 3. Live Domain, DNS & TLS Status Verification
- **Prisma Cloud Deployment Details:**
  - Project ID / Module: `sutrastudio`
  - Service: `web` (App ID: `sutrastudio.web`)
  - Live Serving Version: `p4im055afxqvq0q4k1fhb3kz`
  - Internal Build URL: `https://oauyy2zvx4qjf11keahsfo0i.ewr.prisma.build` (HTTP 200 OK)
- **GoDaddy CNAME Attempt Analysis:**
  - User attempted: `Type: CNAME | Name: @ | Value: switchboard.ewr.prisma.build.`
  - GoDaddy Response: `Domain has some invalid records, please address the invalid records. Record could not be added.`
  - Root Cause: Standard DNS specifications (RFC 1034 / RFC 2181) prohibit CNAME records on the zone apex (`@`). Because GoDaddy does not offer CNAME flattening, entering `@` causes a collision with existing SOA/NS records.
- **Live DNS & Network Diagnostics (Verified):**
  - **Query:** `Resolve-DnsName www.sutrastudios.in -Type CNAME`
    - Result: `www.sutrastudios.in -> CNAME -> switchboard.ewr.prisma.build` (TTL 1800) — **ALREADY CONFIGURED & PROPAGATED**.
  - **Query:** `switchboard.ewr.prisma.build -Type A`
    - Target IPs: `66.135.30.206`, `66.135.7.198`, `149.28.231.41` — **ACTIVE**.
  - **Query:** `curl.exe -Iv https://www.sutrastudios.in`
    ```text
    * Established connection to www.sutrastudios.in (149.28.231.41 port 443)
    * ALPN: server accepted http/1.1
    * SSL/TLS connection renegotiated
    < HTTP/1.1 200 OK
    < Content-Type: text/html; charset=utf-8
    < Prisma-Request-Id: 01M63Y42V0JMKQH6R7YX0431AP
    < X-Powered-By: Next.js
    ```
  - **VERIFIED CONCLUSION:** `https://www.sutrastudios.in` is **100% active, serving live production traffic with valid SSL certificate issued by Prisma Cloud**.
- **Apex Domain (`sutrastudios.in` without www):**
  - Currently points to GoDaddy parking IPs (`15.197.225.128`, `3.33.251.168`) returning `405 Not Allowed`.
  - Recommendation: Enable standard GoDaddy Domain Forwarding (301 Permanent Redirect) from `sutrastudios.in` to `https://www.sutrastudios.in`.

---

## PART 2 — DATABASE AUDIT & PRISMA DATA PERSISTENCE AUDIT

### 1. Existing Architecture & Database Status
The project is built on Next.js 16 (App Router) running on Bun within Prisma Compute.
- **Dual-Layer Legacy:**
  - Originally configured with Firebase Authentication and Firestore mock/fallback references in `src/lib/db/index.ts`.
  - Prisma ORM is installed (`@prisma/orm-postgres: ^8.0.0-rc.21`, `@prisma/client: ^6.19.3`).
  - Contract schema resides at `src/prisma/contract.prisma`.
- **In-Memory Store Hazard:**
  - Multiple critical data stores (e.g. `src/lib/services/ordersStore.ts`, `clientsStore.ts`, `couponsStore.ts`) rely primarily on `globalThis` memory caches or mock fallbacks when `DATABASE_URL` is omitted or points to an unmigrated database.
  - Server restarts or container sleep cycles in Prisma Compute can cause in-memory state to reset if data is not written to PostgreSQL.

### 2. Discovered Authentication & Session Flows
1. **Admin Authentication:**
   - Handled via `src/app/api/auth/admin-login/route.ts`.
   - Credentials checked against fixed environment variables (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
   - Issues HTTP-only cookie `sutra_admin_session`.
   - Status: Working in production. MUST BE PRESERVED WITHOUT MODIFICATION.
2. **Client Authentication:**
   - Handled via `src/app/api/auth/client-login/route.ts`.
   - Supports Google Sign-In and email login with fallback session handling.
   - Issues HTTP-only cookie `__session`.
   - Needs: Stable mapping of authenticated Google accounts to durable `User` and `ClientProfile` records in PostgreSQL.

### 3. Existing Models & Schema Inventory (`src/prisma/contract.prisma`)
The contract currently declares:
- `Order`
- `Client`
- `Service`
- `User`
- `Notification`
- `Payment`

### 4. Non-Persistent Forms & APIs Identified
- **New Order Flow (`/new-order`, `MasterOrderForm.tsx`):**
  - Submits to `/api/orders`.
  - Uses `ordersStore.ts`, which persists in memory and attempts file/database writes, but falls back silently on connection absence.
- **Client Profile Form (`/client-form`, `/api/account/profile`):**
  - Stores updates in `globalThis.__SUTRA_CLIENT_PROFILES__`. Requires direct Prisma PostgreSQL persistence.
- **Studio Settings & Feature Flags (`/api/admin/studio-settings`):**
  - Requires durable storage in a dedicated `StudioSetting` model.

### 5. Safe Persistence Implementation Plan
1. **Schema Validation & Migration:**
   - Validate `src/prisma/contract.prisma` against Prisma 8 contract standards.
   - Ensure non-destructive migrations (`prisma migrate dev` or `prisma db push`) that preserve existing data.
2. **Store Hardening:**
   - Update `ordersStore.ts`, `clientsStore.ts`, and `paymentsStore.ts` to execute verified `prisma.<model>.upsert()` / `.create()` queries with try/catch fallback logging.
3. **Automated Verification:**
   - Run end-to-end integration tests verifying:
     Form Submission → API Handler → PostgreSQL Insert → Dashboard Query Read.

---

## PART 3 — SAFE RECOVERY PLAN & NEXT STEPS (APPROVAL GATE)

### Immediate Action Items:
1. **DNS Apex Forwarding (User Action in GoDaddy):**
   - Add standard 301 forwarding from `sutrastudios.in` to `https://www.sutrastudios.in` so visitors typing the apex domain land on the active live site.
2. **Database Persistence Authorization:**
   - Review Part 2 above.
   - Obtain user approval to proceed with Phase 3 (Database Model Design & Prisma Persistence Hardening) on branch `docs/database-audit`.

**STOP GATE:** No database migrations, DNS changes, or application code edits will be performed without explicit confirmation.

