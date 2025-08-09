# Feed Item UI Redesign Specification

Status: Draft
Owner: UI/Platform
Date: 2025-08-08
Scope: Intelligence Feed items (layout, typography, spacing, colors, buttons, badges)

## 1. Objectives
- Achieve visual parity with sidebar/module aesthetic
- Enforce design token usage (spacing, radius, font sizes, colors)
- Reduce visual noise (excess gradients, shadows, arbitrary transforms)
- Unify button and badge systems for themeability and accessibility
- Remove duplicate component & inline styles for maintainability
- Increase information density without sacrificing readability

## 2. Current Issues (Summary)
| Category | Problem |
|----------|---------|
| Components | Two FeedItem components (duplication) |
| Spacing | Raw px values (14,16,10,12) outside token scale |
| Radius | 8px / 12px / 3px / 4px mixed; tokens end at 4px |
| Colors | Arbitrary hex & rgba, gradients, no semantic vars |
| Buttons | Uses `.action-button` (context-leaky), not unified with `.btn` |
| Badges | Inline styles; inconsistent patterns; not tokenized |
| Typography | Raw px sizes (9,10,16) not all bound to tokens |
| Palette | Multiple accent hues (#00ff7f, #00bfff, #ff4444) unsourced |
| Animations | Over-broad transitions (transform+shadow+opacity) |
| Theming | Inline style prevents palette overrides |

## 3. Target Principles
1. Single Source: One FeedItem component
2. Token Alignment: 100% spacing, font sizes, radii, colors reference CSS variables
3. Minimalist Density: Tighten vertical rhythm (4–8px steps) but preserve scannability
4. Semantic Color Layer: Introduce feed-scoped custom properties mapping to global palette
5. Variants Over Inline: Badges & priority use modifier classes
6. Accessible Contrast: All text WCAG AA on dark surfaces
7. Predictable Motion: Limit to opacity + subtle background/border changes (<=0.2s)

## 4. Design Tokens (Additions)
To be appended to `:root` or a feed namespace wrapper:
```
--feed-surface: rgba(0,15,15,0.85);
--feed-surface-hover: rgba(0,25,25,0.9);
--feed-border: rgba(0,255,170,0.2);
--feed-border-hover: rgba(0,255,170,0.4);
--feed-divider: rgba(0,255,170,0.15);
--feed-tag-bg: rgba(0,153,255,0.15);
--feed-tag-border: rgba(0,153,255,0.35);
--feed-tag-text: var(--accent-blue);
--feed-priority-critical: var(--accent-red);
--feed-priority-high: var(--accent-orange);
--feed-priority-medium: var(--accent-blue);
--feed-priority-low: var(--text-muted);
--feed-type-intel: var(--accent-cyan);
--feed-type-news: var(--accent-blue);
--feed-type-alert: var(--accent-orange);
--feed-type-threat: var(--accent-red);
--feed-fade-duration: 0.18s;
```

## 5. Spacing & Layout Spec
| Element | Current | New |
|---------|---------|-----|
| Feed item padding | 14px 16px | var(--spacing-lg) var(--spacing-xxl) (4px 8px) |
| Item margin-bottom | 12px | var(--spacing-xxl) (8px) |
| Header gap | 8px | var(--spacing-sm) (2px) or sm+ (evaluate) |
| Header bottom margin | 10/12px | var(--spacing-lg) (4px) |
| Title margin-bottom | 12px | var(--spacing-lg) (4px) |
| Bottom row margin-top | 10px | var(--spacing-lg) (4px) |
| Bottom row padding-top | 10px | var(--spacing-lg) (4px) |
| Tag gap | 6px | var(--spacing-md) (3px) |

Rationale: Consolidate to token scale, remove unreferenced values.

## 6. Typography Spec
| Element | Current | New |
|---------|---------|-----|
| Title | 16px (raw) | var(--font-size-lg) (14px) OR keep 16px via var(--font-size-xl) if readability demands |
| Timestamp | implicit | var(--font-size-xs) (8px) + var(--text-secondary) |
| Badges | 9-10px raw | var(--font-size-xs) (8px) or var(--font-size-sm) (10px) consistent |
| Buttons | var(--font-size-sm) from .btn | Keep (10px) |

Decision: Prototype both 14px and 16px titles; default to 14px for density if legibility acceptable.

## 7. Badge System
Class taxonomy:
- `.feed-badge` base styles
- Variants: `.priority-critical|high|medium|low`, `.type-intel|news|alert|threat`, `.tag`, `.comments`
Rules:
- Use background + border from token variables
- Uppercase, letter-spacing 0.5px, font-size var(--font-size-xs|sm)
- Border-radius: var(--radius-md) (2px)
- Remove gradients, inline color strings.

## 8. Buttons
Replace `.action-button` usage with `.btn feed-btn` (optional size variant):
```
.feed-btn { 
  padding: var(--spacing-xs) var(--spacing-sm); 
  font-size: var(--font-size-xs); 
}
```
Primary style: reuse `.btn-primary` OR define `.feed-btn-primary` mapping to cyan tokens (no 2px border, just 1px).

## 9. Motion & States
- Entry: `.mounting` -> opacity 0 to 1 + translateY(4px) to 0 over var(--feed-fade-duration)
- Hover: background & border-color shift only (no transform/shadow for minimal mode)
- Expanded state (if kept): subtle border-color emphasize (no box-shadow)

## 10. Component Consolidation
Action: Remove `src/components/FeedItem.tsx` in favor of `src/features/feeds/components/FeedItem.tsx` (or vice versa) ensuring all imports updated. Tests already reference default import path—verify.

## 11. Refactor Steps
1. Add feed token variables (Section 4) to `tactical-ui.css` or a dedicated `feed-theme.css` imported before enhanced styles.
2. Consolidate to single FeedItem component; update imports (grep usages).
3. Create new CSS section in `enhanced-feeds.css` for feed tokens & new classes (`.feed-badge`, `.feed-btn`, `.feed-tag`).
4. Replace inline badge JSX with semantic spans + className combos.
5. Replace `.action-button` with `.btn feed-btn` classes.
6. Adjust spacing/margins/padding per Section 5.
7. Remove hover transform & heavy shadow; lighten transitions.
8. Ensure timestamp & meta elements have explicit classes & tokens.
9. Update tests if selectors rely on old class names for badges (retain `.priority-badge` as alias temporarily to avoid breakage; mark deprecated).
10. Delete deprecated component file & run tests.

## 12. Backwards Compatibility Strategy
- Provide alias classes: `.priority-badge` and `.content-type-badge` for one release cycle pointing to `.feed-badge` variants.
- Keep `.feed-item.visible` animation logic but reduce transform distance.

## 13. Acceptance Criteria
- All feed item related CSS values (font-size, padding, spacing, colors, radius) reference variables.
- Only one FeedItem component exists.
- Zero inline style objects for badges or priority/content type.
- Buttons share `.btn` base system.
- Visual regression: average feed item vertical pixel height reduced ≥10% vs pre-refactor baseline.

## 14. Deferred / Optional
- Dark/light theme switching (future).
- User density preference toggle (compact vs relaxed) controlled by body class.

## 15. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Unintended test failures (snapshot / selectors) | Maintain alias classes & data-testid attributes |
| Reduced readability at 14px title | Fallback to 16px token via quick config flag |
| Palette looks flatter | Introduce subtle 1px inner divider or accent left border as compensating detail |

## 16. Implementation Notes
- Add `data-testid="feed-item-title"` if tests need stable targeting after class changes.
- Consider extracting badge config map to constants file for reuse & testability.

## 17. Rollback Plan
Revert commit or retain legacy file copies in git history; minimal structural change keeps risk low.

---
END OF SPEC
