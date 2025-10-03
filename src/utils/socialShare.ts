export const DEFAULT_X_INTENT_BASE_URL = 'https://x.com/intent/tweet';
export const LEGACY_TWITTER_INTENT_BASE_URL = 'https://twitter.com/intent/tweet';
const DEFAULT_MAX_LENGTH = 280;
const ELLIPSIS = '…';

type NonEmptyArray<T> = [T, ...T[]];

export interface ShareTextOptions {
  title?: string | undefined;
  summary?: string | undefined;
  maxLength?: number | undefined;
}

export interface BuildIntentUrlOptions extends ShareTextOptions {
  url: string;
  hashtags?: string[];
  via?: string | undefined;
  baseUrl?: string | undefined;
}

export function composeShareText({
  title,
  summary,
  maxLength = DEFAULT_MAX_LENGTH
}: ShareTextOptions): string {
  const segments: string[] = [];
  const trimmedTitle = title?.trim();
  const trimmedSummary = summary?.trim();

  if (trimmedTitle) segments.push(trimmedTitle);
  if (trimmedSummary && trimmedSummary !== trimmedTitle) {
    segments.push(trimmedSummary);
  }

  if (segments.length === 0) return '';

  const joined = segments.join(' — ');
  if (joined.length <= maxLength) return joined;

  if (maxLength <= ELLIPSIS.length) {
    return ELLIPSIS.slice(0, maxLength);
  }

  return joined.slice(0, maxLength - ELLIPSIS.length).trimEnd() + ELLIPSIS;
}

export function normalizeHashtags(hashtags: string[] = []): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of hashtags) {
    if (!tag) continue;
    const cleaned = tag
      .replace(/^#+/, '')
      .replace(/\s+/g, '')
      .trim();
    if (!cleaned) continue;
    const lowered = cleaned.toLowerCase();
    if (seen.has(lowered)) continue;
    seen.add(lowered);
    normalized.push(lowered);
  }

  return normalized;
}

function sanitizeVia(via?: string): string | undefined {
  if (!via) return undefined;
  const cleaned = via.replace(/^@+/, '').trim();
  return cleaned || undefined;
}

function resolveBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return DEFAULT_X_INTENT_BASE_URL;
  if (!/^https?:\/\//.test(baseUrl)) {
    return `https://${baseUrl.replace(/^\/+/, '')}`;
  }
  return baseUrl;
}

function ensureUrlProvided(url?: string): asserts url is string {
  if (!url) {
    throw new Error('buildXIntentUrl requires a URL to be provided');
  }
}

export function buildXIntentUrl(options: BuildIntentUrlOptions): string {
  const { url, title, summary, hashtags = [], via, baseUrl, maxLength } = options;
  ensureUrlProvided(url);

  const params = new URLSearchParams();
  const text = composeShareText({ title, summary, maxLength });

  if (text) params.set('text', text);
  params.set('url', url);

  const normalizedHashtags = normalizeHashtags(hashtags);
  if (normalizedHashtags.length > 0) {
    params.set('hashtags', normalizedHashtags.join(','));
  }

  const sanitizedVia = sanitizeVia(via);
  if (sanitizedVia) params.set('via', sanitizedVia);

  return `${resolveBaseUrl(baseUrl)}?${params.toString()}`;
}

export function assertHashtags<T extends string>(hashtags: readonly T[]): NonEmptyArray<T> {
  if (!hashtags || hashtags.length === 0) {
    throw new Error('At least one hashtag is required');
  }
  return [hashtags[0], ...hashtags.slice(1)] as NonEmptyArray<T>;
}
