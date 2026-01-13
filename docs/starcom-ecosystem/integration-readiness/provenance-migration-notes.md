# Provenance Migration Notes

These notes capture backward compatibility guidance for the new provenance bundle fields (contentHash, cid, signatures, chainRef, relayIds, modelVerdicts, provenanceVersion, anchorStatus).

## Goals
- Keep existing stored intel/alert/feed records readable without retrofitting required fields.
- Provide deterministic defaults for UI rendering and future persistence.
- Make it clear how to evolve the schema without breaking older clients.

## Defaulting rules
- All provenance fields remain optional; absence must not block parsing.
- Use empty string for `cid` when value is intentionally missing to satisfy strict optional checks.
- `anchorStatus` defaults to `not-requested`; `chainRef` may be undefined when no anchoring was attempted.
- `signatures`, `relayIds`, and `modelVerdicts` default to empty arrays; UI must treat empty arrays as "none" rather than errors.
- `provenanceVersion` defaults to `0.1.0` until a breaking change requires incrementing.

## Storage/backfill guidance
- Existing records require no migration when fields are absent; ingestion should hydrate defaults at read time.
- When backfilling historical records, populate `contentHash` if available and prefer leaving `cid` empty over fake values.
- For legacy anchoring attempts, set `anchorStatus` to `failed` with a short reason in logs; avoid inventing `chainRef` values.
- If model verdicts are not yet generated, keep `modelVerdicts` empty; do not emit placeholder IDs.

## Client behavior expectations
- UI components must tolerate missing fields and render explicit "Not provided" or "None" copy instead of blank cells.
- Trust badges and detail panels should fall back to neutral/absent states when provenance is undefined.
- When future versions add fields, follow additive evolution: mark new fields optional and gate rendering behind presence checks.

## Migration checkpoints
- Before introducing non-additive changes, tag the interface version and snapshot contract tests.
- Document any breaking adjustments (field renames/removals) with upgrade steps and data transforms.
