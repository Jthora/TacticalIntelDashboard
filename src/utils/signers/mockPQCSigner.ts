import { createHash } from 'crypto';

import { PublicKeyRef, SignaturePayload, SignatureResult, SignerMetadata, SignerProvider } from '../../types/SignerProvider';

const SCHEME = 'PQC-MOCK';
const ALGO = 'deterministic-hash';
const VERSION = '0.1.0';
const MOCK_PUBLIC_KEY = 'mock-pqc-public-key';

const normalizePayload = (payload: SignaturePayload): Buffer => {
  if (typeof payload === 'string') {
    return Buffer.from(payload, 'utf8');
  }
  return Buffer.from(payload);
};

const fingerprint = (data: Buffer): string => {
  return createHash('sha256').update(data).digest('hex');
};

export class MockPQCSigner implements SignerProvider {
  private readonly keyRef: PublicKeyRef = {
    id: fingerprint(Buffer.from(MOCK_PUBLIC_KEY)),
    scheme: SCHEME,
    algo: ALGO,
    publicKey: MOCK_PUBLIC_KEY
  };

  async sign(payload: SignaturePayload): Promise<SignatureResult> {
    const buf = normalizePayload(payload);
    const sig = fingerprint(Buffer.concat([buf, Buffer.from(MOCK_PUBLIC_KEY)]));

    return {
      signature: sig,
      scheme: SCHEME,
      algo: ALGO,
      publicKeyRef: this.keyRef
    };
  }

  async verify(payload: SignaturePayload, signature: SignatureResult): Promise<boolean> {
    if (signature.scheme !== SCHEME || signature.algo !== ALGO) {
      return false;
    }
    const buf = normalizePayload(payload);
    const expected = fingerprint(Buffer.concat([buf, Buffer.from(MOCK_PUBLIC_KEY)]));
    return signature.signature === expected;
  }

  async getPublicKey(): Promise<PublicKeyRef> {
    return this.keyRef;
  }

  metadata(): SignerMetadata {
    return {
      scheme: SCHEME,
      algo: ALGO,
      version: VERSION
    };
  }
}

export const mockPQCSigner = new MockPQCSigner();
