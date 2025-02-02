import { Feed } from '../models/Feed';
import { getTextContent, getAttributeValue, getAllTextContents, getTextContentWithFallback } from '../helpers/xmlHelper';

export const parseFeedData = (xmlDoc: Document, url: string): Feed[] => {
  const items = xmlDoc.getElementsByTagName("item");
  const feeds: Feed[] = [];

  Array.from(items).forEach((item, index) => {
    const feed: Feed = {
      id: `${url}-${index}`,
      name: getTextContent(xmlDoc.documentElement, "title", "No title"),
      url,
      title: getTextContent(item, "title", "No title"),
      link: getTextContent(item, "link", url),
      pubDate: getTextContent(item, "pubDate", new Date().toISOString()),
      description: getTextContent(item, "description", ""),
      content: getTextContentWithFallback(item, "content:encoded", "content", ""),
      feedListId: '1', // This should be dynamically set based on the context
      author: getTextContent(item, "author", ""),
      categories: getAllTextContents(item, "category"),
      media: extractMedia(item),
    };
    feeds.push(feed);
  });

  return feeds;
};

const extractMedia = (item: Element): { url: string, type: string }[] => {
  const mediaElements = item.getElementsByTagName("media:content");
  const media: { url: string, type: string }[] = [];

  Array.from(mediaElements).forEach(mediaElement => {
    const url = getAttributeValue(mediaElement, "media:content", "url", "");
    const type = getAttributeValue(mediaElement, "media:content", "type", "unknown");
    if (url) {
      media.push({ url, type });
    }
  });

  return media;
};

export const isValidXML = (textData: string): boolean => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(textData, "application/xml");
  return xmlDoc.getElementsByTagName("parsererror").length === 0;
};