import { useCallback, useMemo, useState } from 'react';

import useIntelLLMPayload, { IntelLLMPayload } from './useIntelLLMPayload';
import { useStatusMessages } from '../contexts/StatusMessageContext';
import { InferenceFeature, InferenceRequest, InferenceResult } from '../types/InferenceTypes';
import { InferenceError, postInference } from '../services/InferenceClient';
import { FeedFetchDiagnostic } from '../types/FeedTypes';
import { parseBooleanFlag } from '../utils/FeatureFlagUtil';

interface AnalyticsClient {
  track: (event: string, payload?: Record<string, unknown>) => void;
}

const getAnalytics = (): AnalyticsClient | null => {
  const globalAny = globalThis as typeof globalThis & { analytics?: AnalyticsClient };
  return globalAny.analytics ?? null;
};

interface InferenceState {
  status: 'idle' | 'loading' | 'success' | 'error';
  feature: InferenceFeature | null;
  result?: InferenceResult;
  errorMessage?: string;
}

interface UseInferenceRequestOptions {
  selectedFeedList: string | null;
  diagnostics?: FeedFetchDiagnostic[];
  promptVersion?: string;
}

const MAX_PAYLOAD_CHARS = 20000;
const SESSION_COUNT_KEY = 'inferenceSessionCount';

const getEnvValue = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
};

const isInferenceEnabled = () => {
  const raw = getEnvValue('VITE_INFERENCE_ENABLED');
  const parsed = parseBooleanFlag(raw);
  return parsed === null ? true : parsed;
};

const getSessionCap = (): number | null => {
  const raw = getEnvValue('VITE_INFERENCE_SESSION_CAP');
  if (raw === undefined) return 5;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 5;
  if (parsed === 0) return null; // zero means no cap
  return parsed;
};

let inMemorySessionCount = 0;

const readSessionCount = () => {
  if (typeof sessionStorage === 'undefined') return inMemorySessionCount;
  const raw = sessionStorage.getItem(SESSION_COUNT_KEY);
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const writeSessionCount = (value: number) => {
  inMemorySessionCount = value;
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(SESSION_COUNT_KEY, value.toString());
};

const incrementSessionCount = () => {
  const next = readSessionCount() + 1;
  writeSessionCount(next);
  return next;
};

const emitCapHit = (feature: InferenceFeature, count: number, cap: number) => {
  const analytics = getAnalytics();
  if (!analytics) return;
  analytics.track('inference_cap_hit', {
    feature,
    count,
    cap,
    timestamp: new Date().toISOString()
  });
};

const redactText = (value: string | undefined): string | undefined => {
  if (!value) return value;
  const withoutUrls = value.replace(/https?:\/\/[\S]+/g, '[REDACTED_URL]');
  return withoutUrls.replace(/[^\s]+@[^\s]+/g, '[REDACTED_CONTACT]');
};

const applyRedaction = (payload: IntelLLMPayload): IntelLLMPayload => {
  const redactedIntel = payload.feeds.intel.map(record => ({
    ...record,
    body: redactText(record.body) ?? '',
    summary: redactText(record.summary)
  }));

  return {
    ...payload,
    feeds: {
      ...payload.feeds,
      intel: redactedIntel
    }
  };
};

const enforcePayloadLimit = (payload: IntelLLMPayload) => {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= MAX_PAYLOAD_CHARS) {
    return { payload, truncated: false, note: undefined as string | undefined };
  }

  const limitedCount = Math.max(1, Math.min(payload.feeds.intel.length, 30));
  const trimmedIntel = payload.feeds.intel.slice(0, limitedCount);
  const adjustedPayload: IntelLLMPayload = {
    ...payload,
    feeds: {
      ...payload.feeds,
      intel: trimmedIntel,
      count: trimmedIntel.length
    },
    limits: {
      ...payload.limits,
      maxFeeds: Math.min(payload.limits.maxFeeds ?? limitedCount, limitedCount)
    }
  };

  return {
    payload: adjustedPayload,
    truncated: true,
    note: 'Payload trimmed to stay within size limits'
  };
};

export const useInferenceRequest = ({
  selectedFeedList,
  diagnostics,
  promptVersion = 'v1'
}: UseInferenceRequestOptions) => {
  const { pushMessage } = useStatusMessages();
  const basePayload = useIntelLLMPayload({
    selectedFeedList,
    diagnostics: diagnostics ?? [],
    maxFeeds: 50,
    maxAlerts: 10,
    includeRawFeeds: false
  });

  const [state, setState] = useState<InferenceState>({ status: 'idle', feature: null });

  const payloadMeta = useMemo(() => ({
    feedCount: basePayload.feeds.count,
    totalFeeds: basePayload.feeds.total,
    lastUpdated: basePayload.timestamps.lastUpdated,
    alerts: basePayload.alerts.count
  }), [basePayload]);

  const runInference = useCallback(async (feature: InferenceFeature) => {
    if (!isInferenceEnabled()) {
      const msg = 'Inference is currently disabled. Please try again later.';
      setState({ status: 'error', feature, errorMessage: msg });
      pushMessage(msg, 'warning', { source: 'inference' });
      return;
    }

    const cap = getSessionCap();
    const currentCount = readSessionCount();
    if (cap !== null && currentCount >= cap) {
      const msg = 'Session request cap reached. Please wait or try later.';
      setState({ status: 'error', feature, errorMessage: msg });
      pushMessage(msg, 'warning', { source: 'inference' });
      emitCapHit(feature, currentCount, cap);
      return;
    }

    if (basePayload.feeds.total === 0) {
      const msg = 'No feeds available for inference right now';
      setState({ status: 'error', feature, errorMessage: msg });
      pushMessage(msg, 'warning', { source: 'inference' });
      return;
    }

    const withRedaction = applyRedaction({
      ...basePayload,
      timestamps: {
        ...basePayload.timestamps,
        generatedAt: new Date().toISOString()
      }
    });

    const { payload: constrained, truncated, note } = enforcePayloadLimit(withRedaction);

    const request: InferenceRequest = {
      feature,
      promptVersion,
      payload: constrained,
      ...(note ? { truncationNote: note } : {})
    };

    setState({ status: 'loading', feature });
    incrementSessionCount();
    try {
      const response = await postInference(request, { timeoutMs: 10000 });
      const truncationNote = (response.truncated || truncated)
        ? (note ?? 'Payload trimmed to stay within size limits')
        : undefined;

      const result: InferenceResult = {
        feature,
        requestId: response.requestId,
        text: response.text,
        generatedAt: response.generatedAt,
        truncated: response.truncated ?? truncated,
        ...(truncationNote ? { truncationNote } : {})
      };
      setState({ status: 'success', feature, result });
      pushMessage('Inference ready', 'success', { source: 'inference' });
    } catch (err: unknown) {
      let message = 'Inference request failed';
      if (err instanceof InferenceError) {
        const map: Record<string, string> = {
          timeout: 'Inference timed out. Please retry.',
          network: 'Network issue contacting inference service.',
          'rate-limit': 'Rate limit hit. Please wait and retry.',
          server: 'Inference service error. Try again shortly.',
          client: 'Request was rejected. Check payload.',
          unknown: 'Unexpected inference error.'
        };
        message = map[err.category] ?? message;
      }
      setState({ status: 'error', feature, errorMessage: message });
      pushMessage(message, 'error', { source: 'inference', priority: 'high' });
    }
  }, [basePayload, promptVersion, pushMessage]);

  return { state, runInference, payloadMeta };
};

export default useInferenceRequest;
