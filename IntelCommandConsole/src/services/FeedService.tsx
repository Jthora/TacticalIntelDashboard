import FeedController from '../controllers/FeedController';
import { FeedItem, FeedList, FeedResults } from '../types/FeedTypes';
import { LocalStorageUtil } from '../utils/LocalStorageUtil';
import { DefaultFeeds } from '../constants/DefaultFeeds';

class FeedService {
  private feeds: FeedItem[] = [];
  private feedLists: FeedList[] = [];
  private readonly feedsStorageKey = 'feeds';
  private readonly feedListsStorageKey = 'feedLists';

  constructor() {
    this.loadFeeds();
    this.loadFeedLists();
    this.updateFeedsFromServer();
  }

  private loadFeeds() {
    try {
      console.log('Loading feeds from local storage');
      const storedFeeds = LocalStorageUtil.getItem<FeedItem[]>(this.feedsStorageKey);
      if (storedFeeds && storedFeeds.length > 0) {
        this.feeds = storedFeeds;
        console.log('Feeds loaded from local storage:', this.feeds);
      } else {
        console.log('No feeds found in local storage, loading default feeds');
        this.feeds = DefaultFeeds;
        this.saveFeeds();
        console.log('Default feeds loaded:', this.feeds);
      }
    } catch (error) {
      console.error('Failed to load feeds:', error);
      this.feeds = DefaultFeeds;
      this.saveFeeds();
      console.log('Default feeds loaded due to error:', this.feeds);
    }
  }

  private loadFeedLists() {
    try {
      console.log('Loading feed lists from local storage');
      const storedFeedLists = LocalStorageUtil.getItem<FeedList[]>(this.feedListsStorageKey);
      if (storedFeedLists && storedFeedLists.length > 0) {
        this.feedLists = storedFeedLists;
        console.log('Feed lists loaded from local storage:', this.feedLists);
      } else {
        console.log('No feed lists found in local storage, loading default feed lists');
        this.feedLists = this.getDefaultFeedLists();
        this.saveFeedLists();
        console.log('Default feed lists loaded:', this.feedLists);
      }
    } catch (error) {
      console.error('Failed to load feed lists:', error);
      this.feedLists = this.getDefaultFeedLists();
      this.saveFeedLists();
      console.log('Default feed lists loaded due to error:', this.feedLists);
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

  private getDefaultFeeds(): FeedItem[] {
    return DefaultFeeds;
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

  public getFeeds(): FeedItem[] {
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

  public getFeedsByList(feedListId: string): FeedItem[] {
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

  public addFeed(feed: FeedItem) {
    try {
      console.log('Adding new feed:', feed);
      this.feeds.push(feed);
      this.saveFeeds();
    } catch (error) {
      console.error('Failed to add feed:', error);
    }
  }

  public addFeedToList(feedListId: string, feed: FeedItem) {
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
    console.log('Current feeds:', this.feeds);

    const updatedFeeds: FeedItem[] = [];
    for (const feed of this.feeds) {
      try {
        console.log(`Fetching feed for URL: ${feed.link}`);
        const feedResults = await FeedController.fetchAndParseFeed(feed.link);
        if (feedResults && feedResults.feeds.length > 0) {
          console.log(`Feed fetched for URL: ${feed.link}`, feedResults);
          const updatedFeed = feedResults.feeds[0];
          updatedFeeds.push({
            id: feed.id,
            title: updatedFeed.title,
            link: updatedFeed.link,
            pubDate: updatedFeed.pubDate,
            description: updatedFeed.description,
            content: updatedFeed.content,
            feedListId: feed.feedListId,
          });
        } else {
          if (feedResults && feedResults.feeds.length == 0) {
            console.warn(`No feeds found for URL, URL Feed List Returned Empty: ${feed.link}`);
          }
          console.warn(`Failed to fetch feed for URL: ${feed.link}`);
        }
      } catch (error) {
        console.error(`Error fetching feed for URL: ${feed.link}`, error);
      }
    }

    this.feeds = updatedFeeds;
    this.saveFeeds();
    console.log('Feeds updated from server:', this.feeds);
  }

  public getFeedResults(url: string): FeedResults | null {
    return FeedController.getFeedResults(url);
  }
}

export default new FeedService();