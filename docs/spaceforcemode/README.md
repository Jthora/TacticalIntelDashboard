# SpaceForce Mode Initiative

This folder holds the working documents for overhauling Tactical Intel Dashboard with the dual-mode experience (MilTech + SpaceForce). SpaceForce Mode becomes the default operating profile while MilTech Mode preserves the current experience. Each document keeps us aligned on scope, owners, and acceptance criteria.

## Document Map

| File | Purpose |
|------|---------|
| `MODE_ARCHITECTURE.md` | Defines the cross-cutting architecture changes (contexts, registries, persistence, services). |
| `SOURCE_STRATEGY.md` | Lists MilTech vs. SpaceForce source catalogs, toggle storage rules, and registry contracts. |
| `UI_MODE_SWITCHER.md` | Captures UX flow for the new mode switcher, theming expectations, and visual language. |
| `MIGRATION_CHECKLIST.md` | Step-by-step execution and validation list to ship the feature without regressions. |

## Guiding Principles

1. **Mode = Persona, not just theme.** Swapping modes changes sources, defaults, and copy, not only CSS.
2. **SpaceForce first.** Fresh installs load SpaceForce sources and palette unless the user explicitly reverts.
3. **Isolation.** Each mode owns its own toggle state, cache, and analytics so operators can tune independently.
4. **Fast rollback.** MilTech must remain fully functional and selectable until SpaceForce reaches parity.

Use these documents as living specs—update status sections as the work progresses.
