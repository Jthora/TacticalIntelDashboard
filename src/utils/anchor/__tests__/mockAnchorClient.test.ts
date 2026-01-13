import { jest } from '@jest/globals';

import { MockAnchorClient, mockAnchorClient } from '../mockAnchorClient';

describe('mockAnchorClient', () => {
  it('anchors and returns pending', async () => {
    const rec = await mockAnchorClient.anchor({ hash: 'abc123' });
    expect(rec.status).toBe('pending');
    expect(rec.txRef).toContain('tx-');
  });

  it('transitions from pending to confirmed after delay', async () => {
    jest.useFakeTimers();
    const client = new MockAnchorClient();
    client.configureSimulation({ outcome: 'always-confirm', settleDelayMs: 5 });

    const pending = await client.anchor({ hash: 'confirm-me' });
    expect(pending.status).toBe('pending');

    jest.advanceTimersByTime(5);
    const settled = await client.get(pending.txRef);
    expect(settled.status).toBe('confirmed');

    client.reset();
    jest.useRealTimers();
  });

  it('transitions from pending to failed when forced to fail', async () => {
    jest.useFakeTimers();
    const client = new MockAnchorClient();
    client.configureSimulation({ outcome: 'always-fail', settleDelayMs: 5 });

    const pending = await client.anchor({ hash: 'fail-me' });
    expect(pending.status).toBe('pending');

    jest.advanceTimersByTime(5);
    const settled = await client.get(pending.txRef);
    expect(settled.status).toBe('failed');
    expect(settled.error).toBe('mock-failure');

    client.reset();
    jest.useRealTimers();
  });

  it('get returns confirmed or failed deterministically', async () => {
    const confirmed = await mockAnchorClient.get('tx-aaaaaaaaaaaa');
    const failed = await mockAnchorClient.get('tx-aaaaaaaaaaa');

    expect(['confirmed', 'failed']).toContain(confirmed.status);
    expect(['confirmed', 'failed']).toContain(failed.status);
  });

  it('returns failed for invalid txRef', async () => {
    const res = await mockAnchorClient.get('badref');
    expect(res.status).toBe('failed');
    expect(res.error).toBe('invalid-txRef');
  });

  it('returns failure for unknown but well-formed txRef', async () => {
    const client = new MockAnchorClient();
    client.configureSimulation({ outcome: 'always-fail' });

    const res = await client.get('tx-unknown');
    expect(res.status).toBe('failed');
    expect(res.error).toBe('mock-failure');

    client.reset();
  });

  it('logs redacted anchor attempts when enabled', async () => {
    const client = new MockAnchorClient();
    client.configureSimulation({ logAttempts: true });

    await client.anchor({ hash: 'supersecret-hash', context: 'ctx' });
    const log = client.getAttemptLog();

    expect(log).toHaveLength(1);
    expect(log[0].hashPreview).toBe('supers');
    expect(log[0].contextProvided).toBe(true);
    expect(log[0].hashLength).toBe('supersecret-hash'.length);

    client.reset();
  });
});
