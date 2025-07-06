/**
 * Alert Storage Service
 * Handles persistence of alerts and alert history
 */

import { AlertConfig, AlertTrigger } from '../../../types/AlertTypes';

export class AlertStorageService {
  private static readonly ALERTS_KEY = 'tactical-intel-alerts';
  private static readonly HISTORY_KEY = 'tactical-intel-alert-history';

  /**
   * Load alerts from localStorage
   */
  public static loadAlerts(): AlertConfig[] {
    try {
      const stored = localStorage.getItem(this.ALERTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load alerts from localStorage:', error);
      return [];
    }
  }

  /**
   * Save alerts to localStorage
   */
  public static saveAlerts(alerts: AlertConfig[]): boolean {
    try {
      localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
      return true;
    } catch (error) {
      console.error('Failed to save alerts to localStorage:', error);
      return false;
    }
  }

  /**
   * Load alert history from localStorage
   */
  public static loadAlertHistory(): AlertTrigger[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((trigger: any) => ({
          ...trigger,
          triggeredAt: new Date(trigger.triggeredAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load alert history from localStorage:', error);
      return [];
    }
  }

  /**
   * Save alert history to localStorage
   */
  public static saveAlertHistory(history: AlertTrigger[]): boolean {
    try {
      // Keep only last 1000 entries to prevent storage bloat
      const trimmedHistory = history.slice(-1000);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory));
      return true;
    } catch (error) {
      console.error('Failed to save alert history to localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all alert data from localStorage
   */
  public static clearAllData(): boolean {
    try {
      localStorage.removeItem(this.ALERTS_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear alert data from localStorage:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  public static getStorageStats(): { alerts: number; history: number; totalBytes: number } {
    const alertsData = localStorage.getItem(this.ALERTS_KEY) || '';
    const historyData = localStorage.getItem(this.HISTORY_KEY) || '';
    
    return {
      alerts: alertsData ? JSON.parse(alertsData).length : 0,
      history: historyData ? JSON.parse(historyData).length : 0,
      totalBytes: new Blob([alertsData + historyData]).size
    };
  }
}
