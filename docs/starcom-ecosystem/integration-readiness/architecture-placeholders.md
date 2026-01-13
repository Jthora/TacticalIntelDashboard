# Architecture Placeholders

1. Purpose
- Provide logical, non-binding diagrams-in-text for the future Starcom Ecosystem integration.
- Map current components to future roles and identify adapter slots.

2. Logical flows (conceptual)
- Data path: Sources → AI Security RelayNodes (local AI, validation) → IPFS (blobs) + Relays (events) → Dashboard → Analysts/Agents.
- Trust path: Signers (EVM now, PQC later) → Relay signatures → QAN anchoring → Dashboard badges.
- Control path: Dashboard settings → relay selection, feature flags (PQC, anchoring), cache/security knobs.

3. Component placeholders
- Dashboard Core: React UI, feed ingestion, intelligence/alert state.
- SignerProvider: pluggable sign/verify backend (EVM/PQC/hybrid).
- RelayClient: pluggable transport (mock now; Nostr-like later) for publish/subscribe.
- AnchorClient: pluggable chain adapter (mock now; QAN later) for anchoring hashes.
- ProvenanceRegistry: stores provenance bundles and exposes them to UI.
- IPFS Adapter: current Infura client; configurable for other gateways.

4. Envelope placeholder (event-level)
- id, type (intel|alert|annotation), payload (minimal intel fields), ts.
- provenance: hash, cid, signatures[], chainRef, relayIds.
- meta: topic/tags, sourceId, priority, classification, version.

5. Intel item placeholder (payload-level)
- id, sourceId, title, content, category, priority, classification, tags.
- timestamps: createdAt/timestamp, lastUpdated.
- provenance fields: contentHash, cid, signatures[], relayIds[], chainRef, modelVerdicts, provenanceVersion.
- status: verification, processingStatus, accessLog.

6. Anchoring placeholder
- anchor(hash) → { txRef, chain: 'QAN' | 'mock', status: 'submitted' }
- get(txRef) → { txRef, chain, status: 'pending'|'confirmed'|'failed', anchoredAt? }

7. Relay placeholder
- publish(event) → Ack{id, status}
- subscribe(filter) → events with ids/hashes/signatures
- health() → { status, latencyMs?, lastError? }

8. Identity placeholder
- metadata: { scheme: 'EVM'|'PQC'|'HYBRID', algo, version }
- publicKeyRef/fingerprint for trust display; avoid leaking raw keys unless needed.

9. UI bindings
- Badge states: Signed/Anchored/CID/Relay origin; show scheme/algo.
- Diagnostics: relay health, anchor status, signer backend, config mode (mock/real).

10. Deployment placeholders
- Frontend served normally; relay/anchor endpoints configured via env.
- Mock modes available for demos and tests.

11. Risks tracked here
- Protocol churn (relay, PQC, QAN) could shift adapter signatures; keep them minimal.
- Size/latency of PQC could impact client; plan for async/worker offload if needed.

12. Evolution notes
- Start with mocks; later swap concrete RelayClient/AnchorClient without touching UI/state.
- Keep provenanceVersion to manage forward compatibility.
