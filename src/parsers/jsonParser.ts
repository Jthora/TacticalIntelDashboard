import { Feed } from '../models/Feed';
import { getJsonValue, getJsonArray } from '../helpers/jsonHelper';

export const parseFeedData = (jsonData: Record<string, unknown>, url: string): Feed[] => {
  const items = getJsonArray(jsonData, "items") as Record<string, unknown>[];
  const feeds: Feed[] = [];

  items.forEach((item: Record<string, unknown>, index: number) => {
    const feed: Feed = {
      id: `${url}-${index}`,
      name: "JSON Feed", // This should be dynamically set based on the context
      url,
      title: getJsonValue(item, "title", "No title") as string,
      link: getJsonValue(item, "link", url) as string,
      pubDate: new Date(getJsonValue(item, "pubDate", new Date().toISOString()) as string).toISOString(),
      description: getJsonValue(item, "description", "") as string,
      content: getJsonValue(item, "content", "") as string,
      feedListId: '1', // This should be dynamically set based on the context
      author: getJsonValue(item, "author", "") as string,
      categories: getJsonArray(item, "categories") as string[],
      media: getJsonArray(item, "media").map((mediaItem: unknown) => ({
        url: getJsonValue(mediaItem as Record<string, unknown>, "url", "") as string,
        type: getJsonValue(mediaItem as Record<string, unknown>, "type", "") as string,
      })) as { url: string; type: string }[],
    };
    feeds.push(feed);
  });

  return feeds;
};

export const isValidJSON = (textData: string): boolean => {
  // Quick check to avoid parsing JavaScript code as JSON
  if (textData.includes('export ') || 
      textData.includes('function ') || 
      textData.includes('import ') ||
      textData.includes('const ') ||
      !textData.trim().startsWith('{') && !textData.trim().startsWith('[')) {
    return false;
  }
  
  try {
    JSON.parse(textData);
    return true;
  } catch (error) {
    // Don't log every JSON parsing error as it's expected for non-JSON content
    return false;
  }
};