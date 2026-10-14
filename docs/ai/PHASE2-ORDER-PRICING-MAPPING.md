# Phase 2 — Order Pricing Display Mapping (STEP 5)

> Status: **documentation only** — no backend changes were made in Step 5.
> Frontend changes: `src/app/(client)/new-order/page.tsx`,
> `src/components/orders/MasterOrderForm.tsx`,
> `src/app/(public)/pricing/page.tsx`.

## 1. What Step 5 Did (frontend only)

The New Order flow (`/new-order`, `MasterOrderForm`) now displays the correct
selected pricing details while keeping the existing workflow unchanged:

- **Deep-link carry-over** — the Packages/Pricing page hands selections to
  New Order via the existing supported URL-parameter mechanism:
  - Individual services: `/new-order?service=<canonical-slug>`
  - A specific catalogue deliverable (display-only context):
    `/new-order?service=<canonical-slug>&deliverable=<display-item-id>`
  - Monthly plans: `/new-order?package=<canonical-retainer-slug>`
  - Quantity: `&qty=N` (server-validated 1–100, unchanged)
- **Monthly plan panel** — package name, monthly price, included image count,
  included video count + duration limit, revision policy, exclusions and
  billing frequency ("Billed every 30 days"), all resolved from the canonical
  retainer (`@/config/packages`).
- **Individual service panel** — service name, selected deliverable, canonical
  unit price, quantity stepper and an explicit **Subtotal** (`unit price ×
  quantity`).
- **No silent substitution** — if a deep-linked service/package identifier
  cannot be resolved, nothing is pre-selected and a visible notice asks the
  customer to choose. Step 1 cannot proceed without an explicit selection.
- **No fake authority** — every pricing block states the charged amount is
  re-validated against the studio catalogue at submission; the catalogue
  display price is labelled indicative.

## 2. Why The Submission Contract Was NOT Extended

The order API (`POST /api/orders`) resolves `package.tierId` against the
authoritative canonical catalogues (`@/config/services`, `@/config/packages`)
and re-validates the price server-side. The proposed single-service display
SKUs from Step 4 (`src/config/displayPricing.ts`, e.g. "Social media post —
₹299 per design") **do not exist** in the canonical catalogue, so a
`deliverableId` in the payload would either be ignored or rejected — and
adding server-recognised deliverable SKUs requires backend + catalog changes.

Per the Step 5 mandate (requirements 1, 6, 7, 8), the submission payload is
**byte-for-byte unchanged**: the `deliverable` URL parameter is rendered as
form context only and never enters `orderPayload`.

## 3. Required Phase 2 Mapping (backend work, not implemented)

| # | Phase 2 item | Detail |
|---|---|---|
| 1 | Canonical SKU per catalogue deliverable | Create canonical catalog entries (or priced variants) for each `DISPLAY_FIXED_PRICE_ITEMS` id in `src/config/displayPricing.ts` (16 items: 9 Image Creation, 7 Video Creation), published by the admin catalogue service so Firestore and server validation see them. |
| 2 | Deliverable → canonical ID map | Maintain a server-side map `displayItemId → canonical service/variant ID`. The frontend map already exists via `FixedDisplayPriceItem.serviceSlug`; Phase 2 adds the per-deliverable granularity. |
| 3 | Payload extension | Add optional `package.deliverableId` to the order payload; extend `POST /api/orders` validation to resolve it, validate the unit price against the canonical catalogue, and persist it on the order document. |
| 4 | Scoped-range confirmation flow | Replace the "Request Quote → /contact" hand-off for the six range services with an in-order scoped quote selector once server-side scoped pricing exists. |
| 5 | Monthly display-package alignment | The Step 4 display packages (Starter/Growth/Daily Creative) currently deep-link the approved canonical retainers (`starter-trend`, `growth-trend`, `daily-trend-creator`) whose quotas differ. Phase 2 either publishes the new quotas to the canonical retainers or introduces matching canonical packages, then updates `DISPLAY_MONTHLY_PACKAGES.canonicalSlug`. |
| 6 | Admin & client order views | Surface `deliverableId`/deliverable name in the admin order workspace and client order detail views. |

## 4. Invariants To Preserve In Phase 2

- Server-side price validation remains the single source of truth; frontend
  display prices are never authoritative for charging.
- Idempotency keys, UPI/UTR flow, `RouteGuard` authentication and the
  backward-compatible flat payload fields stay intact.
- Deep links must keep failing loudly (visible notice) rather than silently
  substituting a different service or package.
