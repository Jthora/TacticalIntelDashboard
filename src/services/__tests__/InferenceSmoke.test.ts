import { postInference } from '../InferenceClient';
import { InferenceRequest } from '../../types/InferenceTypes';

const SMOKE_ENABLED = process.env.INFERENCE_SMOKE_ENABLE === '1';
const SMOKE_ENDPOINT = process.env.INFERENCE_SMOKE_ENDPOINT;
const PROMPT_VERSION = process.env.INFERENCE_SMOKE_PROMPT_VERSION ?? 'v1';

const now = new Date().toISOString();

const sandboxPayload: InferenceRequest['payload'] = {
  mission: { mode: 'sandbox', profileLabel: 'Smoke Test', selectedFeedList: null },
  filters: {
    activeFilters: [],
    timeRange: null,
    searchQuery: 'smoke-check',
    sortBy: { field: 'timestamp', direction: 'desc' }
  },
  feeds: {
    intel: [
      {
        id: 'smoke-1',
        title: 'Sandbox intel sample',
        created: now,
        classification: 'UNCLASS',
        priority: 'low',
        sources: ['smoke-fixture'],
        tags: ['smoke'],
        summary: 'Short sandbox intel used for live smoke validation.',
        body: 'Smoke test body content for inference live call.',
        confidence: 0.5
      }
    ],
    count: 1,
    total: 1
  },
  diagnostics: {
    summary: { success: 1, empty: 0, failed: 0 },
    entries: []
  },
  alerts: {
    triggers: [],
    count: 0
  },
  timestamps: {
    lastUpdated: now,
    generatedAt: now
  },
  limits: {
    maxFeeds: 5,
    maxAlerts: 5
  }
};

describe('Inference smoke (sandbox live call)', () => {
  if (!SMOKE_ENABLED || !SMOKE_ENDPOINT) {
    it.skip('skips smoke test when INFERENCE_SMOKE_ENABLE or endpoint not set', () => {
      expect(true).toBe(true);
    });
    return;
  }

  jest.setTimeout(15000);

  it('performs a tiny live call and records latency/tokens', async () => {
    const request: InferenceRequest = {
      feature: 'summary',
      promptVersion: PROMPT_VERSION,
      payload: sandboxPayload,
      truncationNote: 'sandbox smoke fixture'
    };

    const started = Date.now();
    const response = await postInference(request, {
      endpoint: SMOKE_ENDPOINT,
      timeoutMs: 10000
    });
    const latencyMs = Date.now() - started;

    expect(latencyMs).toBeLessThan(10000);
    expect(response.text.length).toBeGreaterThanOrEqual(12);

    // Helpful console log for manual verification without leaking payloads.
    // eslint-disable-next-line no-console
    console.info('[Smoke] latencyMs=%d tokens=%o', latencyMs, response.tokens ?? {});
  });
});
