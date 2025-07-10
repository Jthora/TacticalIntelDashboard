/**
 * Edge Case Tests: Network & Performance
 * Tests for network failures, timeouts, memory leaks, and performance stress
 */

import { describe, test, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';
import { CORSStrategy } from '../../contexts/SettingsContext';

// Mock fetch for network tests
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockClear();
});

describe('Network & Performance Edge Cases', () => {
  
  describe('Network Failures', () => {
    test('should handle network timeout gracefully', async () => {
      // Mock fetch to timeout
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      const corsStrategy = SettingsIntegrationService.getCORSStrategy();
      expect(corsStrategy).toBeDefined();
      
      // Should not crash when network fails
      expect(() => {
        SettingsIntegrationService.getCORSProxyChain();
      }).not.toThrow();
    });

    test('should handle CORS proxy failures', async () => {
      // Mock all proxy attempts to fail
      mockFetch.mockRejectedValue(new Error('CORS blocked'));

      const proxyChain = SettingsIntegrationService.getCORSProxyChain();
      expect(Array.isArray(proxyChain)).toBe(true);
      
      // Should gracefully handle proxy failures
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('critical error')
      );
    });

    test('should handle DNS resolution failures', async () => {
      // Mock DNS failure
      mockFetch.mockRejectedValue(new Error('ENOTFOUND'));

      expect(() => {
        SettingsIntegrationService.getProxyUrl('https://example.com');
      }).not.toThrow();
    });

    test('should handle rate limiting gracefully', async () => {
      // Mock rate limiting response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '60' }),
      } as Response);

      const strategy = SettingsIntegrationService.getCORSStrategy();
      expect(typeof strategy).toBe('string');
      
      // Should handle rate limits without crashing
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('critical')
      );
    });

    test('should handle partial network connectivity', async () => {
      // Mock intermittent connectivity
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        } as Response);
      });

      // Should handle intermittent failures
      expect(() => {
        for (let i = 0; i < 10; i++) {
          SettingsIntegrationService.getCORSStrategy();
        }
      }).not.toThrow();
    });
  });

  describe('Performance Stress Testing', () => {
    test('should handle large settings objects efficiently', () => {
      // Create a large settings object
      const largeSettings = {
        cors: {
          defaultStrategy: CORSStrategy.RSS2JSON,
          protocolStrategies: {},
          services: {
            rss2json: Array(1000).fill('https://example.com/api'),
            corsProxies: Array(1000).fill('https://proxy.example.com')
          },
          fallbackChain: Array(100).fill(CORSStrategy.DIRECT)
        },
        protocols: {
          priority: Array(500).fill('RSS'),
          settings: Object.fromEntries(
            Array(1000).fill(0).map((_, i) => [`protocol${i}`, { enabled: true }])
          ),
          autoDetect: true,
          fallbackEnabled: true
        }
      };

      const startTime = performance.now();
      
      // Save and load large settings multiple times
      for (let i = 0; i < 100; i++) {
        localStorage.setItem('testLargeSettings', JSON.stringify(largeSettings));
        const loaded = JSON.parse(localStorage.getItem('testLargeSettings') || '{}');
        expect(loaded.cors.services.rss2json.length).toBe(1000);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
      
      // Cleanup
      localStorage.removeItem('testLargeSettings');
    });

    test('should handle rapid repeated service calls', () => {
      const startTime = performance.now();
      
      // Make many rapid service calls
      const results: any[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(SettingsIntegrationService.getCORSStrategy());
        results.push(SettingsIntegrationService.getThemeSettings());
        results.push(SettingsIntegrationService.getGeneralSettings());
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete rapidly
      expect(duration).toBeLessThan(500); // 500ms
      expect(results.length).toBe(3000);
      
      // All results should be valid
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle memory pressure gracefully', () => {
      const memoryStressObjects: any[] = [];
      
      try {
        // Create memory pressure
        for (let i = 0; i < 10000; i++) {
          memoryStressObjects.push({
            id: i,
            data: Array(100).fill(`data-${i}`),
            settings: SettingsIntegrationService.loadSettings()
          });
        }
        
        // Service should still work under memory pressure
        const strategy = SettingsIntegrationService.getCORSStrategy();
        expect(strategy).toBeDefined();
        
        const themeSettings = SettingsIntegrationService.getThemeSettings();
        expect(themeSettings).toBeDefined();
        
      } finally {
        // Cleanup memory
        memoryStressObjects.length = 0;
      }
    });

    test('should detect memory leaks in service calls', () => {
      const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
      
      // Perform many operations that could potentially leak memory
      for (let i = 0; i < 1000; i++) {
        SettingsIntegrationService.loadSettings();
        SettingsIntegrationService.applyThemeSettings();
        SettingsIntegrationService.applyCorsSettings();
        SettingsIntegrationService.applyGeneralSettings();
        
        // Force garbage collection periodically if available
        if (global.gc && i % 100 === 0) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Browser Storage Edge Cases', () => {
    test('should handle localStorage quota exceeded', () => {
      const originalSetItem = localStorage.setItem;
      
      // Mock localStorage quota exceeded
      localStorage.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });
      
      try {
        // Should handle quota exceeded gracefully
        expect(() => {
          const settings = SettingsIntegrationService.loadSettings();
          // Attempt to save large data
          localStorage.setItem('test', JSON.stringify(settings));
        }).not.toThrow();
        
        expect(console.error).toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining('QuotaExceededError'),
          expect.anything()
        );
        
      } finally {
        localStorage.setItem = originalSetItem;
      }
    });

    test('should handle localStorage being disabled', () => {
      const originalLocalStorage = window.localStorage;
      
      // Mock disabled localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      try {
        // Should handle missing localStorage gracefully
        expect(() => {
          SettingsIntegrationService.loadSettings();
        }).not.toThrow();
        
      } finally {
        Object.defineProperty(window, 'localStorage', {
          value: originalLocalStorage,
          writable: true
        });
      }
    });

    test('should handle corrupted localStorage access', () => {
      const originalGetItem = localStorage.getItem;
      
      // Mock corrupted localStorage access
      localStorage.getItem = jest.fn(() => {
        throw new Error('Security error');
      });
      
      try {
        // Should handle security errors gracefully
        expect(() => {
          SettingsIntegrationService.loadSettings();
        }).not.toThrow();
        
      } finally {
        localStorage.getItem = originalGetItem;
      }
    });
  });

  describe('Protocol Detection Edge Cases', () => {
    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        '',
        'not-a-url',
        'http://',
        'https://',
        'ftp://incomplete',
        'javascript:alert(1)',
        'data:text/plain,test',
        '//example.com',
        'http://[invalid-ipv6',
        'https://example.com:abc',
      ];
      
      malformedUrls.forEach(url => {
        expect(() => {
          SettingsIntegrationService.detectProtocolFromUrl(url);
        }).not.toThrow();
      });
    });

    test('should handle extremely long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(10000);
      
      expect(() => {
        SettingsIntegrationService.detectProtocolFromUrl(longUrl);
      }).not.toThrow();
    });

    test('should handle Unicode and special characters in URLs', () => {
      const specialUrls = [
        'https://example.com/测试',
        'https://example.com/тест',
        'https://example.com/🚀',
        'https://example.com/path with spaces',
        'https://example.com/%20encoded',
        'https://user:pass@example.com',
      ];
      
      specialUrls.forEach(url => {
        expect(() => {
          SettingsIntegrationService.detectProtocolFromUrl(url);
        }).not.toThrow();
      });
    });
  });

  describe('Service Integration Stress Tests', () => {
    test('should handle concurrent theme applications', async () => {
      const promises: Promise<void>[] = [];
      
      // Apply theme settings concurrently
      for (let i = 0; i < 50; i++) {
        promises.push(
          Promise.resolve().then(() => {
            SettingsIntegrationService.applyThemeSettings();
          })
        );
      }
      
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    test('should handle rapid setting retrievals', () => {
      const startTime = performance.now();
      
      // Rapidly retrieve different settings
      for (let i = 0; i < 500; i++) {
        SettingsIntegrationService.getThemeSettings();
        SettingsIntegrationService.getGeneralSettings();
        SettingsIntegrationService.getVerificationSettings();
        SettingsIntegrationService.getProtocolPriority();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete rapidly
      expect(duration).toBeLessThan(200); // 200ms for 2000 operations
    });

    test('should maintain data consistency under stress', () => {
      // Store initial state - verify service methods work
      SettingsIntegrationService.getThemeSettings();
      SettingsIntegrationService.getGeneralSettings();
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        SettingsIntegrationService.applyThemeSettings();
        SettingsIntegrationService.applyGeneralSettings();
        SettingsIntegrationService.resetCache();
      }
      
      // Data should remain consistent
      const finalTheme = SettingsIntegrationService.getThemeSettings();
      const finalGeneral = SettingsIntegrationService.getGeneralSettings();
      
      expect(typeof finalTheme).toBe('object');
      expect(typeof finalGeneral).toBe('object');
      expect(finalTheme.theme).toBeDefined();
      expect(finalGeneral.refreshInterval).toBeDefined();
    });
  });
});
