import { Feed } from '../models/Feed';
import { parseTxtContent } from '../helpers/txtHelper';

export const parseFeedData = (txtData: string, url: string): Feed[] => {
  const items = parseTxtContent(txtData);
  const feeds: Feed[] = [];

  items.forEach((item, index) => {
    // Safe date parsing
    let pubDate: string;
    try {
      if (item.pubDate) {
        const date = new Date(item.pubDate);
        pubDate = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
      } else {
        pubDate = new Date().toISOString();
      }
    } catch (error) {
      console.warn('Date parsing error for TXT feed item:', error);
      pubDate = new Date().toISOString();
    }

    const feed: Feed = {
      id: `${url}-${index}`,
      name: "TXT Feed", // This should be dynamically set based on the context
      url,
      title: item.title || "No title",
      link: item.link || url,
      pubDate,
      description: item.description || "",
      content: item.content || "",
      feedListId: '1', // This should be dynamically set based on the context
      author: item.author || "",
      categories: item.categories || [],
      media: item.media || [],
    };
    feeds.push(feed);
  });

  return feeds;
};

export const isValidTXT = (textData: string): boolean => {
  // Don't try to parse JavaScript, HTML, or XML as text feeds
  if (textData.includes('export ') || 
      textData.includes('function ') || 
      textData.includes('</') || 
      textData.includes('<?xml') ||
      textData.includes('<rss') ||
      textData.includes('<feed') ||
      textData.includes('<html')) {
    return false;
  }
  
  return textData.trim().length > 0;
};