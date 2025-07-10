import { FeedItem } from '../types/FeedTypes';
import { EARTH_ALLIANCE_SOURCES } from './EarthAllianceSources';

// Earth Alliance Feeds (VALIDATED WORKING ENDPOINTS ONLY)
export const EarthAllianceFeeds: FeedItem[] = EARTH_ALLIANCE_SOURCES.map((source, index) => ({
  id: `ea-${index + 1}`,
  title: source.name,
  link: source.url,
  pubDate: new Date().toISOString(),
  description: `Earth Alliance aligned source: ${source.category}`,
  content: `Earth Alliance intelligence source with trust rating: ${source.trustRating}`,
  feedListId: '2',
  categories: [source.category],
}));

// Default is now Earth Alliance sources
export const DefaultFeeds: FeedItem[] = EarthAllianceFeeds;

// Feed modes enum
export enum FeedMode {
  EARTH_ALLIANCE = 'EARTH_ALLIANCE',
  MAINSTREAM = 'MAINSTREAM',
  HYBRID = 'HYBRID'
}

// Function to get appropriate feeds based on selected mode
export const getFeedsByMode = (mode: FeedMode) => {
  switch (mode) {
    case FeedMode.EARTH_ALLIANCE:
      return EarthAllianceFeeds;
    case FeedMode.MAINSTREAM:
      // You would import MainstreamFeeds here
      return [];
    case FeedMode.HYBRID:
      // Combine high-trust Earth Alliance sources with mainstream
      return [...EarthAllianceFeeds.filter(feed => {
        const source = EARTH_ALLIANCE_SOURCES.find(s => s.url === feed.link);
        return source && source.trustRating >= 80;
      })];
    default:
      return EarthAllianceFeeds;
  }
};