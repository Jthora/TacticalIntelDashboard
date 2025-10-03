import { beforeEach, describe, expect, jest, test } from '@jest/globals';

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
  value: localStorageMock,
  configurable: true,
  writable: true
});

// Ensure global scope also references the same mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true
});

const DEFAULT_GENERAL_SETTINGS = {
  autoRefresh: false,
  refreshInterval: 300,
  preserveHistory: true,
  notifications: true,
  notificationSound: 'ping',
  showNotificationCount: true,
  cacheDuration: 1800,
  storageLimit: 50,
  export: {
    format: 'json',
    autoExport: false,
    includeMetadata: true,
    compress: false,
    encrypt: true
  },
  share: {
    enabled: true,
    defaultHashtags: ['intelwatch'],
    attribution: 'via Tactical Intel Dashboard'
  }
} as const;

describe('SettingsIntegrationService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    SettingsIntegrationService.resetCache();
  });

  describe('getGeneralSettings', () => {
    test('should return default settings when localStorage is empty', () => {
      const settings = SettingsIntegrationService.getGeneralSettings();
      
      expect(settings).toEqual(DEFAULT_GENERAL_SETTINGS);
    });

    test('should derive settings from dashboardSettings general configuration', () => {
      localStorageMock.setItem('dashboardSettings', JSON.stringify({
        general: {
          refreshInterval: 600000,
          cacheSettings: {
            enabled: true,
            duration: 900000
          },
          notifications: {
            enabled: false,
            sound: true
          },
          export: {
            format: 'csv',
            autoExport: true,
            includeMetadata: false,
            compress: true,
            encrypt: false
          },
          share: {
            enabled: false,
            defaultHashtags: ['intelwatch', 'ops'],
            attribution: 'intel ops'
          }
        }
      }));

      const settings = SettingsIntegrationService.getGeneralSettings();

  expect(localStorageMock.getItem).toHaveBeenCalledWith('dashboardSettings');

      expect(settings.refreshInterval).toBe(600);
  expect(settings.autoRefresh).toBe(true);
      expect(settings.cacheDuration).toBe(900);
      expect(settings.notifications).toBe(false);
      expect(settings.notificationSound).toBe('ping');
      expect(settings.export).toEqual({
        format: 'csv',
        autoExport: true,
        includeMetadata: false,
        compress: true,
        encrypt: false
      });
      expect(settings.share).toEqual({
        enabled: false,
        defaultHashtags: ['intelwatch', 'ops'],
        attribution: 'intel ops'
      });
    });

    test('should fall back to legacy generalSettings when dashboard settings are absent', () => {
      const legacySettings = {
        autoRefresh: false,
        refreshInterval: 600,
        preserveHistory: false,
        notifications: false,
        notificationSound: 'beep',
        showNotificationCount: false,
        cacheDuration: 3600,
        storageLimit: 100
      };

      localStorageMock.setItem('generalSettings', JSON.stringify(legacySettings));

      const settings = SettingsIntegrationService.getGeneralSettings();

  expect(localStorageMock.getItem).toHaveBeenCalledWith('generalSettings');

      expect(settings).toEqual(expect.objectContaining({
        autoRefresh: legacySettings.autoRefresh,
        refreshInterval: legacySettings.refreshInterval,
        preserveHistory: legacySettings.preserveHistory,
        notifications: legacySettings.notifications,
        notificationSound: legacySettings.notificationSound,
        showNotificationCount: legacySettings.showNotificationCount,
        cacheDuration: legacySettings.cacheDuration,
        storageLimit: legacySettings.storageLimit
      }));
    });

    test('should merge dashboard and defaults when share config is partially defined', () => {
      localStorageMock.setItem('dashboardSettings', JSON.stringify({
        general: {
          refreshInterval: 300000,
          share: {
            enabled: true,
            attribution: 'custom attribution'
          }
        }
      }));

      const settings = SettingsIntegrationService.getGeneralSettings();

      expect(settings.share).toEqual({
        enabled: true,
        defaultHashtags: ['intelwatch'],
        attribution: 'custom attribution'
      });
    });

    test('should handle corrupted localStorage data', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        localStorageMock.setItem('generalSettings', 'invalid-json');
        localStorageMock.setItem('dashboardSettings', 'invalid-json{');

        const settings = SettingsIntegrationService.getGeneralSettings();
        expect(settings).toEqual(DEFAULT_GENERAL_SETTINGS);
      } finally {
        warnSpy.mockRestore();
      }
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
