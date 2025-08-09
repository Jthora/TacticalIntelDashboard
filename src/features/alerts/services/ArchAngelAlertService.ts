/**
 * Refactored Alert Service - Main coordinator service
 * Uses modular services for clean separation of concerns
 */

import { AlertConfig, AlertTrigger } from '../../../types/AlertTypes';
import { AlertMatchingService, FeedItem } from '../matching/AlertMatchingService';
import { AlertNotificationService } from '../notifications/AlertNotificationService';
import { AlertStorageService } from '../storage/AlertStorageService';

export { AlertLevel, AlertSchedule } from '../../../services/alerts/AlertService';

export class ArchAngelAlertService {
  private static instance: ArchAngelAlertService;
  private alerts: AlertConfig[] = [];
  private alertHistory: AlertTrigger[] = [];
  private isMonitoring: boolean = false;
  private subscribers: Array<(matches: AlertTrigger[]) => void> = [];
  
  private notificationService: AlertNotificationService;

  private constructor() {
    this.notificationService = AlertNotificationService.getInstance();
    this.loadData();
  }

  public static getInstance(): ArchAngelAlertService {
    if (!ArchAngelAlertService.instance) {
      ArchAngelAlertService.instance = new ArchAngelAlertService();
    }
    return ArchAngelAlertService.instance;
  }

  /**
   * Initialize the alert service
   */
  public async initialize(): Promise<void> {
    await this.notificationService.requestNotificationPermission();
    this.startMonitoring();
  }

  /**
   * Load alerts and history from storage
   */
  private loadData(): void {
    this.alerts = AlertStorageService.loadAlerts();
    this.alertHistory = AlertStorageService.loadAlertHistory();
  }

  /**
   * Save data to storage
   */
  private saveData(): void {
    AlertStorageService.saveAlerts(this.alerts);
    AlertStorageService.saveAlertHistory(this.alertHistory);
  }

  // ===========================================
  // ALERT CONFIGURATION METHODS
  // ===========================================

  /**
   * Create a new alert
   */
  public createAlert(alertConfig: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>): string {
    const id = this.generateAlertId();
    const newAlert: AlertConfig = {
      ...alertConfig,
      id,
      createdAt: new Date(),
      triggerCount: 0
    };
    
    this.alerts.push(newAlert);
    this.saveData();
    return id;
  }

  /**
   * Update an existing alert
   */
  public updateAlert(alertId: string, updates: Partial<AlertConfig>): boolean {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;

    this.alerts[index] = { ...this.alerts[index], ...updates };
    this.saveData();
    return true;
  }

  /**
   * Delete an alert
   */
  public deleteAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;

    this.alerts.splice(index, 1);
    this.saveData();
    return true;
  }

  /**
   * Toggle alert active status
   */
  public toggleAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.active = !alert.active;
    this.saveData();
    return true;
  }

  /**
   * Get all alerts
   */
  public getAlerts(): AlertConfig[] {
    return [...this.alerts];
  }

  /**
   * Get a specific alert
   */
  public getAlert(alertId: string): AlertConfig | undefined {
    return this.alerts.find(alert => alert.id === alertId);
  }

  // ===========================================
  // MONITORING AND MATCHING METHODS
  // ===========================================

  /**
   * Start monitoring feeds for alerts
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
  }

  /**
   * Stop monitoring feeds for alerts
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Check feed items against alerts
   */
  public checkFeedItems(feedItems: FeedItem[]): AlertTrigger[] {
    if (!this.isMonitoring) return [];

    const triggers = AlertMatchingService.checkFeedItems(feedItems, this.alerts);
    
    if (triggers.length > 0) {
      // Update trigger counts
      triggers.forEach(trigger => {
        const alert = this.alerts.find(a => a.id === trigger.alertId);
        if (alert) {
          alert.triggerCount += 1;
          alert.lastTriggered = trigger.triggeredAt;
        }
      });

      // Add to history
      this.alertHistory.push(...triggers);

      // Show notifications
      this.notificationService.showNotifications(triggers, this.alerts);

      // Notify subscribers
      this.notifySubscribers(triggers);

      // Save updated data
      this.saveData();
    }

    return triggers;
  }

  // ===========================================
  // SUBSCRIPTION METHODS
  // ===========================================

  /**
   * Subscribe to alert triggers
   */
  public subscribe(callback: (matches: AlertTrigger[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of new triggers
   */
  private notifySubscribers(triggers: AlertTrigger[]): void {
    this.subscribers.forEach(callback => {
      try {
        callback(triggers);
      } catch (error) {
        console.error('Error in alert subscriber:', error);
      }
    });
  }

  // ===========================================
  // HISTORY AND STATS METHODS
  // ===========================================

  /**
   * Get alert history
   */
  public getAlertHistory(limit?: number): AlertTrigger[] {
    const history = [...this.alertHistory].reverse(); // Most recent first
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get alert statistics
   */
  public getAlertStats(): {
    totalAlerts: number;
    activeAlerts: number;
    totalTriggers: number;
    triggersToday: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const triggersToday = this.alertHistory.filter(trigger => {
      const triggerDate = new Date(trigger.triggeredAt);
      triggerDate.setHours(0, 0, 0, 0);
      return triggerDate.getTime() === today.getTime();
    }).length;

    return {
      totalAlerts: this.alerts.length,
      activeAlerts: this.alerts.filter(alert => alert.active).length,
      totalTriggers: this.alertHistory.length,
      triggersToday
    };
  }

  /**
   * Get recent triggers for a specific alert
   */
  public getRecentTriggers(alertId: string, limit: number = 10): AlertTrigger[] {
    return this.alertHistory
      .filter(trigger => trigger.alertId === alertId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear all alert history
   */
  public clearHistory(): boolean {
    this.alertHistory = [];
    return AlertStorageService.saveAlertHistory([]);
  }

  /**
   * Clear history for a specific alert
   */
  public clearAlertHistory(alertId: string): boolean {
    this.alertHistory = this.alertHistory.filter(trigger => trigger.alertId !== alertId);
    this.saveData();
    return true;
  }

  /**
   * Snooze an alert for specified minutes
   */
  public snoozeAlert(alertId: string, minutes: number): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    // Add snooze time to alert scheduling
    const snoozeUntil = new Date(Date.now() + (minutes * 60 * 1000));
    const updatedScheduling = {
      ...alert.scheduling,
      snoozeUntil
    };
    this.updateAlert(alertId, { scheduling: updatedScheduling });
    return true;
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Test notification system
   */
  public async testNotifications(): Promise<boolean> {
    return this.notificationService.testNotification();
  }

  /**
   * Export all alert data
   */
  public exportData(): { alerts: AlertConfig[]; history: AlertTrigger[] } {
    return {
      alerts: this.getAlerts(),
      history: this.getAlertHistory()
    };
  }

  /**
   * Import alert data
   */
  public importData(data: { alerts?: AlertConfig[]; history?: AlertTrigger[] }): boolean {
    try {
      if (data.alerts) {
        this.alerts = data.alerts;
      }
      if (data.history) {
        this.alertHistory = data.history;
      }
      this.saveData();
      return true;
    } catch (error) {
      console.error('Failed to import alert data:', error);
      return false;
    }
  }

  /**
   * Get monitoring status
   */
  public isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get notification permission status
   */
  public getNotificationPermission(): NotificationPermission {
    return this.notificationService.getNotificationPermission();
  }
}
