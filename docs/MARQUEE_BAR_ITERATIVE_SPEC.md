# MarqueeBar Iterative Specification
Status: Draft
Owner: UI/Platform
Date: 2025-08-08
Scope: Streaming headline ticker (MarqueeBar) showing condensed normalized intelligence items (NOT just source statuses)

## 1. Problem Statement
Current bar (placeholder) lists operational sources. Requirement: display a continuous, auto-scrolling line of concise headline snippets derived from heterogeneous normalized feeds (prices, alerts, seismic events, CVEs, news, hacker news, generic). Must respect per-source toggles (marqueeEnabled, feedEnabled) and apply category‑specific condensation rules distinct from main Intelligence Feed display.

## 2. Goals
- Convert existing normalized feed data to short semantic “marquee items” without altering feed normalization.
- Support per-source inclusion toggle (Marquee vs Feed independently).
- Provide domain‑specific formatting (crypto, NOAA alerts, earthquakes, CVEs, price deltas, etc.).
- Maintain a performant, accessible, infinitely looping scroll with low reflow.
- Avoid duplicate / stale entries (temporal window + logical key dedupe).

## 3. Non‑Goals (Initial Iteration)
- Multi‑row tickers
- Inline media / icons beyond simple unicode or small badges
- User personalization of order beyond priority sorting
- Live WebSocket (will poll via existing fetch cadence first)

## 4. Data Model
```
interface MarqueeItem {
  id: string;           // unique (sourceId + logical key + timestamp hash)
  sourceId: string;
  text: string;         // final condensed headline
  category?: string;    // PRICE | ALERT | QUAKE | CVE | NEWS | HN | REDDIT | GENERIC
  importance: 1|2|3|4;  // mapped from priority/type
  timestamp: Date;      // event time
  link?: string;        // click-through
}
```
Retention: sliding window (default 45m) OR max N (e.g. 250) trimming oldest importance-first.

## 5. Projection Layer (NEW)
Introduce MarqueeProjectionRegistry parallel to NormalizerRegistry.
```
interface MarqueeProjector {
  canProject(normalizerName: string, sourceId: string): boolean;
  project(items: NormalizedDataItem[]): MarqueeItem[];
}
```
Resolution order: specific projector (crypto, noaa, usgs, cve, price) -> generic fallback.

## 6. Category Formatting Rules
| Category | Input Fields (Normalized) | Output Pattern | Notes |
|----------|---------------------------|----------------|-------|
| PRICE (CoinGecko) | symbol, price, change24h | "BTC $64,203 (+4.2%)" | Hide % if |delta| < 0.3% |
| ALERT (NOAA) | event, region/state, endsAt | "Flood Advisory (MI) until 04:15 CDT" | Convert tz to user local abbrev |
| QUAKE (USGS) | magnitude, place, depth | "M5.3 • 12km WNW Ridgecrest CA" | Round mag 0.1 |
| CVE / GH Sec Advisory | id/cveId, severity, pkg | "CVE-2025-1234 CRITICAL (openssl)" | Upper severity |
| HN | title, score | "HN: {Title} (▲123)" | Truncate 70 chars |
| NEWS / GENERIC | title | Trim to 70 chars | Remove trailing site name |
| REDDIT | subreddit, title | "r/secnews: Title" | Remove flair brackets |

## 7. Importance Mapping
- CRITICAL / severity HIGH+: 4
- HIGH or ALERT / major magnitude (>=5.0): 3
- MEDIUM / normal price updates / moderate events: 2
- LOW / generic: 1
Dynamic bump: PRICE delta ≥ 3% -> +1 level (cap 4)

## 8. Dedupe Strategy
Key definitions per category:
- PRICE: sourceId + symbol
- ALERT: alertId or hash(event+region)
- QUAKE: eventId
- CVE: cveId
- HN / NEWS / GENERIC: item.id
Keep newest; replace existing if text changed (e.g. updated price) to avoid clutter.

## 9. Service Architecture
MarqueeProjectionService responsibilities:
- receive batches of NormalizedDataItem after fetch normalization
- filter by source.marqueeEnabled
- project via registry
- dedupe & store in internal Map<logicalKey, MarqueeItem>
- emit sorted list on subscription (observer or useMarquee hook)
- periodic prune (setInterval 5m)
Sorting pipeline: importance DESC -> timestamp DESC -> lex text

## 10. Integration Points
1. After each successful normalization (in ModernAPIService.fetchIntelligenceData or aggregation pipeline), call projectionService.ingest(normalizedItems, sourceId, normalizerName).
2. Provide React hook:
```
const { items } = useMarqueeItems(); // subscribes to projection service
```
3. Add toggles in IntelSources list item UI:
   - MARQ toggle (sets marqueeEnabled via updateSource)
   - FEED toggle (sets feedEnabled; feed logic filters if false)

## 11. UI Component Layout
Placement: Between Header and 3-column grid. Modify MainLayout or HomePage to insert <MarqueeBar /> before .home-page-container.
Structure:
```
<div class="marquee-bar" role="region" aria-label="Live intelligence ticker">
  <div class="marquee-track">
    <div class="marquee-segment">{Item • Item • Item ...}</div>
    <div class="marquee-segment clone">(duplicate)</div>
  </div>
</div>
```
Animation: CSS translateX linear; width computed after render; duplicate ensures seamless loop.
Hover/focus: pause via adding .paused (animation-play-state: paused).

## 12. Styling Tokens (Additions)
```
--marquee-height: 28px;
--marquee-bg: linear-gradient(90deg,#04110f,#061d19);
--marquee-border: var(--feed-border);
--marquee-text: var(--text-secondary);
--marquee-accent-alert: var(--accent-orange);
--marquee-accent-critical: var(--accent-red);
--marquee-accent-price-up: var(--accent-green);
--marquee-accent-price-down: var(--accent-red);
--marquee-speed-base: 80; /* px per second */
```

## 13. Accessibility
- region label clarifies non-essential live info → do NOT use aria-live (avoid verbosity).
- Each item focusable via keyboard (tab cycling) with outline & instantaneous pause on focus.
- Provide visually hidden skip button to jump past ticker.

## 14. Performance Considerations
- Recompute track only when item list identity changes (shallow compare length + first/last id).
- Avoid re-animating by using CSS custom property for duration: duration = (totalWidth / speedBase)s.
- Price updates: throttle ingestion to 1 per symbol per 30s unless ≥1% change.

## 15. Phased Implementation
Phase 1: Types + registry + service + hook + basic projector (generic + price + alert + quake) + toggles (no UI yet) + unit tests (projection & dedupe).
Phase 2: UI MarqueeBar component + CSS + integration in layout + toggles UI in IntelSources.
Phase 3: Additional projectors (HN, CVE, Reddit) + dynamic speed scaling + accessibility polish.
Phase 4: Persistence (store last N marquee items in localStorage) + user speed preference.

## 16. Testing Strategy
Unit:
- projector outputs given sample normalized payloads
- dedupe replacement logic
- importance sorting rules
Integration:
- toggling marqueeEnabled adds/removes items
- price delta triggers importance bump
UI:
- infinite loop seamlessness (no jump) (jsdom width mocks)
- pause on hover/focus

## 17. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Excess CPU from frequent updates | Throttle ingestion; batch updates | 
| Overflowing long text causing height jitter | single-line truncate (ellipsis) before projection fallback |
| Visual stutter on re-render | CSS-only animation; stable DOM keys |
| Source toggles desync with stored flags | Always read from IntelligenceContext source objects |

## 18. Rollback Plan
Feature behind optional flag (e.g. enableMarquee=true). Disable by not rendering <MarqueeBar />; projection service becomes dormant.

## 19. Open Questions
- Should priority 4 items flash or color pulse? (Deferred)
- Need per-category icon? (Optional Phase 3)
- User-configurable max age vs fixed window? (Collect feedback)

## 20. Acceptance Criteria (Phase 2)
- Marquee displays at least 5 distinct category formats when data present.
- Loop runs ≥ 2 cycles without perceptible gap.
- Toggling a source’s MARQ button removes/ adds items within 2s (next ingestion cycle).
- No memory growth after 1h run (observed item map size bounded).

---
END OF ITERATIVE SPEC
