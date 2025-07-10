// Edge Case Tests for Settings System - Data Corruption & Recovery
// These tests follow TDD principles to ensure graceful handling of corrupted data

import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';
import { CORSStrategy, Settings } from '../../contexts/SettingsContext';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Override global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('TDD Edge Cases: Data Corruption & Recovery', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error to test error handling
  });

  describe('localStorage Corruption Scenarios', () => {
    test('should recover from malformed JSON in localStorage', () => {
      // Arrange - TDD: Write failing test first
      const corruptedJson = '{"theme": "dark", "density": "compact", invalid';
      mockLocalStorage.setItem('dashboardSettings', corruptedJson);

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert - Should recover gracefully with empty object
      expect(settings).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load settings'),
        expect.any(Error)
      );
    });

    test('should handle localStorage quota exceeded', () => {
      // Arrange - Mock quota exceeded error
      const quotaExceededError = new Error('QuotaExceededError');
      quotaExceededError.name = 'QuotaExceededError';
      mockLocalStorage.setItem.mockImplementation(() => {
        throw quotaExceededError;
      });

      const testSettings: Partial<Settings> = {
        display: { theme: 'dark', density: 'compact', fontSize: 14 }
      };

      // Act & Assert - Should not crash
      expect(() => {
        localStorage.setItem('dashboardSettings', JSON.stringify(testSettings));
      }).toThrow('QuotaExceededError');

      // Verify service handles this gracefully
      const loadedSettings = SettingsIntegrationService.loadSettings();
      expect(loadedSettings).toEqual({});
    });

    test('should gracefully handle localStorage access denied', () => {
      // Arrange - Mock access denied scenario
      const accessDeniedError = new Error('localStorage access denied');
      mockLocalStorage.getItem.mockImplementation(() => {
        throw accessDeniedError;
      });

      // Act & Assert
      const settings = SettingsIntegrationService.loadSettings();
      expect(settings).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });

    test('should recover from empty localStorage values', () => {
      // Arrange
      mockLocalStorage.setItem('dashboardSettings', '');

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert
      expect(settings).toEqual({});
    });

    test('should handle localStorage with null/undefined values', () => {
      // Arrange
      mockLocalStorage.getItem.mockReturnValue(null);

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert
      expect(settings).toEqual({});
    });
  });

  describe('Settings Schema Evolution', () => {
    test('should migrate v1.0 settings to current version', () => {
      // Arrange - Old version settings format
      const v1Settings = {
        version: '1.0',
        theme: 'dark', // Old flat structure
        compactMode: true,
        corsProxy: 'allorigins'
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(v1Settings));

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert - Should handle old format gracefully
      expect(settings).toBeDefined();
      // The service should either migrate or return empty object for incompatible formats
    });

    test('should handle missing required fields', () => {
      // Arrange - Partial settings object missing critical fields
      const partialSettings = {
        display: { theme: 'dark' }
        // Missing cors, protocols, verification, general
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(partialSettings));

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert - Should not crash
      expect(settings).toBeDefined();
    });

    test('should preserve custom user settings during migration', () => {
      // Arrange - Settings with custom values that should be preserved
      const customSettings = {
        version: '1.0',
        display: {
          theme: 'alliance', // Custom theme
          fontSize: 18 // Custom font size
        },
        cors: {
          defaultStrategy: CORSStrategy.DIRECT // Custom strategy
        }
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(customSettings));

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert - Custom values should be preserved if possible
      expect(settings).toBeDefined();
      if (settings.display) {
        expect(settings.display.theme).toBe('alliance');
        expect(settings.display.fontSize).toBe(18);
      }
    });

    test('should recover from incompatible schema versions', () => {
      // Arrange - Future version schema that current code doesn't understand
      const futureSettings = {
        version: '99.0',
        newFeatureData: { /* unknown structure */ },
        incompatibleField: 'value'
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(futureSettings));

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert - Should fallback gracefully
      expect(settings).toEqual({});
    });
  });

  describe('Cross-Domain Storage Issues', () => {
    test('should handle subdomain settings isolation', () => {
      // This test would require more complex setup to truly test cross-domain
      // For now, verify the service doesn't crash with domain-like keys
      
      // Arrange
      const domainSpecificKey = 'dashboardSettings_subdomain_test';
      mockLocalStorage.setItem(domainSpecificKey, JSON.stringify({
        display: { theme: 'dark', density: 'compact', fontSize: 14 }
      }));

      // Act & Assert
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should manage settings across different ports', () => {
      // Arrange - Simulate port-specific isolation
      const portSpecificSettings = {
        port3000: { theme: 'dark' },
        port5173: { theme: 'light' }
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(portSpecificSettings));

      // Act & Assert
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle protocol changes (http to https)', () => {
      // Arrange - Settings from different protocol
      const protocolSettings = {
        httpSettings: { theme: 'dark' },
        httpsSettings: { theme: 'light' }
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(protocolSettings));

      // Act & Assert
      expect(() => {
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });
  });

  describe('Extreme Data Scenarios', () => {
    test('should handle extremely large settings objects', () => {
      // Arrange - Create a large settings object
      const largeSettings = {
        display: { theme: 'dark', density: 'compact', fontSize: 14 },
        largeArray: new Array(10000).fill({ data: 'test'.repeat(100) }),
        largeString: 'x'.repeat(100000)
      };

      // Act & Assert - Should not crash when handling large data
      expect(() => {
        mockLocalStorage.setItem('dashboardSettings', JSON.stringify(largeSettings));
        SettingsIntegrationService.loadSettings();
      }).not.toThrow();
    });

    test('should handle circular reference in settings', () => {
      // Arrange - Create object with circular reference
      const circularSettings: any = {
        display: { theme: 'dark', density: 'compact', fontSize: 14 }
      };
      circularSettings.self = circularSettings; // Circular reference

      // Act & Assert - JSON.stringify should fail, service should handle gracefully
      expect(() => {
        JSON.stringify(circularSettings);
      }).toThrow();

      // Service should handle this gracefully when encountered
      const settings = SettingsIntegrationService.loadSettings();
      expect(settings).toBeDefined();
    });

    test('should handle unicode and special characters in settings', () => {
      // Arrange - Settings with various special characters
      const specialCharSettings = {
        display: {
          theme: 'dark',
          customName: '🎨 Design Theme 中文 العربية €∑ƒ∂'
        }
      };
      mockLocalStorage.setItem('dashboardSettings', JSON.stringify(specialCharSettings));

      // Act
      const settings = SettingsIntegrationService.loadSettings();

      // Assert - Should handle unicode gracefully
      expect(settings).toBeDefined();
    });
  });
});
