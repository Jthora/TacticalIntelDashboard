Phase 1 Prune Status

Scope narrowed without deleting code. The following changes were applied to reduce lint/build surface and focus on the active app paths (routing from `src/routes/AppRoutes.tsx`).

What changed
- ESLint: expanded ignores for tests and clearly unmounted feature areas (see `eslint.config.js`).
- Unimported: expanded ignorePatterns to silence noise from archived areas (see `.unimportedrc.json`).
- Knip: project scope excludes archived areas; now reports only actionable unused items in the active surface (see `.knip.json`).
- TypeScript: excluded archived areas from program to speed up checks (see `tsconfig.app.json`).
- Fixes: corrected `scripts/deploy-auth-contract.ts` duplicate/unused declarations; removed regex escape issues in `src/components/FeedItem.tsx`.

Results
- ESLint (active surface): 202 remaining (145 errors, 57 warnings). Primarily `no-explicit-any`, some hook-deps warnings, and a few no-case-declarations.
- Knip (active surface):
  - Unused files (8):
    - src/components/HealthDashboard.tsx
    - src/components/IntelSourcesFixed.tsx
    - src/components/SystemControl/SystemControl.tsx
    - src/components/SystemHealth/SystemHealth.tsx
    - src/hooks/useEventBus.ts
    - src/hooks/usePerformanceOptimization.ts
    - src/hooks/useWeb3.ts
    - src/types/ethereum.d.ts
  - Unused deps (11) and devDeps (11) remain (kept until we decide to remove or revive features).

Notes
- Build currently fails due to missing Vite types for `import.meta.env` and asset imports and strict `exactOptionalPropertyTypes` in some modules. This is expected until Phase 2 remediation.

Proposed Phase 2
- Add asset module declarations and include `vite/client` types to restore build.
- Address `no-case-declarations` and a few small TS issues in active contexts/services.
- Decide whether to remove the 8 unused files or wire them; otherwise move to `archive/`.
