# UI + Mode Switcher Plan

## Header Interaction
- Add a **MODE** button to `Header.tsx` controls (next to fullscreen/Web3).
- Clicking opens `ModeSwitcherModal` (new component) with:
  - Mode cards (MilTech, SpaceForce) showing name, tagline, key data domains.
  - Preview swatches (theme colors) and sample metrics (source count).
  - Primary action: "Activate" (immediate switch) + optional "Set as Default" toggle.

## Modal States
| State | Description |
|-------|-------------|
| Default | List both modes, highlight current selection. |
| Confirmation | After selecting new mode, show toast/snackbar summarizing changes (theme, sources). |
| Error | If mode swap fails (e.g., fetch error), fallback to previous mode and surface message. |

## Visual Language
- **SpaceForce**: deep navy background, neon cyan accents, starfield noise (CSS background), iconography (🚀, 🛰️).
- **MilTech**: keep existing combat/green palette.
- Add `[data-mode="spaceforce"]` attribute on `<body>` to style supporting modules (marquee copy, badges).

## Modules to Update
1. **Header (`Header.tsx`)**
   - Inject button, manage modal open state.
   - Display current mode badge (e.g., `MODE: SPACEFORCE`).
2. **MarqueeBar**
   - Pull copy from `modeProfiles[mode].marqueeMessage`.
3. **Left Sidebar / IntelSources**
   - Display mode-specific summary ("Space domain awareness feeds online").
   - Reset selected feed to `modeProfiles[mode].defaultFeed` after switch.
4. **SystemControl**
   - Add passive indicator showing mode + theme (theme dropdown remains for advanced overrides).
5. **Global Theme**
   - Extend CSS to support `data-theme="spaceforce"` tokens (typography, button states, background). Prototype in `App.css` + component styles.

## Accessibility Considerations
- Ensure color contrast meets WCAG for both themes.
- Mode switcher modal should be keyboard accessible (trap focus, Esc closes, buttons reachable via Tab).
- Announce mode changes via live region ("SpaceForce Mode activated").

## Telemetry
- Log mode changes with payload `{ from, to, timestamp }` for adoption metrics.
- Capture dismissal reasons if modal fails (optional).

## Fallback
- If modal cannot render (JS disabled, etc.), gracefully degrade to a dropdown in the header.

Keep this doc updated with wireframes/screenshots as the UI solidifies.
