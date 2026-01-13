export interface RelayEvent<T = any> {
  id: string;
  type: string;
  payload: T;
  ts: string;
  topics?: string[];
  relayIds?: string[];
}

export interface RelayFilter {
  topics?: string[];
  types?: string[];
}

export interface RelayAck {
  id: string;
  status: 'ok' | 'failed';
  error?: string;
}

export interface RelayHealth {
  status: 'ok' | 'degraded' | 'down';
  latencyMs?: number;
  lastError?: string;
  checkedAt?: string;
  nextRetryInMs?: number;
}

export type RelayHandler<T = any> = (event: RelayEvent<T>) => void;

export interface RelaySubscription {
  unsubscribe: () => void;
}

export interface RelayClient {
  publish<T = any>(event: RelayEvent<T>): Promise<RelayAck>;
  subscribe<T = any>(filter: RelayFilter, handler: RelayHandler<T>): RelaySubscription;
  health(): Promise<RelayHealth>;
}
