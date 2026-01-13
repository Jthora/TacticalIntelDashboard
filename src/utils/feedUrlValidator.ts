import { PRIMARY_INTELLIGENCE_SOURCES } from '../constants/ModernIntelligenceSources';

export interface FeedUrlValidationOptions {
  /**
   * Allows investigative article URLs that contain date-based patterns when true.
   * Useful when validating cached feed entries sourced from investigative outlets
   * where individual articles are expected.
   */
  allowArticlePatternsForInvestigativeHosts?: boolean;
  /**
   * Optional list of normalized hostnames that are allowed. When provided, any
   * URL whose hostname (minus www) is not in the list will be rejected.
   */
  allowedHosts?: string[];
  /**
   * When true, rejects hostnames that resolve to private network shortcuts
   * (localhost, 127.x, 10.x, 192.168.x, 172.16-31.x).
   */
  blockPrivateNetworks?: boolean;
}

const FEED_INDICATORS = [
  '/rss',
  '/feed',
  '.xml',
  '/atom',
  'rss.xml',
  'feeds/',
  '/rss.php'
];

const ARTICLE_PATTERNS = [
  '/2025/',
  '/2024/',
  '/2023/',
  '/article/',
  '/story/',
  '/news/2025',
  '/news/2024',
  '/post/',
  '/item/',
  'article_'
];

const INVESTIGATIVE_ARTICLE_HOSTNAMES: Set<string> = new Set(
  PRIMARY_INTELLIGENCE_SOURCES
    .map(source => source.homepage)
    .filter((homepage): homepage is string => Boolean(homepage))
    .map(homepage => extractNormalizedHostname(homepage))
    .filter((hostname): hostname is string => Boolean(hostname))
);

function extractNormalizedHostname(input: string): string | null {
  try {
    const { hostname } = new URL(input);
    return hostname.replace(/^www\./i, '').toLowerCase();
  } catch (error) {
    return null;
  }
}

function hasFeedIndicator(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return FEED_INDICATORS.some(indicator => lowerUrl.includes(indicator));
}

function hasArticlePattern(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return ARTICLE_PATTERNS.some(pattern => lowerUrl.includes(pattern));
}

function isInvestigativeArticleHost(url: string): boolean {
  const hostname = extractNormalizedHostname(url);
  return Boolean(hostname && INVESTIGATIVE_ARTICLE_HOSTNAMES.has(hostname));
}

function isPrivateOrLoopback(hostname: string | null): boolean {
  if (!hostname) return true;
  if (hostname === 'localhost') return true;
  if (hostname.startsWith('127.')) return true;
  if (hostname.startsWith('10.')) return true;
  if (hostname.startsWith('192.168.')) return true;
  const octets = hostname.split('.');
  if (octets.length >= 2) {
    const first = Number(octets[0]);
    const second = Number(octets[1]);
    if (first === 172 && second >= 16 && second <= 31) return true;
  }
  return false;
}

export const isValidFeedURL = (
  url: string,
  {
    allowArticlePatternsForInvestigativeHosts = true,
    allowedHosts,
    blockPrivateNetworks = true
  }: FeedUrlValidationOptions = {}
): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const hostname = extractNormalizedHostname(url);

  if (blockPrivateNetworks && isPrivateOrLoopback(hostname)) {
    return false;
  }

  if (allowedHosts && allowedHosts.length > 0) {
    if (!hostname || !allowedHosts.map(h => h.toLowerCase()).includes(hostname)) {
      return false;
    }
  }

  if (hasFeedIndicator(url)) {
    return true;
  }

  if (hasArticlePattern(url)) {
    if (allowArticlePatternsForInvestigativeHosts && isInvestigativeArticleHost(url)) {
      return true;
    }
    return false;
  }

  return true;
};

export const investigativeArticleHostnames = (): string[] =>
  Array.from(INVESTIGATIVE_ARTICLE_HOSTNAMES);
