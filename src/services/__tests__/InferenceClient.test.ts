import { postInference, InferenceError } from '../InferenceClient';
import { InferenceRequest } from '../../types/InferenceTypes';

describe('postInference', () => {
  const baseRequest: InferenceRequest = {
    feature: 'summary',
    promptVersion: 'v1',
    payload: {
      mission: { mode: 'test', profileLabel: 'Test', selectedFeedList: null },
      filters: {
        activeFilters: [],
        timeRange: null,
        searchQuery: '',
        sortBy: { field: 'timestamp', direction: 'desc' }
      },
      feeds: {
        intel: [],
        count: 0,
        total: 0
      },
      diagnostics: {
        summary: { success: 0, empty: 0, failed: 0 },
        entries: []
      },
      alerts: {
        triggers: [],
        count: 0
      },
      timestamps: {
        lastUpdated: null,
        generatedAt: '2024-01-01T00:00:00.000Z'
      },
      limits: {
        maxFeeds: 50,
        maxAlerts: 10
      }
    }
  };

  afterEach(() => {
    jest.useRealTimers();
    // @ts-expect-error
    global.fetch = undefined;
    jest.resetAllMocks();
  });

  it('returns response on success', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: 'intel summary', generatedAt: '2024-02-02T00:00:00Z' })
    });
    global.fetch = fetchMock as any;

    const result = await postInference(baseRequest, { timeoutMs: 5000 });

    expect(result.text).toBe('intel summary');
    expect(result.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries once on network error then succeeds', async () => {
    jest.useFakeTimers();

    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ text: 'after retry', generatedAt: '2024-02-02T00:00:00Z' })
      });
    global.fetch = fetchMock as any;

    const promise = postInference(baseRequest, { timeoutMs: 5000 });

    await jest.runOnlyPendingTimersAsync();
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('after retry');
    jest.useRealTimers();
  });

  it('does not retry on rate limit error', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({})
    });
    global.fetch = fetchMock as any;

    await expect(postInference(baseRequest, { timeoutMs: 5000 })).rejects.toBeInstanceOf(InferenceError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
