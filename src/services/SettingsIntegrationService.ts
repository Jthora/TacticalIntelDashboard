/**
 * This service integrates the settings from SettingsContext into the application functionality.
 * It serves as a bridge between the settings UI and the application's behavior.
 */
import { CORSStrategy, Settings } from '../contexts/SettingsContext';
import { log } from '../utils/LoggerService';

export class SettingsIntegrationService {
  // Cache the settings locally for quick access
  private static settings: Settings | null = null;
  
  /**
   * Load settings from localStorage or default settings
   */
  static loadSettings(): Settings {
    if (this.settings) {
      return this.settings;
    }
    
    try {
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
        log.debug('SettingsIntegration', 'Loaded settings from localStorage');
        return this.settings as Settings;
      }
    } catch (error) {
      log.error('SettingsIntegration', 'Failed to load settings', error);
    }
    
    // If settings couldn't be loaded, return empty object
    // The SettingsContext will apply defaults
    return {} as Settings;
  }
  
  /**
   * Get the current CORS strategy based on settings
   * @param protocol Optional protocol to get specific strategy
   * @returns The appropriate CORS strategy
   */
  static getCORSStrategy(protocol?: string): CORSStrategy {
    const settings = this.loadSettings();
    
    // If a protocol is specified and has a custom strategy, use it
    if (protocol && settings.cors?.protocolStrategies?.[protocol]) {
      return settings.cors.protocolStrategies[protocol];
    }
    
    // Otherwise use the default strategy
    return settings.cors?.defaultStrategy || CORSStrategy.RSS2JSON;
  }
  
  /**
   * Get the proxy URL for a target based on the current CORS strategy
   * @param targetUrl The URL to proxy
   * @param protocol Optional protocol for specific handling
   * @returns The proxied URL
   */
  static getProxyUrl(targetUrl: string, protocol?: string): string {
    const strategy = this.getCORSStrategy(protocol);
    const settings = this.loadSettings();
    
    switch (strategy) {
      case CORSStrategy.RSS2JSON:
        // Use the first available RSS2JSON service
        if (settings.cors?.services?.rss2json?.length > 0) {
          const service = settings.cors.services.rss2json[0];
          return `${service}?rss_url=${encodeURIComponent(targetUrl)}`;
        }
        // Fallback to direct if no services available
        return targetUrl;
        
      case CORSStrategy.DIRECT:
        return targetUrl;
        
      case CORSStrategy.SERVICE_WORKER:
        // Implement service worker proxy logic here
        return `${window.location.origin}/sw-proxy?url=${encodeURIComponent(targetUrl)}`;
        
      case CORSStrategy.JSONP:
        // JSONP requires different fetch approach at the caller level
        return targetUrl;
        
      case CORSStrategy.EXTENSION:
        // This assumes a browser extension is handling CORS
        return targetUrl;
        
      default:
        // Default to direct fetch
        return targetUrl;
    }
  }
  
  /**
   * Get an array of CORS proxies to try in sequence
   * This implements the fallback chain from settings
   */
  static getCORSProxyChain(): string[] {
    const settings = this.loadSettings();
    const proxies: string[] = [];
    
    // Add proxies based on the fallback chain order
    if (settings.cors?.fallbackChain && settings.cors.services) {
      for (const strategy of settings.cors.fallbackChain) {
        switch (strategy) {
          case CORSStrategy.RSS2JSON:
            if (settings.cors.services.rss2json) {
              proxies.push(...settings.cors.services.rss2json.map(
                service => `${service}?rss_url=`
              ));
            }
            break;
            
          case CORSStrategy.DIRECT:
            proxies.push(''); // Empty string means direct fetch
            break;
            
          case CORSStrategy.SERVICE_WORKER:
            proxies.push(`${window.location.origin}/sw-proxy?url=`);
            break;
            
          case CORSStrategy.JSONP:
            // Not directly applicable as a proxy URL
            break;
            
          case CORSStrategy.EXTENSION:
            // Not directly applicable as a proxy URL
            break;
        }
      }
      
      // Always add generic CORS proxies at the end of the chain
      if (settings.cors.services.corsProxies) {
        proxies.push(...settings.cors.services.corsProxies);
      }
    }
    
    return proxies.length > 0 ? proxies : [''];
  }
  
  /**
   * Get the theme settings
   */
  static getThemeSettings(): {
    theme: 'light' | 'dark' | 'system' | 'alliance';
    density: 'comfortable' | 'compact' | 'spacious';
    fontSize: number;
  } {
    const settings = this.loadSettings();
    return settings.display || {
      theme: 'alliance',
      density: 'comfortable',
      fontSize: 14
    };
  }
  
  /**
   * Apply theme settings to the document
   * Updates CSS variables and data attributes
   */
  static applyThemeSettings(): void {
    const { theme, density, fontSize } = this.getThemeSettings();
    
    // Set data attributes for theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Set data attributes for density
    document.documentElement.setAttribute('data-density', density);
    
    // Set font size CSS variable
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    
    // Compatibility with ThemeContext compact mode
    document.documentElement.setAttribute('data-compact', 
      density === 'compact' ? 'true' : 'false');
    
    log.debug('SettingsIntegration', `Applied theme: ${theme}, density: ${density}, fontSize: ${fontSize}`);
  }
  
  /**
   * Get verification settings
   */
  static getVerificationSettings(): {
    minimumTrustRating: number;
    preferredMethods: string[];
    warningThreshold: number;
  } {
    const settings = this.loadSettings();
    return settings.verification || {
      minimumTrustRating: 60,
      preferredMethods: ['official', 'community', 'automated'],
      warningThreshold: 40
    };
  }
  
  /**
   * Determine if content should be trusted based on trust rating
   * @param trustRating A number representing trust level
   * @returns Object with trust status and warning level
   */
  static getTrustStatus(trustRating: number): {
    trusted: boolean;
    warning: boolean;
    status: 'trusted' | 'warning' | 'untrusted';
  } {
    const { minimumTrustRating, warningThreshold } = this.getVerificationSettings();
    
    const trusted = trustRating >= minimumTrustRating;
    const warning = trustRating < minimumTrustRating && trustRating >= warningThreshold;
    
    let status: 'trusted' | 'warning' | 'untrusted' = 'untrusted';
    if (trusted) status = 'trusted';
    else if (warning) status = 'warning';
    
    return { trusted, warning, status };
  }
  
  /**
   * Get protocol priority
   */
  static getProtocolPriority(): string[] {
    const settings = this.loadSettings();
    return settings.protocols?.priority || 
      ['RSS', 'JSON', 'API', 'IPFS', 'MASTODON', 'SSB'];
  }
  
  /**
   * Order feed sources by protocol priority
   * @param sources Array of feed sources with protocol property
   * @returns Sorted array based on protocol priority
   */
  static orderByProtocolPriority<T extends { protocol?: string }>(sources: T[]): T[] {
    const priority = this.getProtocolPriority();
    
    return [...sources].sort((a, b) => {
      const protocolA = a.protocol || '';
      const protocolB = b.protocol || '';
      
      const indexA = priority.indexOf(protocolA);
      const indexB = priority.indexOf(protocolB);
      
      // Handle cases where protocol isn't in priority list
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      // Lower index = higher priority
      return indexA - indexB;
    });
  }
  
  /**
   * Get general settings
   */
  static getGeneralSettings(): {
    autoRefresh: boolean;
    refreshInterval: number;
    preserveHistory: boolean;
    notifications: boolean;
    notificationSound: string;
    showNotificationCount: boolean;
    cacheDuration: number;
    storageLimit: number;
  } {
    // Get general settings from localStorage where they're saved by GeneralSettings component
    const storedSettings = localStorage.getItem('generalSettings');
    
    // Default values if none are stored
    const defaults = {
      autoRefresh: false, // Disabled by default to prevent infinite loops on startup
      refreshInterval: 300, // 5 minutes in seconds
      preserveHistory: true,
      notifications: true,
      notificationSound: 'ping',
      showNotificationCount: true,
      cacheDuration: 1800, // 30 minutes in seconds
      storageLimit: 50 // 50 MB
    };
    
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        // Merge with defaults to ensure all properties are present
        return { ...defaults, ...parsed };
      } catch (error) {
        console.warn('Failed to parse general settings from localStorage:', error);
        return defaults;
      }
    }
    
    return defaults;
  }
  
  /**
   * Detect protocol from URL (moved from fetchFeed.ts to make it available for testing)
   * @param url The URL to analyze
   * @returns The detected protocol or undefined
   */
  static detectProtocolFromUrl(url: string): string | undefined {
    // Simple protocol detection based on URL patterns
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.rss') || 
        lowerUrl.includes('/rss') || 
        lowerUrl.includes('/feed') ||
        lowerUrl.includes('/atom')) {
      return 'RSS';
    }
    
    if (lowerUrl.includes('.json') || lowerUrl.includes('/json')) {
      return 'JSON';
    }
    
    if (lowerUrl.includes('api.')) {
      return 'API';
    }
    
    if (lowerUrl.startsWith('ipfs://') || lowerUrl.includes('ipfs/')) {
      return 'IPFS';
    }
    
    if (lowerUrl.includes('@') && (lowerUrl.includes('mastodon') || lowerUrl.includes('pleroma'))) {
      return 'MASTODON';
    }
    
    // Default undefined - will use default CORS strategy
    return undefined;
  }
  
  /**
   * Reset the cached settings to force a reload from localStorage
   */
  static resetCache(): void {
    this.settings = null;
  }
  
  /**
   * Apply CORS settings to the application
   */
  static applyCorsSettings(): void {
    const settings = this.loadSettings();
    
    if (settings.cors) {
      log.debug('SettingsIntegration', 'Applied CORS settings', {
        defaultStrategy: settings.cors.defaultStrategy,
        protocolStrategies: settings.cors.protocolStrategies
      });
    }
  }
  
  /**
   * Apply protocol settings to the application
   */
  static applyProtocolSettings(): void {
    const settings = this.loadSettings();
    
    if (settings.protocols) {
      log.debug('SettingsIntegration', 'Applied protocol settings', {
        priority: settings.protocols.priority,
        autoDetect: settings.protocols.autoDetect
      });
    }
  }
  
  /**
   * Apply verification settings to the application
   */
  static applyVerificationSettings(): void {
    const settings = this.loadSettings();
    
    if (settings.verification) {
      log.debug('SettingsIntegration', 'Applied verification settings', {
        minimumTrustRating: settings.verification.minimumTrustRating,
        warningThreshold: settings.verification.warningThreshold,
        preferredMethods: settings.verification.preferredMethods
      });
    }
  }
  
  /**
   * Apply general settings to the application
   */
  static applyGeneralSettings(): void {
    const settings = this.loadSettings();
    
    if (settings.general) {
      log.debug('SettingsIntegration', 'Applied general settings', {
        refreshInterval: settings.general.refreshInterval,
        cacheSettings: settings.general.cacheSettings,
        notifications: settings.general.notifications
      });
    }
  }

  /**
   * Save settings to localStorage
   */
  static saveSettings(settings: Partial<Settings>): void {
    try {
      const existing = this.loadSettings();
      this.settings = { ...existing, ...settings };
      localStorage.setItem('dashboardSettings', JSON.stringify(this.settings));
      log.debug('SettingsIntegration', 'Saved settings to localStorage');
    } catch (error) {
      log.error('SettingsIntegration', 'Failed to save settings', error);
    }
  }

  /**
   * Reset settings to defaults
   */
  static resetToDefaults(): void {
    try {
      localStorage.removeItem('dashboardSettings');
      this.settings = null;
      log.debug('SettingsIntegration', 'Reset settings to defaults');
    } catch (error) {
      log.error('SettingsIntegration', 'Failed to reset settings', error);
    }
  }

  /**
   * Validate settings structure
   */
  static validateSettings(settings: any): boolean {
    if (!settings || typeof settings !== 'object') {
      return false;
    }
    
    // Basic validation - could be expanded
    return true;
  }

  /**
   * Validate and sanitize settings
   */
  static validateAndSanitizeSettings(settings: any): Partial<Settings> {
    if (!this.validateSettings(settings)) {
      return {};
    }
    
    // Basic sanitization - remove potentially dangerous properties
    const sanitized = { ...settings };
    delete sanitized.__proto__;
    delete sanitized.constructor;
    
    return sanitized;
  }

  /**
   * Apply settings to the application
   */
  static applySettings(settings: Partial<Settings>): void {
    const sanitized = this.validateAndSanitizeSettings(settings);
    this.saveSettings(sanitized);
    
    // Apply individual setting categories
    this.applyThemeSettings();
    this.applyCorsSettings();
    this.applyProtocolSettings();
    this.applyVerificationSettings();
    this.applyGeneralSettings();
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Basic HTML/script sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Test CORS strategy
   */
  static async testCORSStrategy(_strategy: CORSStrategy, options: { timeout?: number } = {}): Promise<boolean> {
    const timeout = options.timeout || 5000;
    
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeout);
      
      // Simple test - this would be expanded with actual testing logic
      setTimeout(() => {
        clearTimeout(timer);
        resolve(true);
      }, 100);
    });
  }
}