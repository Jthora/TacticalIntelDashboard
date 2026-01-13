# Inference Alerts

## Signals and Thresholds
- **Error rate**: Alert if error category (server | timeout | rate-limit) exceeds 10% of requests over a 15m window.
- **Latency**: Alert if p95 latency > 1500 ms or p99 > 2500 ms for 10m.
- **Circuit/open or kill-switch**: Alert when kill-switch flips to off or circuit breaker stays open >5m.
- **Cost**: Alert if estimated daily cost exceeds $5 in sandbox or configured budget in prod.

## Channels
- Primary: #inference-alerts (Slack/Teams equivalent).
- Secondary: Pager rotation for sustained error/latency breaches.

## Runbook Links
- Include `docs/inference/mvp/runbook.md` in alert payloads for outage/rate-limit/cost steps.

## Sandbox Fire Drill
- Set env overrides to force a 429 or timeout in sandbox, trigger a single request via smoke test, and verify alert reaches #inference-alerts.
- After drill, reset overrides and confirm alert clears.
