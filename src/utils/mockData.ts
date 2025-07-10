// Mock RSS data for development when proxies fail
export const mockRSSFeeds = [
  {
    id: 'mock-1',
    title: 'Mock News Article 1',
    link: 'https://example.com/article1',
    pubDate: new Date().toISOString(),
    description: 'This is a mock news article for development testing when RSS feeds cannot be fetched due to CORS issues.',
    content: 'Full content of mock article 1. This demonstrates how the feed reader would display actual news content.',
    feedListId: '1',
    author: 'Mock Author',
    categories: ['Technology', 'Development'],
    media: [],
  },
  {
    id: 'mock-2',
    title: 'Mock News Article 2',
    link: 'https://example.com/article2',
    pubDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    description: 'Another mock news article showing how multiple articles would appear in the feed.',
    content: 'Full content of mock article 2. This helps developers see the layout and functionality.',
    feedListId: '1',
    author: 'Mock Reporter',
    categories: ['News', 'Testing'],
    media: [],
  },
  {
    id: 'mock-3',
    title: 'Mock Breaking News',
    link: 'https://example.com/breaking',
    pubDate: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    description: 'Breaking: Mock development environment working correctly with fallback data.',
    content: 'This breaking news demonstrates that the RSS reader gracefully handles proxy failures.',
    feedListId: '1',
    author: 'Dev Team',
    categories: ['Breaking', 'Development'],
    media: [],
  }
];

export const createMockFeedResults = (url: string) => {
  return {
    feeds: mockRSSFeeds.map((feed, index) => ({
      ...feed,
      id: `${url}-mock-${index}`,
      source: `Mock data for ${url}`,
    })),
    fetchedAt: new Date().toISOString(),
  };
};
