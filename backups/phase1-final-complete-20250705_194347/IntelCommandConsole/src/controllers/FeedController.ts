import { FeedResults, FeedItem } from '../types/FeedTypes';
import { fetchFeed } from '../utils/fetchFeed';

interface FetchedFeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  feedListId: string;
  author?: string;
  categories?: string[];
  media?: { url: string, type: string }[];
}

interface FetchedFeedResults {
  feeds: FetchedFeedItem[];
}

class FeedController {
  private feedResultsCache: Map<string, FeedResults> = new Map();
  private cacheExpiryTime: number = 1000 * 60 * 5; // Cache expiry time set to 5 minutes

  public async fetchAndParseFeed(url: string): Promise<FeedResults | null> {
    try {
      const cachedResult = this.getCachedFeedResults(url);
      if (cachedResult) {
        console.log(`Returning cached results for URL: ${url}`);
        return cachedResult;
      }

      console.log(`Fetching feed for URL: ${url}`);
      const fetchedFeedResults = await fetchFeed(url);
      if (fetchedFeedResults) {
        const feedResults = this.convertFeedResults(fetchedFeedResults);
        this.cacheFeedResults(url, feedResults);
        return feedResults;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch and parse feed for URL: ${url}`, error);
      return null;
    }
  }

  private convertFeedResults(fetchedFeedResults: FetchedFeedResults): FeedResults {
    const feeds: FeedItem[] = fetchedFeedResults.feeds.map((feed: FetchedFeedItem) => ({
      id: feed.id,
      title: feed.title,
      link: feed.link,
      pubDate: feed.pubDate,
      description: feed.description || '',
      content: feed.content || '',
      feedListId: feed.feedListId,
      author: feed.author,
      categories: feed.categories,
      media: feed.media,
    }));

    return {
      feeds,
      fetchedAt: new Date().toISOString(),
    };
  }

  private cacheFeedResults(url: string, feedResults: FeedResults) {
    this.feedResultsCache.set(url, feedResults);
    console.log(`Feed fetched and cached for URL: ${url}`);
  }

  public getFeedResults(url: string): FeedResults | null {
    try {
      const cachedResult = this.getCachedFeedResults(url);
      if (cachedResult) {
        console.log(`Returning cached results for URL: ${url}`);
        return cachedResult;
      }
      console.warn(`No cached results found for URL: ${url}`);
      return null;
    } catch (error) {
      console.error(`Failed to get feed results for URL: ${url}`, error);
      return null;
    }
  }

  private getCachedFeedResults(url: string): FeedResults | null {
    const cachedResult = this.feedResultsCache.get(url);
    if (cachedResult) {
      const cacheAge = new Date().getTime() - new Date(cachedResult.fetchedAt).getTime();
      if (cacheAge < this.cacheExpiryTime) {
        return cachedResult;
      } else {
        console.log(`Cache expired for URL: ${url}`);
        this.feedResultsCache.delete(url);
      }
    }
    return null;
  }

  public clearCache() {
    console.log('Clearing feed results cache');
    this.feedResultsCache.clear();
  }

  public removeCacheEntry(url: string) {
    if (this.feedResultsCache.has(url)) {
      console.log(`Removing cache entry for URL: ${url}`);
      this.feedResultsCache.delete(url);
    } else {
      console.warn(`No cache entry found for URL: ${url}`);
    }
  }

  public getCacheStatus(): { [url: string]: string } {
    const status: { [url: string]: string } = {};
    this.feedResultsCache.forEach((value, key) => {
      status[key] = value.fetchedAt;
    });
    return status;
  }
}

export default new FeedController();