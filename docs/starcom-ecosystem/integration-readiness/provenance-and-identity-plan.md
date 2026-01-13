# Provenance and Identity Plan

1. Goals
- Ensure every intel item and alert can carry verifiable provenance even before final relay/chain specs are known.
- Abstract signing/verification so we can swap EVM for PQC (or hybrid) without refactoring UI/state.
- Define how the UI presents trust signals and handles partial or missing proofs.

2. Provenance bundle (proposed fields)
- contentHash: canonical hash of the intel payload (hash algorithm TBD; likely SHA-256 initially).
- cid: IPFS content identifier when blobs/artifacts exist.
- signatures: array of { scheme, algo, signerId, signature, createdAt, publicKeyRef }.
- chainRef: { chain: 'QAN' | 'mock', txRef, status, anchoredAt? }.
- relayIds: ids of relay messages/events that carried this intel.
- modelVerdicts: [{ modelId, summaryHash, confidence, ts, signedByModel? }].
- provenanceVersion: semantic version for schema evolution.
- anchorStatus: derived badge state (pending/anchored/failed/not-requested).
	- Implementation note: SignerProvider interface lives in src/types/SignerProvider.ts; mock PQC signer in src/utils/signers/mockPQCSigner.ts for deterministic tests.
	- Implementation note: base interfaces live in src/types/Provenance.ts for immediate use by intel and alert types.
	- Error semantics for signer: sign/verify SHOULD throw typed errors (e.g., Web3Error or PQCError) with code/message; callers MUST surface user-friendly messages and log codes.

3. Canonicalization (to finalize with specs)
- Use stable field ordering and normalized JSON for hashing/signing.
- Exclude volatile fields (e.g., UI-only, timestamps that are not part of integrity) from hash.
- Keep a versioned "signing scope" definition; store scope name with signatures.

4. Identity abstraction
- SignerProvider interface: sign/verify/getPublicKey/metadata.
- Backends: EVM (current), PQC (future), HYBRID (both; verify either/both).
- Public key representation: for PQC, support larger keys; store refs not full keys when possible.
- Key identifiers: prefer stable fingerprints (hash of public key) over addresses.

5. Hybrid strategy
- Allow multiple signatures per item (EVM + PQC) and treat them as additive trust.
- Verification rules: accept if at least one valid signature from trusted schemes, or require both in stricter modes.
- UI badge should show which scheme(s) verified.

6. Trust presentation in UI
- Badges: Signed (scheme/algo), Anchored (chainRef), CID (view/download), Relay Origin(s).
- States: verified, partially verified, not signed, not anchored, stale proof, mismatch.
- Tooltips: show signerId, scheme, algo, timestamp, chain status; link to CID/txRef when available.

7. Missing/partial proof handling
- If signature absent: show "Not signed" and allow user to request signing (future workflow).
- If anchor absent: show "Not anchored"; allow deferred anchoring request.
- If CID missing: show "No artifact"; allow upload/pin when appropriate.

8. Key lifecycle placeholders
- Rotation: store multiple publicKeyRefs; allow marking old keys as deprecated.
- Revocation: maintain denylist/CRL equivalent; UI shows revoked warning.
- Expiry: future-proof signatures with optional expiry metadata.

9. Attestations and models
- Model verdicts can be signed (by the model runner or relay) and included in signatures array or a parallel field.
- Hash summaries of model outputs to avoid storing large payloads in provenance.

10. Anchoring flow (mock today, QAN later)
- Derive hash → call AnchorClient.anchor → receive txRef/status → store in chainRef.
- Anchor verification: AnchorClient.get(txRef) → update status to confirmed/failed.
- UI polls or refreshes to show anchored badge when confirmed.

11. Relay linkage
- For each intel/alert, store relayIds from which it was received or to which it was published.
- RelayIds become part of provenance to support traceability and replay detection.

12. Storage and privacy considerations
- Avoid embedding sensitive plaintext in provenance; prefer hashes and references.
- Allow encrypted payloads in IPFS; store CID of ciphertext plus hash of plaintext scope for integrity.

13. Performance considerations
- PQC key and signature sizes are larger; plan UI truncation and storage overhead.
- Hash once, reuse across signatures and anchoring to avoid recompute.

14. Migration approach
- Start by adding provenance fields to intel/alert schemas and UI with stub data.
- Implement SignerProvider interface with EVM backend; add mock PQC backend returning deterministic values.
- Add AnchorClient mock; wire UI badges to mock statuses.

15. Testing plan
- Unit tests for canonicalization and hash stability.
- Tests for sign/verify flows per backend (EVM, mock PQC).
- Contract tests ensuring provenance bundle shape is preserved through serialization.
- UI tests for badge states (signed/anchored/missing/partial).

16. Governance and trust policy (future)
- Define trust policy: which schemes and signers are accepted, how many signatures required, and when anchoring is mandatory.
- Express policy in config to avoid code redeploys.
