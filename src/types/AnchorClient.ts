export interface AnchorRequest {
  hash: string;
  context?: string;
}

export interface AnchorRecord {
  txRef: string;
  chain: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  anchoredAt?: string;
  error?: string;
}

export interface AnchorClient {
  anchor(req: AnchorRequest): Promise<AnchorRecord>;
  get(txRef: string): Promise<AnchorRecord>;
}
