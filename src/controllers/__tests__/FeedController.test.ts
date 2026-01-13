import FeedController from '../FeedController';
import { fetchFeed } from '../../utils/fetchFeed';

jest.mock('../../utils/fetchFeed', () => ({
  fetchFeed: jest.fn()
}));

type MockedFetchFeed = jest.MockedFunction<typeof fetchFeed>;

const mockFeedResults = {
  feeds: [
    {
      id: '1',
      title: 'Test Item',
      link: 'https://example.com/article',
      pubDate: '2024-01-01T00:00:00Z',
      description: 'Desc',
      content: 'Body',
      feedListId: 'list-1'
    }
  ],
  fetchedAt: '2024-01-01T00:00:00Z'
};

const mockFeedUrl = 'https://example.com/feed';

describe('FeedController', () => {
  const mockedFetch = fetchFeed as MockedFetchFeed;

  beforeEach(() => {
    mockedFetch.mockReset();
    FeedController.clearCache();
  });

  it('fetches and caches feed results', async () => {
    mockedFetch.mockResolvedValue(mockFeedResults);

    const firstResult = await FeedController.fetchAndParseFeed(mockFeedUrl);

    expect(firstResult?.feeds).toHaveLength(1);
    expect(firstResult?.feeds[0].id).toBe('1');
    expect(mockedFetch).toHaveBeenCalledTimes(1);

    const secondResult = await FeedController.fetchAndParseFeed(mockFeedUrl);

    expect(secondResult?.feeds[0].title).toBe('Test Item');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it('returns cached result via getFeedResults', async () => {
    mockedFetch.mockResolvedValue(mockFeedResults);

    await FeedController.fetchAndParseFeed(mockFeedUrl);
    const cached = FeedController.getFeedResults(mockFeedUrl);

    expect(cached?.feeds[0].link).toBe('https://example.com/article');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
