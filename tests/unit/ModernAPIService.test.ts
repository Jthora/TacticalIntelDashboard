/**
 * Unit Tests for ModernAPIService
 * Critical Test Scenario 2: API Service Integration
 * Tests TDD_ERROR_008 through TDD_ERROR_022
 */

import { ModernAPIService } from '../../src/services/ModernAPIService';
import { APIEndpoint } from '../../src/types/ModernAPITypes';

// Mock fetch for testing
global.fetch = jest.fn();

describe('ModernAPIService', () => {
  
  let apiService: ModernAPIService;
  
  beforeEach(() => {
    apiService = new ModernAPIService();
    (fetch as jest.Mock).mockClear();
  });

  describe('TDD_TEST_008-015: Service Initialization and Configuration', () => {
    
    test('TDD_TEST_008: Should initialize ModernAPIService correctly', () => {
      // Expected Log: TDD_SUCCESS_008
      expect(apiService).toBeDefined();
      expect(apiService).toBeInstanceOf(ModernAPIService);
    });

    test('TDD_TEST_009: Should have fetchFromAPI method', () => {
      // Expected Log: TDD_SUCCESS_009
      expect(typeof apiService.fetchFromAPI).toBe('function');
    });

    test('TDD_TEST_010: Should have fetchIntelligenceData method', () => {
      // Expected Log: TDD_SUCCESS_010
      expect(typeof apiService.fetchIntelligenceData).toBe('function');
    });

    test('TDD_TEST_011: Should have fetchMultipleEndpoints method', () => {
      // Expected Log: TDD_SUCCESS_011
      expect(typeof apiService.fetchMultipleEndpoints).toBe('function');
    });
  });

  describe('TDD_TEST_012-018: API Data Fetching', () => {
    
    const mockAPIEndpoint: APIEndpoint = {
      id: 'test-endpoint',
      name: 'Test API',
      baseUrl: 'https://api.test.com',
      apiPaths: {
        data: '/data'
      },
      authRequired: false,
      rateLimitPerMinute: 60,
      corsEnabled: true,
      reliability: 8
    };

    const mockResponse = {
      status: 'success',
      data: [
        {
          title: 'Test Data Item',
          description: 'Test description',
          timestamp: '2025-01-01T12:00:00Z'
        }
      ]
    };

    test('TDD_TEST_012: Should fetch intelligence data successfully', async () => {
      // Expected Log: TDD_SUCCESS_012
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.fetchIntelligenceData(
        mockAPIEndpoint,
        '/data',
        'normalizeGenericData'
      );
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('TDD_TEST_013: Should handle API fetch errors gracefully', async () => {
      // Expected Log: TDD_ERROR_013
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.fetchIntelligenceData(
        mockAPIEndpoint,
        '/data',
        'normalizeGenericData'
      );
      
      expect(result).toEqual([]);
    });

    test('TDD_TEST_014: Should fetch from multiple endpoints successfully', async () => {
      // Expected Log: TDD_SUCCESS_014
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const requests = [
        {
          endpoint: mockAPIEndpoint,
          apiPath: '/data1',
          normalizer: 'normalizeGenericData'
        },
        {
          endpoint: mockAPIEndpoint,
          apiPath: '/data2',
          normalizer: 'normalizeGenericData'
        }
      ];

      const result = await apiService.fetchMultipleEndpoints(requests);
      
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('TDD_TEST_015: Should handle multiple endpoint errors gracefully', async () => {
      // Expected Log: TDD_ERROR_015
      (fetch as jest.Mock).mockRejectedValue(new Error('API error'));

      const requests = [
        {
          endpoint: mockAPIEndpoint,
          apiPath: '/data',
          normalizer: 'normalizeGenericData'
        }
      ];

      const result = await apiService.fetchMultipleEndpoints(requests);
      
      expect(result).toEqual([]);
    });

    test('TDD_TEST_016: Should use proper CORS headers for API requests', async () => {
      // Expected Log: TDD_SUCCESS_016
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await apiService.fetchIntelligenceData(
        mockAPIEndpoint,
        '/data',
        'normalizeGenericData'
      );
      
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestInit = fetchCall[1];
      
      expect(requestInit).toHaveProperty('mode');
      expect(requestInit.mode).toBe('cors');
    });

    test('TDD_TEST_017: Should handle HTTP error responses', async () => {
      // Expected Log: TDD_ERROR_017
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await apiService.fetchIntelligenceData(
        mockAPIEndpoint,
        '/data',
        'normalizeGenericData'
      );
      
      expect(result).toEqual([]);
    });

    test('TDD_TEST_018: Should handle malformed JSON responses', async () => {
      // Expected Log: TDD_ERROR_018
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await apiService.fetchIntelligenceData(
        mockAPIEndpoint,
        '/data',
        'normalizeGenericData'
      );
      
      expect(result).toEqual([]);
    });
  });

  describe('TDD_TEST_019-022: Error Handling and Resilience', () => {
    
    test('TDD_TEST_019: Should handle HTTP error responses', async () => {
      // Expected Log: TDD_ERROR_019
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await apiService.fetchNewsData();
      
      expect(result).toEqual([]);
    });

    test('TDD_TEST_020: Should handle malformed JSON responses', async () => {
      // Expected Log: TDD_ERROR_020
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await apiService.fetchNewsData();
      
      expect(result).toEqual([]);
    });

    test('TDD_TEST_021: Should handle network timeouts', async () => {
      // Expected Log: TDD_ERROR_021
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await apiService.fetchNewsData();
      
      expect(result).toEqual([]);
    });

    test('TDD_TEST_022: Should provide consistent error recovery', async () => {
      // Expected Log: TDD_SUCCESS_022
      const service = new ModernAPIService();
      
      // First call fails
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('First call fails'));
      const firstResult = await service.fetchNewsData();
      expect(firstResult).toEqual([]);
      
      // Second call succeeds
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsResponse
      });
      const secondResult = await service.fetchNewsData();
      expect(Array.isArray(secondResult)).toBe(true);
    });
  });

  describe('TDD_INTEGRATION_001: Service Integration Points', () => {
    
    test('Should support being called by ModernFeedService', () => {
      // This test verifies the service can be integrated with ModernFeedService
      expect(apiService.fetchNewsData).toBeDefined();
      expect(apiService.fetchWeatherData).toBeDefined();
      expect(apiService.fetchSecurityData).toBeDefined();
      
      // All methods should return promises
      expect(apiService.fetchNewsData()).toBeInstanceOf(Promise);
      expect(apiService.fetchWeatherData()).toBeInstanceOf(Promise);
      expect(apiService.fetchSecurityData()).toBeInstanceOf(Promise);
    });
  });
});
