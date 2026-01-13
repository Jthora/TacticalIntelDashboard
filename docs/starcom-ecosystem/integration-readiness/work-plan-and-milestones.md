# Work Plan and Milestones

1. Objective
- Sequence work the team can do now to reach integration readiness without binding to missing specs.

2. Phase 1: Stabilize current app (now)
- Fix ingestion wiring (missing fetch import); verify feed parsing and caching.
- Add provenance fields to intel/alerts schemas and UI badges (stub data allowed).
- Centralize config (relay, IPFS, PQC, anchoring flags) per configuration-matrix.md.
- Add structured logging and diagnostics panel entries for ingest/provenance.
- Deliver: app runs with trust placeholders visible; tests cover ingestion and settings.

3. Phase 2: Abstractions and mocks
- Implement SignerProvider interface with EVM backend and mock PQC backend.
- Implement RelayClient stub (in-memory) and AnchorClient mock (returns pending/confirmed).
- Wire UI to show relay/anchor status from mocks; ensure graceful degradation.
- Deliver: contract tests for signer/relay/anchor; UI badges reflect mock states.

4. Phase 3: Provenance hardening
- Define canonicalization utility for hashing; add deterministic tests.
- Store provenance bundles alongside intel/alerts; surface in UI detail panes.
- Add policy placeholders for required signatures/anchors.
- Deliver: provenance persisted and displayed; hash/sign tests pass.

5. Phase 4: Security and validation
- Harden feed parsing (content-type checks, size limits, sanitization plan).
- Add allowed domains and cache TTL clamps; improve error surfaces.
- Run dependency audits and address high-risk items.
- Deliver: security-readiness items implemented; tests for malicious fixtures.

6. Phase 5: Configuration polish
- Expose feature flags in Settings: relay, anchoring, PQC, IPFS pinning, diagnostics.
- Document env templates and defaults; add config summary panel.
- Deliver: configuration-matrix reflected in code; profile presets (dev/demo/stage) defined.

7. Phase 6: UX readiness
- Improve trust badges, tooltips, and empty states for missing proofs.
- Add provenance panel and relay/anchor health indicators.
- Deliver: analyst-facing clarity on what is trusted, pending, or absent.

8. Phase 7: Test coverage uplift
- Add fixtures for feeds, provenance, relay events, anchor refs.
- Expand contract tests and UI smoke tests; add bundle guardrail check.
- Deliver: CI running core suites; mock integrations validated.

9. Phase 8: Pre-integration checkpoint
- Review assumptions-and-open-questions; update with latest info from relay/QAN teams.
- Freeze interfaces pending external SDK drop; tag versions.
- Deliver: greenlight to wire real relay/chain when specs land.

10. Deferred (until specs available)
- Real relay protocol client; real QAN anchoring; real PQC scheme integration.
- Performance tuning for PQC and relay throughput.

11. Milestone exit criteria
- M1 (Phase 2 done): mocks and interfaces live; ingestion stable.
- M2 (Phase 4 done): security hardening and provenance hashing in place.
- M3 (Phase 6 done): UX trust surfaces complete; config exposed.
- M4 (Phase 8 done): ready to integrate with real relay/QAN/PQC.

12. Ownership and tracking
- Assign owners per phase; track in progressTracker with dates.
- Keep blockers linked to open questions.
