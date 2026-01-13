import { InferenceFeature } from '../types/InferenceTypes';

interface InferenceEventBase {
  requestId: string;
  feature: InferenceFeature;
  promptVersion: string;
  payloadSize: number;
  feeds: number;
  alerts: number;
  truncationNote: string | null;
}

interface InferenceStart extends InferenceEventBase {
  timestamp: number;
}

interface InferenceSuccess extends InferenceEventBase {
  status: number;
  latencyMs: number;
  truncated: boolean;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
    costUSD?: number;
  };
}

interface InferenceFailure extends InferenceEventBase {
  status: number | null;
  latencyMs: number;
  category: string;
}

interface InferenceMetricsSnapshot {
  successes: number;
  failures: number;
  truncations: number;
  lastLatencyMs: number | null;
  lastStatus: number | null;
  lastCategory: string | null;
  lastRequestId: string | null;
  latencyBuckets: Record<string, number>;
}

type LatencyBucket = { label: string; max: number };

const latencyBucketDefinitions: LatencyBucket[] = [
  { label: '0-250', max: 250 },
  { label: '250-500', max: 500 },
  { label: '500-1000', max: 1000 },
  { label: '1000-2000', max: 2000 },
  { label: '2000+', max: Number.POSITIVE_INFINITY }
];

const createEmptyLatencyBuckets = (): Record<string, number> =>
  latencyBucketDefinitions.reduce<Record<string, number>>((acc, bucket) => {
    acc[bucket.label] = 0;
    return acc;
  }, {});

const metrics: InferenceMetricsSnapshot = {
  successes: 0,
  failures: 0,
  truncations: 0,
  lastLatencyMs: null,
  lastStatus: null,
  lastCategory: null,
  lastRequestId: null,
  latencyBuckets: createEmptyLatencyBuckets()
};

const defaultSampleRate = (() => {
  if (typeof process !== 'undefined' && (process.env as any)?.VITE_INFERENCE_LOG_SAMPLE_RATE) {
    const parsed = parseFloat((process.env as any).VITE_INFERENCE_LOG_SAMPLE_RATE);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  }
  return 1;
})();

const shouldLog = () => Math.random() < defaultSampleRate;

const maskValue = (value: string | null): string | null => {
  if (!value) return value;
  const withoutUrls = value.replace(/https?:\/\/\S+/g, '[REDACTED_URL]');
  const withoutContacts = withoutUrls.replace(/[\w.-]+@[\w.-]+/g, '[REDACTED_CONTACT]');
  return withoutContacts;
};

export class InferenceLogger {
  static logRequestStart(event: InferenceStart) {
    metrics.lastRequestId = event.requestId;
    metrics.lastCategory = 'start';
    metrics.lastLatencyMs = null;
    metrics.lastStatus = null;
    if (!shouldLog()) return;
    console.info('[Inference] start', {
      id: event.requestId,
      feature: event.feature,
      promptVersion: event.promptVersion,
      payloadSize: event.payloadSize,
      feeds: event.feeds,
      alerts: event.alerts,
      truncationNote: maskValue(event.truncationNote),
      timestamp: event.timestamp
    });
  }

  static logSuccess(event: InferenceSuccess) {
    metrics.successes += 1;
    metrics.truncations += event.truncated ? 1 : 0;
    metrics.lastLatencyMs = event.latencyMs;
    metrics.lastStatus = event.status;
    metrics.lastCategory = 'success';
    metrics.lastRequestId = event.requestId;
    InferenceLogger.recordLatency(event.latencyMs);
    if (!shouldLog()) return;
    console.info('[Inference] success', {
      id: event.requestId,
      feature: event.feature,
      promptVersion: event.promptVersion,
      status: event.status,
      latencyMs: event.latencyMs,
      payloadSize: event.payloadSize,
      truncated: event.truncated,
      truncationNote: maskValue(event.truncationNote),
      feeds: event.feeds,
      alerts: event.alerts,
      tokens: event.tokens
    });
  }

  static logFailure(event: InferenceFailure) {
    metrics.failures += 1;
    metrics.lastLatencyMs = event.latencyMs;
    metrics.lastStatus = event.status ?? null;
    metrics.lastCategory = event.category;
    metrics.lastRequestId = event.requestId;
    InferenceLogger.recordLatency(event.latencyMs);
    if (!shouldLog()) return;
    console.warn('[Inference] failure', {
      id: event.requestId,
      feature: event.feature,
      promptVersion: event.promptVersion,
      status: event.status,
      latencyMs: event.latencyMs,
      payloadSize: event.payloadSize,
      category: event.category,
      truncationNote: maskValue(event.truncationNote),
      feeds: event.feeds,
      alerts: event.alerts
    });
  }

  static getMetrics(): InferenceMetricsSnapshot {
    return { ...metrics, latencyBuckets: { ...metrics.latencyBuckets } };
  }

  static resetMetrics() {
    metrics.successes = 0;
    metrics.failures = 0;
    metrics.truncations = 0;
    metrics.lastLatencyMs = null;
    metrics.lastStatus = null;
    metrics.lastCategory = null;
    metrics.lastRequestId = null;
    metrics.latencyBuckets = createEmptyLatencyBuckets();
  }

  private static recordLatency(latencyMs: number) {
    const bucket = latencyBucketDefinitions.find(def => latencyMs <= def.max) ?? latencyBucketDefinitions[latencyBucketDefinitions.length - 1];
    metrics.latencyBuckets[bucket.label] += 1;
  }
}

export default InferenceLogger;
