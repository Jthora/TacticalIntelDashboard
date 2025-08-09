/**
 * Unit tests for EnhancedFeedFetcherService
 */
import { afterEach,beforeEach, describe, expect, jest, test } from '@jest/globals';

import { FeedMode } from '../../../../constants/EarthAllianceDefaultFeeds';
import { EARTH_ALLIANCE_SOURCES } from '../../../../constants/EarthAllianceSources';
import { protocolAdapter } from '../../../../constants/SourceProtocolAdapter';
import { EnhancedFeedFetcherService } from '../EnhancedFeedFetcherService';

// Mock the protocol adapter
jest.mock('../../../../constants/SourceProtocolAdapter', () => {
  return {
    protocolAdapter: {
      fetchAndParse: jest.fn()
    }
  };
});

// Mock the EarthAllianceDefaultFeeds
jest.mock('../../../../constants/EarthAllianceDefaultFeeds', () => {
  return {
    FeedMode: {
      EARTH_ALLIANCE: 'EARTH_ALLIANCE',
      MAINSTREAM: 'MAINSTREAM',
      HYBRID: 'HYBRID'
    },
    getFeedsByMode: jest.fn().mockImplementation((mode) => {
      if (mode === 'EARTH_ALLIANCE') {
        return [
          { id: 'ea-1', title: 'EA Article 1', link: 'https://ea-source.com/1', description: 'Description 1' },
          { id: 'ea-2', title: 'EA Article 2', link: 'https://ea-source.com/2', description: 'Description 2' }
        ];
      } else {
        return [
          { id: 'ms-1', title: 'MS Article 1', link: 'https://ms-source.com/1', description: 'Description 1' },
          { id: 'ms-2', title: 'MS Article 2', link: 'https://ms-source.com/2', description: 'Description 2' }
        ];
      }
    })
  };
});

describe('EnhancedFeedFetcherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchFeed', () => {
    test('should fetch feed data using protocol adapter', async () => {
      // Arrange
      const url = 'https://test-source.com/feed';
      const mockData = [{ title: 'Test Article', link: 'https://test-source.com/article' }];
      (protocolAdapter.fetchAndParse as jest.Mock).mockResolvedValueOnce(mockData);

      // Act
      const result = await EnhancedFeedFetcherService.fetchFeed(url);

      // Assert
      expect(protocolAdapter.fetchAndParse).toHaveBeenCalledWith(url);
      expect(result).toEqual(mockData);
    });

    test('should throw error when protocol adapter fails', async () => {
      // Arrange
      const url = 'https://test-source.com/feed';
      const mockError = new Error('Failed to fetch');
      (protocolAdapter.fetchAndParse as jest.Mock).mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(EnhancedFeedFetcherService.fetchFeed(url)).rejects.toThrow(mockError);
    });
  });

  describe('getSourceForEndpoint', () => {
    test('should return source for valid endpoint', () => {
      // Arrange
      const validEndpoint = EARTH_ALLIANCE_SOURCES[0].endpoint;

      // Act
      const result = EnhancedFeedFetcherService.getSourceForEndpoint(validEndpoint);

      // Assert
      expect(result).toEqual(EARTH_ALLIANCE_SOURCES[0]);
    });

    test('should return undefined for invalid endpoint', () => {
      // Arrange
      const invalidEndpoint = 'https://invalid-endpoint.com/feed';

      // Act
      const result = EnhancedFeedFetcherService.getSourceForEndpoint(invalidEndpoint);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('convertToFeeds', () => {
    test('should convert items to Feed objects with source info', () => {
      // Arrange
      const endpoint = EARTH_ALLIANCE_SOURCES[0].endpoint;
      const items = [
        { title: 'Test Article 1', link: 'https://source.com/article1', description: 'Description 1' },
        { title: 'Test Article 2', link: 'https://source.com/article2', description: 'Description 2' }
      ];

      // Act
      const result = EnhancedFeedFetcherService.convertToFeeds(items, endpoint);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Test Article 1');
      expect(result[0].source).toBe(EARTH_ALLIANCE_SOURCES[0].name);
      expect(result[0].sourceInfo).toEqual(EARTH_ALLIANCE_SOURCES[0]);
      expect(result[0].feedListId).toBe('2'); // Earth Alliance feed list
    });

    test('should handle items with missing properties', () => {
      // Arrange
      const endpoint = 'https://unknown-source.com/feed';
      const items = [
        { }
      ];

      // Act
      const result = EnhancedFeedFetcherService.convertToFeeds(items, endpoint);

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('No Title');
      expect(result[0].source).toBe('Unknown Source');
      expect(result[0].description).toBe('No Description');
    });
  });

  describe('getFeedsByMode', () => {
    test('should get Earth Alliance feeds by mode', async () => {
      // Act
      const result = await EnhancedFeedFetcherService.getFeedsByMode(FeedMode.EARTH_ALLIANCE);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('EA Article 1');
      expect(result[0].source).toBe('Earth Alliance');
      expect(result[0].feedListId).toBe('2');
    });

    test('should get Mainstream feeds by mode', async () => {
      // Act
      const result = await EnhancedFeedFetcherService.getFeedsByMode(FeedMode.MAINSTREAM);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].title).toBe('MS Article 1');
      expect(result[0].source).toBe('Mainstream');
      expect(result[0].feedListId).toBe('1');
    });
  });
});
