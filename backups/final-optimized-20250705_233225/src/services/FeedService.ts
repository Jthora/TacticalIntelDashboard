import { Feed } from '../models/Feed';
import { FeedList, FeedResults } from '../types/FeedTypes';
import { LocalStorageUtil } from '../utils/LocalStorageUtil';
import FeedController from '../controllers/FeedController';
import { DefaultFeeds } from '../constants/DefaultFeeds';
import { convertFeedItemsToFeeds } from '../utils/feedConversion';
import { fetchFeed } from '../utils/fetchFeed'; // Import fetchFeed

class FeedService {
  private feeds: Feed[] = [];
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
      const storedFeeds = LocalStorageUtil.getItem<Feed[]>(this.feedsStorageKey);
      if (storedFeeds && storedFeeds.length > 0) {
        this.feeds = storedFeeds;
      } else {
        this.feeds = this.getDefaultFeeds();
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
      if (storedFeedLists && storedFeedLists.length > 0) {
        this.feedLists = storedFeedLists;
      } else {
        this.feedLists = this.getDefaultFeedLists();
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

  private getDefaultFeeds(): Feed[] {
    return convertFeedItemsToFeeds(DefaultFeeds);
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

  public getFeedById(feedId: string): Feed | undefined {
    console.log(`Getting feed by ID: ${feedId}`);
    try {
      const feed = this.feeds.find(feed => feed.id === feedId);
      console.log(`Feed found:`, feed);
      return feed;
    } catch (error) {
      console.error(`Failed to get feed by ID ${feedId}:`, error);
      return undefined;
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
      this.saveFeedLists();
    } catch (error) {
      console.error('Failed to remove feed list:', error);
    }
  }

  public async updateFeedsFromServer() {
    console.log('Updating feeds from server');
    console.log('Current feeds:', this.feeds);

    const updatedFeeds: Feed[] = [];
    for (const feed of this.feeds) {
      try {
        const feedResults = await fetchFeed(feed.url); // Use fetchFeed to get feed data
        if (feedResults) {
          const updatedFeed = { ...feed, ...feedResults.feeds[0] }; // Assuming feedResults.feeds[0] contains the updated feed data
          updatedFeeds.push(updatedFeed);
        } else {
          console.error(`Failed to fetch feed from ${feed.url}`);
          updatedFeeds.push(feed); // Keep the old feed if fetch fails
        }
      } catch (error) {
        console.error(`Error fetching feed from ${feed.url}:`, error);
        updatedFeeds.push(feed); // Keep the old feed if fetch fails
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