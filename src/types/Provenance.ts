// Provenance types to support trust and integrity metadata
export interface SignatureRecord {
  scheme: 'EVM' | 'PQC' | 'HYBRID' | string;
  algo: string;
  signerId: string;
  signature: string;
  createdAt: string;
  publicKeyRef?: string;
}

export interface ChainReference {
  chain: string; // e.g., QAN, mock
  txRef: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  anchoredAt?: string;
}

export interface ModelVerdict {
  modelId: string;
  summaryHash: string;
  confidence?: number;
  signedByModel?: boolean;
  ts: string;
}

export interface ProvenanceBundle {
  contentHash?: string;
  cid?: string;
  signatures?: SignatureRecord[];
  chainRef?: ChainReference;
  relayIds?: string[];
  modelVerdicts?: ModelVerdict[];
  provenanceVersion?: string;
  anchorStatus?: 'not-requested' | 'pending' | 'anchored' | 'failed';
}
