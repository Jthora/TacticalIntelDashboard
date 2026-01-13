import { getAllTextContents, getAttributeValue, getElementsByTagName,getTextContent, getTextContentWithFallback } from '../helpers/htmlHelper';
import { Feed } from '../models/Feed';

const dangerousSelectors = ['script', 'style', 'iframe', 'object', 'embed', 'meta[http-equiv="refresh"]', 'link[rel="preload"]', 'link[rel="prefetch"]'];

export const sanitizeHtmlDocument = (doc: Document): Document => {
  // Drop entire dangerous nodes first
  dangerousSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(node => node.remove());
  });

  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const element = walker.currentNode as Element;

    // Remove inline event handlers (onclick, onerror, etc.)
    Array.from(element.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = (attr.value || '').trim().toLowerCase();

      if (name.startsWith('on')) {
        element.removeAttribute(attr.name);
        return;
      }

      if ((name === 'src' || name === 'href' || name === 'xlink:href') && (value.startsWith('javascript:') || value.startsWith('data:text'))) {
        element.removeAttribute(attr.name);
      }
    });
  }

  return doc;
};

export const parseFeedData = (htmlDoc: Element, url: string, feedListId: string): Feed[] => {
  const items = getElementsByTagName(htmlDoc, "item");
  const feeds: Feed[] = [];

  items.forEach((item, index) => {
    try {
      const feed: Feed = {
        id: `${url}-${index}`,
        name: "HTML Feed", // This should be dynamically set based on the context
        url,
        title: getTextContent(item, "title", "No title"),
        link: getTextContent(item, "link", url),
        pubDate: getTextContent(item, "pubDate", new Date().toISOString()),
        description: getTextContent(item, "description", ""),
        content: getTextContentWithFallback(item, "content:encoded", "content", ""),
        feedListId, // Dynamically set based on the context
        author: getTextContent(item, "author", ""),
        categories: getAllTextContents(item, "category"),
        media: extractMedia(item),
      };
      feeds.push(feed);
    } catch (error) {
      console.error(`Error parsing item at index ${index}:`, error);
    }
  });

  return feeds;
};

const extractMedia = (item: Element): { url: string, type: string }[] => {
  const mediaElements = getElementsByTagName(item, "media\\:content");
  const media: { url: string, type: string }[] = [];

  mediaElements.forEach(mediaElement => {
    const url = getAttributeValue(mediaElement, "url", "");
    const type = getAttributeValue(mediaElement, "type", "unknown");
    if (url) {
      media.push({ url, type });
    }
  });

  return media;
};

export const isValidHTML = (textData: string): boolean => {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(textData, "text/html");
  return !htmlDoc.querySelector("parsererror");
};