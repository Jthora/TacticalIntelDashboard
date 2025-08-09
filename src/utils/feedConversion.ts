import { Feed } from '../models/Feed';
import { FeedItem } from '../types/FeedTypes';

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
      ...(feed.author ? { author: feed.author } : {}),
      ...(feed.categories ? { categories: feed.categories } : {}),
      ...(feed.media ? { media: feed.media } : {})
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
    ...(feed.author ? { author: feed.author } : {}),
    ...(feed.categories ? { categories: feed.categories } : {}),
    ...(feed.media ? { media: feed.media } : {})
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
      ...(feedItem.author ? { author: feedItem.author } : {}),
      ...(feedItem.categories ? { categories: feedItem.categories } : {}),
      ...(feedItem.media ? { media: feedItem.media } : {}),
      // Preserve extended properties from modern API
      ...(feedItem.priority ? { priority: feedItem.priority } : {}),
      ...(feedItem.contentType ? { contentType: feedItem.contentType } : {}),
      ...(feedItem.tags ? { tags: feedItem.tags } : {}),
      ...(feedItem.source ? { source: feedItem.source } : {}),
      // Include metadata for additional features
      ...(feedItem.metadata ? { metadata: feedItem.metadata } : {})
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
    ...(feedItem.author ? { author: feedItem.author } : {}),
    ...(feedItem.categories ? { categories: feedItem.categories } : {}),
    ...(feedItem.media ? { media: feedItem.media } : {}),
    // Preserve extended properties from modern API
    ...(feedItem.priority ? { priority: feedItem.priority } : {}),
    ...(feedItem.contentType ? { contentType: feedItem.contentType } : {}),
    ...(feedItem.tags ? { tags: feedItem.tags } : {}),
    ...(feedItem.source ? { source: feedItem.source } : {}),
    // Include metadata for additional features
    ...(feedItem.metadata ? { metadata: feedItem.metadata } : {})
  };
};