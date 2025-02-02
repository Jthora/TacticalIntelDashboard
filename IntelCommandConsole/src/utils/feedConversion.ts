import { FeedItem } from '../types/FeedTypes';
import { Feed } from '../models/Feed';

export const convertFeedsToFeedItems = (feeds: Feed[]): FeedItem[] => {
  return feeds.map((feed) => {
    const feedItem: FeedItem = {
      id: feed.id, // Use feed's existing ID
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

export const convertFeedToFeedItem = (feed: Feed): FeedItem => {
  return {
    id: feed.id, // Use feed's existing ID
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
};

export const convertFeedItemsToFeeds = (feedItems: FeedItem[]): Feed[] => {
  return feedItems.map(feedItem => {
    const feed: Feed = {
      id: feedItem.id, // Use feedItem's existing ID
      name: feedItem.title, // Assuming name is the same as title
      url: feedItem.link, // Assuming url is the same as link
      title: feedItem.title,
      link: feedItem.link,
      pubDate: new Date(feedItem.pubDate).toISOString(), // Fix: Convert pubDate to ISO string
      description: feedItem.description,
      content: feedItem.content,
      feedListId: feedItem.feedListId,
      author: feedItem.author,
      categories: feedItem.categories,
      media: feedItem.media,
    };

    // Additional conversion logic can be added here
    // For example, handling different date formats, extracting more metadata, etc.

    return feed;
  });
};

export const convertFeedItemToFeed = (feedItem: FeedItem): Feed => {
  return {
    id: feedItem.id, // Use feedItem's existing ID
    name: feedItem.title, // Assuming name is the same as title
    url: feedItem.link, // Assuming url is the same as link
    title: feedItem.title,
    link: feedItem.link,
    pubDate: new Date(feedItem.pubDate).toISOString(), // Fix: Convert pubDate to ISO string
    description: feedItem.description,
    content: feedItem.content,
    feedListId: feedItem.feedListId,
    author: feedItem.author,
    categories: feedItem.categories,
    media: feedItem.media,
  };
};