# SUTRA STUDIO — Orders Storage & Pricing Consistency: Diagnosis

## Verified against the running application (dev server, live HTTP probes)

### BUG 1 — CRITICAL: Unauthenticated full order-ledger leak (this is why "orders look broken")

`GET /api/orders` computed admin scope from **client-controlled inputs**:

```ts
const isAdminScope =
  user.isAdmin || user.role === "admin" ||
  scope === "admin" ||              // ?scope=admin  -> anyone
  referer.includes("/admin");       // Referer: /admin -> anyone
```

Live proof (no cookies, no auth header at all):

| Request | Result |
|---|---|
| `GET /api/orders` | `totalCount: 0` (correct) |
| `GET /api/orders?scope=admin` | **`totalCount: 254`** — entire studio ledger, client emails + phones |
| `GET /api/orders` + `Referer: /admin/orders` | **`totalCount: 254`** — same leak |

### BUG 2 — CRITICAL: Unauthenticated per-client lookup leak

```ts
} else if (targetClientUid || targetEmail) {   // reached ONLY when unauthenticated
  filtered = filtered.filter(...)
```

Live proof (no auth):

| Request | Result |
|---|---|
| `GET /api/orders?email=qa-pkg@example.com` | **`totalCount: 1`** — full order record incl. email/phone/amounts |
| `GET /api/orders?clientUid=usr_client_001` | **`totalCount: 23`** — 23 orders |

### BUG 3 — Firestore quota exhaustion spam

`RESOURCE_EXHAUSTED: Quota exceeded` fires on every request from
`OrdersStore.findByIdAsync` and `ClientsStore.syncFromFirestore`, which have no
cooldown (unlike `OrdersStore.syncFromFirestore`, which does).

## Order WRITE path verified working

`POST /api/orders` stores correctly for every shape tested:
standalone service, per-unit qty multiplier, packs, quarterly/annual retainer,
seed-catalog service, plan, and client-portal razorpay_checkout.
`npm run test:orders` → **48/48 assertions pass**.

## Pricing drift found across pages (canonical: min ₹99, max ₹19,999)

| File | Line | Value shown | Canonical |
|---|---|---|---|
| `src/app/layout.tsx` | 147 | `priceRange: "₹499 - ₹9,999"` | `₹99 - ₹19,999` |
| `src/app/(public)/pricing/layout.tsx` | 6,13 | "from ₹2,499" | from ₹99 |
| `src/app/HomeClient.tsx` | 600 | "₹15k – ₹40k" (exceeds ₹20,000 ceiling) | catalog-derived |
| `src/app/admin/brand-guide/page.tsx` | 145,1475 | Retainers 14,999 / 29,999 / 59,999 | 9,999 / 14,999 / 19,999 |
| `src/app/admin/marketing/page.tsx` | 1487-1488 | "Starter (₹14,999/mo)", "Growth (₹29,999/mo)" | 9,999 / 14,999 |
