# Testing Strategy

1. Purpose
- Define tests we can implement now to protect current behavior and prepare for relay/QAN/PQC integrations later.
- Emphasize contract tests on interfaces and schemas to reduce refactors when specs land.

2. Near-term tests (implementable now)
- Ingestion smoke: fetch known-good feeds (XML/JSON/TXT) and assert parse → normalized items.
- Cache behavior: ensure TTL respected and stale entries evicted.
- Settings persistence: load/save round-trip for general/settings subsets.
- IPFS utility dry-run: mock upload/retrieve/pin with deterministic CIDs.
- Access level gating: UI/logic respects roles for actions (ack alerts, exports).
- UI trust badges: render states for signed/anchored/CID missing (stub data).

3. Contract tests for interfaces
- SignerProvider: sign/verify deterministic payload, metadata correctness, failure paths.
- RelayClient stub: publish/subscribe, filter matching, health check responses.
- AnchorClient stub: anchor() returns pending, get() transitions to confirmed/failed, error handling.
- Provenance bundle: schema validation, serialization round-trip, optional fields handling.

4. Fixtures and mocks
- Feed fixtures: small XML/JSON/TXT with edge cases (missing fields, HTML-in-XML).
- Provenance fixtures: signed/unsigned, anchored/unanchored, partial signatures.
- Relay fixtures: mock events with ids, hashes, and fake signatures.
- Anchor fixtures: mock txRefs with pending/confirmed/failed states.

5. UI/E2E checks (lightweight)
- Render Home/Settings pages; verify settings toggles and persistence.
- Display feed list with mock data; ensure no unsafe HTML rendered.
- Show badges and tooltips; confirm copy contains scheme/algo placeholders.

6. Performance/sanity
- Bundle size guardrails (no large PQC libs until needed; use mock provider now).
- Ensure no blocking calls in main thread for heavy parsing.

7. CI guidance
- Run lint + tests on PRs; allow opt-in heavy suites (bundle analysis) on demand.
- Keep mock-only relay/anchor tests in CI; real endpoints gated behind flags when available.

8. Gaps to fill later (mark as TODO)
- End-to-end relay round-trip once protocol finalized.
- Real anchoring to QAN testnet once SDK is available.
- PQC performance and correctness tests once scheme chosen.
- Interop tests with other Starcom apps sharing schemas.

9. Test data hygiene
- Keep fixtures small, deterministic, and non-sensitive.
- Version fixtures to align with schema versions.

10. Observability of tests
- Use structured assertions; include ids/hashes instead of payload dumps.
- Log why tests fail with clear hints (e.g., canonicalization mismatch).

11. Maintenance plan
- Tag tests by area (ingest, provenance, signer, relay, anchor, ui).
- Review contract tests when schemas/interfaces change; keep them strict.
