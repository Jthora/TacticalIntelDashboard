import { Feed } from '../models/Feed';
import { parseTxtContent } from '../helpers/txtHelper';

export const parseFeedData = (txtData: string, url: string): Feed[] => {
  const items = parseTxtContent(txtData);
  const feeds: Feed[] = [];

  items.forEach((item, index) => {
    const feed: Feed = {
      id: `${url}-${index}`,
      name: "TXT Feed", // This should be dynamically set based on the context
      url,
      title: item.title || "No title",
      link: item.link || url,
      pubDate: new Date(item.pubDate || new Date().toISOString()).toISOString(),
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
  return textData.trim().length > 0;
};