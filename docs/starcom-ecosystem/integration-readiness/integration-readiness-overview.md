# Integration Readiness Overview

1. What this folder is
- A preparation kit for wiring the Tactical Intel Dashboard into the Starcom Ecosystem (AI Security RelayNodes + IPFS + QAN anchoring) without finalized specs.
- A set of documents that define stable interfaces, provenance expectations, configuration, security, and test plans.

2. Why it exists now
- Specs for relays, PQC, and QAN are not final; we still need to reduce future rework.
- By fixing schemas, interfaces, and UX placeholders early, we enable parallel work across teams.

3. The dashboard’s role (current capability)
- Ingests and normalizes multi-format feeds with proxy resilience.
- Maintains intelligence items, alerts, and statistics with classification and priority.
- Provides EVM-based identity, IPFS utility (Infura), and configurable settings.

4. Target role in Starcom Ecosystem
- Analyst/agent console for consuming relay intel, validating provenance, triaging alerts, and publishing decisions back.
- Trust-aware pane: shows signatures, anchors, CIDs, and relay origins once available.

5. Key preparation themes
- Abstraction: signer/relay/anchor interfaces with mock implementations.
- Provenance: add hash/CID/signatures/chainRef fields and UI badges.
- Configuration: centralized, feature-flagged toggles for relays, anchoring, PQC, IPFS.
- Security: parsing hardening, size limits, domain allowlists, safe defaults.
- Testing: contract tests on interfaces, fixtures for feeds/provenance/relay/anchor, UI smoke tests.

6. Cross-links to detailed docs
- vision-and-scope.md: goals, scope, success criteria.
- assumptions-and-open-questions.md: what we assume, what we must confirm.
- integration-surfaces.md: stable touchpoints and SPIs.
- provenance-and-identity-plan.md: provenance bundle and signer abstraction.
- configuration-matrix.md: flags, envs, defaults, precedence.
- security-readiness.md: mitigations we can ship now.
- testing-strategy.md: near-term and contract tests.
- work-plan-and-milestones.md: sequencing and exits.
- architecture-placeholders.md (optional): logical diagrams and mappings.

7. How to use this folder
- Start with the overview and scope to align intent.
- Read assumptions to know risks; update as answers arrive.
- Implement code changes guided by integration-surfaces, provenance plan, and config matrix.
- Follow testing-strategy when adding or refactoring.
- Track progress in work-plan-and-milestones and your project board.

8. Non-goals
- No binding to a specific relay protocol, PQC scheme, or QAN transaction format yet.
- No premature performance tuning for PQC or relay throughput.

9. Readiness definition (summary)
- App runs end-to-end today with ingestion and alerts.
- Provenance fields and trust UX are present (even if stubbed).
- Interfaces for signer/relay/anchor exist with mocks and tests.
- Config is centralized with flags; security mitigations applied.

10. Next immediate steps
- Wire ingestion fix; add provenance fields; implement signer/relay/anchor interfaces (mocks).
- Add trust badges and diagnostics; expose config flags; add contract tests.
- Revisit assumptions once relay/QAN/PQC specs are available.
