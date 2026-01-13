# Integration Surfaces

1. Purpose
- Describe the interfaces and touchpoints we plan to stabilize before external specs (relay protocol, PQC, QAN) are finalized.
- Identify what is stable, what needs an abstraction, and how data contracts should evolve.

2. Stable surfaces (existing)
- Feed ingestion: multi-format parsing with proxy fallback, cache, and validation.
- Intel/alert data models: ids, category, priority, classification metadata, timestamps.
- Settings storage: CORS/protocol strategies, display, verification preferences.
- IPFS utility: init, upload, retrieve, pin (Infura-backed, swappable).
- EVM signer: connect/sign/verify via ethers (to be abstracted).

3. Surfaces to abstract (planned adapters)
- Signer provider: interface for sign/verify; backends: EVM (current), PQC (future), hybrid.
- Relay pub/sub client: publish intel events, subscribe to topics/filters; stub impl now.
- Anchoring adapter: write/read chain references (mock now, QAN later).
- Provenance store: manage hash/CID/signature sets and link to intel items/alerts.

4. Data contracts to hold steady
- Intel item fields: id, sourceId, title, content, category, priority, classification, tags, timestamps, relatedItems, verification, processingStatus, accessLog.
- Provenance extensions: contentHash, cid, signatures[], relayIds[], chainRef, anchorStatus, modelVerdicts, provenanceVersion.
- Alerts: id, intelligenceId, type, priority, status, timestamps, metadata (sourceId, classification, location, relatedAlerts).
- Settings: relay endpoints list, IPFS gateway list, feature flags (pqcEnabled, anchoringEnabled, relayEnabled), cache/security options.

5. Extension points (SPI outline)
  - SignerProvider (see src/types/SignerProvider.ts)
  - sign(payload: Uint8Array | string): Promise<Signature>
  - verify(payload, signature): Promise<boolean>
  - getPublicKey(): Promise<PublicKeyRef>
  - metadata(): { scheme: 'EVM' | 'PQC' | 'HYBRID'; algo: string; version: string }
  - RelayClient (see src/types/RelayClient.ts; mock at src/utils/relay/inMemoryRelayClient.ts)
  - publish(event: IntelEvent): Promise<Ack>
  - subscribe(filters, handler): Subscription
  - health(): Promise<Health>
  - Retry/backoff expectations: mock client supports configurable exponential backoff (base/jitter/attempts) with health.nextRetryInMs; real client SHOULD implement exponential backoff (base 200–500ms, jittered), cap attempts (e.g., 5 tries), and surface lastError with nextRetry estimate in health(). Drop or park publishes when retries exhausted and emit a structured log with code/context.
  - AnchorClient (see src/types/AnchorClient.ts; mock at src/utils/anchor/mockAnchorClient.ts)
  - anchor(hash: string, opts?): Promise<{ txRef: string; chain: string; status: 'submitted' | 'confirmed' | 'failed' }>
  - get(txRef: string): Promise<AnchorRecord>
  - Error semantics: invalid txRef SHOULD return status failed with error (mock returns code "invalid-txRef"); transient chain errors SHOULD surface retry guidance.
  - Mock behavior: supports configurable settle delay and outcomes for pending→confirmed/failed transitions, plus redacted attempt logging for diagnostics.
- ProvenanceRegistry
  - record(itemId, provenance: ProvenanceBundle): void
  - get(itemId): ProvenanceBundle | null
  - Test fixtures: shared provenance bundles (signed, unsigned, pending, failed, missing CID, multi-relay, hybrid EVM+PQC) live at src/tests/provenanceFixtures.ts for UI/state tests.

6. Event shapes (provisional, additive)
- IntelEvent: { id, type: 'intel', payload: IntelItemCore, provenance?, signatures?, cid?, chainRef?, ts }
- AlertEvent: { id, type: 'alert', intelId, priority, status, provenance?, ts }
- AnnotationEvent: { id, type: 'annotation', intelId, author, text, confidence?, provenance?, ts }

7. Error and status shapes
- Prefer structured errors: { code, message, retryable?, details }
- Health responses for relay/anchor clients: { status: 'ok' | 'degraded' | 'down', latencyMs?, lastError? }

8. UX bindings
- Trust badges draw from ProvenanceBundle: signed?, anchored?, cid?, relayOrigin?, scheme, algo.
- Diagnostics panel shows relay health, anchor health, signer backend, and last sync.

9. Config bindings
- Relay endpoints: array; active endpoint; feature flag to disable.
- IPFS gateways: primary, fallback; pinning toggle.
- PQC: enabled/disabled; preferred scheme; fallback to EVM.
- Anchoring: enabled/disabled; chain name; mock mode toggle (ANCHORING_ENABLED default true, ANCHORING_MODE default mock, ALLOW_REAL_ANCHORING required to permit real); fallback order: disabled → mock; real requested without allow flag → mock with reason; chain overrides via ANCHORING_CHAIN.
- Trust UI: ProvenanceBadges component renders signed/anchored/CID/relay states from ProvenanceBundle with tooltips; ProvenanceDetailPanel renders full bundle (hash, cid, signatures, anchor, relays, model verdicts) with safe fallbacks; both accept stub/default bundles; badges now appear on feed items (with toggleable detail panel), alert cards, alert notifications, and intelligence browse cards (inline detail panels).
- Anchor client selection: config drives mode; real mode requires ALLOW_REAL_ANCHORING and available real client, else fallback to mock with reason.
 - Advanced Settings: infrastructure toggles (relay/anchoring/PQC/IPFS pinning/diagnostics) drive SettingsContext infrastructure state; summary panel supports copy-to-clipboard and shows warnings for risky configs; telemetry emits on toggle apply (redacted payloads).
 - Infrastructure runtime: settings toggles hydrate a runtime config matrix; relay runtime swaps to noop client when disabled and enables relay event logging when diagnostics is on; anchoring resolution respects toggle and falls back to mock with reason; diagnostics toggles adjust logger verbosity/console output; RealTimeService start is skipped when relay disabled.

10. Stability rules
- Additive evolution: avoid breaking fields; add new fields as optional.
- Canonicalization: agree on stable serialization for signing/hashing before PQC/chain wiring.
- Backward compatibility: keep version field in provenance bundles.

11. Testing expectations (pre-spec)
- Contract tests on interfaces with stub implementations.
- Serialization round-trip tests for intel/provenance objects.
- Serialization round-trip coverage lives at [src/utils/__tests__/provenanceSerialization.test.ts](../../src/utils/__tests__/provenanceSerialization.test.ts).
- Canonicalization and hashing coverage (including golden vectors for hybrid, missing CID, and multi-relay bundles) lives at [src/utils/__tests__/provenanceCanonicalization.test.ts](../../src/utils/__tests__/provenanceCanonicalization.test.ts) using [hashProvenanceBundle](../../src/utils/provenanceCanonicalization.ts).
- Central config matrix (relay, anchoring, PQC, IPFS, logging) with defaults and env parsing lives at [src/config/configMatrix.ts](../../src/config/configMatrix.ts) with tests in [src/config/__tests__/configMatrix.test.ts](../../src/config/__tests__/configMatrix.test.ts).
  Precedence defaults → env → user prefs (with sensitive anchoring fields protected from user overrides) is exercised in tests.
  UI exposure lives in Advanced Settings (relay/anchoring/PQC/IPFS pinning/diagnostics toggles plus summary and copy-to-clipboard) wired through SettingsContext infrastructure state.
- Health check tests for mock relay/anchor clients.

12. Migration guidance
- Keep adapters thin and injectable.
- Avoid leaking implementation details (Nostr, QAN specifics) into core UI/state.
- Use feature flags to guard new transports/crypto until validated.
- Provenance field migration/backfill guidance lives in [provenance-migration-notes.md](provenance-migration-notes.md);
  keep new fields additive and defaultable.

13. Telemetry hooks
- Emit structured logs for publish/subscribe, anchor attempts, sign/verify calls.
- Redact sensitive payloads; log hashes/ids instead of bodies.
 - Settings toggle applies emit `settings.infrastructure.updated` with boolean flags (no endpoints/secrets).
 - Advanced Settings telemetry emission and warning rendering covered by RTL tests.

14. Degradation behavior
- If relay disabled/unavailable: operate in offline mode; queue or skip publishes; clearly badge state.
- If anchoring disabled: show "Not anchored" with guidance; keep working locally.
- If PQC unavailable: fall back to EVM signer when allowed.
