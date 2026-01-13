import { RelayAck, RelayClient, RelayEvent, RelayFilter, RelayHealth, RelayHandler, RelaySubscription } from '../../types/RelayClient';

interface SubscriptionEntry {
  filter: RelayFilter;
  handler: RelayHandler<any>;
}

const matchesFilter = (event: RelayEvent, filter: RelayFilter): boolean => {
  if (filter.types && filter.types.length > 0 && !filter.types.includes(event.type)) {
    return false;
  }
  if (filter.topics && filter.topics.length > 0) {
    const topics = event.topics || [];
    const overlap = topics.some(t => filter.topics!.includes(t));
    if (!overlap) return false;
  }
  return true;
};

interface SimulationOptions {
  latencyMs?: number;
  failNext?: boolean;
  logEvents?: boolean;
  dropPolicy?: 'deliver' | 'drop';
}

interface BackoffPolicy {
  enabled: boolean;
  maxAttempts: number;
  baseMs: number;
  jitterRatio: number; // 0.2 => ±20% jitter
  maxMs: number;
}

export class InMemoryRelayClient implements RelayClient {
  private subscriptions: SubscriptionEntry[] = [];
  private lastError: string | undefined;
  private nextRetryAt: number | undefined;
  private startedAt = Date.now();
  private simulation: SimulationOptions = { dropPolicy: 'deliver' };
  private eventLog: RelayEvent[] = [];
  private backoff: BackoffPolicy = {
    enabled: false,
    maxAttempts: 1,
    baseMs: 200,
    jitterRatio: 0.2,
    maxMs: 2000
  };

  configureSimulation(opts: SimulationOptions) {
    this.simulation = { ...this.simulation, ...opts };
  }

  configureBackoff(policy: Partial<BackoffPolicy>) {
    this.backoff = { ...this.backoff, ...policy };
  }

  async publish<T = any>(event: RelayEvent<T>): Promise<RelayAck> {
    const attempts = this.backoff.enabled ? this.backoff.maxAttempts : 1;
    let attempt = 0;
    let lastError: string | undefined;

    while (attempt < attempts) {
      attempt += 1;
      try {
        if (this.simulation.latencyMs) {
          await new Promise(resolve => setTimeout(resolve, this.simulation.latencyMs));
        }

        if (this.simulation.failNext) {
          this.simulation.failNext = false;
          throw new Error('simulated-failure');
        }

        if (this.simulation.dropPolicy === 'drop') {
          throw new Error('dropped-by-policy');
        }

        if (this.simulation.logEvents) {
          this.eventLog.push(event);
        }

        this.subscriptions.forEach(sub => {
          if (matchesFilter(event, sub.filter)) {
            sub.handler(event);
          }
        });
        this.lastError = undefined;
        this.nextRetryAt = undefined;
        return { id: event.id, status: 'ok' };
      } catch (error: any) {
        lastError = error?.message || 'publish error';
        this.lastError = lastError;

        if (attempt >= attempts) {
          this.nextRetryAt = undefined;
          return { id: event.id, status: 'failed', error: lastError || 'publish error' };
        }

        const delay = this.computeBackoffDelay(attempt);
        this.nextRetryAt = Date.now() + delay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.nextRetryAt = undefined;
    const error = lastError || 'publish error';
    return { id: event.id, status: 'failed', error };
  }

  subscribe<T = any>(filter: RelayFilter, handler: RelayHandler<T>): RelaySubscription {
    const entry: SubscriptionEntry = { filter, handler };
    this.subscriptions.push(entry);
    return {
      unsubscribe: () => {
        this.subscriptions = this.subscriptions.filter(s => s !== entry);
      }
    };
  }

  async health(): Promise<RelayHealth> {
    const base: RelayHealth = {
      status: this.lastError ? 'degraded' : 'ok',
      checkedAt: new Date().toISOString(),
      latencyMs: this.simulation.latencyMs,
      uptimeMs: Date.now() - this.startedAt
    } as RelayHealth;

    if (this.lastError) {
      const nextRetryInMs = this.nextRetryAt ? Math.max(this.nextRetryAt - Date.now(), 0) : undefined;
      if (nextRetryInMs !== undefined) {
        return { ...base, lastError: this.lastError, nextRetryInMs };
      }
      return { ...base, lastError: this.lastError };
    }
    return base;
  }

  getEventLog(): RelayEvent[] {
    return [...this.eventLog];
  }

  private computeBackoffDelay(attempt: number): number {
    const exponential = this.backoff.baseMs * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, this.backoff.maxMs);
    const jitter = capped * this.backoff.jitterRatio;
    const min = capped - jitter;
    const max = capped + jitter;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export const inMemoryRelayClient = new InMemoryRelayClient();
