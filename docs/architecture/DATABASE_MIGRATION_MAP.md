# DATABASE_MIGRATION_MAP.md - Database Strategy & Migration Policy

## 1. Current State
- Codebase contains **zero active MySQL or PostgreSQL tables**.
- System architecture is established on **Cloud Firestore** for application metadata and **Google Drive** for binary files and media.

## 2. Target Firestore Collection Architecture
- `users`: User profiles, roles (`client`, `admin`), preferences, Google Drive root folder reference.
- `clients`: Business details, brand guidelines, industry, company metadata.
- `services`: 12 studio services and workflow mappings.
- `packages`: Pricing and deliverable tiers.
- `orders`: Client orders, statuses (`pending`, `in_progress`, `completed`, `in_review`), timestamps.
- `projects`: Detailed milestones, progress percentages, assignees.
- `deliverables`: Asset IDs, Google Drive URLs, approval states.
- `conversations`: Client ↔ AI and Client ↔ Admin message threads.
- `workflowRuns`: Isolated execution runs per service category.
- `inquiries`: Public lead inquiries captured from `/contact`.
