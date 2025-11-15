# Migration & Validation Checklist

Use this sequence to ship the SpaceForce mode safely. Track status with `[ ]` → `[x]`.

## 1. Foundation
- [x] Create `MissionMode` enum + registry (profiles + helpers).
- [x] Update Settings schema (`settings.general.mode`).
- [x] Upgrade FeedModeContext → MissionModeContext with persistence + effects.
- [x] Extend ThemeContext to honor mode defaults.

## 2. Source Layer
- [x] Extract MilTech catalog behind registry.
- [x] Author SpaceForce catalog (primary/secondary/social).
- [x] Update `SourceToggleStore` for per-mode namespaces.
- [x] Teach ModernFeedService to accept mode + flush caches.
- [x] Ensure adapters (`getModernIntelligenceSourcesAsLegacy`) take mode parameter.

- [ ] Add dedicated mission-mode selector _(deferred, header modal removed per 2025-11-15 feedback)_.
- [x] Apply `[data-mode]` attributes + CSS tokens.
- [x] Update LeftSidebar/IntelSources to display mode metadata + reset selection.
- [x] Sync HomePage default feed logic with mode profile.
- [x] Refresh MarqueeBar copy per mode.

## 4. Persistence & Analytics
- [x] Store last mode in `localStorage`/settings.
- [x] Clear/rehydrate `IntelligenceContext` on mode switch.
- [x] Log mode-change telemetry event.

## 5. Testing
- [x] Unit tests: Source registry, toggle store, ModernFeedService mode switch.
- [x] Component tests: Mode switcher modal (RTL).
- [x] Component tests: ThemeContext + settings interplay.
- [ ] Manual QA: verify feed lists, toggles, caches for each mode; confirm fallback to MilTech works.

## 6. Documentation & Ops
- [ ] Update README / deployment docs to mention dual-mode capability.
- [ ] Add runbook snippet for switching default mode in prod.
- [ ] Announce change log entry detailing new feeds + UI changes.

Check items off here as the work progresses to keep everyone aligned on remaining tasks.
