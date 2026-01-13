# Vision and Scope

1. Purpose
- Establish the Tactical Intel Dashboard as the analyst and agent console inside the Starcom Ecosystem and Earth Intelligence Network.
- Define near-term readiness goals without binding to unconfirmed relay, PQC, or chain specs.
- Clarify what "integration readiness" means: stable interfaces, provenance fields, and config surfaces that survive future wiring.

2. Context
- Starcom Ecosystem: decentralized intelligence network with AI Security RelayNodes, IPFS artifacts, and QAN anchoring (PQC-ready) as the emerging backbone.
- Tactical Intel Dashboard: current Vite/React/TS app with feed ingestion, alerting, local IPFS client, and EVM-based identity.
- Constraint: No finalized spec sheet for relays, QAN interaction, or PQC primitives yet.

3. Personas and outcomes
- Analyst: needs trustworthy feeds, provenance cues, alert triage, and the ability to publish vetted intel.
- Relay operator: needs to observe what the console expects to consume/publish so they can shape relay contracts.
- AI agent: needs stable data schemas to read, summarize, score, and annotate intel items.
- Security/compliance: needs auditability and future anchoring points without premature coupling.

4. In-scope (readiness phase)
- Document stable data contracts for intel items, provenance, alerts, and settings.
- Define abstraction layers (signer, relay pub/sub, anchoring adapter) and their expected behaviors.
- Add UX placeholders for trust (signed/anchored/CID/relay origin) without requiring live connectivity.
- Prepare configuration strategy (env, feature flags, defaults) for relays, IPFS, PQC, and QAN endpoints.
- Identify minimal hardening we can apply now (parsing, validation, logging) that is spec-agnostic.

5. Out-of-scope (until specs land)
- Binding to a specific relay protocol or message envelope.
- Implementing PQC crypto, KEM, or QAN transaction formats.
- Shipping production-grade Nostr or chain anchoring without confirmed SLAs.
- Finalizing tokenomics, ACL rules, or fee models.

6. Success criteria for readiness
- The dashboard runs end-to-end for feed ingestion and alerting with provenance fields in place.
- Clear extension points exist for signer backends, relay transport, and chain anchoring, each with interfaces and stubs.
- Configuration is centralized, documented, and feature-flagged for PQC/relay/QAN toggles.
- Testing scaffolds cover current behavior and contract expectations for future adapters.
- Security posture is documented with mitigations that do not depend on missing specs.

7. Why this matters now
- Reduces integration risk by freezing surface shapes before external teams wire relays or chains.
- Lets multiple teams work in parallel: UI/UX, relay implementers, chain anchoring, PQC research.
- Avoids late-stage rewrites by anticipating provenance and identity needs early.

8. Big-picture architecture (logical, non-binding)
- Data path: Sources → RelayNodes → IPFS (blobs) + relays (events) → Dashboard.
- Trust path: Signers (EVM today, PQC later) + chain anchoring (QAN) → Dashboard badges.
- Control path: Dashboard settings → relay selection, policy toggles, cache/security knobs.

9. Guiding principles
- Prefer interface-first design with mock adapters.
- Keep user-facing cues for trust, even if stubbed.
- Minimize irreversible choices (pluggable transports/crypto/providers).
- Make configurations explicit and overridable.

10. Near-term priorities
- Fix ingestion gaps (missing fetch import), ensure parsing/caching is stable.
- Add provenance fields to intel items and alerts.
- Define signer, relay, and anchoring interfaces with default stub implementations.
- Add trust badges and diagnostics panels fed by stub data.
- Ship configuration matrix and logging defaults.

11. Dependencies and placeholders
- Identity: current ethers/MetaMask; placeholder for PQC provider.
- Storage: IPFS via Infura; placeholder for alternate gateways and local nodes.
- Chain: no QAN SDK yet; placeholder anchoring adapter returning mock tx refs.
- Relay: no protocol pinned; placeholder pub/sub service with in-memory events.

12. UX expectations during readiness
- Badges may show "Not anchored" or "Signature unavailable" states gracefully.
- Settings panels expose relay endpoints, IPFS gateways, and feature toggles with safe defaults.
- Alert and intel views surface provenance panels, even if partially empty.

13. Operational considerations
- Keep logging structured and redactable; avoid PII in logs.
- Ensure offline-friendly behavior with mock modes for demos.
- Favor deterministic behavior in stubs to simplify testing.

14. Exit definition for readiness phase
- All documents in this folder completed and reviewed.
- Core code has abstraction points merged and tested with stubs.
- Configuration and provenance fields live without breaking current UX.
- Known gaps are listed with owners and dependencies on external specs.
