# AGENTS.md - SutraStudio Global Directives

Welcome to **SutraStudio**. All AI agents, contributors, and software engineers working in this repository must strictly adhere to the following directives and standards.

---

## 1. Core Development Principle

Always follow:
**Understand → Inspect → Reuse → Plan → Implement → Test → Review → Fix → Verify → Deliver**

Never start coding immediately without understanding the requirement and inspecting the existing project.

---

## 2. Project AI Documentation Hierarchy

Before implementing any feature or modification, AI agents must read these files in order:

```text
AGENTS.md (This file)
docs/
└── ai/
    ├── PROJECT.md          -> Product vision, requirements, master prompt pack & routes
    ├── DESIGN-SYSTEM.md    -> UI standards, SutraStudio warm-ivory tokens, typography, components
    ├── DEVELOPMENT.md     -> Engineering rules, code quality, Firebase + Google Drive patterns
    └── WORKFLOW.md         -> Implementation lifecycle, 30-step roadmap, Definition of Done
```

* [PROJECT.md](file:///d:/SutraStudio/docs/ai/PROJECT.md)
* [DESIGN-SYSTEM.md](file:///d:/SutraStudio/docs/ai/DESIGN-SYSTEM.md)
* [DEVELOPMENT.md](file:///d:/SutraStudio/docs/ai/DEVELOPMENT.md)
* [WORKFLOW.md](file:///d:/SutraStudio/docs/ai/WORKFLOW.md)
* [Master Prompt Pack](file:///d:/SutraStudio/SUTRA_STUDIO_UI_MASTER_PROMPT_PACK/01_MASTER/MASTER_PROMPT.md)

---

## 3. Brand & Design Directives

- **Brand**: SUTRA STUDIO — traditional Indian-inspired creative technology / design studio with a modern premium digital experience.
- **Theme**: Premium white / warm ivory (`#FAF9F5` / `#FFFFFF`), charcoal typography (`#171717`), muted brass accents (`#A98B57`), and warm borders (`#E5E1D8`).
- **No Neon / Cyberpunk**: Avoid neon glow, crowded layouts, heavy dark-mode-first designs, or excessive floating cards.
- **Micro-Interactions**: Subtle, purposeful interactions only; respect `prefers-reduced-motion`.
- **Responsive by Default**: Desktop, tablet, and mobile layouts are mandatory for every page and component.

---

## 4. Architecture & Engineering Guardrails

- **Data / Storage**: Firebase Authentication + Firestore (user/application/chat/order data) + Google Drive (media, video, 3D, documents).
- **No SQL Databases**: No MySQL / PostgreSQL in the modern architecture.
- **Security**: Never expose API keys or service account credentials in client-side code.
- **Page Count Rule**: Preserve exact route inventory; do not arbitrarily add or remove routes without explicit developer approval.
- **Reuse First**: Inspect existing components and utilities before creating new ones.
- **Zero Fake Implementations**: All interactive elements (forms, buttons, filters, portals) must be functional.
