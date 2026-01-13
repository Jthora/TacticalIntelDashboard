# Intel Inference MVP — Transport and Reliability

## Goals
- Reliable, observable LLM calls with predictable retries and timeouts.
- Clear error mapping to user-facing states; no silent failures.
- Respect rate limits and cost constraints.

## Client Behavior
- HTTP(S) POST to provider endpoint; JSON payload with version and prompt metadata.
- Timeouts: client timeout 8s; overall UX timeout 10s (includes rendering).
- Retries: 1 retry on network/5xx with exponential backoff (e.g., 300ms jittered). No retry on 4xx.
- Circuit breaker: if 3 consecutive failures within 5 minutes, short-circuit for 2 minutes and surface degraded message.
- Idempotency: optional `requestId` (hash of payload) to avoid duplicate charges if provider supports it.

## Error Handling
- Map provider errors to categories: network, timeout, rate-limit, auth, server, validation.
- User messaging: concise status via StatusMessage; avoid raw provider text.
- Fallback: if call fails, do not render stale/partial data; keep previous UI content unchanged.

## Rate Limits & Quotas
- Track requests per minute/hour; if nearing limit, throttle UI (disable button, show message).
- Backoff on 429 with Retry-After if provided; otherwise 30–60s default.
- Budgeting: cap requests per user session (e.g., 10 per hour) and log denials.

## Payload Controls
- Enforce schema validation client-side before send; abort if invalid/empty feeds.
- Size guard: block sends >64KB; strip raw feeds first, then reduce feeds count if still too large.
- Redaction applied before sending; log redaction notes, not contents.

## Logging & Metrics
- Logs (info): requestId, payload sizes (bytes, feed/alert counts), truncated flags, promptVersion.
- Logs (warn/error): category, status code, latency, requestId, retry count.
- Metrics: counters for success/failure by category; histograms for latency; gauges for truncation occurrence; tokens used (if provider returns usage).

## Observability Hooks
- Correlate UI action to requestId; include in StatusMessage for debugging.
- Emit breadcrumb events for retries and circuit-breaker opens.

## Security & Keys
- Keys stored in env/secret manager; never logged.
- Use per-env keys (sandbox/prod); feature flag guards prod usage.
- Optionally route through a thin proxy to hide provider keys from client.

## Transport Abstraction
- Provide a small client module: `callInference({ payload, prompt, signal })` returning `{ text, usage, latency, requestId }`.
- Accept AbortSignal for UX-level cancel (e.g., user closes dialog).

## Testing (Transport)
- Unit: simulate timeouts, 429, 500; ensure retry/backoff only on allowed codes.
- Contract: mock provider responses (success, partial, error) and validate mapping.
- Smoke: real call in sandbox with tiny payload; assert non-empty text and latency < 10s.

## Degradation Modes
- If circuit open: disable CTA, show “Temporarily unavailable; retry soon.”
- If rate-limited: backoff and show cooldown timer.
- If payload empty: skip call and show “No data to summarize.”

## Deployment Considerations
- Configurable timeouts/retries per environment.
- Feature flag to disable transport quickly.
- Keep transport side-effect free (no global mutation) to ease testing.

## Future Enhancements
- Multi-provider failover with routing based on health/latency.
- Streaming responses with incremental render (post-MVP).
- Adaptive prompt sizing based on provider token window.
