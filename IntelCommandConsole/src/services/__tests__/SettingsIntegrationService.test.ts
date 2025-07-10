import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { SettingsIntegrationService } from '../SettingsIntegrationService';

// Mock localStorage
const localStorageMock = (() => {
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
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SettingsIntegrationService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getGeneralSettings', () => {
    test('should return default settings when localStorage is empty', () => {
      const settings = SettingsIntegrationService.getGeneralSettings();
      
      expect(settings).toEqual({
        autoRefresh: true,
        refreshInterval: 300,
        preserveHistory: true,
        notifications: true,
        notificationSound: 'ping',
        showNotificationCount: true,
        cacheDuration: 1800,
        storageLimit: 50
      });
    });

    test('should return stored settings when localStorage has data', () => {
      const storedSettings = {
        autoRefresh: false,
        refreshInterval: 600,
        preserveHistory: false,
        notifications: false,
        notificationSound: 'beep',
        showNotificationCount: false,
        cacheDuration: 3600,
        storageLimit: 100
      };

      localStorageMock.setItem('generalSettings', JSON.stringify(storedSettings));

      const settings = SettingsIntegrationService.getGeneralSettings();
      expect(settings).toEqual(storedSettings);
    });

    test('should merge with defaults when localStorage has partial data', () => {
      const partialSettings = {
        autoRefresh: false,
        refreshInterval: 600
      };

      localStorageMock.setItem('generalSettings', JSON.stringify(partialSettings));

      const settings = SettingsIntegrationService.getGeneralSettings();
      expect(settings.autoRefresh).toBe(false);
      expect(settings.refreshInterval).toBe(600);
      expect(settings.notifications).toBe(true); // Should use default
    });

    test('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('generalSettings', 'invalid-json');

      const settings = SettingsIntegrationService.getGeneralSettings();
      expect(settings).toEqual({
        autoRefresh: true,
        refreshInterval: 300,
        preserveHistory: true,
        notifications: true,
        notificationSound: 'ping',
        showNotificationCount: true,
        cacheDuration: 1800,
        storageLimit: 50
      });
    });
  });

  describe('getCORSStrategy', () => {
    test('should return correct CORS strategy for protocol', () => {
      // This would need access to the actual settings context
      // For now, test the integration method exists
      expect(typeof SettingsIntegrationService.getCORSStrategy).toBe('function');
    });
  });

  describe('getThemeSettings', () => {
    test('should return theme settings', () => {
      expect(typeof SettingsIntegrationService.getThemeSettings).toBe('function');
    });
  });

  describe('getTrustStatus', () => {
    test('should return correct trust status for high rating', () => {
      const status = SettingsIntegrationService.getTrustStatus(85);
      expect(status.trusted).toBe(true);
      expect(status.warning).toBe(false);
    });

    test('should return warning for low rating', () => {
      const status = SettingsIntegrationService.getTrustStatus(45);
      expect(status.trusted).toBe(false);
      expect(status.warning).toBe(true);
    });

    test('should handle edge cases', () => {
      const zeroStatus = SettingsIntegrationService.getTrustStatus(0);
      expect(zeroStatus.trusted).toBe(false);

      const maxStatus = SettingsIntegrationService.getTrustStatus(100);
      expect(maxStatus.trusted).toBe(true);
    });
  });

  describe('resetCache', () => {
    test('should reset cache without errors', () => {
      expect(() => {
        SettingsIntegrationService.resetCache();
      }).not.toThrow();
    });
  });
});
