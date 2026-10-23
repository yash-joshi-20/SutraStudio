# SUTRA STUDIO — PRISMA & NEON POSTGRESQL MIGRATION PLAN
**Document Version**: 1.0.0  
**Status**: APPROVED FOR EXECUTION  
**Branch**: `feature/migrate-prisma-neon-postgres`  
**Target Architecture**: Prisma ORM 6.x + Neon Serverless PostgreSQL (`provider = "postgresql"`)

---

## 1. Executive Summary & Objective

In accordance with user instructions:
1. Conduct a comprehensive review of all unnecessary, obsolete, and leftover files across the repository.
2. Formulate a step-by-step execution plan documented in this specification.
3. Completely delete all unnecessary, legacy, and dead script/backup files.
4. Migrate database engine from SQLite to **Neon Serverless PostgreSQL** using **Prisma ORM**.
5. Maintain 100% route integrity (all 144 Next.js routes), zero fake implementations, zero secret leakage, and clean compilation.

---

## 2. Review of Unnecessary & Obsolete Files to Delete

| File Path | Nature / Reason for Deletion | Action |
|:---|:---|:---|
| `scripts/bootstrap-super-admin.ts` | Legacy script importing `firebase-admin` to bootstrap admin claims. | **DELETE** |
| `scripts/check-and-clear-admin-lock.ts` | Legacy script targeting Firestore `admin_login_attempts`. | **DELETE** |
| `scripts/set-admin-claim.ts` | Legacy script setting Firebase Auth custom claims. | **DELETE** |
| `scripts/set-admin-password.ts` | Legacy script modifying Firebase Auth user passwords. | **DELETE** |
| `scripts/step1-e2e-real-accounts-test.ts` | Legacy test issuing HTTP requests to Google Firebase Auth REST endpoints. | **DELETE** |
| `scripts/test-auth-and-packages-verification.mjs` | Legacy test verifying Firebase Auth users and token issuance. | **DELETE** |
| `backups/admin_panel_backup.zip` | Obsolete zip archive. | **DELETE** |
| `backups/cleanup_obsolete_files_backup_20261021.zip` | Obsolete zip archive. | **DELETE** |
| `backups/master_prompt_pack_backup.zip` | 53 MB obsolete zip archive. | **DELETE** |
| `backups/md_files_backup.zip` | Obsolete zip archive. | **DELETE** |
| `backups/SUTRA_STUDIO_UI_MASTER_PROMPT_PACK/` | Duplicate prompt pack backup copy. | **DELETE** |
| `backups/docs/` | Duplicate docs backup copy. | **DELETE** |
| `backups/mobile/` | Duplicate mobile backup copy. | **DELETE** |

*Note: `scripts/create-admin.ts` will NOT be deleted; it will be modernized into a pure Prisma CLI tool to seed/manage admin accounts in Neon Postgres.*

---

## 3. Neon PostgreSQL Architecture & Configuration

### 3.1 Prisma Schema Specification (`prisma/schema.prisma`)
- Change `provider = "sqlite"` to `provider = "postgresql"`.
- Support connection pooling (`url = env("DATABASE_URL")`) and direct migration connectivity (`directUrl = env("DIRECT_URL")`).
- Use `@db.Text` on all stringified metadata and JSON attributes for high capacity in PostgreSQL:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id              String   @id @default(cuid())
  uid             String   @unique
  email           String   @unique
  passwordHash    String?
  name            String
  phone           String?
  role            String   @default("client") // "client" | "admin"
  photoURL        String?
  emailVerified   Boolean  @default(false)
  company         String   @default("")
  tier            String   @default("Standard")
  status          String   @default("Active")
  billingData     String?  @db.Text
  driveFolderId   String   @default("")
  driveFolderLink String?
  adminNotes      String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  orders          Order[]
  payments        Payment[]
  notifications   Notification[]
}

model Order {
  id            String   @id
  orderNumber   String   @unique
  clientUid     String
  clientName    String
  clientEmail   String
  service       String
  packageName   String?
  packageId     String?
  totalAmount   Float
  amountPaid    Float    @default(0)
  status        String   @default("pending_verification")
  paymentStatus String   @default("pending_payment")
  turnaround    String?
  brief         String?  @db.Text
  source        String   @default("web")
  metadata      String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User?    @relation(fields: [clientUid], references: [uid])
  payments      Payment[]
}

model Payment {
  id            String   @id
  orderId       String?
  clientUid     String?
  clientEmail   String?
  amount        Float
  method        String   @default("upi_qr")
  status        String   @default("pending_verification")
  utr           String?
  receiptUrl    String?
  metadata      String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User?    @relation(fields: [clientUid], references: [uid])
  order         Order?   @relation(fields: [orderId], references: [id])
}

model Notification {
  id        String   @id @default(cuid())
  userUid   String?
  title     String
  message   String   @db.Text
  type      String   @default("system")
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userUid], references: [uid])
}

model Inquiry {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  service   String?
  message   String?  @db.Text
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model KeyValue {
  key       String   @id
  value     String   @db.Text
  updatedAt DateTime @updatedAt
}
```

### 3.2 Neon Client Singleton (`src/lib/prisma.ts`)
- Configured to support standard PostgreSQL connection pooling over TCP, as well as Neon serverless pooling adapter if `@neondatabase/serverless` is configured.
- Graceful fallbacks for local development / testing without crashing when offline.

### 3.3 Environment Variables Setup (`.env`, `.env.example`, `.env.local`)
- `DATABASE_URL`: `postgresql://<user>:<password>@<ep-pooler>.neon.tech/neondb?sslmode=require`
- `DIRECT_URL`: `postgresql://<user>:<password>@<ep-direct>.neon.tech/neondb?sslmode=require`

---

## 4. Execution Roadmap

1. **Step 1**: Commit this plan document in `docs/ai/PRISMA_NEON_MIGRATION_PLAN.md`.
2. **Step 2**: Remove all 13 reviewed unnecessary and obsolete files.
3. **Step 3**: Modernize `scripts/create-admin.ts` to use Prisma.
4. **Step 4**: Update `prisma/schema.prisma` with PostgreSQL provider and `@db.Text` attributes.
5. **Step 5**: Update `src/lib/prisma.ts` and environment templates.
6. **Step 6**: Run `npx prisma generate` to build updated Prisma Client for PostgreSQL.
7. **Step 7**: Run full verification suite (`npm run typecheck`, `npm run build`, `npm test`).
8. **Step 8**: Commit to `feature/migrate-prisma-neon-postgres`, push to origin, merge into `main`, and push to `origin/main`.
