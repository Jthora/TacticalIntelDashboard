import { FeedItem } from '../types/FeedTypes';

const defaultUrls = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://www.reddit.com/r/news/.rss',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.cnn.com/rss/edition.rss',
  'https://www.theguardian.com/world/rss',
  'https://www.washingtonpost.com/rss/world',
  'https://www.bloomberg.com/feed/podcast/etf-report.xml',
  'https://www.ft.com/?format=rss',
];

export const DefaultFeeds: FeedItem[] = defaultUrls.map((url, index) => ({
  id: (index + 1).toString(),
  title: `Title ${index + 1}`,
  link: url,
  pubDate: `2023-01-${String(index + 1).padStart(2, '0')}`,
  description: `Description ${index + 1}`,
  content: `Content ${index + 1}`,
  feedListId: '1',
}));