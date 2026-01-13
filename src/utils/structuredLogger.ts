type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type RedactedPayload = {
  hash: string;
  length: number;
};

type StructuredLog = {
  area: 'ingest' | 'provenance' | string;
  code: string;
  message: string;
  url?: string | undefined;
  context?: Record<string, unknown> | undefined;
  payloadDigest?: RedactedPayload | undefined;
  timestamp: string;
};

const sensitiveKeys = new Set(['payload', 'body', 'data', 'contents', 'text', 'raw']);

// Lightweight FNV-1a 32-bit hash for deterministic digests without external deps
const hashString = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

const redactValue = (value: unknown): RedactedPayload => {
  const asString = typeof value === 'string' ? value : JSON.stringify(value ?? {});
  return {
    hash: hashString(asString),
    length: asString.length,
  };
};

const sanitizeContext = (context?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!context) return undefined;
  const cleaned: Record<string, unknown> = {};
  Object.entries(context).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    const lower = key.toLowerCase();
    if (sensitiveKeys.has(lower)) {
      cleaned[key] = redactValue(value);
      return;
    }
    if (typeof value === 'string' && value.length > 120) {
      cleaned[key] = redactValue(value);
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
};

export const logIngestEvent = (params: {
  level: LogLevel;
  code: string;
  message: string;
  url?: string;
  context?: Record<string, unknown>;
  payload?: unknown;
}): void => {
  const { level, code, message, url, context, payload } = params;
  const payloadDigest = payload !== undefined ? redactValue(payload) : undefined;
  const record: StructuredLog = {
    area: 'ingest',
    code,
    message,
    url,
    context: sanitizeContext(context),
    payloadDigest,
    timestamp: new Date().toISOString(),
  };
  const logger = (console[level as keyof Console] as unknown as (...args: unknown[]) => void) || console.log;
  logger('[ingest]', record);
};

export type { StructuredLog, RedactedPayload, LogLevel };
export { hashString, redactValue, sanitizeContext };
