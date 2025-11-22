import { MissionMode } from '../../constants/MissionMode';
import { INVESTIGATIVE_RSS_API } from '../../constants/APIEndpoints';
import { modernAPIService } from '../ModernAPIService';
import { modernFeedService } from '../ModernFeedService';
import type { IntelligenceSource, NormalizedDataItem } from '../../types/ModernAPITypes';

jest.mock('../MarqueeProjectionService', () => ({
  marqueeProjectionService: {
    ingest: jest.fn()
  }
}));

describe('ModernFeedService empty cache retry logic', () => {
  const emptyCacheTestSource: IntelligenceSource = {
    id: 'test-empty-cache-source',
    name: 'Test Empty Cache Source',
    description: 'Synthetic source used to verify empty cache retry behavior.',
    endpoint: INVESTIGATIVE_RSS_API,
    normalizer: 'normalizeGeopoliticalRSS',
    refreshInterval: 1_200_000,
    enabled: true,
    tags: ['space', 'test'],
    healthScore: 88
  };

  const makeNormalizedItems = (): NormalizedDataItem[] => [
    {
      id: 'test-item-1',
      title: 'Test Source Alert',
      summary: 'Simulated conjunction warning.',
      url: 'https://example.com/empty-cache',
      publishedAt: new Date(),
      source: 'Test Empty Cache Source',
      category: 'space',
      tags: ['space', 'debris'],
      priority: 'high',
      trustRating: 80,
      verificationStatus: 'VERIFIED',
      dataQuality: 75
    }
  ];

  let fetchSpy: jest.SpiedFunction<typeof modernAPIService.fetchIntelligenceData>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    fetchSpy = jest.spyOn(modernAPIService, 'fetchIntelligenceData');

    // Flip mission modes to guarantee caches are cleared between tests
    modernFeedService.setMissionMode(MissionMode.MILTECH);
    modernFeedService.setMissionMode(MissionMode.SPACEFORCE);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    jest.useRealTimers();
  });

  it('retries fetching shortly after an empty cache placeholder expires', async () => {
    fetchSpy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(makeNormalizedItems());

    const firstFetch = await modernFeedService.fetchSourceData(emptyCacheTestSource, true);
    expect(firstFetch.items).toHaveLength(0);
    expect(firstFetch.diagnostic.status).toBe('empty');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const immediateRetry = await modernFeedService.fetchSourceData(emptyCacheTestSource, false);
    expect(immediateRetry.items).toHaveLength(0);
    expect(immediateRetry.diagnostic.notes).toContain('Empty cache placeholder');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(61_000);

    const secondFetch = await modernFeedService.fetchSourceData(emptyCacheTestSource, false);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(secondFetch.items).toHaveLength(1);
    expect(secondFetch.diagnostic.status).toBe('success');
  });
});
