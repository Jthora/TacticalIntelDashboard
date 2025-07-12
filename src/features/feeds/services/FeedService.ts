import { Feed } from '../../../models/Feed';
import { log } from '../../../utils/LoggerService';
import { FeedList, FeedResults } from '../../../types/FeedTypes';
import { LocalStorageUtil } from '../../../utils/LocalStorageUtil';
import FeedController from '../../../controllers/FeedController';
import { DefaultFeeds } from '../../../constants/DefaultFeeds';
import { convertFeedItemsToFeeds } from '../../../utils/feedConversion';
import { fetchFeed } from '../../../utils/fetchFeed'; // Import fetchFeed
import { FeedHealthService } from '../../../services/FeedHealthService';

class FeedService {
  private feeds: Feed[] = [];
  private feedLists: FeedList[] = [];
  private readonly feedsStorageKey = 'feeds';
  private readonly feedListsStorageKey = 'feedLists';
  private readonly feedsVersionKey = 'feedsVersion';
  private readonly currentFeedsVersion = '2.1-cors-fixed'; // Increment this when feeds change

  constructor() {
    this.loadFeeds();
    this.loadFeedLists();
    this.updateFeedsFromServer();
  }

  private loadFeeds() {
    try {
      console.log('🔍 FeedService: loadFeeds called');
      log.debug("Component", 'Loading feeds from local storage');
      
      // Check if we need to upgrade feeds to new version
      const storedVersion = LocalStorageUtil.getItem<string>(this.feedsVersionKey);
      console.log('🔍 FeedService: Stored version:', storedVersion, 'Current version:', this.currentFeedsVersion);
      
      const storedFeeds = LocalStorageUtil.getItem<Feed[]>(this.feedsStorageKey);
      console.log('🔍 FeedService: storedFeeds from localStorage:', storedFeeds?.length || 0, 'items');
      
      // Force reload if version mismatch or no stored feeds
      if (storedVersion !== this.currentFeedsVersion || !storedFeeds || storedFeeds.length === 0) {
        console.log('� FeedService: Version mismatch or no feeds, forcing upgrade to realistic feeds');
        this.feeds = this.getDefaultFeeds();
        // Save new version and feeds
        LocalStorageUtil.setItem(this.feedsVersionKey, this.currentFeedsVersion);
        this.saveFeeds();
      } else {
        console.log('� FeedService: Using stored feeds from localStorage');
        console.log('📦 FeedService: Stored feeds sample:', storedFeeds.slice(0, 2));
        this.feeds = storedFeeds;
      }
      console.log('✅ FeedService: Final feeds count:', this.feeds.length);
    } catch (error) {
      console.error('Failed to load feeds:', error);
      this.feeds = this.getDefaultFeeds();
      this.saveFeeds();
      log.debug("Component", 'Default feeds loaded due to error:', this.feeds);
    }
  }

  private loadFeedLists() {
    try {
      log.debug("Component", 'Loading feed lists from local storage');
      const storedFeedLists = LocalStorageUtil.getItem<FeedList[]>(this.feedListsStorageKey);
      if (storedFeedLists && storedFeedLists.length > 0) {
        this.feedLists = storedFeedLists;
      } else {
        this.feedLists = this.getDefaultFeedLists();
      }
    } catch (error) {
      console.error('Failed to load feed lists:', error);
      this.feedLists = this.getDefaultFeedLists();
      this.saveFeedLists();
      log.debug("Component", 'Default feed lists loaded due to error:', this.feedLists);
    }
  }

  private saveFeeds() {
    try {
      log.debug("Component", 'Saving feeds to local storage');
      LocalStorageUtil.setItem(this.feedsStorageKey, this.feeds);
      log.debug("Component", 'Feeds saved to local storage');
    } catch (error) {
      console.error('Failed to save feeds:', error);
    }
  }

  private saveFeedLists() {
    try {
      log.debug("Component", 'Saving feed lists to local storage');
      LocalStorageUtil.setItem(this.feedListsStorageKey, this.feedLists);
      log.debug("Component", 'Feed lists saved to local storage');
    } catch (error) {
      console.error('Failed to save feed lists:', error);
    }
  }

  private getDefaultFeeds(): Feed[] {
    console.log('🔍 FeedService: getDefaultFeeds called');
    const defaultFeedItems = DefaultFeeds;
    console.log('🔍 FeedService: DefaultFeeds length:', defaultFeedItems.length);
    console.log('🔍 FeedService: DefaultFeeds sample:', defaultFeedItems.slice(0, 2));
    
    const convertedFeeds = convertFeedItemsToFeeds(defaultFeedItems);
    console.log('🔍 FeedService: Converted feeds length:', convertedFeeds.length);
    console.log('🔍 FeedService: Converted feeds sample:', convertedFeeds.slice(0, 2));
    
    return convertedFeeds;
  }

  public resetToDefault() {
    log.debug("Component", 'Resetting feeds and feed lists to default');
    this.feeds = this.getDefaultFeeds();
    this.feedLists = this.getDefaultFeedLists();
    this.saveFeeds();
    this.saveFeedLists();
    this.updateFeedsFromServer(); // Ensure feeds are updated from the server
  }

  private getDefaultFeedLists(): FeedList[] {
    return [
      { id: '1', name: 'Default List' },
    ];
  }

  public getFeeds(): Feed[] {
    log.debug("Component", 'Getting all feeds');
    return this.feeds;
  }

  public getFeedLists(): FeedList[] {
    log.debug("Component", 'Getting all feed lists');
    try {
      const lists = this.feedLists;
      log.debug("Component", 'Feed lists retrieved:', lists);
      return lists;
    } catch (error) {
      console.error('Failed to get feed lists:', error);
      return [];
    }
  }

  public getFeedsByList(feedListId: string): Feed[] {
    console.log('🔍 FeedService: getFeedsByList called with ID:', feedListId);
    console.log('🔍 FeedService: Total feeds available:', this.feeds.length);
    console.log('🔍 FeedService: Feed sample:', this.feeds.slice(0, 2).map(f => ({ id: f.id, feedListId: f.feedListId, title: f.title })));
    
    log.debug("Component", `Getting feeds for list ID: ${feedListId}`);
    try {
      const feeds = this.feeds.filter(feed => feed.feedListId === feedListId);
      console.log('🔍 FeedService: Filtered feeds count:', feeds.length);
      log.debug("Component", `Feeds for list ID ${feedListId}:`, feeds);
      return feeds;
    } catch (error) {
      console.error(`Failed to get feeds for list ID ${feedListId}:`, error);
      return [];
    }
  }

  public getFeedById(feedId: string): Feed | undefined {
    log.debug("Component", `Getting feed by ID: ${feedId}`);
    try {
      const feed = this.feeds.find(feed => feed.id === feedId);
      log.debug("Component", `Feed found:`, feed);
      return feed;
    } catch (error) {
      console.error(`Failed to get feed by ID ${feedId}:`, error);
      return undefined;
    }
  }

  public addFeed(feed: Feed) {
    try {
      log.debug("Component", 'Adding new feed:', feed);
      this.feeds.push(feed);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to add feed:', error);
    }
  }

  public addFeedToList(feedListId: string, feed: Feed) {
    try {
      log.debug("Component", `Adding feed to list ID: ${feedListId}`, feed);
      feed.feedListId = feedListId;
      this.addFeed(feed);
    } catch (error) {
      console.error('Failed to add feed to list:', error);
    }
  }

  public removeFeed(feedId: string) {
    try {
      log.debug("Component", `Removing feed ID: ${feedId}`);
      this.feeds = this.feeds.filter(feed => feed.id !== feedId);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to remove feed:', error);
    }
  }

  public removeFeedFromList(feedListId: string, feedId: string) {
    try {
      log.debug("Component", `Removing feed ID: ${feedId} from list ID: ${feedListId}`);
      this.feeds = this.feeds.filter(feed => feed.id !== feedId || feed.feedListId !== feedListId);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to remove feed from list:', error);
    }
  }

  public addFeedList(feedList: FeedList) {
    try {
      log.debug("Component", 'Adding new feed list:', feedList);
      this.feedLists.push(feedList);
      this.saveFeedLists();
    } catch (error) {
      console.error('Failed to add feed list:', error);
    }
  }

  public removeFeedList(feedListId: string) {
    try {
      log.debug("Component", `Removing feed list ID: ${feedListId}`);
      this.feedLists = this.feedLists.filter(list => list.id !== feedListId);
      this.saveFeedLists();
    } catch (error) {
      console.error('Failed to remove feed list:', error);
    }
  }

  public async updateFeedsFromServer() {
    console.log('🌐 FeedService: updateFeedsFromServer called');
    console.log('🌐 FeedService: Will attempt to fetch', this.feeds.length, 'feeds');
    log.debug("Component", 'Updating feeds from server');
    log.debug("Component", 'Current feeds:', this.feeds);

    const updatedFeeds: Feed[] = [];
    for (const feed of this.feeds) {
      console.log(`🌐 Fetching RSS for: ${feed.name} (${feed.url})`);
      const startTime = Date.now();
      try {
        const feedResults = await fetchFeed(feed.url); // Use fetchFeed to get feed data
        const responseTime = Date.now() - startTime;
        
        console.log(`📡 RSS fetch result for ${feed.name}:`, feedResults ? 'SUCCESS' : 'FAILED');
        if (feedResults) {
          console.log(`📡 RSS data for ${feed.name}:`, feedResults.feeds?.length || 0, 'items');
          if (feedResults.feeds && feedResults.feeds.length > 0) {
            console.log(`📡 First RSS item:`, feedResults.feeds[0]);
          }
          const updatedFeed = { ...feed, ...feedResults.feeds[0] }; // Assuming feedResults.feeds[0] contains the updated feed data
          updatedFeeds.push(updatedFeed);
          // Track successful fetch
          FeedHealthService.updateFeedHealth(feed.id, feed.url, true, responseTime);
        } else {
          console.error(`❌ Failed to fetch feed from ${feed.url} - no results`);
          updatedFeeds.push(feed); // Keep the old feed if fetch fails
          // Track failed fetch
          FeedHealthService.updateFeedHealth(feed.id, feed.url, false, undefined, 'Feed fetch returned null');
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ Error fetching feed from ${feed.url}:`, error);
        updatedFeeds.push(feed); // Keep the old feed if fetch fails
        // Track error
        FeedHealthService.updateFeedHealth(feed.id, feed.url, false, responseTime, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('🌐 FeedService: Feed update complete. Updated', updatedFeeds.length, 'feeds');
    this.feeds = updatedFeeds;
    this.saveFeeds();
    log.debug("Component", 'Feeds updated from server:', this.feeds);
  }

  public getFeedResults(url: string): FeedResults | null {
    return FeedController.getFeedResults(url);
  }
}

export default new FeedService();
