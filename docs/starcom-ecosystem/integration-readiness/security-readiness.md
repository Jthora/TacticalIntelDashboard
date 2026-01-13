# Security Readiness

1. Purpose
- Identify security work we can do now, before relay, PQC, and QAN specs solidify.
- Reduce risk from ingestion, rendering, and future relay interactions.

2. Threats we can address early
- Feed poisoning: malformed XML/JSON/HTML/TXT leading to parser or logic issues.
- HTML/script injection: feeds returning pages or scripts masquerading as feeds.
- Replay/duplication risk (placeholder handling via ids/hashes).
- Unsigned/unverified data: absence of integrity signals.
- Supply-chain issues: dependency drift or malicious packages.

3. Mitigations implementable now
- Strict content-type detection and validation; refuse obvious HTML in feed paths.
- Use DOMParser defensively; sanitize or strip active content in HTML parsing.
- Enforce size limits on fetched payloads (client-side guardrails where possible).
- Cache TTLs and eviction to reduce stale/replayed content exposure.
- Structured error handling and logging (without PII or payload dumps).
- Dependency audits: run lint/audit tasks; lockfile hygiene.

4. Provenance placeholders
- Add provenance fields so trust gaps are visible (signed?, anchored?, cid?).
- Show "not signed"/"not anchored" states instead of silent acceptance.

5. Relay/transport prep
- Plan to include message ids, timestamps, hashes, and signatures in envelopes.
- Prepare deduplication strategy by id/hash.
- Prepare backpressure/retry knobs (configurable) for future relay client.

6. Identity and signing
- Abstract signer to allow enforcing signature presence later.
- Add policy placeholder: minimum required schemes, required signers per domain.
- Log signature verification outcomes for observability.

7. Storage and IPFS
- Avoid storing sensitive plaintext in logs; prefer hashes.
- Support encrypted artifacts (future), but note this in provenance docs.
- Pinning policy TBD; flag when unpinned to set expectations.

8. UI safety
- Render feed content in sanitized containers; avoid dangerouslySetInnerHTML where possible.
- Truncate large fields; avoid untrusted HTML rendering unless sanitized.
- Badge untrusted states clearly to avoid analyst misuse.

9. Configuration safeguards
- Allowed domains list for feeds; configurable and validated.
- Safe defaults: relays/anchoring off until explicitly enabled.
- Logging redaction on by default.

10. Operational practices
- Keep a security checklist for releases (lint, audit, tests, bundle size scan).
- Document incident response placeholders (what to capture in logs, how to disable relays quickly).
- Versioned configs to reproduce states during investigations.

11. Future hooks (spec-dependent)
- PQC/KEM for channel bootstrap; relay attestation; QAN anchoring for integrity.
- Rate limiting and DoS protections at relay layer once endpoints are known.
- CRL/denylist handling for compromised keys.

12. Testing
- Add tests for parser validation paths and malicious fixture samples.
- Add contract tests for signer abstraction to ensure verification outcomes are surfaced.
- Add e2e mocks for relay failure/degradation once client stub exists.

13. Residual risks (awaiting specs)
- Relay impersonation risk until auth is defined.
- Anchoring guarantees unknown until QAN integration is defined.
- PQC performance/footprint unknown; may affect UX.
