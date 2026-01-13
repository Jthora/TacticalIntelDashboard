import { InferenceError, postInference } from '../InferenceClient';
import { InferenceRequest } from '../../types/InferenceTypes';

describe('InferenceClient contract responses', () => {
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
    // @ts-expect-error
    global.fetch = undefined;
    jest.resetAllMocks();
    delete (process.env as any).VITE_INFERENCE_API_KEY;
  });

  it('accepts non-empty text responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        text: 'intel summary',
        generatedAt: '2025-01-01T00:00:00Z',
        usage: {
          prompt_tokens: 100,
          completion_tokens: 20,
          total_tokens: 120,
          estimated_cost: 0.005
        }
      })
    });
    global.fetch = fetchMock as any;

    const result = await postInference(baseRequest, { timeoutMs: 5000 });

    expect(result.text).toBe('intel summary');
    expect(result.requestId).toBeDefined();
    expect(result.tokens).toEqual({ prompt: 100, completion: 20, total: 120, costUSD: 0.005 });
  });

  it('adds auth header when API key provided', async () => {
    (process.env as any).VITE_INFERENCE_API_KEY = 'sandbox-key';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: 'intel summary', generatedAt: '2025-01-01T00:00:00Z' })
    });
    global.fetch = fetchMock as any;

    await postInference(baseRequest, { timeoutMs: 5000 });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.headers?.Authorization).toBe('Bearer sandbox-key');
  });

  it('rejects empty string responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: '' })
    });
    global.fetch = fetchMock as any;

    await expect(postInference(baseRequest, { timeoutMs: 5000 })).rejects.toBeInstanceOf(InferenceError);
  });

  it('rejects whitespace-only responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: '   \n  ' })
    });
    global.fetch = fetchMock as any;

    await expect(postInference(baseRequest, { timeoutMs: 5000 })).rejects.toBeInstanceOf(InferenceError);
  });

  it('rejects too-short responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: 'short text' })
    });
    global.fetch = fetchMock as any;

    await expect(postInference(baseRequest, { timeoutMs: 5000 })).rejects.toBeInstanceOf(InferenceError);
  });

  it('maps server errors with text payload to InferenceError', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ text: 'internal error' })
    });
    global.fetch = fetchMock as any;

    await expect(postInference(baseRequest, { timeoutMs: 5000 })).rejects.toBeInstanceOf(InferenceError);
  });
});
