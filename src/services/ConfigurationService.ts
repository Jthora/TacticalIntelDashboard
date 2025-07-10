/**
 * Configuration Management Service
 * Provides centralized configuration management for the Intel Command Console
 */

import { log } from '../utils/LoggerService';

export interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // WebSocket Configuration
  websocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
  };
  
  // Feed Configuration
  feeds: {
    refreshInterval: number;
    maxFeeds: number;
    autoRefresh: boolean;
    defaultSources: string[];
  };
  
  // Performance Configuration
  performance: {
    enableMetrics: boolean;
    metricsInterval: number;
    maxMetricsHistory: number;
    enableProfiling: boolean;
  };
  
  // UI Configuration
  ui: {
    theme: 'tactical' | 'console' | 'light';
    compactMode: boolean;
    animationsEnabled: boolean;
    showTooltips: boolean;
    autoSaveInterval: number;
  };
  
  // Security Configuration
  security: {
    encryptionEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireHttps: boolean;
  };
  
  // Export Configuration
  export: {
    maxFileSize: number;
    defaultFormat: 'json' | 'csv' | 'pdf' | 'xml';
    compressionEnabled: boolean;
    encryptionByDefault: boolean;
  };
  
  // Debug Configuration
  debug: {
    enableLogging: boolean;
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
    enablePerformanceLogging: boolean;
  };
}

class ConfigurationService {
  private static instance: ConfigurationService;
  private config: AppConfig;
  private listeners: Map<string, ((config: any) => void)[]> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfiguration();
  }

  static getInstance(): ConfigurationService {
    if (!this.instance) {
      this.instance = new ConfigurationService();
    }
    return this.instance;
  }

  private getDefaultConfig(): AppConfig {
    return {
      api: {
        baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      },
      websocket: {
        url: process.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000
      },
      feeds: {
        refreshInterval: 300000, // 5 minutes
        maxFeeds: 1000,
        autoRefresh: true,
        defaultSources: ['rss', 'api', 'websocket']
      },
      performance: {
        enableMetrics: process.env.NODE_ENV === 'development',
        metricsInterval: 1000,
        maxMetricsHistory: 100,
        enableProfiling: process.env.NODE_ENV === 'development'
      },
      ui: {
        theme: 'tactical',
        compactMode: false,
        animationsEnabled: true,
        showTooltips: true,
        autoSaveInterval: 30000
      },
      security: {
        encryptionEnabled: true,
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 3,
        requireHttps: process.env.NODE_ENV === 'production'
      },
      export: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        defaultFormat: 'json',
        compressionEnabled: true,
        encryptionByDefault: false
      },
      debug: {
        enableLogging: true,
        logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO',
        enablePerformanceLogging: process.env.NODE_ENV === 'development'
      }
    };
  }

  private loadConfiguration(): void {
    try {
      const storedConfig = localStorage.getItem('intel-console-config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        this.config = { ...this.config, ...parsed };
        log.info('ConfigurationService', 'Configuration loaded from storage');
      }
    } catch (error) {
      log.error('ConfigurationService', 'Failed to load configuration', { error });
    }
  }

  private saveConfiguration(): void {
    try {
      localStorage.setItem('intel-console-config', JSON.stringify(this.config));
      log.info('ConfigurationService', 'Configuration saved to storage');
    } catch (error) {
      log.error('ConfigurationService', 'Failed to save configuration', { error });
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration section
   */
  getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return { ...this.config[section] };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AppConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };
    this.saveConfiguration();
    this.notifyListeners(oldConfig);
    log.info('ConfigurationService', 'Configuration updated', { updates });
  }

  /**
   * Update a specific configuration section
   */
  updateSection<K extends keyof AppConfig>(section: K, updates: Partial<AppConfig[K]>): void {
    const oldConfig = { ...this.config };
    this.config[section] = { ...this.config[section], ...updates };
    this.saveConfiguration();
    this.notifyListeners(oldConfig);
    log.info('ConfigurationService', `Configuration section ${section} updated`, { updates });
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    const oldConfig = { ...this.config };
    this.config = this.getDefaultConfig();
    this.saveConfiguration();
    this.notifyListeners(oldConfig);
    log.info('ConfigurationService', 'Configuration reset to defaults');
  }

  /**
   * Subscribe to configuration changes
   */
  onConfigChange(listener: (config: AppConfig) => void): () => void {
    const listeners = this.listeners.get('global') || [];
    listeners.push(listener);
    this.listeners.set('global', listeners);

    return () => {
      const currentListeners = this.listeners.get('global') || [];
      const index = currentListeners.indexOf(listener);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to specific section changes
   */
  onSectionChange<K extends keyof AppConfig>(
    section: K,
    listener: (sectionConfig: AppConfig[K]) => void
  ): () => void {
    const listeners = this.listeners.get(section) || [];
    listeners.push(listener as any);
    this.listeners.set(section, listeners);

    return () => {
      const currentListeners = this.listeners.get(section) || [];
      const index = currentListeners.indexOf(listener as any);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(oldConfig: AppConfig): void {
    // Notify global listeners
    const globalListeners = this.listeners.get('global') || [];
    globalListeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        log.error('ConfigurationService', 'Error in global config listener', { error });
      }
    });

    // Notify section-specific listeners
    Object.keys(this.config).forEach(section => {
      const sectionKey = section as keyof AppConfig;
      if (JSON.stringify(oldConfig[sectionKey]) !== JSON.stringify(this.config[sectionKey])) {
        const sectionListeners = this.listeners.get(section) || [];
        sectionListeners.forEach(listener => {
          try {
            listener(this.config[sectionKey]);
          } catch (error) {
            log.error('ConfigurationService', `Error in ${section} config listener`, { error });
          }
        });
      }
    });
  }

  /**
   * Validate configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate API configuration
    if (!this.config.api.baseUrl) {
      errors.push('API base URL is required');
    }

    // Validate WebSocket configuration
    if (!this.config.websocket.url) {
      errors.push('WebSocket URL is required');
    }

    // Validate performance configuration
    if (this.config.performance.metricsInterval < 100) {
      errors.push('Metrics interval must be at least 100ms');
    }

    // Validate export configuration
    if (this.config.export.maxFileSize < 1024) {
      errors.push('Max file size must be at least 1KB');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export configuration
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration
   */
  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      const validation = this.validateConfig();
      
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      this.updateConfig(importedConfig);
      log.info('ConfigurationService', 'Configuration imported successfully');
    } catch (error) {
      log.error('ConfigurationService', 'Failed to import configuration', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const configService = ConfigurationService.getInstance();
export default ConfigurationService;
