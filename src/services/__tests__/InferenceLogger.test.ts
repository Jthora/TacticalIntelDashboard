import InferenceLogger from '../InferenceLogger';

const baseEvent = {
  requestId: 'req-1',
  feature: 'summary' as const,
  promptVersion: 'v1',
  payloadSize: 100,
  feeds: 2,
  alerts: 1,
  truncationNote: 'see https://example.com contact@test.com'
};

describe('InferenceLogger masking', () => {
  let randomSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    InferenceLogger.resetMetrics();
    randomSpy = jest.spyOn(global.Math, 'random').mockReturnValue(0); // always log
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('masks URLs and contacts in truncation notes', () => {
    InferenceLogger.logRequestStart({ ...baseEvent, timestamp: Date.now() });

    expect(console.info).toHaveBeenCalledTimes(1);
    const [, payload] = (console.info as jest.Mock).mock.calls[0];
    expect(payload.truncationNote).toBe('see [REDACTED_URL] [REDACTED_CONTACT]');
  });
});

describe('InferenceLogger metrics', () => {
  let randomSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    InferenceLogger.resetMetrics();
    randomSpy = jest.spyOn(global.Math, 'random').mockReturnValue(0);
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    InferenceLogger.resetMetrics();
  });

  it('tracks counters, truncations, and latency buckets', () => {
    InferenceLogger.logSuccess({
      ...baseEvent,
      status: 200,
      latencyMs: 320,
      truncated: true
    });

    InferenceLogger.logFailure({
      ...baseEvent,
      status: 500,
      latencyMs: 1200,
      category: 'server'
    });

    const snapshot = InferenceLogger.getMetrics();

    expect(snapshot.successes).toBe(1);
    expect(snapshot.failures).toBe(1);
    expect(snapshot.truncations).toBe(1);
    expect(snapshot.latencyBuckets['250-500']).toBe(1);
    expect(snapshot.latencyBuckets['1000-2000']).toBe(1);
    expect(snapshot.lastCategory).toBe('server');
    expect(snapshot.lastRequestId).toBe(baseEvent.requestId);
  });

  it('records metrics even when logs are sampled out', () => {
    randomSpy.mockReturnValue(1); // skip log emission when sample rate is 1

    InferenceLogger.logSuccess({
      ...baseEvent,
      status: 200,
      latencyMs: 75,
      truncated: false
    });

    const snapshot = InferenceLogger.getMetrics();
    expect(snapshot.successes).toBe(1);
    expect(snapshot.truncations).toBe(0);
    expect(snapshot.latencyBuckets['0-250']).toBe(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
