import { Feed } from '../types/FeedTypes';
import { FeedResults } from '../models/FeedResults';

export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  console.log(`Starting to fetch feed from URL: ${url}`);
  try {
    const response = await fetch(`http://localhost:8081/${url}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    const textData = await response.text();
    console.log(`Feed data fetched for URL: ${url}`, textData);

    // Check if the fetched data is valid XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textData, "application/xml");
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      console.warn(`Invalid XML data fetched for URL: ${url}`);
      return null;
    }

    const feedData = parseFeedData(xmlDoc, url);
    return {
      feeds: [feedData],
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching feed:', error);
    return null;
  }
};

const parseFeedData = (xmlDoc: Document, url: string): Feed => {
  return {
    id: url,
    name: getTextContent(xmlDoc, "title", "No title"),
    url,
    title: getTextContent(xmlDoc, "title", "No title"),
    link: getTextContent(xmlDoc, "link", url),
    pubDate: getTextContent(xmlDoc, "pubDate", new Date().toISOString()),
    description: getTextContent(xmlDoc, "description", "No description"),
    content: getTextContent(xmlDoc, "content", "No content"),
    feedListId: '1',
  };
};

const getTextContent = (xmlDoc: Document, tagName: string, defaultValue: string): string => {
  return xmlDoc.querySelector(tagName)?.textContent || defaultValue;
};