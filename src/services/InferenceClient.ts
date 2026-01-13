import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

import { InferenceErrorCategory, InferenceRequest, InferenceResponse } from '../types/InferenceTypes';
import InferenceLogger from './InferenceLogger';
import { warnIfInvalidInferenceKey, getInferenceApiKey } from './inferenceEnv';

const DEFAULT_ENDPOINT = (typeof process !== 'undefined' && (process.env as any)?.VITE_INFERENCE_ENDPOINT)
  ?? '/api/inference';
const DEFAULT_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 350;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const categorizeStatus = (status: number): InferenceErrorCategory => {
  if (status === 429) return 'rate-limit';
  if (status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'unknown';
};

export class InferenceError extends Error {
  public category: InferenceErrorCategory;
  public status: number | undefined;
  public requestId: string | undefined;

  constructor(message: string, category: InferenceErrorCategory, status?: number, requestId?: string) {
    super(message);
    this.name = 'InferenceError';
    this.category = category;
    this.status = status;
    this.requestId = requestId;
  }
}

interface PostOptions {
  endpoint?: string;
  timeoutMs?: number;
}

const buildRequestId = (payload: InferenceRequest['payload']): string => {
  const hash = SHA256(JSON.stringify({
    mission: payload.mission,
    filters: payload.filters,
    feedsCount: payload.feeds.count,
    alertsCount: payload.alerts.count,
    generatedAt: payload.timestamps.generatedAt
  })).toString(Hex);
  return `${hash.slice(0, 12)}-${Date.now()}`;
};

const fetchWithTimeout = async (endpoint: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const apiKey = getInferenceApiKey();
    const authHeaders = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    const headers = { ...(init.headers ?? {}), ...authHeaders } as HeadersInit;

    const response = await fetch(endpoint, { ...init, headers, signal: controller.signal });
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new InferenceError('Inference request timed out', 'timeout');
    }
    throw new InferenceError('Network error during inference request', 'network');
  } finally {
    clearTimeout(timer);
  }
};

const shouldRetry = (category: InferenceErrorCategory) => category === 'timeout' || category === 'network' || category === 'server';

warnIfInvalidInferenceKey();

const parseTokenUsage = (data: any) => {
  const usage = data?.usage ?? data?.tokens ?? {};
  const prompt = usage.prompt_tokens ?? usage.prompt;
  const completion = usage.completion_tokens ?? usage.completion;
  const total = usage.total_tokens ?? usage.total ?? (prompt && completion ? prompt + completion : undefined);
  const costUSD = usage.estimated_cost ?? usage.cost;

  const result: {
    prompt?: number;
    completion?: number;
    total?: number;
    costUSD?: number;
  } = {};

  if (typeof prompt === 'number') result.prompt = prompt;
  if (typeof completion === 'number') result.completion = completion;
  if (typeof total === 'number') result.total = total;
  if (typeof costUSD === 'number') result.costUSD = costUSD;

  return Object.keys(result).length === 0 ? undefined : result;
};

const MIN_TEXT_LENGTH = 12;

const validateText = (text: unknown, status: number | undefined, requestId: string): string => {
  if (typeof text !== 'string') {
    throw new InferenceError('Inference response missing text', 'server', status, requestId);
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new InferenceError('Inference response missing text', 'server', status, requestId);
  }
  if (trimmed.length < MIN_TEXT_LENGTH) {
    throw new InferenceError('Inference response too short', 'server', status, requestId);
  }
  return trimmed;
};

export const postInference = async (
  request: InferenceRequest,
  options: PostOptions = {}
): Promise<InferenceResponse> => {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const requestId = buildRequestId(request.payload);
  const body = JSON.stringify({ ...request, requestId });
  const payloadSize = body.length;
  const startedAt = Date.now();

  InferenceLogger.logRequestStart({
    requestId,
    feature: request.feature,
    promptVersion: request.promptVersion,
    payloadSize,
    feeds: request.payload.feeds.count,
    alerts: request.payload.alerts.count,
    truncationNote: request.truncationNote ?? null,
    timestamp: startedAt
  });

  const doRequest = async (): Promise<InferenceResponse> => {
    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    }, timeoutMs);

    if (!response.ok) {
      const category = categorizeStatus(response.status);
      const message = `Inference request failed with status ${response.status}`;
      throw new InferenceError(message, category, response.status, requestId);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (err) {
      throw new InferenceError('Invalid JSON in inference response', 'server', response.status, requestId);
    }

    const validatedText = validateText(data?.text, response.status, requestId);

    const generatedAt = typeof data.generatedAt === 'string' ? data.generatedAt : new Date().toISOString();

    const tokens = parseTokenUsage(data);

    const latencyMs = Date.now() - startedAt;

    const result: InferenceResponse = {
      requestId,
      text: validatedText,
      generatedAt,
      truncated: Boolean(data.truncated),
      status: response.status
    };

    if (tokens) {
      result.tokens = tokens;
    }

    InferenceLogger.logSuccess({
      requestId,
      feature: request.feature,
      promptVersion: request.promptVersion,
      status: response.status,
      latencyMs,
      payloadSize,
      truncated: Boolean(data.truncated),
      truncationNote: request.truncationNote ?? null,
      feeds: request.payload.feeds.count,
      alerts: request.payload.alerts.count,
      ...(tokens ? { tokens } : {})
    });

    return result;
  };

  try {
    return await doRequest();
  } catch (err) {
    const latencyMs = Date.now() - startedAt;

    if (err instanceof InferenceError) {
      InferenceLogger.logFailure({
        requestId,
        feature: request.feature,
        promptVersion: request.promptVersion,
        status: err.status ?? null,
        latencyMs,
        payloadSize,
        category: err.category,
        truncationNote: request.truncationNote ?? null,
        feeds: request.payload.feeds.count,
        alerts: request.payload.alerts.count
      });
    }

    if (err instanceof InferenceError && shouldRetry(err.category)) {
      await sleep(RETRY_DELAY_MS + Math.floor(Math.random() * 150));
      return doRequest();
    }
    throw err;
  }
};
