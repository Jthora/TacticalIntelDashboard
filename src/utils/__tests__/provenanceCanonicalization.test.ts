import {
  makeFailedProvenance,
  makeHybridProvenance,
  makeMissingCidProvenance,
  makeMultiRelayProvenance,
  makePendingProvenance,
  makeProvenanceFixture
} from '../../tests/provenanceFixtures';
import { hashProvenanceBundle, canonicalizeProvenanceBundle } from '../provenanceCanonicalization';

const goldenBundle = makeHybridProvenance();
const goldenHash = '17b13909434a2c7a4f293d6f1a8a76065ccde21d95cce1e0a65d3e03fd5275d9';
const goldenMissingCidHash = 'af0691bacd739615b5d6722565e0abcf46af4405bb49667ff21ed18fa1fe922d';
const goldenMultiRelayHash = '4a118bdf620076899af9e6fe0ba4ffea6ade340a734d21afcc382a747762b4e2';

describe('provenance canonicalization', () => {
  it('is order independent for top-level fields', () => {
    const a = makePendingProvenance();
    const b = { ...makePendingProvenance(), relayIds: [...(a.relayIds || [])].reverse() };

    const hashA = hashProvenanceBundle(a);
    const hashB = hashProvenanceBundle(b);

    expect(hashA).toEqual(hashB);
  });

  it('excludes volatile fields from hash', () => {
    const base = makeFailedProvenance();
    const mutated = {
      ...base,
      anchorStatus: 'pending' as const,
      ...(base.chainRef
        ? { chainRef: { ...base.chainRef, status: 'pending' as const, anchoredAt: '2025-01-01T00:00:00Z' } }
        : {})
    };

    const hashBase = hashProvenanceBundle(base);
    const hashMutated = hashProvenanceBundle(mutated);

    expect(hashBase).toEqual(hashMutated);
  });

  it('matches golden vector for hybrid provenance fixture', () => {
    const canonical = canonicalizeProvenanceBundle(goldenBundle);
    const hash = hashProvenanceBundle(goldenBundle);

    expect(hash).toEqual(goldenHash);
    expect(canonical).toContain('signatures');
  });

  it('matches golden vector for missing CID fixture', () => {
    const hash = hashProvenanceBundle(makeMissingCidProvenance());
    expect(hash).toEqual(goldenMissingCidHash);
  });

  it('matches golden vector for multi-relay fixture', () => {
    const hash = hashProvenanceBundle(makeMultiRelayProvenance());
    expect(hash).toEqual(goldenMultiRelayHash);
  });

  it('produces deterministic hash when signatures are reordered', () => {
    const original = makeProvenanceFixture();
    const swapped = makeProvenanceFixture({
      signatures: original.signatures ? original.signatures.slice().reverse() : []
    });

    expect(hashProvenanceBundle(original)).toEqual(hashProvenanceBundle(swapped));
  });
});
