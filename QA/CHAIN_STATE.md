# QA/CHAIN_STATE.md — Sutra Studio Fix Chain State

> This file is updated after each step completes.
> Resume from the first step NOT marked DONE.

---

## STEP 1 — Safety net and GitHub

- **Status**: DONE
- **Date**: 2026-10-05
- **Branch**: fixes (from main @ 983af99)
- **Commit**: (see below after push)
- **Tag**: demo-baseline

### Result

- Git already initialized with remote: https://github.com/yash-joshi-20/SutraStudio.git
- .gitignore verified: covers .env*, secrets/, scripts/backups/, *.zip, node_modules/, .next/
- scripts/backups/ removed from index (backup JSON was tracked — now fixed)
- Branch `fixes` created from `main`
- QA/BASELINE.md created with 30+ pages, 40+ API routes documented
- Build: PASS (95/95 routes), typecheck: PASS, lint: PASS
- Secrets clean: no sensitive files tracked

### Remaining

- Continue from Step 2 automatically

---

## STEP 2 — Find why login fails (diagnosis only)

- **Status**: IN PROGRESS

---

## STEP 3 — Fix session and cookie code bugs

- **Status**: PREVIOUSLY DONE (Prompt 1)
- Session route: uses body.idToken (verified)
- Activity cookie refresh in middleware: verified
- secure flag: depends on request protocol (verified)
- sameOrigin: localhost/127.0.0.1 allowed (verified)
- client-login: checks userRecord.disabled (verified)

---

## STEP 4 — Client login, sign-up, verification, reset

- **Status**: PENDING

---

## STEP 5 — Admin login and admin account

- **Status**: PENDING

---

## STEP 6 — Separation of client and admin and route protection

- **Status**: PENDING

---

## STEP 7 — Orders: store them in Firebase

- **Status**: PREVIOUSLY DONE (Prompt 2) — ordersStore migrated to Firestore

---

## STEP 8 — Order creation (server-side price) and New Order wizard

- **Status**: PENDING

---

## STEP 9 — Admin order control

- **Status**: PENDING

---

## STEP 10 — Payments (Google Pay / UPI)

- **Status**: PENDING

---

## STEP 11 — Delivery, approval, notifications, package rules

- **Status**: PENDING

---

## STEP 12 — AI chat places the same orders

- **Status**: PENDING

---

## STEP 13 — Packages and prices (one source, no storage text)

- **Status**: PENDING

---

## STEP 14 — API health and missing-key list

- **Status**: PENDING

---

## STEP 15 — Demo data (real, labeled, removable) and lock down open APIs

- **Status**: PENDING

---

## STEP 16 — n8n and the 12 services end to end

- **Status**: PENDING

---

## STEP 17 — Zero-error UI pass, final verdict, merge

- **Status**: PENDING
