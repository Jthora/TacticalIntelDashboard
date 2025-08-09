import { DefaultFeeds } from '../constants/DefaultFeeds';
import FeedController from '../controllers/FeedController';
import { Feed } from '../models/Feed';
import { FeedList, FeedResults } from '../types/FeedTypes';
import { cleanupStoredFeeds } from '../utils/feedCleanup';
import { convertFeedItemsToFeeds } from '../utils/feedConversion';
import { fetchFeed } from '../utils/fetchFeed'; // Import fetchFeed
import { LocalStorageUtil } from '../utils/LocalStorageUtil';
import { log } from '../utils/LoggerService';

class FeedService {
  private feeds: Feed[] = [];
  private feedLists: FeedList[] = [];
  private readonly feedsStorageKey = 'feeds';
  private readonly feedListsStorageKey = 'feedLists';

  constructor() {
    // Clean up any invalid cached feeds before loading
    cleanupStoredFeeds();
    
    this.loadFeeds();
    this.loadFeedLists();
    this.updateFeedsFromServer();
  }

  private loadFeeds() {
    try {
      log.debug("FeedService", 'Loading feeds from local storage');
      const storedFeeds = LocalStorageUtil.getItem<Feed[]>(this.feedsStorageKey);
      if (storedFeeds && storedFeeds.length > 0) {
        this.feeds = storedFeeds;
      } else {
        this.feeds = this.getDefaultFeeds();
      }
    } catch (error) {
      log.error("FeedService", 'Failed to load feeds:', error);
      this.feeds = this.getDefaultFeeds();
      this.saveFeeds();
      log.debug("FeedService", 'Default feeds loaded due to error:', this.feeds);
    }
  }

  private loadFeedLists() {
    try {
      log.debug("FeedService", 'Loading feed lists from local storage');
      const storedFeedLists = LocalStorageUtil.getItem<FeedList[]>(this.feedListsStorageKey);
      if (storedFeedLists && storedFeedLists.length > 0) {
        this.feedLists = storedFeedLists;
      } else {
        this.feedLists = this.getDefaultFeedLists();
      }
    } catch (error) {
      log.error("FeedService", 'Failed to load feed lists:', error);
      this.feedLists = this.getDefaultFeedLists();
      this.saveFeedLists();
      log.debug("FeedService", 'Default feed lists loaded due to error:', this.feedLists);
    }
  }

  private saveFeeds() {
    try {
      log.debug("FeedService", 'Saving feeds to local storage');
      LocalStorageUtil.setItem(this.feedsStorageKey, this.feeds);
      log.debug("FeedService", 'Feeds saved to local storage');
    } catch (error) {
      log.error("FeedService", 'Failed to save feeds:', error);
    }
  }

  private saveFeedLists() {
    try {
      log.debug("FeedService", 'Saving feed lists to local storage');
      LocalStorageUtil.setItem(this.feedListsStorageKey, this.feedLists);
      log.debug("FeedService", 'Feed lists saved to local storage');
    } catch (error) {
      log.error("FeedService", 'Failed to save feed lists:', error);
    }
  }

  private getDefaultFeeds(): Feed[] {
    return convertFeedItemsToFeeds(DefaultFeeds);
  }

  public resetToDefault() {
    log.debug("FeedService", 'Resetting feeds and feed lists to default');
    this.feeds = this.getDefaultFeeds();
    this.feedLists = this.getDefaultFeedLists();
    this.saveFeeds();
    this.saveFeedLists();
    this.updateFeedsFromServer(); // Ensure feeds are updated from the server
  }

  private getDefaultFeedLists(): FeedList[] {
    return [
      { id: '1', name: 'Default List' },
      { id: 'modern-api', name: 'Modern Intelligence Sources' },
      { id: 'primary-intel', name: 'Primary Intelligence' },
      { id: 'security-feeds', name: 'Security & Threat Intelligence' }
    ];
  }

  public getFeeds(): Feed[] {
    log.debug("FeedService", 'Getting all feeds');
    return this.feeds;
  }

  public getFeedLists(): FeedList[] {
    log.debug("FeedService", 'Getting all feed lists');
    try {
      const lists = this.feedLists;
      log.debug("FeedService", 'Feed lists retrieved:', lists);
      return lists;
    } catch (error) {
      log.error("FeedService", 'Failed to get feed lists:', error);
      return [];
    }
  }

  public getFeedsByList(feedListId: string): Feed[] {
    log.debug("FeedService", `Getting feeds for list ID: ${feedListId}`);
    try {
      const feeds = this.feeds.filter(feed => feed.feedListId === feedListId);
      log.debug("FeedService", `Feeds for list ID ${feedListId}:`, feeds);
      return feeds;
    } catch (error) {
      log.error("FeedService", `Failed to get feeds for list ID ${feedListId}:`, error);
      return [];
    }
  }

  public getFeedById(feedId: string): Feed | undefined {
    log.debug("FeedService", `Getting feed by ID: ${feedId}`);
    try {
      const feed = this.feeds.find(feed => feed.id === feedId);
      log.debug("FeedService", `Feed found:`, feed);
      return feed;
    } catch (error) {
      log.error("FeedService", `Failed to get feed by ID ${feedId}:`, error);
      return undefined;
    }
  }

  public addFeed(feed: Feed) {
    try {
      log.debug("FeedService", 'Adding new feed:', feed);
      this.feeds.push(feed);
      this.saveFeeds();
    } catch (error) {
      log.error("FeedService", 'Failed to add feed:', error);
    }
  }

  public addFeedToList(feedListId: string, feed: Feed) {
    try {
      log.debug("FeedService", `Adding feed to list ID: ${feedListId}`, feed);
      feed.feedListId = feedListId;
      this.addFeed(feed);
    } catch (error) {
      log.error("FeedService", 'Failed to add feed to list:', error);
    }
  }

  public removeFeed(feedId: string) {
    try {
      log.debug("FeedService", `Removing feed ID: ${feedId}`);
      this.feeds = this.feeds.filter(feed => feed.id !== feedId);
      this.saveFeeds();
    } catch (error) {
      log.error("FeedService", 'Failed to remove feed:', error);
    }
  }

  public removeFeedFromList(feedListId: string, feedId: string) {
    try {
      log.debug("FeedService", `Removing feed ID: ${feedId} from list ID: ${feedListId}`);
      this.feeds = this.feeds.filter(feed => feed.id !== feedId || feed.feedListId !== feedListId);
      this.saveFeeds();
    } catch (error) {
      log.error("FeedService", 'Failed to remove feed from list:', error);
    }
  }

  public addFeedList(feedList: FeedList) {
    try {
      log.debug("FeedService", 'Adding new feed list:', feedList);
      this.feedLists.push(feedList);
      this.saveFeedLists();
    } catch (error) {
      log.error("FeedService", 'Failed to add feed list:', error);
    }
  }

  public removeFeedList(feedListId: string) {
    try {
      log.debug("FeedService", `Removing feed list ID: ${feedListId}`);
      this.feedLists = this.feedLists.filter(list => list.id !== feedListId);
      this.saveFeedLists();
    } catch (error) {
      log.error("FeedService", 'Failed to remove feed list:', error);
    }
  }

  public async updateFeedsFromServer() {
    log.debug("FeedService", 'Updating feeds from server');
    log.debug("FeedService", 'Current feeds:', this.feeds);

    // Development mode notice removed - now using validated sources

    const updatedFeeds: Feed[] = [];
    for (const feed of this.feeds) {
      try {
        const feedResults = await fetchFeed(feed.url); // Use fetchFeed to get feed data
        if (feedResults) {
          const updatedFeed = { ...feed, ...feedResults.feeds[0] }; // Assuming feedResults.feeds[0] contains the updated feed data
          updatedFeeds.push(updatedFeed);
        } else {
          log.error("FeedService", `Failed to fetch feed from ${feed.url}`);
          updatedFeeds.push(feed); // Keep the old feed if fetch fails
        }
      } catch (error) {
        log.error("FeedService", `Error fetching feed from ${feed.url}:`, error);
        updatedFeeds.push(feed); // Keep the old feed if fetch fails
      }
    }

    this.feeds = updatedFeeds;
    this.saveFeeds();
    log.debug("FeedService", 'Feeds updated from server:', this.feeds);
  }

  public getFeedResults(url: string): FeedResults | null {
    return FeedController.getFeedResults(url);
  }

  // Feed enrichment methods for filtering
  public enrichFeedWithMetadata(feed: Feed): Feed {
    return {
      ...feed,
      priority: this.determinePriority(feed),
      contentType: this.determineContentType(feed),
      region: this.determineRegion(feed),
      tags: this.extractTags(feed),
      timestamp: feed.pubDate,
      source: feed.name
    };
  }

  public determinePriority(feed: Feed): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const searchableText = [
      feed.title,
      feed.description,
      feed.content
    ].filter(Boolean).join(' ').toLowerCase();

    // Critical keywords
    if (searchableText.includes('urgent') || 
        searchableText.includes('breaking') || 
        searchableText.includes('critical') ||
        searchableText.includes('emergency') ||
        searchableText.includes('immediate')) {
      return 'CRITICAL';
    }

    // High priority keywords
    if (searchableText.includes('important') || 
        searchableText.includes('alert') ||
        searchableText.includes('warning') ||
        searchableText.includes('security') ||
        searchableText.includes('threat')) {
      return 'HIGH';
    }

    // Medium priority keywords
    if (searchableText.includes('update') || 
        searchableText.includes('notice') ||
        searchableText.includes('announcement') ||
        searchableText.includes('report')) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  public determineContentType(feed: Feed): 'INTEL' | 'NEWS' | 'ALERT' | 'THREAT' {
    const searchableText = [
      feed.title,
      feed.description,
      feed.content,
      feed.name
    ].filter(Boolean).join(' ').toLowerCase();

    // Threat indicators
    if (searchableText.includes('threat') || 
        searchableText.includes('attack') || 
        searchableText.includes('cyber') ||
        searchableText.includes('malware') ||
        searchableText.includes('vulnerability') ||
        searchableText.includes('exploit')) {
      return 'THREAT';
    }

    // Intelligence indicators
    if (searchableText.includes('intelligence') || 
        searchableText.includes('intel') || 
        searchableText.includes('classified') ||
        searchableText.includes('analysis') ||
        searchableText.includes('assessment') ||
        searchableText.includes('briefing')) {
      return 'INTEL';
    }

    // Alert indicators
    if (searchableText.includes('alert') || 
        searchableText.includes('warning') || 
        searchableText.includes('emergency') ||
        searchableText.includes('urgent') ||
        searchableText.includes('critical')) {
      return 'ALERT';
    }

    return 'NEWS';
  }

  public determineRegion(feed: Feed): 'GLOBAL' | 'AMERICAS' | 'EUROPE' | 'ASIA_PACIFIC' {
    const searchableText = [
      feed.title,
      feed.description,
      feed.content,
      feed.name,
      feed.url
    ].filter(Boolean).join(' ').toLowerCase();

    // Americas indicators
    if (searchableText.includes('usa') || 
        searchableText.includes('america') || 
        searchableText.includes('canada') ||
        searchableText.includes('mexico') ||
        searchableText.includes('brazil') ||
        searchableText.includes('us ') ||
        searchableText.includes('.us') ||
        searchableText.includes('washington') ||
        searchableText.includes('pentagon')) {
      return 'AMERICAS';
    }

    // Europe indicators
    if (searchableText.includes('europe') || 
        searchableText.includes('uk') || 
        searchableText.includes('britain') ||
        searchableText.includes('germany') ||
        searchableText.includes('france') ||
        searchableText.includes('nato') ||
        searchableText.includes('eu ') ||
        searchableText.includes('brexit') ||
        searchableText.includes('london') ||
        searchableText.includes('brussels')) {
      return 'EUROPE';
    }

    // Asia Pacific indicators
    if (searchableText.includes('china') || 
        searchableText.includes('japan') || 
        searchableText.includes('korea') ||
        searchableText.includes('india') ||
        searchableText.includes('asia') ||
        searchableText.includes('pacific') ||
        searchableText.includes('beijing') ||
        searchableText.includes('tokyo') ||
        searchableText.includes('seoul') ||
        searchableText.includes('sydney')) {
      return 'ASIA_PACIFIC';
    }

    return 'GLOBAL';
  }

  public extractTags(feed: Feed): string[] {
    const tags: string[] = [];

    // Use existing categories if available
    if (feed.categories && feed.categories.length > 0) {
      tags.push(...feed.categories);
    }

    const searchableText = [
      feed.title,
      feed.description,
      feed.content
    ].filter(Boolean).join(' ').toLowerCase();

    // Extract common tactical/security tags
    const commonTags = [
      'cybersecurity', 'malware', 'ransomware', 'phishing', 'breach',
      'vulnerability', 'exploit', 'apt', 'nation-state', 'hacker',
      'trojan', 'virus', 'backdoor', 'zero-day', 'mitigation',
      'incident', 'response', 'forensics', 'detection', 'prevention'
    ];

    commonTags.forEach(tag => {
      if (searchableText.includes(tag)) {
        tags.push(tag.toUpperCase());
      }
    });

    // Remove duplicates and return
    return [...new Set(tags)];
  }
}

export default new FeedService();
