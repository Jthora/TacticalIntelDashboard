import { FeedItem } from '../types/FeedTypes';
import { Feed } from '../models/Feed';

export const convertFeedItems = (feedItems: Feed[], url: string): FeedItem[] => {
  return feedItems.map((feed, index) => {
    const feedItem: FeedItem = {
      id: `${url}-${index}`,
      title: feed.title,
      link: feed.link,
      pubDate: new Date(feed.pubDate).toISOString(),
      description: feed.description || '',
      content: feed.content || '',
      feedListId: feed.feedListId,
      author: feed.author,
      categories: feed.categories,
      media: feed.media,
    };

    // Additional conversion logic can be added here
    // For example, handling different date formats, extracting more metadata, etc.

    return feedItem;
  });
};