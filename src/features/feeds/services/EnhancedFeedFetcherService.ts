import { FeedMode, getFeedsByMode } from '../../../constants/EarthAllianceDefaultFeeds';
import { EARTH_ALLIANCE_SOURCES } from '../../../constants/EarthAllianceSources';
import { protocolAdapter } from '../../../constants/SourceProtocolAdapter';
import { Feed } from '../../../models/Feed';

/**
 * Enhanced Feed Fetcher Service
 * This service handles fetching feeds from multiple protocols using the SourceProtocolAdapter
 */
export class EnhancedFeedFetcherService {
  /**
   * Fetch a feed from any supported protocol
   * @param url The feed URL/endpoint to fetch
   * @returns A promise resolving to the feed data
   */
  public static async fetchFeed(url: string): Promise<any[]> {
    try {
      console.log(`Fetching feed from ${url}`);
      // Use the protocol adapter to determine the correct handler and fetch the data
      return await protocolAdapter.fetchAndParse(url);
    } catch (error) {
      console.error(`Error fetching feed from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get the Earth Alliance source for a given endpoint
   * @param endpoint The feed endpoint
   * @returns The Earth Alliance source or undefined
   */
  public static getSourceForEndpoint(endpoint: string) {
    return EARTH_ALLIANCE_SOURCES.find(source => source.endpoint === endpoint);
  }

  /**
   * Convert feed items to Feed objects
   * @param items The feed items from any protocol
   * @param endpoint The original endpoint
   * @returns An array of Feed objects
   */
  public static convertToFeeds(items: any[], endpoint: string): Feed[] {
    const source = this.getSourceForEndpoint(endpoint);
    
    return items.map((item, index) => ({
      id: `${endpoint.replace(/[^a-z0-9]/gi, '-')}-${index}`,
      name: item.title || 'No Title',
      title: item.title || 'No Title',
      url: item.link || endpoint,
      link: item.link || '',
      description: item.description || 'No Description',
      content: item.content || item.description || '',
      pubDate: item.pubDate || new Date().toISOString(),
      source: source ? source.name : 'Unknown Source',
      author: item.author || '',
      feedListId: '2', // Earth Alliance feed list
      sourceInfo: source,
      categories: item.categories || []
    }));
  }

  /**
   * Get feeds based on the current feed mode
   * @param mode The feed mode (EARTH_ALLIANCE, MAINSTREAM, HYBRID)
   * @returns A promise resolving to Feed objects
   */
  public static async getFeedsByMode(mode: FeedMode): Promise<Feed[]> {
    const feedItems = getFeedsByMode(mode);
    
    // Convert feed items to Feed objects
    return feedItems.map((item, index) => ({
      id: item.id || `mode-${mode}-${index}`,
      name: item.title || 'No Title',
      title: item.title || 'No Title',
      url: item.link || '',
      link: item.link || '',
      description: item.description || 'No Description',
      content: item.content || item.description || '',
      pubDate: item.pubDate || new Date().toISOString(),
      source: mode === FeedMode.EARTH_ALLIANCE ? 'Earth Alliance' : 'Mainstream',
      author: item.author || '',
      feedListId: mode === FeedMode.EARTH_ALLIANCE ? '2' : '1',
      categories: item.categories || []
    }));
  }
}
