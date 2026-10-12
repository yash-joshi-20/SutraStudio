# SUTRA STUDIO — Catalog Precedence, Pricing Governance & Order Immutability

This specification defines the single source of truth, reconciliation precedence, and lifecycle immutability rules governing services, packages, and pricing across the public storefront, client portal, order pipeline, and administrative console.

---

## 1. Catalog Source Hierarchy & Precedence Rules

When resolving service metadata, pricing, packages, or intake schemas, the following precedence order is strictly enforced:

```text
[1. CANONICAL CODE INVARIANTS] (Highest Authority: Safety Bounds)
       ↓
[2. ADMIN FIRESTORE REPOSITORY] (Runtime Active Configuration)
       ↓
[3. IN-MEMORY RUNTIME CACHE] (High-Performance Server State)
       ↓
[4. SEED CORPUS FALLBACK] (Cold Start Default)
```

### Precedence Explanation:

1. **Canonical Invariants (Highest Authority)**:
   - Defined in [`src/config/services.ts`](file:///d:/SutraStudio/src/config/services.ts), [`src/config/packages.ts`](file:///d:/SutraStudio/src/config/packages.ts), and [`src/lib/services/catalogData.ts`](file:///d:/SutraStudio/src/lib/services/catalogData.ts).
   - Invariant Rules:
     - **Strict ₹20,000 Price Ceiling**: No standalone service starting price or monthly package rate may exceed ₹20,000.
     - **Currency**: Must be Indian Rupee (`INR` / `₹`).
     - **Positive Values**: Prices cannot be negative or non-finite.
     - **Delivery SLA**: Must be an integer >= 1 day.
     - **Revisions Included**: Must be an integer >= 0.
   - Any administrator update that attempts to violate these invariants is **rejected at the API boundary** (HTTP 400 Bad Request).

2. **Admin Firestore Repository (Runtime Active Configuration)**:
   - Stored in Cloud Firestore collections `services` and `plans`.
   - Authorized changes made by verified studio administrators via [`/api/admin/catalog`](file:///d:/SutraStudio/src/app/api/admin/catalog/route.ts) that satisfy the canonical invariants are saved here.
   - These runtime rates govern new inbound orders and storefront display.

3. **In-Memory Runtime Cache**:
   - `ServiceCatalogService` maintains `globalStore.__SUTRA_CATALOG_SERVICES__` and `globalStore.__SUTRA_CATALOG_PLANS__` to deliver zero-latency reads across serverless and warm processes while persisting changes to disk and Firestore.

4. **Seed Corpus Fallback**:
   - `SEED_CATALOG_SERVICES` and `SEED_CATALOG_PLANS`. Used when Firestore is cold or during initial database provisioning.

---

## 2. Confirmed Order Immutability (Snapshot Isolation)

**Hard Business Rule**: Confirmed orders retain their original agreed commercial price snapshot in perpetuity.

- When a client commissions an order (or an automated invoice is generated), the order document stores:
  - `totalAmount`: The exact agreed price at the moment of checkout/confirmation.
  - `amountPaid`: The verified transaction amount.
  - `items`: Itemized breakdown with historical unit prices and quantities.
- When an administrator modifies a catalog price or archives a service:
  - **Existing Confirmed Orders Are Never Mutated**: The historical orders retain their original pricing snapshot.
  - **New Orders Use The Updated Catalog**: Only orders initiated *after* the change will reflect the updated rate.

---

## 3. Non-Destructive Deprecation (Referenced Orders Protection)

**Hard Business Rule**: Do not delete or rename a service referenced by a confirmed order. Archive/deactivate instead.

- **Referenced Status Check**:
  Before allowing deletion (`DELETE /api/admin/catalog`) or ID/slug alteration (`PATCH /api/admin/catalog`), the server queries the order repository (`OrdersStore.getAll()`).
  - Confirmed statuses: `paid`, `approved`, `in_production`, `completed`, `active`, `confirmed`, `delivered`.
- **Enforcement**:
  - If a service or plan is referenced by at least one confirmed order:
    - **Deletion Attempt**: Blocked with `HTTP 409 Conflict` (`REFERENCED_BY_CONFIRMED_ORDER`).
    - **ID / Slug Rename Attempt**: Blocked with `HTTP 409 Conflict`.
    - **Permitted Action**: The service can only be marked as inactive (`active: false`), archiving it from public selection while keeping all historic client links, invoices, and deliverables fully intact.

---

## 4. Administrative Audit Trail Ledger

Every catalog change is recorded in the immutable administrative ledger via [`AuditLogService`](file:///d:/SutraStudio/src/lib/services/auditLogService.ts):

Each audit entry records:
- `who`:
  - `uid`: Authenticated Administrator UID (from verified session cookie).
  - `email`: Administrator email address.
  - `role`: Server-verified role (`admin`).
- `what`: `SYSTEM_CONFIG_UPDATED`.
- `when`: ISO 8601 timestamp.
- `targetType`: `system`.
- `targetId`: Service or Plan ID.
- `targetTitle`: Service or Plan Name.
- `before`: Exact snapshot of modified fields prior to edit.
- `after`: Exact snapshot of modified fields after edit.
- `note`: Human-readable summary of the modification.
- `type`: `info` (for price updates) or `warning` (for deactivations/archivals).

---

## 5. Security & Authentication Boundary

- All catalog mutation routes (`/api/admin/catalog`) are protected by `requireAdmin()`.
- Identity and clearance are verified exclusively using:
  1. The HttpOnly server cookie `sutra_admin_session`.
  2. Firebase Admin SDK token verification (`adminAuth().verifySessionCookie`).
  3. Server custom claims (`user.role === 'admin'`).
  4. Verified email allowlist (`isAdminAllowedEmail`).
  5. 30-minute inactivity timeout.
- Browser-supplied roles, query parameters, or client-side JSON cookies are strictly rejected.
