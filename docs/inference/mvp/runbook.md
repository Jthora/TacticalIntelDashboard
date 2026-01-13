# Inference Runbook (Outage / Rate-Limit / Cost)

## Kill-switch / Disable
- Flip `VITE_INFERENCE_ENABLED=false` and redeploy (or set feature flag in config store).
- Confirm UI shows disabled message and stops sending requests.

## Rate-limit / 429
- Increase client backoff/timeout flags; reduce maxFeeds/maxAlerts if needed.
- Temporarily lower per-session cap (`VITE_INFERENCE_SESSION_CAP`) to throttle.
- Monitor error category `rate-limit` and retry outcomes.

## Latency / Timeouts
- Reduce payload size (maxFeeds/maxAlerts) and lower CTA availability if needed.
- Tune `VITE_INFERENCE_ENDPOINT` timeouts/retries; watch latency buckets and SLOs.

## Server/Provider outage
- Disable via kill-switch; surface user-friendly unavailable message.
- If safe, direct smoke tests to sandbox to validate recovery.

## Cost spike
- Lower per-session caps; temporarily disable non-essential CTAs.
- Watch token/cost panel; alert if daily spend exceeds budget.

## Alert Payload Links
- Include runbook URL with alert: `docs/inference/mvp/runbook.md`.

## Checks
- Keys: ensure `VITE_INFERENCE_API_KEY` present; prod vs sandbox key mismatch logs warning.
- Env separation: `VITE_ENVIRONMENT` should be `sandbox` outside prod.
