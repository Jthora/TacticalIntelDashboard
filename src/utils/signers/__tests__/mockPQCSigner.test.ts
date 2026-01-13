import { mockPQCSigner } from '../mockPQCSigner';

const payload = 'hello-world';

describe('mockPQCSigner', () => {
  it('signs and verifies deterministically', async () => {
    const sig = await mockPQCSigner.sign(payload);
    const ok = await mockPQCSigner.verify(payload, sig);

    expect(ok).toBe(true);
    expect(sig.signature).toHaveLength(64);
    expect(sig.scheme).toBe('PQC-MOCK');
    expect(sig.algo).toBe('deterministic-hash');
    expect(sig.publicKeyRef.id).toBeDefined();
  });

  it('fails verification on tampered payload', async () => {
    const sig = await mockPQCSigner.sign(payload);
    const ok = await mockPQCSigner.verify(payload + '-tamper', sig);

    expect(ok).toBe(false);
  });

  it('exposes metadata and public key', async () => {
    const meta = mockPQCSigner.metadata();
    const key = await mockPQCSigner.getPublicKey();

    expect(meta.scheme).toBe('PQC-MOCK');
    expect(meta.algo).toBe('deterministic-hash');
    expect(meta.version).toBe('0.1.0');
    expect(key.publicKey).toBeDefined();
  });
});
