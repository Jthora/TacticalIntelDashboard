import { act, renderHook } from '@testing-library/react';
import useInferenceRequest from '../useInferenceRequest';
import { InferenceRequest } from '../../types/InferenceTypes';

const pushMessageMock = jest.fn();

jest.mock('../useIntelLLMPayload');
jest.mock('../../contexts/StatusMessageContext', () => ({
  useStatusMessages: () => ({ pushMessage: pushMessageMock, clearMessages: jest.fn(), dismissMessage: jest.fn(), messages: [], latestMessage: null, highestPriorityMessage: null })
}));
jest.mock('../../services/InferenceClient', () => ({
  postInference: jest.fn(),
  InferenceError: jest.requireActual('../../services/InferenceClient').InferenceError
}));

const baseIntelRecord = {
  id: 'r1',
  title: 'Title',
  created: '2024-01-01T00:00:00Z',
  classification: 'UNCLASS',
  priority: 'medium' as const,
  sources: ['SRC'],
  body: 'Body https://example.com contact@test.com',
  summary: 'Summary'
};

const buildPayload = (intelCount: number, bodySize = 50) => {
  const intel = Array.from({ length: intelCount }).map((_, idx) => ({
    ...baseIntelRecord,
    id: `id-${idx}`,
    body: 'x'.repeat(bodySize)
  }));
  return {
    mission: { mode: 'test', profileLabel: 'Test', selectedFeedList: 'list-1' },
    filters: {
      activeFilters: [],
      timeRange: null,
      searchQuery: '',
      sortBy: { field: 'timestamp', direction: 'desc' }
    },
    feeds: {
      intel,
      count: intel.length,
      total: intel.length
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
      generatedAt: '2024-01-01T00:00:00Z'
    },
    limits: {
      maxFeeds: 50,
      maxAlerts: 10
    }
  };
};

describe('useInferenceRequest', () => {
  const useIntelLLMPayload = require('../useIntelLLMPayload').default as jest.Mock;
  const postInference = require('../../services/InferenceClient').postInference as jest.Mock;
  const { InferenceError } = jest.requireActual('../../services/InferenceClient');

  beforeEach(() => {
    jest.resetAllMocks();
    delete (process.env as any).VITE_INFERENCE_ENABLED;
    delete (process.env as any).VITE_INFERENCE_SESSION_CAP;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    useIntelLLMPayload.mockReturnValue(buildPayload(1));
    postInference.mockResolvedValue({
      requestId: 'req-1',
      text: 'ok',
      generatedAt: '2024-02-02T00:00:00Z',
      truncated: false,
      status: 200
    });
    pushMessageMock.mockClear();
  });

  it('redacts URLs and contacts before sending', async () => {
    const redactionPayload = buildPayload(1);
    redactionPayload.feeds.intel[0].body = 'Visit https://example.com contact@test.com';
    useIntelLLMPayload.mockReturnValue(redactionPayload);

    const { result } = renderHook(() => useInferenceRequest({ selectedFeedList: 'list-1', diagnostics: [] }));

    await act(async () => {
      await result.current.runInference('summary');
    });

    const sent: InferenceRequest = postInference.mock.calls[0][0];
    expect(sent.payload.feeds.intel[0].body).toContain('[REDACTED_URL]');
    expect(sent.payload.feeds.intel[0].body).toContain('[REDACTED_CONTACT]');
  });

  it('enforces payload size limits and adds truncation note', async () => {
    // Create payload exceeding max size
    useIntelLLMPayload.mockReturnValue(buildPayload(60, 800));

    const { result } = renderHook(() => useInferenceRequest({ selectedFeedList: 'list-1', diagnostics: [] }));

    await act(async () => {
      await result.current.runInference('summary');
    });

    const sent: InferenceRequest = postInference.mock.calls[0][0];
    expect(sent.payload.feeds.count).toBe(30);
    expect(sent.payload.limits.maxFeeds).toBe(30);
    expect(sent.truncationNote).toBeDefined();
  });

  it('short-circuits when no feeds and surfaces message', async () => {
    useIntelLLMPayload.mockReturnValue(buildPayload(0));

    const { result } = renderHook(() => useInferenceRequest({ selectedFeedList: 'list-1', diagnostics: [] }));

    await act(async () => {
      await result.current.runInference('summary');
    });

    expect(postInference).not.toHaveBeenCalled();
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toContain('No feeds available');
    expect(pushMessageMock).toHaveBeenCalledWith('No feeds available for inference right now', 'warning', { source: 'inference' });
  });

  it('maps transport error categories to user-facing message', async () => {
    postInference.mockRejectedValue(new InferenceError('fail', 'timeout'));

    const { result } = renderHook(() => useInferenceRequest({ selectedFeedList: 'list-1', diagnostics: [] }));

    await act(async () => {
      await result.current.runInference('summary');
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toContain('timed out');
    expect(pushMessageMock).toHaveBeenCalledWith('Inference timed out. Please retry.', 'error', { source: 'inference', priority: 'high' });
  });

  it('blocks when inference is disabled via flag', async () => {
    (process.env as any).VITE_INFERENCE_ENABLED = 'false';

    const { result } = renderHook(() => useInferenceRequest({ selectedFeedList: 'list-1', diagnostics: [] }));

    await act(async () => {
      await result.current.runInference('summary');
    });

    expect(postInference).not.toHaveBeenCalled();
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toContain('disabled');
    expect(pushMessageMock).toHaveBeenCalledWith('Inference is currently disabled. Please try again later.', 'warning', { source: 'inference' });
  });

  it('enforces per-session request cap', async () => {
    (process.env as any).VITE_INFERENCE_SESSION_CAP = '1';
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('inferenceSessionCount', '1');
    }

    const { result } = renderHook(() => useInferenceRequest({ selectedFeedList: 'list-1', diagnostics: [] }));

    await act(async () => {
      await result.current.runInference('summary');
    });

    expect(postInference).not.toHaveBeenCalled();
    expect(result.current.state.errorMessage).toContain('cap');
    expect(pushMessageMock).toHaveBeenCalledWith('Session request cap reached. Please wait or try later.', 'warning', { source: 'inference' });
  });
});
