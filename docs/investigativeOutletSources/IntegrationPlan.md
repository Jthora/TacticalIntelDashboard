# Investigative Outlet Sources Integration Plan

This plan captures the end-to-end approach for onboarding the seven investigative journalism feeds into the Tactical Intel Dashboard. Each stage is designed to minimize duplication, ensure normalization quality, and keep the UI and analytics layers in sync.

## Objectives

- Ingest the RSS feeds listed in the investigative outlet table using the modern API pipeline.
- Provide consistent normalization, tagging, and prioritization for investigative content.
- Surface the sources within the Intel Sources UI with clear categorization and health states.
- Maintain regression safety through unit tests and targeted smoke checks.

## Implementation Phases

### 1. Shared RSS API Gateway
- Create a reusable `INVESTIGATIVE_RSS_API` endpoint in `src/constants/APIEndpoints.ts` using the existing `https://rss2json.vercel.app/api` service.
- Accept the original feed URL as a query parameter so the same endpoint can service all investigative outlets.
- Document rate limits and fallbacks (e.g., `rss2json` alternatives) for future resilience work.

### 2. Normalization Layer Enhancements
- Add `normalizeInvestigativeRSS` to `src/services/DataNormalizer.ts`:
  - Strip HTML safely, sanitize summaries, and parse publication dates defensively.
  - Derive metadata: author, thumbnail, category tags, leak-type heuristics.
  - Map severity/keywords to priorities (e.g., `critical` for emergency alerts, `medium` for routine investigative briefs).
- Register the normalizer in `src/services/NormalizerRegistry.ts` with an accompanying Zod schema.
- Share enrichment logic that guarantees tags such as `investigative`, `whistleblower`, and outlet-specific identifiers.

### 3. Source Registration
- For each outlet, append a primary `IntelligenceSource` entry in `src/constants/ModernIntelligenceSources.ts`:
  - Unique ID pattern: `<outlet>-investigations`.
  - `endpoint`: shared investigative RSS API with encoded feed URL reference.
  - `normalizer`: `normalizeInvestigativeRSS`.
  - `refreshInterval`: 15–30 minutes depending on publication cadence.
  - `healthScore`: baseline trust signal derived from awards/credibility notes.
  - `tags`: include outlet name, leak themes, and `investigative`.
- Update source categories to expose the feeds under relevant groupings (OSINT, CYBINT, HUMINT, MILINT, or a new INVESTIGATIVE cluster if needed).

### 4. Adapter & Legacy Compatibility
- Confirm `ModernIntelSourcesAdapter` inherits the new sources automatically via `PRIMARY_INTELLIGENCE_SOURCES`.
- Extend `mapModernCategoryToLegacy` if a new investigative category is introduced so legacy UI components classify the feeds correctly.
- Ensure the marquee or summary widgets respect new tags without additional wiring.

### 5. Testing & Validation
- Extend `src/constants/__tests__/ModernIntelligenceSources.test.ts` to assert each investigative source is registered, enabled, and mapped to `normalizeInvestigativeRSS`.
- Add normalization unit tests feeding mocked RSS payloads into `normalizeInvestigativeRSS` to verify ID generation, priority mapping, and metadata extraction.
- Run focused Jest suites plus `npm run build` for regression safety after each batch of additions.
- Optionally add a UI smoke checklist (manual) to confirm Intel Sources cards render with proper badges.

### 6. Deployment Notes
- Monitor rate limits on the shared RSS-to-JSON service; plan contingency (e.g., fallback to alternate proxies or self-hosted converter).
- Document onboarding steps in the main README once the integration is stable.
- Consider feature flagging if the feeds should debut to a subset of users first.

## Deliverables Checklist

- [x] Shared investigative RSS endpoint.
- [x] Investigative RSS normalizer & registry wiring.
- [x] Seven `IntelligenceSource` entries with category assignments. _(Completed 2025-10-04)_
- [ ] Updated adapter/category mappings.
- [ ] Unit tests for configuration and normalization.
- [ ] Optional smoke test notes and README references.

Use the accompanying `ProgressTracker.md` to record incremental progress as each source is implemented.
