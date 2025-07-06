/**
 * Alert Notification Service
 * Handles browser notifications and notification permissions
 */

import { AlertConfig, AlertTrigger } from '../../../types/AlertTypes';

export class AlertNotificationService {
  private notificationPermission: NotificationPermission = 'default';
  private static instance: AlertNotificationService;

  private constructor() {
    this.checkNotificationPermission();
  }

  public static getInstance(): AlertNotificationService {
    if (!AlertNotificationService.instance) {
      AlertNotificationService.instance = new AlertNotificationService();
    }
    return AlertNotificationService.instance;
  }

  /**
   * Check current notification permission
   */
  private checkNotificationPermission(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  /**
   * Request browser notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
      return this.notificationPermission;
    }
    return 'denied';
  }

  /**
   * Get current notification permission status
   */
  public getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  /**
   * Check if notifications are enabled and permitted
   */
  public canShowNotifications(): boolean {
    return 'Notification' in window && this.notificationPermission === 'granted';
  }

  /**
   * Show notification for alert trigger
   */
  public showNotification(alert: AlertConfig, trigger: AlertTrigger): void {
    if (!this.canShowNotifications() || !alert.notifications?.browser) {
      return;
    }

    try {
      const notification = new Notification(
        `🚨 INTEL ALERT: ${alert.name}`,
        {
          body: `Keyword "${trigger.matchedKeywords.join(', ')}" detected in ${trigger.feedItem.source}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `alert-${alert.id}`,
          requireInteraction: alert.priority === 'critical',
          data: {
            alertId: alert.id,
            triggerId: trigger.id,
            source: trigger.feedItem.source,
            keywords: trigger.matchedKeywords
          }
        }
      );

      // Auto-close notification after 5 seconds for non-critical alerts
      const autoCloseTime = alert.priority === 'critical' ? 0 : 5000;
      if (autoCloseTime > 0) {
        setTimeout(() => {
          notification.close();
        }, autoCloseTime);
      }

      // Handle notification interactions
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        // Could emit an event or call a callback here
        this.onNotificationClick(alert, trigger);
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Handle notification click events
   */
  private onNotificationClick(alert: AlertConfig, trigger: AlertTrigger): void {
    // This could be extended to emit events or navigate to specific views
    console.log('Notification clicked:', { alert: alert.name, trigger: trigger.id });
    
    // Example: Focus on the alert in the UI
    const event = new CustomEvent('alert-notification-clicked', {
      detail: { alert, trigger }
    });
    window.dispatchEvent(event);
  }

  /**
   * Show multiple notifications with rate limiting
   */
  public showNotifications(triggers: AlertTrigger[], alertConfigs: AlertConfig[]): void {
    // Rate limit: max 3 notifications at once
    const maxNotifications = 3;
    const notifications = triggers.slice(0, maxNotifications);

    notifications.forEach(trigger => {
      const alert = alertConfigs.find(a => a.id === trigger.alertId);
      if (alert) {
        this.showNotification(alert, trigger);
      }
    });

    // If more notifications were throttled, show a summary
    if (triggers.length > maxNotifications) {
      this.showSummaryNotification(triggers.length - maxNotifications);
    }
  }

  /**
   * Show summary notification for throttled alerts
   */
  private showSummaryNotification(additionalCount: number): void {
    if (!this.canShowNotifications()) return;

    try {
      new Notification(
        '🔔 Additional Alerts',
        {
          body: `${additionalCount} additional alert${additionalCount > 1 ? 's' : ''} triggered. Check the dashboard for details.`,
          icon: '/favicon.ico',
          tag: 'alert-summary'
        }
      );
    } catch (error) {
      console.error('Failed to show summary notification:', error);
    }
  }

  /**
   * Clear all notifications with the alert tag
   */
  public clearNotifications(): void {
    // Modern browsers don't provide a way to close all notifications programmatically
    // This is a placeholder for future implementation
    console.log('Clearing notifications...');
  }

  /**
   * Test notification functionality
   */
  public async testNotification(): Promise<boolean> {
    if (!this.canShowNotifications()) {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    try {
      const testNotification = new Notification(
        '🧪 Test Notification',
        {
          body: 'Arch Angel Agency notification system is working correctly.',
          icon: '/favicon.ico',
          tag: 'test-notification'
        }
      );

      setTimeout(() => testNotification.close(), 3000);
      return true;
    } catch (error) {
      console.error('Test notification failed:', error);
      return false;
    }
  }
}
