import { CORSStrategy } from '../contexts/SettingsContext';
import { Feed } from '../models/Feed';
import { isValidHTML,parseFeedData as parseHTMLFeedData } from '../parsers/htmlParser';
import { isValidJSON,parseFeedData as parseJSONFeedData } from '../parsers/jsonParser';
import { isValidTXT,parseFeedData as parseTXTFeedData } from '../parsers/txtParser';
import { isValidXML,parseFeedData as parseXMLFeedData } from '../parsers/xmlParser';
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { FeedResults } from '../types/FeedTypes';
import { handleFetchError, handleHTMLParsingError,handleJSONParsingError, handleTXTParsingError, handleXMLParsingError } from './errorHandler';
import { convertFeedsToFeedItems } from './feedConversion';
import { LocalStorageUtil } from './LocalStorageUtil';

// Get proxy URL using user's CORS settings
const getProxyUrl = (targetUrl: string): string => {
  // Get CORS strategy from user settings
  try {
    const strategy = SettingsIntegrationService.getCORSStrategy();
    const proxyUrl = SettingsIntegrationService.getProxyUrl(targetUrl);
    
    // If settings provide a specific proxy URL, use it
    if (proxyUrl !== targetUrl) {
      console.log(`Using configured proxy: ${proxyUrl}`);
      return proxyUrl;
    }
    
    // If strategy is DIRECT, use the working CORS proxy
    if (strategy === CORSStrategy.DIRECT) {
      const workingProxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
      console.log(`Using working CORS proxy: ${workingProxy}`);
      return workingProxy;
    }
  } catch (error) {
    console.warn('Failed to get CORS settings, falling back to working proxy:', error);
  }
  
  // Fallback to working proxy
  return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
};

const handleCORSError = (url: string, error: Error): void => {
  console.error(`CORS error fetching feed from ${url}:`, error);
  // Additional handling logic if needed
};

const fetchWithRetry = async (url: string, _options: RequestInit, retries = 3, backoff = 300): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use simple fetch options to avoid preflight requests
      const simpleOptions: RequestInit = {
        method: 'GET',
        mode: 'cors',
        // Remove headers that trigger preflight requests
        // Only use simple headers that don't require preflight
      };
      
      const response = await fetch(url, simpleOptions);
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
  const proxyUrl = getProxyUrl(url);
  
  try {
    // Try primary proxy (from settings or working proxy)
    console.log(`Attempting to fetch via primary proxy: ${proxyUrl}`);
    const response = await fetchWithRetry(proxyUrl, options);
    
    if (response.ok) {
      console.log(`Primary proxy succeeded`);
      return response;
    }
    
    throw new Error(`Primary proxy failed: ${response.status} ${response.statusText}`);
  } catch (primaryError) {
    console.warn(`Primary proxy failed, trying fallbacks:`, primaryError);
    
    // Get fallback proxy chain from settings
    let fallbackProxies: string[] = [];
    try {
      fallbackProxies = SettingsIntegrationService.getCORSProxyChain();
      console.log(`Got fallback proxies:`, fallbackProxies);
    } catch (error) {
      // Fallback to known working proxy if settings unavailable
      fallbackProxies = [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?'
      ];
      console.log(`Using hardcoded fallback proxies:`, fallbackProxies);
    }
    
    // Try fallback proxies in sequence
    for (let i = 0; i < fallbackProxies.length; i++) {
      try {
        const fallbackProxy = fallbackProxies[i];
        let fallbackUrl: string;
        
        if (fallbackProxy === '') {
          // Direct fetch
          fallbackUrl = url;
        } else if (fallbackProxy.includes('?rss_url=')) {
          // RSS2JSON format
          fallbackUrl = `${fallbackProxy}${encodeURIComponent(url)}`;
        } else {
          // Standard CORS proxy format
          fallbackUrl = `${fallbackProxy}${encodeURIComponent(url)}`;
        }
        
        console.log(`Attempting fallback proxy ${i + 1}: ${fallbackUrl}`);
        
        const response = await fetchWithRetry(fallbackUrl, {
          ...options,
          headers: {
            ...options.headers,
            'X-Requested-With': 'XMLHttpRequest', // Some proxies require this
          }
        });
        
        if (response.ok) {
          console.log(`Fallback proxy ${i + 1} succeeded`);
          return response;
        }
      } catch (fallbackError) {
        console.warn(`Fallback proxy ${i + 1} failed:`, fallbackError);
        continue;
      }
    }
    
    // All proxies failed
    throw new Error(`All proxy attempts failed for URL: ${url}`);
  }
};

// URL validation function to ensure we only process legitimate feed URLs
const isValidFeedURL = (url: string): boolean => {
  // Check for common feed indicators
  const feedIndicators = [
    '/rss', '/feed', '.xml', '/atom', 
    'rss.xml', 'feeds/', '/rss.php'
  ];
  
  // Check for article-specific patterns that should NOT be processed as feeds
  const articlePatterns = [
    '/2025/', '/2024/', '/2023/', '/article/',
    '/story/', '/news/2025', '/news/2024',
    '/post/', '/item/', 'article_'
  ];
  
  const hasArticlePattern = articlePatterns.some(pattern => url.includes(pattern));
  const hasFeedIndicator = feedIndicators.some(indicator => url.includes(indicator));
  
  // URL is valid if it has feed indicators OR does not have article patterns
  // But prioritize feed indicators
  if (hasFeedIndicator) {
    return true;
  }
  
  if (hasArticlePattern) {
    console.warn(`🚫 Skipping article URL (not a feed): ${url}`);
    return false;
  }
  
  return true;
};

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  console.log(`Starting to fetch feed from URL: ${url}`);
  
  // Validate URL before processing
  if (!isValidFeedURL(url)) {
    console.error(`Invalid feed URL detected: ${url}`);
    return null;
  }
  
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
    let textData = await response.text();
    console.log(`Feed data fetched for URL: ${url}`, textData.substring(0, 200));

    // Handle different proxy response formats
    if (contentType && contentType.includes('application/json')) {
      try {
        const jsonResponse = JSON.parse(textData);
        // Handle allorigins response format
        if (jsonResponse.contents) {
          textData = jsonResponse.contents;
          console.log(`Extracted content from allorigins response`);
        }
        // Handle other JSON proxy formats
        else if (typeof jsonResponse === 'object' && jsonResponse.data) {
          textData = jsonResponse.data;
          console.log(`Extracted data from JSON proxy response`);
        }
      } catch (e) {
        console.warn(`Failed to parse JSON response, treating as plain text`);
      }
    }

    let feeds: Feed[] = [];
    
    // Determine content type from the actual content if not provided correctly by proxy
    let actualContentType = contentType;
    if (textData.trim().startsWith('<?xml') || textData.includes('<rss') || textData.includes('<feed')) {
      actualContentType = 'application/xml';
    } else if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
      actualContentType = 'application/json';
    } else if (textData.includes('<!DOCTYPE') || textData.includes('<html') || textData.includes('<head>')) {
      actualContentType = 'text/html';
      console.warn(`⚠️ Detected HTML content from URL: ${url} - This appears to be a webpage, not a feed`);
      
      // For individual article pages, return null instead of trying to parse
      if (!isValidFeedURL(url)) {
        console.error(`🚫 Refusing to parse HTML content from article URL: ${url}`);
        return null;
      }
    }
    
    if (actualContentType && (actualContentType.includes('application/xml') || actualContentType.includes('text/xml') || textData.includes('<rss') || textData.includes('<feed'))) {
      if (!isValidXML(textData)) {
        handleXMLParsingError(url, new Error('Invalid XML'), textData);
        return null;
      }
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textData, "application/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        handleXMLParsingError(url, new Error('Parser error'), textData);
        return null;
      }
      feeds = parseXMLFeedData(xmlDoc, url);
      console.log(`Parsed ${feeds.length} feeds from XML`);
    } else if (actualContentType && actualContentType.includes('application/json')) {
      if (!isValidJSON(textData)) {
        handleJSONParsingError(url, new Error('Invalid JSON'), textData);
        return null;
      }
      const jsonData = JSON.parse(textData);
      feeds = parseJSONFeedData(jsonData, url);
      console.log(`Parsed ${feeds.length} feeds from JSON`);
    } else if (actualContentType && actualContentType.includes('text/plain')) {
      if (!isValidTXT(textData)) {
        handleTXTParsingError(url, new Error('Invalid TXT'), textData);
        return null;
      }
      feeds = parseTXTFeedData(textData, url);
      console.log(`Parsed ${feeds.length} feeds from TXT`);
    } else if (actualContentType && actualContentType.includes('text/html')) {
      if (!isValidHTML(textData)) {
        handleHTMLParsingError(url, new Error('Invalid HTML'), textData);
        return null;
      }
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(textData, "text/html");
      feeds = parseHTMLFeedData(htmlDoc.documentElement, url, '1');
      console.log(`Parsed ${feeds.length} feeds from HTML`);
    } else {
      console.error(`Unsupported content type: ${actualContentType}, attempting XML parsing as fallback`);
      // Try XML parsing as a last resort
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "application/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
          feeds = parseXMLFeedData(xmlDoc, url);
          console.log(`Fallback XML parsing succeeded, parsed ${feeds.length} feeds`);
        } else {
          throw new Error(`Unable to parse content as XML`);
        }
      } catch (xmlError) {
        throw new Error(`Unsupported content type: ${actualContentType} and fallback XML parsing failed`);
      }
    }

    const convertedFeedItems = convertFeedsToFeedItems(feeds);
    console.log(`Converted to ${convertedFeedItems.length} feed items`);

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
    return null;
  }
};

// Additional functionality for robustness

const cacheFeedData = (url: string, data: FeedResults): void => {
  try {
    LocalStorageUtil.setItem(url, data);
    console.log(`Feed data cached for URL: ${url}`);
  } catch (error) {
    console.error(`Error caching feed data for URL: ${url}`, error);
  }
};

const getCachedFeedData = (url: string): FeedResults | null => {
  try {
    const cachedData = LocalStorageUtil.getItem<FeedResults>(url);
    return cachedData ?? null;
  } catch (error) {
    console.error(`Error retrieving cached feed data for URL: ${url}`, error);
    return null;
  }
};

export { cacheFeedData, getCachedFeedData };
