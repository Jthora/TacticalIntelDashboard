import { fetchFeed } from '../utils/fetchFeed';
import { FeedResults } from '../models/FeedResults';
import { Feed, FeedList } from '../types/FeedTypes';
import { LocalStorageUtil } from '../utils/LocalStorageUtil';

class FeedService {
  private feeds: Feed[] = [];
  private feedLists: FeedList[] = [];
  private readonly feedsStorageKey = 'feeds';
  private readonly feedListsStorageKey = 'feedLists';
  private feedResultsCache: { [url: string]: FeedResults } = {};

  constructor() {
    this.loadFeeds();
    this.loadFeedLists();
    this.updateFeedsFromServer();
  }

  private loadFeeds() {
    try {
      console.log('Loading feeds from local storage');
      const storedFeeds = LocalStorageUtil.getItem<Feed[]>(this.feedsStorageKey);
      if (storedFeeds) {
        this.feeds = storedFeeds;
        console.log('Feeds loaded from local storage:', this.feeds);
      } else {
        console.log('No feeds found in local storage, loading default feeds');
        this.feeds = this.getDefaultFeeds();
        this.saveFeeds();
        console.log('Default feeds loaded:', this.feeds);
      }
    } catch (error) {
      console.error('Failed to load feeds:', error);
      this.feeds = this.getDefaultFeeds();
      this.saveFeeds();
      console.log('Default feeds loaded due to error:', this.feeds);
    }
  }

  private loadFeedLists() {
    try {
      console.log('Loading feed lists from local storage');
      const storedFeedLists = LocalStorageUtil.getItem<FeedList[]>(this.feedListsStorageKey);
      if (storedFeedLists) {
        this.feedLists = storedFeedLists;
        console.log('Feed lists loaded from local storage:', this.feedLists);
      } else {
        this.feedLists = this.getDefaultFeedLists();
        this.saveFeedLists();
        console.log('Default feed lists loaded:', this.feedLists);
      }
    } catch (error) {
      console.error('Failed to load feed lists:', error);
      this.feedLists = this.getDefaultFeedLists();
      this.saveFeedLists();
    }
  }

  private saveFeeds() {
    try {
      console.log('Saving feeds to local storage');
      LocalStorageUtil.setItem(this.feedsStorageKey, this.feeds);
      console.log('Feeds saved to local storage');
    } catch (error) {
      console.error('Failed to save feeds:', error);
    }
  }

  private saveFeedLists() {
    try {
      console.log('Saving feed lists to local storage');
      LocalStorageUtil.setItem(this.feedListsStorageKey, this.feedLists);
      console.log('Feed lists saved to local storage');
    } catch (error) {
      console.error('Failed to save feed lists:', error);
    }
  }

  private getDefaultFeeds(): Feed[] {
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
  
    return defaultUrls.map((url, index) => ({
      id: (index + 1).toString(),
      name: `Feed ${index + 1}`,
      url,
      title: `Title ${index + 1}`,
      link: `${url}/link`,
      pubDate: `2023-01-${String(index + 1).padStart(2, '0')}`,
      description: `Description ${index + 1}`,
      content: `Content ${index + 1}`,
      feedListId: '1',
    }));
  }

  public resetToDefault() {
    console.log('Resetting feeds and feed lists to default');
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
    console.log('Getting all feeds');
    return this.feeds;
  }

  public getFeedLists(): FeedList[] {
    console.log('Getting all feed lists');
    try {
      const lists = this.feedLists;
      console.log('Feed lists retrieved:', lists);
      return lists;
    } catch (error) {
      console.error('Failed to get feed lists:', error);
      return [];
    }
  }

  public getFeedsByList(feedListId: string): Feed[] {
    console.log(`Getting feeds for list ID: ${feedListId}`);
    try {
      const feeds = this.feeds.filter(feed => feed.feedListId === feedListId);
      console.log(`Feeds for list ID ${feedListId}:`, feeds);
      return feeds;
    } catch (error) {
      console.error(`Failed to get feeds for list ID ${feedListId}:`, error);
      return [];
    }
  }

  public addFeed(feed: Feed) {
    try {
      console.log('Adding new feed:', feed);
      this.feeds.push(feed);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to add feed:', error);
    }
  }

  public addFeedToList(feedListId: string, feed: Feed) {
    try {
      console.log(`Adding feed to list ID: ${feedListId}`, feed);
      feed.feedListId = feedListId;
      this.addFeed(feed);
    } catch (error) {
      console.error('Failed to add feed to list:', error);
    }
  }

  public removeFeed(feedId: string) {
    try {
      console.log(`Removing feed ID: ${feedId}`);
      this.feeds = this.feeds.filter(feed => feed.id !== feedId);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to remove feed:', error);
    }
  }

  public removeFeedFromList(feedListId: string, feedId: string) {
    try {
      console.log(`Removing feed ID: ${feedId} from list ID: ${feedListId}`);
      this.feeds = this.feeds.filter(feed => feed.id !== feedId || feed.feedListId !== feedListId);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to remove feed from list:', error);
    }
  }

  public addFeedList(feedList: FeedList) {
    try {
      console.log('Adding new feed list:', feedList);
      this.feedLists.push(feedList);
      this.saveFeedLists();
    } catch (error) {
      console.error('Failed to add feed list:', error);
    }
  }

  public removeFeedList(feedListId: string) {
    try {
      console.log(`Removing feed list ID: ${feedListId}`);
      this.feedLists = this.feedLists.filter(list => list.id !== feedListId);
      this.feeds = this.feeds.filter(feed => feed.feedListId !== feedListId);
      this.saveFeedLists();
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to remove feed list:', error);
    }
  }

  public async updateFeedsFromServer() {
    console.log('Updating feeds from server');
    console.log('Current feeds:', this.feeds); // Log the current feeds
  
    const updatedFeeds: Feed[] = [];
    for (const feed of this.feeds) {
      try {
        console.log(`Fetching feed for URL: ${feed.url}`);
        const feedResults = await fetchFeed(feed.url);
        if (feedResults) {
          console.log(`Feed fetched for URL: ${feed.url}`, feedResults);
          const updatedFeed = feedResults.feeds[0]; // Assuming feedResults.feeds is an array
          updatedFeeds.push({
            id: feed.id,
            name: feed.name,
            url: feed.url,
            title: updatedFeed.title,
            link: updatedFeed.link,
            pubDate: updatedFeed.pubDate,
            description: updatedFeed.description,
            content: updatedFeed.content,
            feedListId: feed.feedListId,
          });
          this.feedResultsCache[feed.url] = feedResults; // Cache the results
        } else {
          console.warn(`Failed to fetch feed for URL: ${feed.url}`);
        }
      } catch (error) {
        console.error(`Error fetching feed for URL: ${feed.url}`, error);
      }
    }
  
    this.feeds = updatedFeeds;
    this.saveFeeds();
    console.log('Feeds updated from server:', this.feeds);
  }

  public getFeedResults(url: string): FeedResults | null {
    return this.feedResultsCache[url] || null;
  }
}

export default new FeedService();