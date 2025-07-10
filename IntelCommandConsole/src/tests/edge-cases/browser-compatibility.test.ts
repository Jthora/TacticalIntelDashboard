/**
 * Edge Case Tests: Browser Compatibility
 * Tests for cross-browser localStorage behavior, CSS variables, and mobile quirks
 */

import { describe, test, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';

// Mock various browser environments
const createMockLocalStorage = (quirks: any = {}) => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      if (quirks.throwOnGet) throw new Error('localStorage not available');
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      if (quirks.throwOnSet) throw new DOMException('QuotaExceededError');
      if (quirks.limitSize && value.length > 1000) throw new DOMException('QuotaExceededError');
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock console to capture warnings
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
});

describe('Browser Compatibility Edge Cases', () => {
  
  describe('localStorage Variations', () => {
    test('should handle IE localStorage quirks', () => {
      // IE throws on localStorage access in some cases
      const ieLocalStorage = createMockLocalStorage({ throwOnGet: true });
      Object.defineProperty(window, 'localStorage', { value: ieLocalStorage });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Should handle gracefully and provide defaults
      const settings = SettingsIntegrationService.loadSettings();
      expect(typeof settings).toBe('object');
    });

    test('should handle Safari private mode localStorage', () => {
      // Safari private mode has 0 quota
      const safariPrivateStorage = createMockLocalStorage({ limitSize: true });
      Object.defineProperty(window, 'localStorage', { value: safariPrivateStorage });

      const largeSettings = {
        display: { theme: 'dark', density: 'compact', fontSize: 14 },
        cors: {
          defaultStrategy: 'RSS2JSON',
          protocolStrategies: {},
          services: {
            rss2json: Array(1000).fill('https://example.com/api'),
            corsProxies: Array(1000).fill('https://proxy.example.com')
          },
          fallbackChain: []
        }
      };

      expect(() => {
        // This should trigger quota exceeded
        safariPrivateStorage.setItem('test', JSON.stringify(largeSettings));
      }).toThrow();

      // Service should handle quota exceeded gracefully
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle Firefox localStorage security restrictions', () => {
      // Firefox throws security errors in some contexts
      const firefoxStorage = createMockLocalStorage({ throwOnSet: true });
      Object.defineProperty(window, 'localStorage', { value: firefoxStorage });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Should log appropriate warnings
      expect(console.error).toHaveBeenCalled();
    });

    test('should handle Chrome incognito mode restrictions', () => {
      // Chrome incognito has limited localStorage
      const incognitoStorage = createMockLocalStorage();
      
      // Mock quota exceeded after some data
      let dataStored = 0;
      incognitoStorage.setItem = jest.fn((_key: string, value: string) => {
        dataStored += value.length;
        if (dataStored > 5000) { // Simulate 5KB limit
          throw new DOMException('QuotaExceededError');
        }
        return value;
      });

      Object.defineProperty(window, 'localStorage', { value: incognitoStorage });

      expect(() => {
        for (let i = 0; i < 100; i++) {
          SettingsIntegrationService.loadSettings();
        }
      }).not.toThrow();
    });
  });

  describe('CSS Variables Support', () => {
    test('should handle browsers without CSS custom properties support', () => {
      // Mock older browser without CSS custom properties
      const mockStyleElement = {
        style: {
          setProperty: jest.fn(),
          removeProperty: jest.fn(),
          getPropertyValue: jest.fn(() => '')
        }
      };

      Object.defineProperty(document, 'documentElement', {
        value: mockStyleElement,
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();

      // Should attempt to set CSS properties
      expect(mockStyleElement.style.setProperty).toHaveBeenCalled();
    });

    test('should handle CSS variables that fail to apply', () => {
      // Mock style.setProperty to throw errors
      const mockStyleElement = {
        style: {
          setProperty: jest.fn(() => {
            throw new Error('CSS property not supported');
          }),
          removeProperty: jest.fn(),
          getPropertyValue: jest.fn(() => '')
        }
      };

      Object.defineProperty(document, 'documentElement', {
        value: mockStyleElement,
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();

      // Should handle CSS errors gracefully
      expect(console.error).toHaveBeenCalled();
    });

    test('should provide fallbacks for unsupported CSS features', () => {
      // Test with limited CSS support
      const limitedCSSElement = {
        style: {
          setProperty: jest.fn((prop: string) => {
            // Only support basic properties
            if (!['color', 'background-color', 'font-size'].includes(prop)) {
              throw new Error('Property not supported');
            }
          }),
          removeProperty: jest.fn(),
          getPropertyValue: jest.fn(() => '')
        }
      };

      Object.defineProperty(document, 'documentElement', {
        value: limitedCSSElement,
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();
    });
  });

  describe('Mobile Browser Quirks', () => {
    test('should handle mobile Safari localStorage limits', () => {
      // Mobile Safari has stricter localStorage limits
      const mobileSafariStorage = createMockLocalStorage();
      let totalStorage = 0;
      
      mobileSafariStorage.setItem = jest.fn((_key: string, value: string) => {
        totalStorage += value.length;
        if (totalStorage > 2048) { // 2KB limit simulation
          throw new DOMException('QuotaExceededError');
        }
      });

      Object.defineProperty(window, 'localStorage', { value: mobileSafariStorage });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle Android WebView localStorage issues', () => {
      // Android WebView sometimes has localStorage disabled
      Object.defineProperty(window, 'localStorage', { value: undefined });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Should provide sensible defaults
      const settings = SettingsIntegrationService.loadSettings();
      expect(typeof settings).toBe('object');
    });

    test('should handle mobile viewport and theme changes', () => {
      // Mock mobile viewport meta tag
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(viewportMeta);

      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();

      // Cleanup
      document.head.removeChild(viewportMeta);
    });
  });

  describe('Feature Detection', () => {
    test('should detect and handle missing Web APIs', () => {
      // Mock missing APIs
      const originalFetch = global.fetch;
      const originalPromise = global.Promise;
      const originalJSON = global.JSON;

      // Test without fetch
      delete (global as any).fetch;
      expect(() => {
        SettingsIntegrationService.getCORSStrategy();
      }).not.toThrow();

      // Test without Promise (very old browsers)
      delete (global as any).Promise;
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Test without JSON (IE7 and below)
      delete (global as any).JSON;
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Restore APIs
      global.fetch = originalFetch;
      global.Promise = originalPromise;
      global.JSON = originalJSON;
    });

    test('should handle limited DOM API support', () => {
      // Mock limited DOM support
      const originalQuerySelector = document.querySelector;
      const originalGetElementById = document.getElementById;

      document.querySelector = undefined as any;
      document.getElementById = undefined as any;

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();

      // Restore DOM methods
      document.querySelector = originalQuerySelector;
      document.getElementById = originalGetElementById;
    });

    test('should handle browsers without event listener support', () => {
      // Mock limited event support
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = undefined as any;

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Restore event listener
      window.addEventListener = originalAddEventListener;
    });
  });

  describe('Performance Variations', () => {
    test('should handle slow localStorage operations', async () => {
      // Mock slow localStorage
      const slowStorage = createMockLocalStorage();
      slowStorage.getItem = jest.fn((_key: string) => {
        // Simulate slow operation
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Busy wait for 100ms
        }
        return null;
      });

      Object.defineProperty(window, 'localStorage', { value: slowStorage });

      const startTime = performance.now();
      
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should still complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second max
    });

    test('should handle memory-constrained environments', () => {
      // Simulate low memory environment
      const originalPerformance = global.performance;
      
      global.performance = {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 900 * 1024 * 1024, // 900MB used
          totalJSHeapSize: 1024 * 1024 * 1024, // 1GB total
          jsHeapSizeLimit: 1024 * 1024 * 1024
        }
      } as any;

      expect(() => {
        // Should work even in low memory
        for (let i = 0; i < 100; i++) {
          SettingsIntegrationService.loadSettings();
        }
      }).not.toThrow();

      global.performance = originalPerformance;
    });
  });

  describe('Accessibility Edge Cases', () => {
    test('should handle high contrast mode', () => {
      // Mock Windows high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn(() => ({
          matches: true,
          addListener: jest.fn(),
          removeListener: jest.fn()
        }))
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();
    });

    test('should handle reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn((query: string) => ({
          matches: query.includes('prefers-reduced-motion'),
          addListener: jest.fn(),
          removeListener: jest.fn()
        }))
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();
    });

    test('should handle screen reader compatibility', () => {
      // Mock screen reader environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'JAWS/2021.2008.24 Chrome/91.0.4472.124',
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();
    });
  });

  describe('Network Environment Variations', () => {
    test('should handle offline environments', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.getCORSStrategy();
        SettingsIntegrationService.getCORSProxyChain();
      }).not.toThrow();
    });

    test('should handle slow network connections', () => {
      // Mock slow connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          downlink: 0.25,
          rtt: 2000
        },
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle corporate firewall restrictions', () => {
      // Mock restricted environment
      const restrictedFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
      restrictedFetch.mockRejectedValue(new Error('Blocked by firewall'));
      global.fetch = restrictedFetch;

      expect(() => {
        SettingsIntegrationService.getCORSProxyChain();
      }).not.toThrow();

      // Should handle blocked requests gracefully
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('critical')
      );
    });
  });
});
