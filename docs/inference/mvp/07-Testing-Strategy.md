# Intel Inference MVP — Testing Strategy

## Objectives
- Ensure payloads, prompts, and transport behave deterministically.
- Catch regressions in UI states and error handling.
- Provide minimal live confidence via smoke tests without high cost.

## Test Layers
1) **Unit tests**
2) **Contract/mocked LLM tests**
3) **Live smoke tests (sandbox)**
4) **UI integration/behavioral checks**
5) **Observability checks (logs/metrics presence)**

## Unit Tests (examples)
- Payload builder (`useIntelLLMPayload`):
  - Truncates feeds/alerts per limits; sets truncation flags/notes.
  - Builds diagnostics summary correctly; handles empty diagnostics.
  - Respects filters/timeRange/search/sort fields; handles null timeRange.
  - Redaction hooks strip/mask specified fields (once implemented).
- Mapper (`mapFeedToIntel`):
  - Priority normalization; tag normalization; source derivation from URL.
  - Summary truncation to 280 chars; body newline enforcement.
  - Created/updated timestamp logic.
- Prompt builders (string renderers):
  - Templates include truncation note when provided.
  - Fallback text when no feeds/alerts/diagnostics.
- Transport client:
  - Retries only on allowed errors; respects timeout; maps errors to categories.
  - Blocks oversized payloads; logs/returns appropriate error.

## Contract / Mocked LLM Tests
- Mock success response with sample text; ensure parser tolerates missing optional fields.
- Mock error responses (429, 500, timeout); ensure UI-facing error mapping correct.
- Validate that output renderer refuses empty/whitespace-only text.

## Live Smoke Tests (Sandbox)
- Small, fixed payload (≤5 feeds) sent to sandbox model daily/CI optional.
- Assertions:
  - Response received within 10s.
  - Non-empty text length > 40 chars.
  - Contains no known banned strings and does not exceed 1.5k tokens.
- Log requestId, latency, and token usage if available.

## UI Integration Checks
- CTA click triggers payload build and disables button during in-flight.
- Loading state shown; success renders block; error shows inline alert; empty feeds short-circuits.
- Truncation notice shown when feeds capped; diagnostics CTA shown when failures present.

## Observability / Telemetry Checks
- Logs include payload sizes, truncation flags, requestId.
- Metrics increment on success/failure; latency histogram populated.
- Circuit breaker events emitted when triggered.

## Tooling / Harness
- Use Jest for unit/contract tests (mock transport, mock contexts).
- For smoke: lightweight script with env-guarded key; skip in PR CI, run nightly or manual.
- Consider Playwright/RTL for minimal UI interaction tests.

## Test Data / Fixtures
- Feed fixtures: small (3 items), medium (25), large (120) to test truncation.
- Diagnostics fixtures: all success, mixed, all failed.
- Alerts fixtures: none, few, many (over limit).

## Acceptance Gates
- Unit tests ≥90% coverage on payload/prompt/transport modules.
- Contract tests pass against mock provider matrix.
- Smoke test green in sandbox before enabling prod flag.
- UI flows verified for main CTA path (manual or automated small suite).

## Failure Handling in CI
- On smoke failure: do not fail full pipeline by default; flag with warning unless critical.
- On unit/contract failure: block merge.

## Future Enhancements
- Add schema validation step (zod/io-ts) to payload builder and test it.
- Add golden snapshot tests for prompts with fixtures to detect drift.
- Add chaos tests for transport (forced timeouts) to validate UX error handling.
