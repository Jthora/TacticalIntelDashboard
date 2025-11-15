import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';

import { MissionMode } from '../../constants/MissionMode';
import { NormalizedDataItem } from '../../types/ModernAPITypes';
import { LocalStorageUtil } from '../../utils/LocalStorageUtil';
import { SourceToggleStore } from '../../utils/SourceToggleStore';
import { modernAPIService } from '../ModernAPIService';
import { modernFeedService } from '../ModernFeedService';

describe('ModernFeedService mission mode switching', () => {
  const getInternals = () => modernFeedService as unknown as {
    lastFetchTime: Map<string, number>;
    cachedResults: Map<string, NormalizedDataItem[]>;
  };

  beforeEach(() => {
    modernFeedService.setMissionMode(MissionMode.MILTECH);
    const internals = getInternals();
    internals.cachedResults.clear();
    internals.lastFetchTime.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    const internals = getInternals();
    internals.cachedResults.clear();
    internals.lastFetchTime.clear();
  });

  test('setMissionMode is a no-op if the mode is unchanged', () => {
    const setActiveSpy = jest.spyOn(SourceToggleStore, 'setActiveMode');
    const clearCacheSpy = jest.spyOn(modernAPIService, 'clearCache');
    const removeItemSpy = jest.spyOn(LocalStorageUtil, 'removeItem');

    modernFeedService.setMissionMode(MissionMode.MILTECH);

    expect(setActiveSpy).not.toHaveBeenCalled();
    expect(clearCacheSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();
  });

  test('setMissionMode flushes caches and rebinds dependencies when changing mode', () => {
    const setActiveSpy = jest.spyOn(SourceToggleStore, 'setActiveMode');
    const clearCacheSpy = jest.spyOn(modernAPIService, 'clearCache').mockImplementation(() => {});
    const removeItemSpy = jest.spyOn(LocalStorageUtil, 'removeItem').mockImplementation(() => {});

    const internals = getInternals();
    const sampleItem: NormalizedDataItem = {
      id: 'cache-item-1',
      title: 'Cached Item',
      summary: 'Cached summary',
      url: 'https://example.com/item',
      publishedAt: new Date(),
      source: 'Test Source',
      category: 'test',
      tags: ['test'],
      priority: 'low',
      trustRating: 50,
      verificationStatus: 'VERIFIED',
      dataQuality: 50
    };

    internals.cachedResults.set('MILTECH:test', [sampleItem]);
    internals.lastFetchTime.set('MILTECH:test', Date.now());

    modernFeedService.setMissionMode(MissionMode.SPACEFORCE);

    expect(setActiveSpy).toHaveBeenCalledWith(MissionMode.SPACEFORCE);
    expect(clearCacheSpy).toHaveBeenCalledTimes(1);
    expect(removeItemSpy).toHaveBeenCalledWith(expect.stringContaining('modernFeedCache:SPACEFORCE'));
    expect(internals.cachedResults.size).toBe(0);
    expect(internals.lastFetchTime.size).toBe(0);
  });
});
