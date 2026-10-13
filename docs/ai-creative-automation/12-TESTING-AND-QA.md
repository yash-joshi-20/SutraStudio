# 12 — Testing, Quality Gates & Verification

The Sutra Studio AI Creative Automation Engine undergoes rigorous automated verification across static typing, unit testing, integration workflows, and UI sanity checks.

---

## 🚦 Verification Commands

Run these automated verification suites from the project root:

```bash
# 1. Type Check (Zero TypeScript errors)
npm run typecheck

# 2. Lint Check (ESLint & code quality rules)
npm run lint

# 3. Unit & Integration Test Suites
npm run test
```

---

## 🧪 Automated Test Matrices

### 1. Dynamic Workflow & Dependency Validation
- **Prerequisite Enforcement**: Validates that steps requiring upstream inputs (e.g. Step 4 requiring Step 3, Step 6 requiring Step 5) cannot execute prematurely.
- **Workflow Duplication**: Validates that calling `duplicateWorkflowTemplate` creates a completely isolated new ID and steps array without mutating the source template.

### 2. Provider Adapter & Missing Key Behavior
- **Zero Mock Validation**: Verifies that when `KLING_API_KEY` or `BFL_API_KEY` is undefined, adapters return structured missing key notices rather than mock media strings.
- **Graceful Fallback**: Verifies that when `BFL_API_KEY` is missing, the adapter router falls back seamlessly to `PollinationsImageAdapter` or `LocalTemplateAdapter`.

### 3. State Machine Integrity
- **Permitted Transitions**: Validates transitions:
  - `draft → queued → processing → quality_check → completed`
  - `processing → failed → queued` (retry)
  - `processing → cancelled`
- **Idempotency**: Verifies that executing `advanceStep` or `executeStepRunner` twice on the same step does not produce duplicate billing entries or corrupted step indices.

### 4. Admin API Authorization
- **Unauthenticated Access**: Verifies that requests without admin cookies receive `401 Unauthorized`.
- **CSRF Block**: Verifies that requests with foreign `Origin` or `Referer` headers are rejected with `400 Bad Request (Cross-origin request blocked)`.
