import { FeedItem } from '../types/FeedTypes';
import { DefaultFeeds as EarthAllianceDefaultFeeds } from './EarthAllianceDefaultFeeds';

// Original mainstream sources (kept for the MAINSTREAM mode)
const mainstreamUrls = [
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

export const MainstreamFeeds: FeedItem[] = mainstreamUrls.map((url, index) => ({
  id: `ms-${index + 1}`,
  title: `Mainstream Source ${index + 1}`,
  link: url,
  pubDate: `2023-01-${String(index + 1).padStart(2, '0')}`,
  description: `Mainstream news source ${index + 1}`,
  content: `Content from mainstream source ${index + 1}`,
  feedListId: '1',
}));

// Use Earth Alliance feeds as default
export const DefaultFeeds: FeedItem[] = EarthAllianceDefaultFeeds;