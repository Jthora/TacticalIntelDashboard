# Assumptions and Open Questions

1. Purpose
- Capture what we currently assume about the Starcom Ecosystem, AI Security RelayNodes, IPFS use, and QAN anchoring.
- List open questions by domain, so we can proceed with safe placeholders and avoid rework.

2. Relay layer assumptions
- There will be a pub/sub style relay fabric (likely Nostr-like) that can carry intel events and metadata.
- Relays can include references to IPFS CIDs and signatures; they may not carry large blobs.
- Relay messages will need anti-replay and integrity guarantees; signatures are expected.
- Latency is moderate; eventual consistency is acceptable for non-critical events.

3. Relay open questions
- Which protocol exactly (Nostr, custom, other)?
- Envelope format: JSON? CBOR? Required fields? Max message size?
- Auth model: who can publish/subscribe? Are relays permissioned, private, or public?
- QoS and retention: are relays transient, or do they store recent messages? How long?
- Do relays support filtering by tags (topics, source IDs, threat levels)?

4. PQC and identity assumptions
- PQC signatures and/or KEM will be required for long-term security; current EVM keys are interim.
- Hybrid mode may coexist: EVM secp256k1 + PQC scheme.
- Frontend may rely on a JS PQC lib; performance on browsers must be acceptable.

5. PQC open questions
- Which PQC algorithm family (Dilithium, Falcon, SPHINCS+) and what JS implementation?
- How will keys be stored client-side? Will there be a wallet or mediator?
- Do we need multi-sig or threshold signatures in PQC form?
- Will QAN provide native PQC primitives or require client-side wrapping?

6. QAN anchoring assumptions
- QAN will be used to anchor hashes of intel items, alerts, or model attestations.
- Minimal on-chain data: store proofs/refs, not full payloads.
- We will need a read path to verify anchors in the UI.

7. QAN open questions
- SDK availability for JS/browser; will we need a backend relay for signing/submit?
- Transaction fee model and throughput expectations.
- Canonical hash scheme: raw content hash, canonical JSON hash, or Merkle structures?
- Finality and confirmation times acceptable for UX badges?

8. IPFS assumptions
- We will use IPFS for blob storage (artifacts, reports, raw feeds) with CIDs shown in UI.
- Current Infura gateway works; we may add local gateways or other providers.
- Pinning may be required to ensure durability.

9. IPFS open questions
- Required pinning strategy (who pins, where, retention targets?).
- CID version and hashing parameters (CIDv1, SHA-256 assumed?).
- Do relays cache or pin content automatically?
- Need for encrypted payloads at rest on IPFS?

10. Data model assumptions
- Intel items carry ids, timestamps, category, priority, classification metadata, tags.
- Provenance fields will be added: hash, CID, signatures[], relayIds[], chainRef, modelVerdicts.
- Alerts reference intel items and inherit provenance context.

11. Data model open questions
- Canonical serialization for hashing/signing? (stable field ordering, excluded fields?)
- Size limits for intel items and attachments?
- Do we need redaction or partial disclosure schemes in v1?
- Are analyst annotations first-class objects with their own provenance?

12. AuthZ and roles assumptions
- Access levels exist (PUBLIC → DIRECTOR) and can map to capabilities.
- Future: claims from QAN or relay attestations may influence roles.

13. AuthZ open questions
- Will we enforce role decisions on-chain, via relays, or locally?
- Do we need capability tokens or macaroon-like caveats?
- How to express per-source or per-topic ACLs?

14. UX assumptions
- Trust badges will show Signed/Anchored/CID/Relay states; must degrade gracefully.
- Offline/mock modes are needed for demos before real relays/chains exist.

15. UX open questions
- What latency is acceptable before showing an anchored state?
- How to present conflicting proofs or missing signatures?
- Should users be able to request re-anchoring or re-signing from the UI?

16. Security assumptions
- Feed poisoning and HTML/script injection are immediate threats.
- Replay and impersonation on relays are likely once live.
- Logs must avoid sensitive payloads.

17. Security open questions
- Do we need content sandboxing beyond current parsing? (e.g., iframes, DOMPurify?)
- Required audit log retention and redaction policies?
- Required rate limits/backpressure on relay publishes?

18. Performance assumptions
- Browser-based signing/verifying is acceptable for small payloads.
- IPFS retrieval via gateway latency is acceptable for preview; pinning improves durability.

19. Performance open questions
- Expected relay throughput and fan-out?
- Batch anchoring vs per-item anchoring for QAN?
- Size of model artifacts or attachments flowing through the UI?

20. Interop assumptions
- Multiple apps will share the same relays and chain anchors.
- Schemas should be forward-compatible and additive.

21. Interop open questions
- Will there be a registry of source IDs and relay topics?
- Is there a shared schema repository and versioning policy?
- How to signal deprecation or migration of fields?

22. Decision checkpoints
- Revisit assumptions once relay protocol is chosen.
- Freeze hashing/signing canonicalization before PQC wiring begins.
- Confirm anchoring minimal viable format with QAN team.
- Lock CID strategy and pinning policy before scale testing.
