import { AnchorClient, AnchorRecord, AnchorRequest } from '../../types/AnchorClient';

const CHAIN = 'QAN-mock';

const makeRecord = (txRef: string, status: AnchorRecord['status'], error?: string): AnchorRecord => {
  const base: AnchorRecord = {
    txRef,
    chain: CHAIN,
    status
  };

  if (status === 'confirmed') {
    base.anchoredAt = new Date().toISOString();
  }
  if (error) {
    base.error = error;
  }

  return base;
};

type AnchorOutcome = 'confirmed' | 'failed';

interface SimulationOptions {
  settleDelayMs?: number;
  outcome?: 'deterministic' | 'always-confirm' | 'always-fail';
  logAttempts?: boolean;
}

interface AnchorAttemptLog {
  txRef: string;
  hashPreview: string;
  hashLength: number;
  contextProvided: boolean;
  at: string;
}

const defaultSimulation: Required<SimulationOptions> = {
  settleDelayMs: 25,
  outcome: 'deterministic',
  logAttempts: false
};

export class MockAnchorClient implements AnchorClient {
  private records = new Map<string, AnchorRecord>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private simulation: Required<SimulationOptions> = { ...defaultSimulation };
  private attemptLog: AnchorAttemptLog[] = [];

  configureSimulation(opts: SimulationOptions) {
    this.simulation = { ...this.simulation, ...opts };
  }

  reset() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers.clear();
    this.records.clear();
    this.attemptLog = [];
    this.simulation = { ...defaultSimulation };
  }

  async anchor(req: AnchorRequest): Promise<AnchorRecord> {
    const txRef = `tx-${Buffer.from(req.hash).toString('hex').slice(0, 12)}`;
    const record = makeRecord(txRef, 'pending');
    this.records.set(txRef, record);

    const outcome = this.resolveOutcome(txRef);
    this.scheduleSettle(txRef, outcome);
    this.logAttempt(txRef, req);

    return { ...record };
  }

  async get(txRef: string): Promise<AnchorRecord> {
    if (!txRef || !txRef.startsWith('tx-')) {
      return makeRecord('invalid', 'failed', 'invalid-txRef');
    }

    const existing = this.records.get(txRef);
    if (existing) {
      return { ...existing };
    }

    // If unknown but well-formed, return deterministic outcome without scheduling
    const outcome = this.resolveOutcome(txRef);
    if (outcome === 'confirmed') {
      return makeRecord(txRef, 'confirmed');
    }
    return makeRecord(txRef, 'failed', 'mock-failure');
  }

  getAttemptLog(): AnchorAttemptLog[] {
    return [...this.attemptLog];
  }

  private scheduleSettle(txRef: string, outcome: AnchorOutcome) {
    const delay = this.simulation.settleDelayMs;
    const timer = setTimeout(() => {
      const current = this.records.get(txRef);
      if (!current) return;

      const next =
        outcome === 'confirmed'
          ? makeRecord(txRef, 'confirmed')
          : makeRecord(txRef, 'failed', 'mock-failure');

      this.records.set(txRef, next);
      this.timers.delete(txRef);
    }, delay);

    this.timers.set(txRef, timer);
  }

  private resolveOutcome(txRef: string): AnchorOutcome {
    if (this.simulation.outcome === 'always-confirm') return 'confirmed';
    if (this.simulation.outcome === 'always-fail') return 'failed';

    const normalized = txRef.replace('tx-', '');
    const score = normalized.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return score % 2 === 0 ? 'confirmed' : 'failed';
  }

  private logAttempt(txRef: string, req: AnchorRequest) {
    if (!this.simulation.logAttempts) return;
    this.attemptLog.push({
      txRef,
      hashPreview: req.hash.slice(0, 6),
      hashLength: req.hash.length,
      contextProvided: Boolean(req.context),
      at: new Date().toISOString()
    });
  }
}

export const mockAnchorClient = new MockAnchorClient();
