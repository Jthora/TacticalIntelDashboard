import { Feed } from '../models/Feed';
import PersistentStorage from '../components/common/PersistentStorage';

class FeedService {
  private feeds: Feed[];

  constructor() {
    this.feeds = PersistentStorage.getFeeds() || [];
  }

  getFeeds(): Feed[] {
    return this.feeds;
  }

  addFeed(feed: Feed): void {
    this.feeds.push(feed);
    this.saveFeeds();
  }

  removeFeed(feedId: string): void {
    this.feeds = this.feeds.filter(feed => feed.id !== feedId);
    this.saveFeeds();
  }

  private saveFeeds(): void {
    PersistentStorage.saveFeeds(this.feeds);
  }
}

export default new FeedService();