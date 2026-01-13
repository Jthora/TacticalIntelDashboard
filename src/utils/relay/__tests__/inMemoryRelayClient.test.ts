import { expect } from '@jest/globals';

import { inMemoryRelayClient } from '../inMemoryRelayClient';
import { RelayEvent } from '../../../types/RelayClient';

describe('InMemoryRelayClient', () => {
  const makeEvent = (overrides: Partial<RelayEvent> = {}): RelayEvent => ({
    id: 'evt-1',
    type: 'intel',
    payload: { foo: 'bar' },
    ts: new Date().toISOString(),
    ...overrides
  });

  it('publishes and delivers to matching subscribers', async () => {
    const received: RelayEvent[] = [];
    const sub = inMemoryRelayClient.subscribe({ types: ['intel'] }, evt => received.push(evt));

    const ack = await inMemoryRelayClient.publish(makeEvent());
    expect(ack.status).toBe('ok');
    expect(received).toHaveLength(1);

    sub.unsubscribe();
  });

  it('filters by topics', async () => {
    const received: RelayEvent[] = [];
    const sub = inMemoryRelayClient.subscribe({ topics: ['alpha'] }, evt => received.push(evt));

    await inMemoryRelayClient.publish(makeEvent({ topics: ['beta'] }));
    await inMemoryRelayClient.publish(makeEvent({ topics: ['alpha'] }));

    expect(received).toHaveLength(1);
    expect(received[0].topics).toContain('alpha');
    sub.unsubscribe();
  });

  it('returns health with optional lastError', async () => {
    const health = await inMemoryRelayClient.health();
    expect(health.status).toBe('ok');
    expect(health.checkedAt).toBeDefined();
  });

  it('simulates failure and reports degraded health', async () => {
    inMemoryRelayClient.configureSimulation({ failNext: true });
    const ack = await inMemoryRelayClient.publish(makeEvent());
    expect(ack.status).toBe('failed');

    const health = await inMemoryRelayClient.health();
    expect(health.status).toBe('degraded');
    expect(health.lastError).toBeDefined();
  });

  it('drops events when drop policy is set', async () => {
    inMemoryRelayClient.configureSimulation({ dropPolicy: 'drop' });
    const ack = await inMemoryRelayClient.publish(makeEvent());
    expect(ack.status).toBe('failed');

    // reset to deliver for other tests
    inMemoryRelayClient.configureSimulation({ dropPolicy: 'deliver' });
  });

  it('logs events when logEvents is enabled', async () => {
    inMemoryRelayClient.configureSimulation({ logEvents: true });
    await inMemoryRelayClient.publish(makeEvent({ id: 'evt-log-1' }));
    const log = inMemoryRelayClient.getEventLog();
    expect(log.some(e => e.id === 'evt-log-1')).toBe(true);
    inMemoryRelayClient.configureSimulation({ logEvents: false });
  });

  it('recovers health after a failure', async () => {
    inMemoryRelayClient.configureSimulation({ failNext: true });
    const failAck = await inMemoryRelayClient.publish(makeEvent());
    expect(failAck.status).toBe('failed');

    inMemoryRelayClient.configureSimulation({});
    const okAck = await inMemoryRelayClient.publish(makeEvent());
    expect(okAck.status).toBe('ok');

    const health = await inMemoryRelayClient.health();
    expect(health.status).toBe('ok');
    expect(health.lastError).toBeUndefined();
  });

  it('retries with backoff and succeeds on second attempt', async () => {
    jest.useFakeTimers();
    inMemoryRelayClient.configureSimulation({ failNext: true });
    inMemoryRelayClient.configureBackoff({ enabled: true, maxAttempts: 2, baseMs: 10, jitterRatio: 0, maxMs: 10 });

    const publishPromise = inMemoryRelayClient.publish(makeEvent({ id: 'evt-backoff' }));
    jest.advanceTimersByTime(10);
    const ack = await publishPromise;

    expect(ack.status).toBe('ok');
    const health = await inMemoryRelayClient.health();
    expect(health.status).toBe('ok');
    expect(health.lastError).toBeUndefined();

    inMemoryRelayClient.configureBackoff({ enabled: false, maxAttempts: 1 });
    jest.useRealTimers();
  });

  it('returns degraded health with nextRetry when retries pending', async () => {
    jest.useFakeTimers();
    inMemoryRelayClient.configureSimulation({ dropPolicy: 'drop' });
    inMemoryRelayClient.configureBackoff({ enabled: true, maxAttempts: 3, baseMs: 20, jitterRatio: 0, maxMs: 20 });

    const publishPromise = inMemoryRelayClient.publish(makeEvent({ id: 'evt-drop' }));
    const healthDuring = await inMemoryRelayClient.health();
    expect(healthDuring.status).toBe('degraded');
    expect(healthDuring.nextRetryInMs).toBeDefined();

    await jest.runAllTimersAsync();
    const ack = await publishPromise;
    expect(ack.status).toBe('failed');

    const healthAfter = await inMemoryRelayClient.health();
    expect(healthAfter.lastError).toBeDefined();
    expect(healthAfter.nextRetryInMs).toBeUndefined();

    inMemoryRelayClient.configureSimulation({ dropPolicy: 'deliver' });
    inMemoryRelayClient.configureBackoff({ enabled: false, maxAttempts: 1 });
    jest.useRealTimers();
  });
});
