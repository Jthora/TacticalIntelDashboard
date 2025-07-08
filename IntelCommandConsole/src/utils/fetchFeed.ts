import { FeedResults } from '../types/FeedTypes';
import { log } from '../utils/LoggerService';
import { Feed } from '../models/Feed';
import { parseFeedData as parseXMLFeedData, isValidXML } from '../parsers/xmlParser';
import { parseFeedData as parseJSONFeedData, isValidJSON } from '../parsers/jsonParser';
import { parseFeedData as parseTXTFeedData, isValidTXT } from '../parsers/txtParser';
import { parseFeedData as parseHTMLFeedData, isValidHTML } from '../parsers/htmlParser';
import { convertFeedsToFeedItems } from './feedConversion';
import { LocalStorageUtil } from './LocalStorageUtil';
import { handleFetchError } from './errorHandler';
import { createMockFeedResults } from './mockData';
import { RSS2JSONService } from '../services/RSS2JSONService';

// Configuration for different proxy strategies
const PROXY_CONFIG = {
  // Vercel Edge Function (Production)
  vercel: '/api/proxy-feed?url=',
  // Public CORS proxies with different APIs (ordered by reliability)
  fallback: [
    'https://api.codetabs.com/v1/proxy?quest=',        // Fast and reliable
    'https://cors-anywhere.herokuapp.com/',            // Established proxy
    'https://api.allorigins.win/get?url=',             // Sometimes slow but works
    'https://thingproxy.freeboard.io/fetch/',          // Alternative proxy
  ],
  // For development, try direct fetch first, then fallbacks
  local: '',
};

// Determine which proxy strategy to use
const getProxyUrl = (targetUrl: string, proxyIndex = 0): string => {
  // In production/Vercel environment, use the edge function
  if (import.meta.env.PROD && window.location.hostname.includes('vercel.app')) {
    return `${PROXY_CONFIG.vercel}${encodeURIComponent(targetUrl)}`;
  }
  
  // In development, try different proxies
  if (proxyIndex < PROXY_CONFIG.fallback.length) {
    return `${PROXY_CONFIG.fallback[proxyIndex]}${encodeURIComponent(targetUrl)}`;
  }
  
  // If all proxies exhausted, return direct URL (will likely fail due to CORS)
  return targetUrl;
};

const handleCORSError = (url: string, error: Error): void => {
  console.error(`CORS error fetching feed from ${url}:`, error);
  // Additional handling logic if needed
};

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      console.warn(`Attempt ${attempt} failed: ${response.statusText}`);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        handleCORSError(url, error);
      } else {
        handleFetchError(error as Error, url);
      }
    }
    await new Promise(resolve => setTimeout(resolve, backoff * attempt));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
};

const fetchWithFallback = async (url: string, options: RequestInit): Promise<Response> => {
  // In production, try the Vercel edge function first
  if (import.meta.env.PROD && window.location.hostname.includes('vercel.app')) {
    try {
      const proxyUrl = getProxyUrl(url);
      log.debug("Component", `Attempting Vercel proxy: ${proxyUrl}`);
      const response = await fetchWithRetry(proxyUrl, options);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Vercel proxy failed:`, error);
    }
  }
  
  // Try different proxy services one by one
  for (let i = 0; i < PROXY_CONFIG.fallback.length; i++) {
    try {
      const proxyUrl = getProxyUrl(url, i);
      log.debug("Component", `Attempting proxy ${i + 1}: ${proxyUrl}`);
      
      const proxyOptions = {
        ...options,
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml, application/atom+xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
        },
        signal: AbortSignal.timeout(8000) // 8 second timeout for proxies
      };
      
      const response = await fetch(proxyUrl, proxyOptions);
      
      if (response.ok) {
        log.debug("Component", `Proxy ${i + 1} succeeded`);
        return response;
      } else {
        console.warn(`Proxy ${i + 1} returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`Proxy ${i + 1} failed:`, error);
      continue;
    }
  }
  
  // If all proxies fail, try direct fetch (will likely fail due to CORS but worth trying)
  try {
    log.debug("Component", `Attempting direct fetch: ${url}`);
    const response = await fetch(url, {
      ...options,
      mode: 'no-cors', // This won't give us the content but won't throw CORS error
    });
    
    if (response.ok || response.type === 'opaque') {
      return response;
    }
  } catch (error) {
    console.warn(`Direct fetch failed:`, error);
  }
  
  throw new Error(`All proxy attempts failed for URL: ${url}`);
};

// Function to handle proxy responses that might wrap the content
const extractContentFromProxyResponse = (textData: string, proxyUrl: string): { content: string, contentType: string } => {
  // Check if this is an allorigins response
  if (proxyUrl.includes('allorigins.win') || proxyUrl.includes('api.allorigins.win')) {
    try {
      const jsonResponse = JSON.parse(textData);
      if (jsonResponse.contents) {
        return {
          content: jsonResponse.contents,
          contentType: 'application/xml' // allorigins typically returns XML feeds
        };
      }
    } catch (error) {
      console.warn('Failed to parse allorigins response as JSON, treating as raw content');
    }
  }
  
  // Check if this is a codetabs response that might be redirected
  if (proxyUrl.includes('codetabs.com') && textData.includes('Moved Permanently')) {
    throw new Error('Codetabs proxy returned redirect - feed likely not accessible');
  }
  
  // Check if content is base64 encoded (common with some proxies)
  if (textData.startsWith('data:application/') && textData.includes('base64,')) {
    try {
      const base64Data = textData.split('base64,')[1];
      const decodedContent = atob(base64Data);
      const contentType = textData.split(';')[0].replace('data:', '');
      return {
        content: decodedContent,
        contentType: contentType
      };
    } catch (error) {
      console.warn('Failed to decode base64 content:', error);
    }
  }
  
  // For other proxies, return the raw content
  return {
    content: textData,
    contentType: 'application/xml'
  };
};

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  log.debug("Component", `Starting to fetch feed from URL: ${url}`);
  
  // 🚀 PROXY-FREE SOLUTION: Try RSS2JSON APIs first, but with better error handling
  log.debug("Component", `Attempting proxy-free RSS2JSON fetch for: ${url}`);
  try {
    const feeds = await RSS2JSONService.fetchFeed(url);
    
    if (feeds && feeds.length > 0) {
      log.debug("Component", `✅ Successfully fetched ${feeds.length} items using RSS2JSON`);
      
      const feedItems = convertFeedsToFeedItems(feeds);
      const feedResults: FeedResults = {
        feeds: feedItems,
        fetchedAt: new Date().toISOString()
      };
      
      // Cache the successful result
      LocalStorageUtil.setItem(`feed_${url}`, feedResults);
      
      return feedResults;
    }
  } catch (rss2jsonError) {
    log.debug("Component", `❌ RSS2JSON failed for ${url}:`, rss2jsonError);
    // Continue to fallback methods instead of failing immediately
    // Continue to fallback methods
  }
  
  // 🔄 FALLBACK: Try traditional proxy method
  log.debug("Component", `Falling back to proxy method for: ${url}`);
  try {
    const response = await fetchWithFallback(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const rawTextData = await response.text();
    
    // Extract content from proxy response if needed
    const { content: textData, contentType: detectedContentType } = extractContentFromProxyResponse(rawTextData, response.url);
    const finalContentType = contentType || detectedContentType;
    
    // Enhanced content validation before parsing
    if (!textData || textData.trim().length === 0) {
      console.warn(`Empty content received from ${url}`);
      throw new Error('Empty content received from proxy');
    }
    
    // Check for common error responses
    if (textData.includes('Too Many Requests') || 
        textData.includes('Rate Limited') ||
        textData.includes('429') ||
        textData.includes('403 Forbidden')) {
      console.warn(`Rate limited or forbidden response for ${url}`);
      throw new Error('Feed access blocked - rate limited or forbidden');
    }
    
    // Check for HTML error pages (instead of RSS/XML)
    if (textData.trim().startsWith('<!doctype html>') || 
        textData.trim().startsWith('<html>') ||
        textData.includes('<title>Too Many Requests</title>')) {
      console.warn(`HTML error page received instead of RSS for ${url}`);
      throw new Error('Received HTML error page instead of RSS feed');
    }
    
    log.debug("Component", `Feed data fetched for URL: ${url}`, textData.substring(0, 500) + '...');

    let feeds: Feed[] = [];
    
    // Try to detect the actual content format by examining the content itself
    // Many RSS feeds have incorrect content-type headers, so we'll use content-based detection
    
    // First, try XML parsing if content looks like XML or has XML content-type
    if (isValidXML(textData) || 
        (finalContentType && (finalContentType.includes('application/xml') || 
                        finalContentType.includes('text/xml') || 
                        finalContentType.includes('application/rss+xml') ||
                        finalContentType.includes('application/atom+xml')))) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "application/xml");
        
        // Check for XML parsing errors
        const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
        if (parserError) {
          throw new Error(`XML parsing error: ${parserError.textContent}`);
        }
        
        // Additional validation - check for RSS/Atom structure
        const hasRssStructure = xmlDoc.getElementsByTagName("rss").length > 0 || 
                               xmlDoc.getElementsByTagName("channel").length > 0 || 
                               xmlDoc.getElementsByTagName("item").length > 0;
        const hasAtomStructure = xmlDoc.getElementsByTagName("feed").length > 0 || 
                                xmlDoc.getElementsByTagName("entry").length > 0;
        
        if (!hasRssStructure && !hasAtomStructure) {
          throw new Error('No valid RSS or Atom structure found in XML');
        }
        
        feeds = parseXMLFeedData(xmlDoc, url);
        if (feeds.length === 0) {
          throw new Error('No feed items found in XML');
        }
      } catch (xmlError) {
        console.warn(`XML parsing failed for ${url}:`, xmlError);
        // Don't return here, let it try other formats
      }
    }
    
    // If XML parsing failed or no feeds found, try JSON
    if (feeds.length === 0 && (isValidJSON(textData) || 
        (finalContentType && finalContentType.includes('application/json')))) {
      try {
        const jsonData = JSON.parse(textData);
        feeds = parseJSONFeedData(jsonData, url);
      } catch (jsonError) {
        console.warn(`JSON parsing failed for ${url}:`, jsonError);
      }
    }
    
    // If still no feeds, try HTML parsing
    if (feeds.length === 0 && (isValidHTML(textData) || 
        (finalContentType && finalContentType.includes('text/html')))) {
      try {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(textData, "text/html");
        feeds = parseHTMLFeedData(htmlDoc.documentElement, url, '1');
      } catch (htmlError) {
        console.warn(`HTML parsing failed for ${url}:`, htmlError);
      }
    }
    
    // If still no feeds, try TXT parsing
    if (feeds.length === 0 && (isValidTXT(textData) || 
        (finalContentType && finalContentType.includes('text/plain')))) {
      try {
        feeds = parseTXTFeedData(textData, url);
      } catch (txtError) {
        console.warn(`TXT parsing failed for ${url}:`, txtError);
      }
    }
    
    // If we still have no feeds, log the issue but don't throw an error
    if (feeds.length === 0) {
      console.warn(`No feeds parsed from ${url}. Content-Type: ${finalContentType}. Content preview: ${textData.substring(0, 200)}...`);
      // Return empty result instead of throwing error
      return {
        feeds: [],
        fetchedAt: new Date().toISOString(),
      };
    }

    const convertedFeedItems = convertFeedsToFeedItems(feeds);

    return {
      feeds: convertedFeedItems,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      handleCORSError(url, error);
    } else {
      console.error('Error fetching feed:', error);
      handleFetchError(error as Error, url);
    }
    
    // 🎯 FINAL FALLBACK: Use mock data in development
    if (import.meta.env.DEV) {
      console.warn(`🔄 All feed fetching methods failed for ${url}. Using mock data for development.`);
      return createMockFeedResults(url);
    }
    
    return null;
  }
};

// Additional functionality for robustness

const cacheFeedData = (url: string, data: FeedResults): void => {
  try {
    LocalStorageUtil.setItem(url, data);
    log.debug("Component", `Feed data cached for URL: ${url}`);
  } catch (error) {
    console.error(`Error caching feed data for URL: ${url}`, error);
  }
};

const getCachedFeedData = (url: string): FeedResults | null => {
  try {
    const cachedData = LocalStorageUtil.getItem<FeedResults>(url);
    if (cachedData) {
      log.debug("Component", `Cached feed data found for URL: ${url}`);
      return cachedData;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving cached feed data for URL: ${url}`, error);
    return null;
  }
};

const validateFeedData = (data: FeedResults): boolean => {
  // Add validation logic for feed data
  if (!data || !data.feeds || !Array.isArray(data.feeds)) {
    console.warn('Invalid feed data structure');
    return false;
  }
  return true;
};

export const fetchFeedWithCache = async (url: string): Promise<FeedResults | null> => {
  const cachedData = getCachedFeedData(url);
  if (cachedData && validateFeedData(cachedData)) {
    return cachedData;
  }

  const fetchedData = await fetchFeed(url);
  if (fetchedData) {
    cacheFeedData(url, fetchedData);
  }
  return fetchedData;
};
