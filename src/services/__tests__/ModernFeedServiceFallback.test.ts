import { afterEach, describe, expect, test } from '@jest/globals';

import { MissionMode } from '../../constants/MissionMode';
import { getSourceById } from '../../constants/MissionSourceRegistry';
import { NormalizedDataItem } from '../../types/ModernAPITypes';
import { modernAPIService } from '../ModernAPIService';
import { modernFeedService } from '../ModernFeedService';

describe('ModernFeedService fallback handling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    const internals = modernFeedService as unknown as {
      lastFetchTime: Map<string, number>;
      cachedResults: Map<string, NormalizedDataItem[]>;
    };
    internals.lastFetchTime.clear();
    internals.cachedResults.clear();
  });

  test('falls back to next proxy when the primary OCCRP path yields no data', async () => {
  modernFeedService.setMissionMode(MissionMode.MILTECH);
  const source = getSourceById(MissionMode.MILTECH, 'occrp-investigations');
    expect(source).toBeDefined();

    const mockItem: NormalizedDataItem = {
      id: 'occrp-test-item',
      title: 'Sample OCCRP Investigation',
      summary: 'Summary of OCCRP investigation.',
      url: 'https://www.occrp.org/en/investigation/sample',
      publishedAt: new Date(),
      source: 'OCCRP Investigations',
      category: 'investigative',
      tags: ['investigative', 'occrp'],
      priority: 'high',
      trustRating: 90,
      verificationStatus: 'VERIFIED',
      dataQuality: 85,
      metadata: {}
    };

    const spy = jest
      .spyOn(modernAPIService, 'fetchIntelligenceData')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockItem]);

    const results = await modernFeedService.fetchSourceData(source!, true);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: mockItem.id, source: mockItem.source });
  });
});
