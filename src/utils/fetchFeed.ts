import { FeedResults } from '../types/FeedTypes';
import { Feed } from '../models/Feed';
import { parseFeedData as parseXMLFeedData, isValidXML } from '../parsers/xmlParser';
import { parseFeedData as parseJSONFeedData, isValidJSON } from '../parsers/jsonParser';
import { parseFeedData as parseTXTFeedData, isValidTXT } from '../parsers/txtParser';
import { parseFeedData as parseHTMLFeedData, isValidHTML } from '../parsers/htmlParser';
import { convertFeedsToFeedItems } from './feedConversion';
import { LocalStorageUtil } from './LocalStorageUtil';
import { handleFetchError, handleXMLParsingError, handleJSONParsingError, handleTXTParsingError, handleHTMLParsingError } from './errorHandler';
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { CORSStrategy } from '../contexts/SettingsContext';

// Legacy configuration for backward compatibility
const LEGACY_PROXY_CONFIG = {
  vercel: '/api/proxy-feed?url=',
  fallback: [
    'https://api.allorigins.win/get?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/',
  ],
  local: import.meta.env.VITE_PROXY_URL || 'http://localhost:8081/',
};

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

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> => {
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

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  console.log(`Starting to fetch feed from URL: ${url}`);
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
    if (cachedData) {
      console.log(`Cached feed data found for URL: ${url}`);
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
