import { FeedResults } from '../types/FeedTypes';
import { Feed } from '../models/Feed';
import { parseFeedData as parseXMLFeedData, isValidXML } from '../parsers/xmlParser';
import { parseFeedData as parseJSONFeedData, isValidJSON } from '../parsers/jsonParser';
import { parseFeedData as parseTXTFeedData, isValidTXT } from '../parsers/txtParser';
import { parseFeedData as parseHTMLFeedData, isValidHTML } from '../parsers/htmlParser';
import { convertFeedsToFeedItems } from './feedConversion';
import { LocalStorageUtil } from './LocalStorageUtil';
import { handleFetchError, handleXMLParsingError, handleJSONParsingError, handleTXTParsingError, handleHTMLParsingError } from './errorHandler';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:8081/';

const handleCORSError = (url: string, error: Error): void => {
  console.error(`CORS error fetching feed from ${url}:`, error);
  // Additional handling logic if needed
};

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  console.log(`Starting to fetch feed from URL: ${url}`);
  try {
    const proxyUrl = `${PROXY_URL}${url}`;
    const response = await fetchWithRetry(proxyUrl, {
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
    console.log(`Feed data fetched for URL: ${proxyUrl}`, textData);

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
      handleFetchError(error as Error, url);
    }
    return null;
  }
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