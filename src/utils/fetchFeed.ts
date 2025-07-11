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
      return proxyUrl;
    }
    
    // If strategy is DIRECT, return original URL
    if (strategy === CORSStrategy.DIRECT) {
      return targetUrl;
    }
  } catch (error) {
    console.warn('Failed to get CORS settings, falling back to legacy configuration:', error);
  }
  
  // Fallback to legacy logic if settings are not available
  if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
    return `${LEGACY_PROXY_CONFIG.vercel}${encodeURIComponent(targetUrl)}`;
  }
  
  if (import.meta.env.DEV) {
    return `${LEGACY_PROXY_CONFIG.fallback[0]}${encodeURIComponent(targetUrl)}`;
  }
  
  return `${LEGACY_PROXY_CONFIG.fallback[0]}${encodeURIComponent(targetUrl)}`;
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
  const proxyUrl = getProxyUrl(url);
  
  try {
    // Try primary proxy (from settings or legacy)
    console.log(`Attempting to fetch via primary proxy: ${proxyUrl}`);
    const response = await fetchWithRetry(proxyUrl, options);
    
    if (response.ok) {
      return response;
    }
    
    throw new Error(`Primary proxy failed: ${response.status} ${response.statusText}`);
  } catch (primaryError) {
    console.warn(`Primary proxy failed, trying fallbacks:`, primaryError);
    
    // Get fallback proxy chain from settings
    let fallbackProxies: string[] = [];
    try {
      fallbackProxies = SettingsIntegrationService.getCORSProxyChain();
    } catch (error) {
      // Fallback to legacy proxies if settings unavailable
      fallbackProxies = LEGACY_PROXY_CONFIG.fallback.map(proxy => `${proxy}`);
    }
    
    // Try fallback proxies in sequence
    for (let i = 0; i < fallbackProxies.length; i++) {
      try {
        const fallbackProxy = fallbackProxies[i];
        const fallbackUrl = fallbackProxy === '' ? url : `${fallbackProxy}${encodeURIComponent(url)}`;
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
    const textData = await response.text();
    console.log(`Feed data fetched for URL: ${url}`, textData);

    let feeds: Feed[] = [];
    if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'))) {
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
    } else if (contentType && contentType.includes('application/json')) {
      if (!isValidJSON(textData)) {
        handleJSONParsingError(url, new Error('Invalid JSON'), textData);
        return null;
      }
      const jsonData = JSON.parse(textData);
      feeds = parseJSONFeedData(jsonData, url);
    } else if (contentType && contentType.includes('text/plain')) {
      if (!isValidTXT(textData)) {
        handleTXTParsingError(url, new Error('Invalid TXT'), textData);
        return null;
      }
      feeds = parseTXTFeedData(textData, url);
    } else if (contentType && contentType.includes('text/html')) {
      if (!isValidHTML(textData)) {
        handleHTMLParsingError(url, new Error('Invalid HTML'), textData);
        return null;
      }
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(textData, "text/html");
      feeds = parseHTMLFeedData(htmlDoc.documentElement, url, '1');
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
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
