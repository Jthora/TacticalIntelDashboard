import { Theme } from '../contexts/ThemeContext';

export interface SystemSettings {
  theme: Theme;
  compactMode: boolean;
  realTimeUpdates: boolean;
  healthAlerts: boolean;
  autoExport: boolean;
  exportFormat: 'json' | 'csv' | 'pdf';
  exportSchedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  notificationLevel: 'all' | 'critical' | 'none';
  autoRefreshInterval: number; // in seconds
  maxDataRetention: number; // in days
}

export interface SettingsValidation {
  isValid: boolean;
  errors: string[];
}

export class SettingsService {
  private static instance: SettingsService;
  private settings: SystemSettings;
  private readonly STORAGE_KEY = 'tactical-system-settings';

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
  }

  static getInstance(): SettingsService {
    if (!this.instance) {
      this.instance = new SettingsService();
    }
    return this.instance;
  }

  private getDefaultSettings(): SystemSettings {
    return {
      theme: 'dark',
      compactMode: false,
      realTimeUpdates: true,
      healthAlerts: true,
      autoExport: false,
      exportFormat: 'json',
      exportSchedule: 'manual',
      notificationLevel: 'all',
      autoRefreshInterval: 30,
      maxDataRetention: 30,
    };
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.getDefaultSettings(), ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof SystemSettings>(key: K): SystemSettings[K] {
    return this.settings[key];
  }

  updateSetting<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
  }

  updateSettings(updates: Partial<SystemSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  validateSettings(settings: Partial<SystemSettings>): SettingsValidation {
    const errors: string[] = [];

    if (settings.autoRefreshInterval !== undefined) {
      if (settings.autoRefreshInterval < 1 || settings.autoRefreshInterval > 3600) {
        errors.push('Auto refresh interval must be between 1 and 3600 seconds');
      }
    }

    if (settings.maxDataRetention !== undefined) {
      if (settings.maxDataRetention < 1 || settings.maxDataRetention > 365) {
        errors.push('Data retention must be between 1 and 365 days');
      }
    }

    if (settings.theme !== undefined) {
      if (!['dark', 'night', 'combat'].includes(settings.theme)) {
        errors.push('Invalid theme selection');
      }
    }

    if (settings.exportFormat !== undefined) {
      if (!['json', 'csv', 'pdf'].includes(settings.exportFormat)) {
        errors.push('Invalid export format');
      }
    }

    if (settings.exportSchedule !== undefined) {
      if (!['manual', 'hourly', 'daily', 'weekly'].includes(settings.exportSchedule)) {
        errors.push('Invalid export schedule');
      }
    }

    if (settings.notificationLevel !== undefined) {
      if (!['all', 'critical', 'none'].includes(settings.notificationLevel)) {
        errors.push('Invalid notification level');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  resetToDefaults(): void {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      const validation = this.validateSettings(imported);
      
      if (!validation.isValid) {
        console.error('Invalid settings:', validation.errors);
        return false;
      }

      this.settings = { ...this.getDefaultSettings(), ...imported };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Subscribe to settings changes - safe, non-invasive notifications
  private listeners: ((settings: SystemSettings) => void)[] = [];

  subscribe(listener: (settings: SystemSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getSettings()));
  }

  // Non-invasive update methods - no automatic CSS application
  updateSettingWithNotification<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]): void {
    this.updateSetting(key, value);
    this.notifyListeners();
  }

  updateSettingsWithNotification(updates: Partial<SystemSettings>): void {
    this.updateSettings(updates);
    this.notifyListeners();
  }
}
