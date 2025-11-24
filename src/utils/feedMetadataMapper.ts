import { Feed } from '../models/Feed';
import { IntelligenceSource } from '../types/ModernAPITypes';

const REGION_KEYWORDS: Array<{ region: NonNullable<Feed['region']>; keywords: string[] }> = [
  { region: 'AMERICAS', keywords: ['america', 'americas', 'us', 'usa', 'canada', 'latam', 'brazil', 'north-america'] },
  { region: 'EUROPE', keywords: ['europe', 'eu', 'uk', 'england', 'germany', 'france', 'nato', 'esa'] },
  { region: 'ASIA_PACIFIC', keywords: ['asia', 'pacific', 'china', 'india', 'apac', 'japan', 'australia'] }
];

const CONTENT_TYPE_KEYWORDS: Array<{ type: NonNullable<Feed['contentType']>; keywords: string[] }> = [
  { type: 'ALERT', keywords: ['alert', 'warning', 'advisory', 'emergency', 'earthquake', 'weather'] },
  { type: 'THREAT', keywords: ['threat', 'security', 'cyber', 'vulnerability', 'attack'] },
  { type: 'INTEL', keywords: ['intel', 'mission', 'operation', 'defense', 'military'] },
  { type: 'NEWS', keywords: ['news', 'analysis', 'brief', 'report'] }
];

export function deriveRegion(source?: IntelligenceSource, tags: string[] = []): Feed['region'] {
  const candidates = [...(source?.tags ?? []), ...tags].map(tag => tag?.toLowerCase?.() ?? '').filter(Boolean);

  for (const { region, keywords } of REGION_KEYWORDS) {
    if (candidates.some(tag => keywords.some(keyword => tag.includes(keyword)))) {
      return region;
    }
  }

  return 'GLOBAL';
}

export function deriveContentType(category?: string, tags: string[] = [], fallback: Feed['contentType'] = 'NEWS'): Feed['contentType'] {
  const normalizedCategory = category?.toLowerCase?.();
  if (normalizedCategory) {
    const directMatch = CONTENT_TYPE_KEYWORDS.find(({ keywords }) =>
      keywords.some(keyword => normalizedCategory.includes(keyword))
    );
    if (directMatch) {
      return directMatch.type;
    }
  }

  const candidates = tags.map(tag => tag?.toLowerCase?.() ?? '').filter(Boolean);
  for (const { type, keywords } of CONTENT_TYPE_KEYWORDS) {
    if (candidates.some(tag => keywords.some(keyword => tag.includes(keyword)))) {
      return type;
    }
  }

  return fallback;
}

export function deriveClassification(verificationStatus?: Feed['verificationStatus']): Feed['classification'] {
  switch (verificationStatus) {
    case 'OFFICIAL':
      return 'TOP_SECRET';
    case 'VERIFIED':
      return 'SECRET';
    case 'UNVERIFIED':
    default:
      return 'UNCLASSIFIED';
  }
}

export function normalizeTimestamp(pubDate?: string): string {
  if (!pubDate) {
    return new Date().toISOString();
  }

  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}
