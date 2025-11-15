# Verification Checklist

## Pre-Integration
- [ ] Confirm ownership/licensing permits redistribution (see Research ticket).
- [ ] Validate feed or HTML endpoint manually (curl or proxy fetch) and store sample payload.
- [ ] Document capture method in `SourceIntegrationPlan.md` and update Jira epic.
- [ ] Create feature flag entry (`sourceFlags.ts`) for staged rollout.

## Development
- [ ] Update `ModernIntelligenceSources.ts` and adapters with new source metadata.
- [ ] Implement or reuse normalizer and add comprehensive Jest tests (happy path + error path + duplicate guard).
- [ ] Extend `ModernFeedService` fallback chain (proxy ordering: canonical → AllOrigins raw → r.jina.ai → HTML backup).
- [ ] Register source in marquee ingestion (if applicable) and ensure caching respects `refreshInterval`.

## Quality Assurance
- [ ] Run `npm test` targeting new suites.
- [ ] Execute `test-modern-api.sh` and `test-feed-parsing.sh` to ensure regression coverage.
- [ ] Capture UI screenshots for sidebar and main feed (light/dark themes) confirming tag alignment.
- [ ] Verify analytics/telemetry events fire with correct `sourceId`.

## Pre-Launch
- [ ] Configure monitoring thresholds (`ModernAPIService.healthMetrics`) and alert routing in Ops dashboard.
- [ ] Document rollback plan (disable flag, purge cache, alert comms owners) in Ops runbook.
- [ ] Update changelog and stakeholder comms (Slack + release notes).

## Post-Launch
- [ ] Monitor success rate ≥90% for first 72 hours; triage incidents within 30 minutes.
- [ ] Audit normalization outputs for data drift weekly for the first month.
- [ ] Reconcile category distribution stats to ensure dashboards remain balanced.
- [ ] Archive validated samples into `samples/feeds/<sourceId>.json` for future regression tests.
