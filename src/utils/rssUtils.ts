/**
 * RSS Feed Processing Utilities
 * Provides functions for validating, sanitizing, and parsing RSS feed data
 */

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  guid?: string;
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  items: RSSItem[];
  lastBuildDate?: string;
  language?: string;
}

/**
 * Validates an RSS feed structure
 */
export function validateRSSFeed(feed: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!feed || typeof feed !== 'object') {
    errors.push('Feed must be an object');
    return { isValid: false, errors };
  }

  if (!feed.title || typeof feed.title !== 'string' || feed.title.trim() === '') {
    errors.push('Feed title is required and must be a non-empty string');
  }

  if (!feed.link || typeof feed.link !== 'string' || !isValidUrl(feed.link)) {
    errors.push('Feed link is required and must be a valid URL');
  }

  if (!Array.isArray(feed.items)) {
    errors.push('Feed items must be an array');
  } else {
    feed.items.forEach((item: any, index: number) => {
      const itemErrors = validateRSSItem(item);
      if (!itemErrors.isValid) {
        errors.push(`Item ${index}: ${itemErrors.errors.join(', ')}`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates an individual RSS item
 */
export function validateRSSItem(item: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item || typeof item !== 'object') {
    errors.push('Item must be an object');
    return { isValid: false, errors };
  }

  if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
    errors.push('Item title is required');
  }

  if (!item.link || typeof item.link !== 'string' || !isValidUrl(item.link)) {
    errors.push('Item link is required and must be a valid URL');
  }

  if (item.description && typeof item.description !== 'string') {
    errors.push('Item description must be a string');
  }

  if (!item.pubDate || typeof item.pubDate !== 'string') {
    errors.push('Item pubDate is required and must be a string');
  } else if (!isValidDate(item.pubDate)) {
    errors.push('Item pubDate must be a valid date');
  }

  if (!item.source || typeof item.source !== 'string' || item.source.trim() === '') {
    errors.push('Item source is required');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitizes RSS feed data to prevent XSS and normalize content
 */
export function sanitizeRSSFeed(feed: RSSFeed): RSSFeed {
  return {
    ...feed,
    title: sanitizeText(feed.title),
    description: sanitizeText(feed.description || ''),
    link: sanitizeUrl(feed.link),
    items: feed.items.map(sanitizeRSSItem)
  };
}

/**
 * Sanitizes an individual RSS item
 */
export function sanitizeRSSItem(item: RSSItem): RSSItem {
  return {
    ...item,
    title: sanitizeText(item.title),
    description: sanitizeText(item.description || ''),
    link: sanitizeUrl(item.link),
    source: sanitizeText(item.source),
    pubDate: item.pubDate, // Keep original date format
    guid: item.guid ? sanitizeText(item.guid) : undefined
  };
}

/**
 * Parses and normalizes dates from RSS feeds
 */
export function parseRSSDate(dateString: string): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  // Try different date formats commonly used in RSS
  /*
  const formats = [
    // RFC 2822 format (most common in RSS)
    /^[A-Za-z]{3},?\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{1,2}:\d{2}(:\d{2})?\s*([+-]\d{4}|[A-Z]{3,4})?$/,
    // ISO 8601 format
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/,
    // Simple date format
    /^\d{4}-\d{2}-\d{2}$/
  ];
  */

  try {
    const date = new Date(dateString.trim());
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    // Invalid date string
  }

  return null;
}

/**
 * Extracts keywords from RSS item content for search/filtering
 */
export function extractKeywords(item: RSSItem): string[] {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();
  
  // Remove HTML tags, punctuation, and normalize whitespace
  const cleanText = text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Split into words and filter out common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);

  const words = cleanText.split(' ')
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 20); // Limit to first 20 keywords

  return [...new Set(words)]; // Remove duplicates
}

/**
 * Helper function to validate URLs
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to validate dates
 */
function isValidDate(dateString: string): boolean {
  return parseRSSDate(dateString) !== null;
}

/**
 * Helper function to sanitize text content
 */
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * Helper function to sanitize URLs
 */
function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
}
