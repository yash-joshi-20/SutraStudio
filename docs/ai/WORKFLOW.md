# WORKFLOW.md - SutraStudio Development & Verification Workflow

## 1. 10-Phase Lifecycle
Every task, component, or screen must follow this sequence:
```text
Understand → Inspect → Reuse → Plan → Implement → Test → Review → Fix → Verify → Deliver
```

---

## 2. 30-Step Master Progression
Development progresses through the structured steps defined in `SUTRA_STUDIO_UI_MASTER_PROMPT_PACK/02_STEPS/`:
1. **Step 01**: Route audit & exact page inventory verification.
2. **Steps 02-30**: Design system implementation, logo system, public pages, client portal, admin dashboard, AI workflows, and integration verification.

---

## 3. Definition of Done
A step or task is complete ONLY when:
- [ ] Requirements from the corresponding step/task are fully implemented.
- [ ] Design adheres strictly to the warm-ivory / premium white palette in [DESIGN-SYSTEM.md](file:///d:/SutraStudio/docs/ai/DESIGN-SYSTEM.md).
- [ ] Responsive layouts verified across desktop, tablet, and mobile breakpoints.
- [ ] No fake buttons, broken links, or stubbed non-working forms.
- [ ] No PostgreSQL / MySQL dependencies added; Firestore + Google Drive architecture preserved.
- [ ] Zero build errors, type errors, or console regressions.
- [ ] Page count and route structure strictly preserved.

---

## 4. Standard Delivery Report Format
Every completed step or task must conclude with the structured report:

### CHANGED
List of files created or modified with markdown links.

### REUSED
Existing components, design tokens, hooks, or assets utilized.

### VERIFIED
Exact test actions, device breakpoints checked, and build confirmations.

### REMAINING
Next steps in the roadmap or dependencies pending.
