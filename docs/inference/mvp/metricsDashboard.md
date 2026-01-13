# Inference Metrics Dashboard & SLOs

## Panels (per environment)
- **Request volume & success rate:** Counters of successes/failures with % success and requestId tracing link.
- **Latency histogram:** Buckets 0–250/250–500/500–1000/1000–2000/2000+ ms using logger buckets; overlay p50/p95/p99 lines.
- **Error breakdown:** Stacked chart by category (timeout, network, rate-limit, server, client) with rate over time.
- **Truncation gauge:** Gauge or single-stat showing truncations per 100 requests and trend.
- **Token usage & cost panel:** Table/stacked bar for prompt/completion/total tokens and estimated costUSD aggregated per hour.
- **Recent failures table:** Most recent 20 failures with requestId, category, status, latency, promptVersion, truncationNote masked.

## SLO Targets (initial)
- **Latency:** p95 < 1500 ms, p99 < 2500 ms.
- **Availability:** Success rate >= 98% (excluding client errors).
- **Truncation:** < 5% of requests flagged as truncated.
- **Cost:** Notify if estimated costUSD exceeds $5/day in sandbox or configured daily budget in prod.

## Alerting Hooks
- Page if latency SLO violated for 10m window; notify channel for truncation or cost breaches.
- Include runbook links for outage, rate-limit, and cost spikes when available.

## Implementation Notes
- Source metrics from `InferenceLogger.getMetrics()` snapshots where available; emit to telemetry sink (to be wired) with requestId for drill-down.
- Cost panel uses normalized token usage `{ prompt, completion, total, costUSD }` parsed in `InferenceClient`.
