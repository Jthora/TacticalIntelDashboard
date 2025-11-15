# Mode Architecture Blueprint

## Objectives
- Introduce a first-class `MissionMode` concept (`MILTECH`, `SPACEFORCE`).
- Keep mode state in a dedicated context + settings so UI/services stay in sync.
- Ensure ModernFeedService, adapters, and caches operate against the active mode profile.

## Components & Responsibilities

### 1. MissionMode Registry (new module)
- **Exports**: `MissionMode` enum, `modeProfiles` map, helpers (`getSourcesForMode`, `getDefaultTheme(mode)`, `getDefaultFeedList(mode)`).
- **Profiles** encapsulate:
  - Source catalog module pointers.
  - Default theme token (`'spaceforce'`, `'combat'`, etc.).
  - Default feed selection ID and marquee copy.
  - Accent colors + icon assets for UI.

### 2. MissionModeContext (upgrade existing `FeedModeContext`)
- Persist selected mode via `SettingsContext` (new `settings.general.mode`).
- Provide `mode`, `setMode`, and `profile` to consumers.
- Emit `useEffect` when mode changes so downstream services can react.

### 3. Theme Synchronization
- Extend `ThemeContext` to accept a `preferredTheme` from MissionMode.
- When mode flips, set theme to `profile.defaultTheme` unless the user toggled a manual override.
- Add new CSS tokens (e.g., `[data-theme="spaceforce"]`).

### 4. Source Registries
- Split `ModernIntelligenceSources.ts` into per-mode catalogs (MilTech = existing file, SpaceForce = new file).
- Build `SourceRegistry` helper that exposes mode-aware getters (`getPrimarySources(mode)`, etc.) and wraps `SourceToggleStore` to ensure overrides are keyed by `[mode, sourceId]`.

### 5. ModernFeedService Integration
- Replace static imports with registry lookups.
- Add `setMissionMode(mode)` to flush caches (`cachedResults`, `lastFetchTime`, `SourceToggleStore.clearMode()`), reload catalog references, and optionally kick off a fresh fetch.
- Ensure `getAvailableSources` and `toggleSource` respect the active mode at all times.

### 6. Intelligence Context + Adapters
- `getModernIntelligenceSourcesAsLegacy(mode)` should hydrate the context with mode-specific sources.
- `IntelSources` and `HomePage` must read `MissionModeContext` to choose the right defaults (feed list, labels, metrics).

## Event Flow (Mode Switch)
1. User opens header modal and selects SpaceForce/MilTech.
2. `MissionModeContext.setMode` updates context + settings + localStorage.
3. `useEffect` in context invokes:
   - `modernFeedService.setMissionMode(mode)`
   - `SourceToggleStore.useMode(mode)`
   - `IntelligenceContext.resetState()` + rehydrate via adapter
   - `ThemeContext.setTheme(profile.defaultTheme)` if not user-overridden
4. UI layers (LeftSidebar, Marquee, etc.) re-render with new data.

## Open Questions
- Do we need per-mode analytics hooks (e.g., mode-specific marquee copy, alerts)?
- Should mission mode affect routing (deep links to `?mode=spaceforce`)?
- Are there mode-specific feature flags (e.g., SpaceForce only features in beta)?

Track answers here as the implementation advances.
