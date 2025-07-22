// Post-TDD Settings Functional Integration Test
// Tests the actual functionality of settings with real browser simulation

import { SettingsIntegrationService } from '../src/services/SettingsIntegrationService';
import { CORSStrategy, Settings } from '../src/contexts/SettingsContext';

// Mock DOM and localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Setup DOM mock
const mockDocument = {
  documentElement: {
    setAttribute: jest.fn(),
    style: {
      setProperty: jest.fn()
    }
  }
};

// Override globals
global.localStorage = mockLocalStorage as any;
global.document = mockDocument as any;

describe('Settings Integration - Post-TDD Validation', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('Theme Settings Integration', () => {
    it('should apply theme settings to DOM correctly', () => {
      const settings: Partial<Settings> = {
        display: {
          theme: 'dark',
          density: 'compact',
          fontSize: 16
        }
      };

      // Store settings
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));

      // Apply theme settings
      SettingsIntegrationService.applyThemeSettings();

      // Verify DOM changes
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-density', 'compact');
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-compact', 'true');
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--base-font-size', '16px');
    });

    it('should handle spacious density correctly', () => {
      const settings: Partial<Settings> = {
        display: {
          theme: 'light',
          density: 'spacious',
          fontSize: 18
        }
      };

      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      SettingsIntegrationService.applyThemeSettings();

      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-compact', 'false');
    });
  });

  describe('CORS Settings Integration', () => {
    it('should return correct CORS strategy based on settings', () => {
      const settings: Partial<Settings> = {
        cors: {
          defaultStrategy: CORSStrategy.DIRECT,
          protocolStrategies: {
            'RSS': CORSStrategy.RSS2JSON
          },
          services: {
            rss2json: ['https://test.com/api'],
            corsProxies: ['https://proxy.com/?']
          },
          fallbackChain: [CORSStrategy.DIRECT, CORSStrategy.RSS2JSON]
        }
      };

      localStorage.setItem('dashboardSettings', JSON.stringify(settings));

      // Test default strategy
      const defaultStrategy = SettingsIntegrationService.getCORSStrategy();
      expect(defaultStrategy).toBe(CORSStrategy.DIRECT);

      // Test protocol-specific strategy
      const rssStrategy = SettingsIntegrationService.getCORSStrategy('RSS');
      expect(rssStrategy).toBe(CORSStrategy.RSS2JSON);

      // Test non-existent protocol should use default
      const unknownStrategy = SettingsIntegrationService.getCORSStrategy('UNKNOWN');
      expect(unknownStrategy).toBe(CORSStrategy.DIRECT);
    });

    it('should fall back to default when no settings exist', () => {
      const strategy = SettingsIntegrationService.getCORSStrategy();
      expect(strategy).toBe(CORSStrategy.RSS2JSON); // Default fallback
    });
  });

  describe('Settings Persistence', () => {
    it('should load settings from localStorage correctly', () => {
      const testSettings = {
        version: '1.0.0',
        display: { theme: 'alliance', density: 'comfortable', fontSize: 14 },
        cors: { defaultStrategy: CORSStrategy.EXTENSION }
      };

      localStorage.setItem('dashboardSettings', JSON.stringify(testSettings));

      const loadedSettings = SettingsIntegrationService.loadSettings();
      expect(loadedSettings.display.theme).toBe('alliance');
      expect(loadedSettings.cors.defaultStrategy).toBe(CORSStrategy.EXTENSION);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('dashboardSettings', 'invalid-json{');

      const loadedSettings = SettingsIntegrationService.loadSettings();
      expect(loadedSettings).toEqual({});
    });

    it('should return empty object when no settings exist', () => {
      const loadedSettings = SettingsIntegrationService.loadSettings();
      expect(loadedSettings).toEqual({});
    });
  });

  describe('Service Method Integration', () => {
    it('should have all required apply methods', () => {
      expect(typeof SettingsIntegrationService.applyThemeSettings).toBe('function');
      expect(typeof SettingsIntegrationService.applyCorsSettings).toBe('function');
      expect(typeof SettingsIntegrationService.applyProtocolSettings).toBe('function');
      expect(typeof SettingsIntegrationService.applyVerificationSettings).toBe('function');
      expect(typeof SettingsIntegrationService.applyGeneralSettings).toBe('function');
    });

    it('should have utility methods', () => {
      expect(typeof SettingsIntegrationService.getTrustStatus).toBe('function');
      expect(typeof SettingsIntegrationService.orderByProtocolPriority).toBe('function');
      expect(typeof SettingsIntegrationService.resetCache).toBe('function');
    });
  });

  describe('Trust Rating System', () => {
    it('should calculate trust status correctly', () => {
      const settings: Partial<Settings> = {
        verification: {
          minimumTrustRating: 60,
          warningThreshold: 40,
          preferredMethods: ['official', 'community']
        }
      };

      localStorage.setItem('dashboardSettings', JSON.stringify(settings));

      // Test different trust levels
      const highTrust = SettingsIntegrationService.getTrustStatus(85);
      expect(highTrust.level).toBe('high');

      const mediumTrust = SettingsIntegrationService.getTrustStatus(55);
      expect(mediumTrust.level).toBe('medium');

      const lowTrust = SettingsIntegrationService.getTrustStatus(25);
      expect(lowTrust.level).toBe('low');
    });
  });

  describe('Protocol Priority System', () => {
    it('should order feeds by protocol priority', () => {
      const settings: Partial<Settings> = {
        protocols: {
          priority: ['RSS', 'JSON', 'API'],
          settings: {},
          autoDetect: true,
          fallbackEnabled: true
        }
      };

      localStorage.setItem('dashboardSettings', JSON.stringify(settings));

      const feeds = [
        { protocol: 'API', url: 'test1.com' },
        { protocol: 'RSS', url: 'test2.com' },
        { protocol: 'JSON', url: 'test3.com' }
      ];

      const orderedFeeds = SettingsIntegrationService.orderByProtocolPriority(feeds);
      
      expect(orderedFeeds[0].protocol).toBe('RSS');
      expect(orderedFeeds[1].protocol).toBe('JSON');
      expect(orderedFeeds[2].protocol).toBe('API');
    });
  });

  describe('Cache Management', () => {
    it('should reset cache when called', () => {
      // This would interact with actual cache in real implementation
      expect(() => SettingsIntegrationService.resetCache()).not.toThrow();
    });
  });
});
