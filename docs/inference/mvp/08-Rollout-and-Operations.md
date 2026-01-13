# Intel Inference MVP — Rollout and Operations

## Environments
- Sandbox: lower quotas, test key, smoke tests run here.
- Production: higher quotas, monitored; feature flag defaults off until ready.
- Optional staging: mirrors prod config with sandbox key.

## Feature Flags
- `inference.enabled`: master kill-switch.
- Per-feature flags: summary, risk/alerts, source-health.
- Transport tuning flags: timeouts, retries, maxFeeds/maxAlerts overrides.

## Deployment Steps (MVP)
1) Merge code behind flags.
2) Deploy to sandbox; run smoke test; verify logs/metrics.
3) Internal dogfood: enable for small user group; monitor latency/errors.
4) Canary in prod: enable for small %; watch SLOs for 24–48h.
5) Gradual ramp: increase % if stable; keep kill-switch ready.

## Monitoring & Metrics
- Success/failure counters; latency histogram; token usage if returned.
- Rate-limit/circuit-breaker events.
- Truncation frequency; empty-response occurrences.
- UI metrics: CTA clicks, errors surfaced.

## Logging
- Include requestId, payload sizes, truncation flags, error category, latency.
- Exclude keys/PII and full payload contents.

## Alerts (Ops)
- Page/notify on sustained error rate > threshold (e.g., >10% over 15m) or latency SLO breach.
- Alert on circuit breaker open state persisting >5m.
- Cost guard: alert on token/day crossing budget.

## Runbook (high level)
- If provider outage: flip kill-switch; show user-facing unavailable message.
- If rate-limited: extend backoff, reduce CTA availability, or lower maxFeeds.
- If latency spike: lower timeouts, reduce payload size, or temporarily disable non-critical features.
- If cost spike: lower per-session request cap; disable optional features.

## Keys and Secrets
- Stored in secret manager/env; never in repo or logs.
- Rotate keys periodically and on incident.
- Separate keys per env; sandbox key must not touch prod.

## Quotas and Budgets
- Define per-env request/min and daily token caps; enforce client-side caps per user session.
- Deny requests when approaching cap; show user message.

## Change Management
- Document changes to prompts/schema; bump `version` when breaking.
- Release notes for enabling features; include SLO impact.

## Incident Response
- Triage checklist: check circuit state, provider status, recent deploys, rate-limit headers.
- Mitigations: disable feature, reduce payload, switch to sandbox key for test.
- Post-incident: root cause, timeline, action items, log gaps, test gaps.

## Backups / Data Handling
- No payload storage at rest; logs only metadata.
- Ensure deletion of temporary artifacts in tests/smoke scripts.

## Future Enhancements
- Multi-provider failover routing.
- Automated adaptive throttling based on recent error/latency.
- Dashboard for prompts/versions and recent failures.
