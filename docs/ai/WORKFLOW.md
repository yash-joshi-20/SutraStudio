# WORKFLOW.md — SutraStudio Development & Verification Workflow

## 1. 10-Phase Lifecycle
Every task, component, or screen must follow this sequence:
```text
Understand → Inspect → Reuse → Plan → Implement → Test → Review → Fix → Verify → Deliver
```

---

## 2. Definition of Done
A task or feature is complete ONLY when:
- [ ] Requirements from PRD + TRD are fully implemented.
- [ ] Design adheres strictly to the warm-ivory / premium white palette in [DESIGN-SYSTEM.md](file:///d:/SutraStudio/docs/ai/DESIGN-SYSTEM.md).
- [ ] Responsive layouts verified across desktop, tablet, and mobile breakpoints.
- [ ] No fake buttons, broken links, or non-working forms.
- [ ] Pure Firebase + Google Drive architecture preserved (0 SQL packages).
- [ ] All 6 regression and security test suites pass with 100% (`npm test`).
- [ ] Zero build errors (`npm run build`) and zero type errors (`tsc --noEmit`).
- [ ] Route count and exact 21 canonical route URLs strictly preserved.

---

## 3. Regression & Security Test Matrix

The project maintains 6 automated regression and acceptance suites executed via `npm test`:

1. **Route Integrity Suite** (`scripts/regression-test.mjs`): Verifies exact 21 canonical routes (16 pages + 5 API endpoints) and default component exports.
2. **AI Workflow Isolation Suite** (`scripts/ai-workflow-regression.mjs`): Verifies whitelisted single-engine execution across all 8 creative pipelines without collateral dispatches.
3. **Storage & Vault Suite** (`scripts/storage-regression.mjs`): Verifies zero SQL dependencies, Drive file metadata, SHA-256 integrity checksums, and Firestore schemas.
4. **Production Checks Suite** (`scripts/production-checks.mjs`): Validates `.env.example`, executes recursive secret scanning, and checks client component boundary isolation.
5. **Final Acceptance Audit** (`scripts/final-acceptance-audit.mjs`): Enforces visual tokens, typography, WCAG skip navigation, and brand vector assets.
6. **Security & RBAC Acceptance Suite** (`scripts/security-acceptance-tests.mjs`): Tests live route guards, multi-tenant data isolation, chat takeover supervision, AI confidentiality shields, and public header privacy.

---

## 4. Standard Delivery Report Format

Every completed task concludes with a concise summary structured as follows:

### Implemented
What was added or modified.

### Files Changed
List of important files modified or created with markdown links.

### Reused
Existing components, design tokens, hooks, or assets utilized.

### Verification
Exact test actions, regression test passes, and build confirmations.

### Remaining
Any open questions or items marked TO BE CONFIRMED (TBC).
