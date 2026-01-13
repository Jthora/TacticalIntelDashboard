import { CORSStrategy } from '../contexts/SettingsContext';
import { Feed } from '../models/Feed';
import { isValidHTML,parseFeedData as parseHTMLFeedData, sanitizeHtmlDocument } from '../parsers/htmlParser';
import { isValidJSON,parseFeedData as parseJSONFeedData } from '../parsers/jsonParser';
import { isValidTXT,parseFeedData as parseTXTFeedData } from '../parsers/txtParser';
import { isValidXML,parseFeedData as parseXMLFeedData } from '../parsers/xmlParser';
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { FeedResults } from '../types/FeedTypes';
import { handleFetchError, handleHTMLParsingError,handleJSONParsingError, handleTXTParsingError, handleXMLParsingError } from './errorHandler';
import { convertFeedsToFeedItems } from './feedConversion';
import { LocalStorageUtil } from './LocalStorageUtil';
import { isValidFeedURL } from './feedUrlValidator';
import { loadConfigMatrix } from '../config/configMatrix';
import { logIngestEvent } from './structuredLogger';

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

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  const { ingestion } = loadConfigMatrix();
  const allowedHosts = ingestion.allowedHosts;
  const blockPrivateNetworks = ingestion.blockPrivateNetworks;
  const maxBytes = ingestion.maxContentLengthBytes;

  logIngestEvent({
    level: 'info',
    code: 'INGEST_FETCH_START',
    message: 'Starting fetch for feed',
    url,
    context: { allowedHosts, blockPrivateNetworks, maxBytes },
  });
  
  // Validate URL before processing
  if (!isValidFeedURL(url, { allowArticlePatternsForInvestigativeHosts: false, allowedHosts, blockPrivateNetworks })) {
    logIngestEvent({
      level: 'warn',
      code: 'INGEST_URL_BLOCKED',
      message: 'Feed URL blocked by policy',
      url,
      context: { allowedHosts, blockPrivateNetworks },
    });
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

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const numericLength = Number(contentLength);
      if (Number.isFinite(numericLength) && numericLength > maxBytes) {
        logIngestEvent({
          level: 'warn',
          code: 'INGEST_SIZE_HEADER_BLOCK',
          message: 'Feed content length exceeds cap (header)',
          url,
          context: { contentLength: numericLength, maxBytes },
        });
        throw new Error(`Feed content exceeds allowed size (${numericLength} > ${maxBytes} bytes)`);
      }
    }

    const contentType = response.headers.get('content-type');
    let textData = await response.text();

    const byteLength = new TextEncoder().encode(textData).length;
    if (byteLength > maxBytes) {
      logIngestEvent({
        level: 'warn',
        code: 'INGEST_SIZE_BODY_BLOCK',
        message: 'Feed content length exceeds cap (body)',
        url,
        context: { byteLength, maxBytes },
      });
      throw new Error(`Feed content exceeds allowed size after download (${byteLength} > ${maxBytes} bytes)`);
    }
    logIngestEvent({
      level: 'info',
      code: 'INGEST_FETCH_OK',
      message: 'Feed response fetched',
      url,
      context: { contentType, byteLength },
    });

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
      logIngestEvent({
        level: 'warn',
        code: 'INGEST_HTML_PAGE',
        message: 'Detected HTML page instead of feed',
        url,
      });
      
      // For individual article pages, return null instead of trying to parse
      if (!isValidFeedURL(url, { allowArticlePatternsForInvestigativeHosts: false })) {
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
      logIngestEvent({
        level: 'info',
        code: 'INGEST_PARSE_XML_OK',
        message: 'Parsed XML feed',
        url,
        context: { itemCount: feeds.length },
      });
    } else if (actualContentType && actualContentType.includes('application/json')) {
      if (!isValidJSON(textData)) {
        handleJSONParsingError(url, new Error('Invalid JSON'), textData);
        return null;
      }
      const jsonData = JSON.parse(textData);
      feeds = parseJSONFeedData(jsonData, url);
      logIngestEvent({
        level: 'info',
        code: 'INGEST_PARSE_JSON_OK',
        message: 'Parsed JSON feed',
        url,
        context: { itemCount: feeds.length },
      });
    } else if (actualContentType && actualContentType.includes('text/plain')) {
      if (!isValidTXT(textData)) {
        handleTXTParsingError(url, new Error('Invalid TXT'), textData);
        return null;
      }
      feeds = parseTXTFeedData(textData, url);
      logIngestEvent({
        level: 'info',
        code: 'INGEST_PARSE_TXT_OK',
        message: 'Parsed TXT feed',
        url,
        context: { itemCount: feeds.length },
      });
    } else if (actualContentType && actualContentType.includes('text/html')) {
      if (!isValidHTML(textData)) {
        handleHTMLParsingError(url, new Error('Invalid HTML'), textData);
        return null;
      }
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(textData, "text/html");
      const sanitized = sanitizeHtmlDocument(htmlDoc);
      feeds = parseHTMLFeedData(sanitized.documentElement, url, '1');
      logIngestEvent({
        level: 'info',
        code: 'INGEST_PARSE_HTML_OK',
        message: 'Parsed HTML feed after sanitization',
        url,
        context: { itemCount: feeds.length },
      });
    } else {
      logIngestEvent({
        level: 'warn',
        code: 'INGEST_PARSE_FALLBACK_XML',
        message: 'Unsupported content type, attempting XML fallback',
        url,
        context: { actualContentType },
      });
      // Try XML parsing as a last resort
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "application/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
          feeds = parseXMLFeedData(xmlDoc, url);
          logIngestEvent({
            level: 'info',
            code: 'INGEST_PARSE_XML_FALLBACK_OK',
            message: 'Parsed via XML fallback',
            url,
            context: { itemCount: feeds.length },
          });
        } else {
          throw new Error(`Unable to parse content as XML`);
        }
      } catch (xmlError) {
        throw new Error(`Unsupported content type: ${actualContentType} and fallback XML parsing failed`);
      }
    }

    const convertedFeedItems = convertFeedsToFeedItems(feeds);
    logIngestEvent({
      level: 'info',
      code: 'INGEST_CONVERT_OK',
      message: 'Converted feeds to feed items',
      url,
      context: { itemCount: convertedFeedItems.length },
    });

    return {
      feeds: convertedFeedItems,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      handleCORSError(url, error);
    } else {
      logIngestEvent({
        level: 'error',
        code: 'INGEST_FETCH_ERROR',
        message: (error as Error).message,
        url,
      });
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
