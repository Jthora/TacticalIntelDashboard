import { Feed } from '../models/Feed';
import { getTextContent, getAllTextContents, getContentWithFallback, getAuthorWithFallback, getMediaWithFallback } from '../helpers/xmlHelper';

export const parseFeedData = (xmlDoc: Document, url: string): Feed[] => {
  const feeds: Feed[] = [];
  
  // Try RSS format first
  const rssItems = xmlDoc.getElementsByTagName("item");
  if (rssItems.length > 0) {
    Array.from(rssItems).forEach((item, index) => {
      try {
        const feed: Feed = {
          id: `${url}-${index}`,
          name: getTextContent(xmlDoc.documentElement, "title", "No title"),
          url,
          title: getTextContent(item, "title", "No title"),
          link: getTextContent(item, "link", url),
          pubDate: getTextContent(item, "pubDate", new Date().toISOString()),
          description: getTextContent(item, "description", ""),
          content: getContentWithFallback(item, getTextContent(item, "description", "")),
          feedListId: '1', // This should be dynamically set based on the context
          author: getAuthorWithFallback(item, ""),
          categories: getAllTextContents(item, "category"),
          media: getMediaWithFallback(item),
        };
        feeds.push(feed);
      } catch (error) {
        console.warn(`Error parsing RSS item ${index} from ${url}:`, error);
      }
    });
  }
  
  // Try Atom format if no RSS items found
  if (feeds.length === 0) {
    const atomEntries = xmlDoc.getElementsByTagName("entry");
    Array.from(atomEntries).forEach((entry, index) => {
      try {
        const feed: Feed = {
          id: `${url}-${index}`,
          name: getTextContent(xmlDoc.documentElement, "title", "No title"),
          url,
          title: getTextContent(entry, "title", "No title"),
          link: getAtomLink(entry) || url,
          pubDate: getTextContent(entry, "published", getTextContent(entry, "updated", new Date().toISOString())),
          description: getTextContent(entry, "summary", getTextContent(entry, "content", "")),
          content: getContentWithFallback(entry, getTextContent(entry, "summary", "")),
          feedListId: '1', // This should be dynamically set based on the context
          author: getAtomAuthor(entry) || getAuthorWithFallback(entry, ""),
          categories: getAllTextContents(entry, "category"),
          media: getMediaWithFallback(entry),
        };
        feeds.push(feed);
      } catch (error) {
        console.warn(`Error parsing Atom entry ${index} from ${url}:`, error);
      }
    });
  }

  return feeds;
};

const getAtomLink = (entry: Element): string => {
  const linkElements = entry.getElementsByTagName("link");
  for (let i = 0; i < linkElements.length; i++) {
    const link = linkElements[i];
    const href = link.getAttribute("href");
    const rel = link.getAttribute("rel");
    if (href && (!rel || rel === "alternate")) {
      return href;
    }
  }
  return "";
};

const getAtomAuthor = (entry: Element): string => {
  const authorElement = entry.getElementsByTagName("author")[0];
  if (authorElement) {
    const name = getTextContent(authorElement, "name", "");
    const email = getTextContent(authorElement, "email", "");
    return name || email || "";
  }
  return "";
};

export const isValidXML = (textData: string): boolean => {
  // Quick check for XML-like content
  if (textData.includes('<?xml') || textData.includes('<rss') || textData.includes('<feed') || textData.includes('<channel')) {
    return true;
  }
  
  // Fallback to actual parsing
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textData, "application/xml");
    return xmlDoc.getElementsByTagName("parsererror").length === 0;
  } catch (error) {
    return false;
  }
};