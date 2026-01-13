export type SignaturePayload = string | Uint8Array;

export interface PublicKeyRef {
  id: string; // stable fingerprint of the public key
  scheme: 'EVM' | 'PQC' | 'HYBRID' | string;
  algo: string;
  publicKey?: string; // optional to avoid large payloads; prefer refs in production
}

export interface SignatureResult {
  signature: string;
  scheme: 'EVM' | 'PQC' | 'HYBRID' | string;
  algo: string;
  publicKeyRef: PublicKeyRef;
}

export interface SignerMetadata {
  scheme: 'EVM' | 'PQC' | 'HYBRID' | string;
  algo: string;
  version: string;
}

export interface SignerProvider {
  sign(payload: SignaturePayload): Promise<SignatureResult>;
  verify(payload: SignaturePayload, signature: SignatureResult): Promise<boolean>;
  getPublicKey(): Promise<PublicKeyRef>;
  metadata(): SignerMetadata;
}
