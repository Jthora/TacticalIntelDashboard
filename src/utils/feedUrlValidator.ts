import { PRIMARY_INTELLIGENCE_SOURCES } from '../constants/ModernIntelligenceSources';

export interface FeedUrlValidationOptions {
  /**
   * Allows investigative article URLs that contain date-based patterns when true.
   * Useful when validating cached feed entries sourced from investigative outlets
   * where individual articles are expected.
   */
  allowArticlePatternsForInvestigativeHosts?: boolean;
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

export const isValidFeedURL = (
  url: string,
  { allowArticlePatternsForInvestigativeHosts = true }: FeedUrlValidationOptions = {}
): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
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
