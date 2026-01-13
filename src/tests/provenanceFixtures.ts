import { ProvenanceBundle } from '../types/Provenance';

const baseTimestamp = new Date('2024-01-01T00:00:00Z').toISOString();

export const makeProvenanceFixture = (overrides: Partial<ProvenanceBundle> = {}): ProvenanceBundle => ({
  contentHash: 'hash-abc123',
  cid: 'bafytestcid',
  signatures: [
    {
      scheme: 'EVM',
      algo: 'secp256k1',
      signerId: '0xabc',
      signature: '0xsig',
      createdAt: baseTimestamp,
      publicKeyRef: 'pk-ref-1'
    }
  ],
  chainRef: { chain: 'mock-chain', txRef: '0xtx123', status: 'confirmed' },
  relayIds: ['relay-1'],
  modelVerdicts: [],
  provenanceVersion: '0.1.0',
  anchorStatus: 'anchored',
  ...overrides
});

export const makeUnsignedProvenance = (): ProvenanceBundle =>
  makeProvenanceFixture({ signatures: [] });

export const makePendingProvenance = (): ProvenanceBundle =>
  makeProvenanceFixture({
    anchorStatus: 'pending',
    chainRef: { chain: 'mock-chain', txRef: '0xtx-pending', status: 'pending' },
  });

export const makeFailedProvenance = (): ProvenanceBundle =>
  makeProvenanceFixture({
    anchorStatus: 'failed',
    chainRef: { chain: 'mock-chain', txRef: '0xtx-failed', status: 'failed' },
  });

export const makeHybridProvenance = (): ProvenanceBundle =>
  makeProvenanceFixture({
    signatures: [
      {
        scheme: 'EVM',
        algo: 'secp256k1',
        signerId: '0xabc',
        signature: '0xsig',
        createdAt: baseTimestamp,
        publicKeyRef: 'pk-ref-1'
      },
      {
        scheme: 'PQC',
        algo: 'falcon',
        signerId: 'pqc-1',
        signature: '0xpqcsig',
        createdAt: baseTimestamp,
        publicKeyRef: 'pk-ref-2'
      }
    ]
  });

export const makeMissingCidProvenance = (): ProvenanceBundle =>
  makeProvenanceFixture({ cid: '' });

export const makeMultiRelayProvenance = (): ProvenanceBundle =>
  makeProvenanceFixture({ relayIds: ['relay-1', 'relay-2', 'relay-3'] });
