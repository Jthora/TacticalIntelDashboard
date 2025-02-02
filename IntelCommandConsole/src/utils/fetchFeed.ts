import { FeedResults } from '../types/FeedTypes';
import { parseFeedData, isValidXML } from './xmlParsing';
import { convertFeedItems } from './feedConversion';
import { LocalStorageUtil } from './LocalStorageUtil';
import { handleFetchError, handleXMLParsingError } from './errorHandler';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:8081/';

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  console.log(`Starting to fetch feed from URL: ${url}`);
  try {
    const response = await fetchWithRetry(`${PROXY_URL}${url}`, {
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
    if (!contentType || (!contentType.includes('application/xml') && !contentType.includes('text/xml'))) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const textData = await response.text();
    console.log(`Feed data fetched for URL: ${url}`, textData);

    // Check if the fetched data is valid XML
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

    const feedItems = parseFeedData(xmlDoc, url);
    const convertedFeedItems = convertFeedItems(feedItems, url);

    return {
      feeds: convertedFeedItems,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFetchError(error as Error, url);
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
      handleFetchError(error as Error, url);
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