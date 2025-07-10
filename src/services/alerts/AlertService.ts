import { 
  AlertConfig, 
  AlertTrigger
} from '../../types/AlertTypes';

// Export enums for testing
export enum AlertLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertSchedule {
  ALWAYS = 'always',
  BUSINESS_HOURS = 'business_hours',
  WEEKDAYS = 'weekdays',
  CUSTOM = 'custom'
}

// Legacy Alert interface for backward compatibility
export interface Alert {
  id: string;
  name: string;
  keywords: string[];
  level: AlertLevel;
  enabled: boolean;
  schedule: AlertSchedule;
  feedSources: string[];
  notificationEnabled: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export class AlertService {
  private static instance: AlertService;
  private alerts: AlertConfig[] = [];
  private alertHistory: AlertTrigger[] = [];
  private isMonitoring: boolean = false;
  private notificationPermission: NotificationPermission = 'default';
  private subscribers: Array<(matches: any[]) => void> = [];

  private constructor() {
    this.loadAlerts();
    this.requestNotificationPermission();
  }

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Initialize the alert service and start monitoring
   */
  public async initialize(): Promise<void> {
    await this.requestNotificationPermission();
    this.startMonitoring();
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  /**
   * Load alerts from localStorage
   */
  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem('tactical-intel-alerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.alerts = parsed.map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load alerts from localStorage:', error);
      this.alerts = [];
    }
  }

  /**
   * Save alerts to localStorage
   */
  private saveAlerts(): void {
    try {
      localStorage.setItem('tactical-intel-alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Failed to save alerts to localStorage:', error);
    }
  }

  /**
   * Load alert history from localStorage
   */
  private loadAlertHistory(): void {
    try {
      const stored = localStorage.getItem('tactical-intel-alert-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.alertHistory = parsed.map((trigger: any) => ({
          ...trigger,
          triggeredAt: new Date(trigger.triggeredAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load alert history from localStorage:', error);
      this.alertHistory = [];
    }
  }

  /**
   * Save alert history to localStorage (keep only last 1000 entries)
   */
  private saveAlertHistory(): void {
    try {
      // Keep only the last 1000 entries
      const recentHistory = this.alertHistory
        .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
        .slice(0, 1000);
      
      localStorage.setItem('tactical-intel-alert-history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Failed to save alert history to localStorage:', error);
    }
  }

  /**
   * Create a new alert
   */
  public createAlert(alertConfig: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>): string {
    const alert: AlertConfig = {
      ...alertConfig,
      id: this.generateAlertId(),
      createdAt: new Date(),
      triggerCount: 0
    };

    this.alerts.push(alert);
    this.saveAlerts();
    
    return alert.id;
  }

  /**
   * Update an existing alert
   */
  public updateAlert(alertId: string, updates: Partial<AlertConfig>): boolean {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;

    this.alerts[index] = { ...this.alerts[index], ...updates };
    this.saveAlerts();
    return true;
  }

  /**
   * Delete an alert
   */
  public deleteAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;

    this.alerts.splice(index, 1);
    this.saveAlerts();
    return true;
  }

  /**
   * Get all alerts
   */
  public getAlerts(): AlertConfig[] {
    return [...this.alerts];
  }

  /**
   * Get alert by ID
   */
  public getAlert(alertId: string): AlertConfig | undefined {
    return this.alerts.find(alert => alert.id === alertId);
  }

  /**
   * Toggle alert active status
   */
  public toggleAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.active = !alert.active;
    this.saveAlerts();
    return true;
  }

  /**
   * Check feed items against all active alerts
   */
  public checkFeedItems(feedItems: any[]): AlertTrigger[] {
    const triggers: AlertTrigger[] = [];
    const activeAlerts = this.alerts.filter(alert => alert.active);

    for (const alert of activeAlerts) {
      if (!this.isAlertScheduleActive(alert)) continue;

      for (const item of feedItems) {
        const matchedKeywords = this.checkKeywordMatches(alert.keywords, item);
        
        if (matchedKeywords.length > 0) {
          // Check if this alert should apply to this source
          if (alert.sources && alert.sources.length > 0) {
            const feedSource = this.extractFeedSource(item);
            if (!alert.sources.includes(feedSource)) continue;
          }

          const trigger: AlertTrigger = {
            id: this.generateTriggerId(),
            alertId: alert.id,
            triggeredAt: new Date(),
            feedItem: {
              title: item.title || '',
              description: item.description || item.summary || '',
              link: item.link || item.url || '',
              source: this.extractFeedSource(item),
              pubDate: item.pubDate || item.published || new Date().toISOString()
            },
            matchedKeywords,
            priority: alert.priority,
            acknowledged: false
          };

          triggers.push(trigger);
          this.updateAlertTriggerStats(alert.id);
          this.sendNotification(alert, trigger);
        }
      }
    }

    if (triggers.length > 0) {
      this.alertHistory.push(...triggers);
      this.saveAlertHistory();
    }

    return triggers;
  }

  /**
   * Check if alert schedule is currently active
   */
  private isAlertScheduleActive(alert: AlertConfig): boolean {
    const now = new Date();
    
    // Check if snoozed
    if (alert.scheduling.snoozeUntil && now < alert.scheduling.snoozeUntil) {
      return false;
    }

    // Check active days
    if (alert.scheduling.activeDays && alert.scheduling.activeDays.length > 0) {
      const currentDay = now.getDay();
      if (!alert.scheduling.activeDays.includes(currentDay)) {
        return false;
      }
    }

    // Check active hours
    if (alert.scheduling.activeHours) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = alert.scheduling.activeHours.start.split(':').map(Number);
      const [endHour, endMin] = alert.scheduling.activeHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (startTime <= endTime) {
        // Same day range
        if (currentTime < startTime || currentTime > endTime) {
          return false;
        }
      } else {
        // Overnight range
        if (currentTime < startTime && currentTime > endTime) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check keyword matches in feed item
   */
  private checkKeywordMatches(keywords: string[], item: any): string[] {
    const searchText = [
      item.title || '',
      item.description || item.summary || '',
      item.content || ''
    ].join(' ').toLowerCase();

    return keywords.filter(keyword => {
      const normalizedKeyword = keyword.toLowerCase().trim();
      
      // Support for boolean operators (basic implementation)
      if (normalizedKeyword.includes(' and ')) {
        const parts = normalizedKeyword.split(' and ');
        return parts.every(part => searchText.includes(part.trim()));
      }
      
      if (normalizedKeyword.includes(' or ')) {
        const parts = normalizedKeyword.split(' or ');
        return parts.some(part => searchText.includes(part.trim()));
      }
      
      if (normalizedKeyword.startsWith('not ')) {
        const term = normalizedKeyword.substring(4);
        return !searchText.includes(term);
      }

      // Simple keyword match
      return searchText.includes(normalizedKeyword);
    });
  }

  /**
   * Extract feed source from item
   */
  private extractFeedSource(item: any): string {
    return item.source || item.feedTitle || item.feed || 'Unknown Source';
  }

  /**
   * Update alert trigger statistics
   */
  private updateAlertTriggerStats(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.triggerCount++;
      alert.lastTriggered = new Date();
      this.saveAlerts();
    }
  }

  /**
   * Send notification for triggered alert
   */
  private sendNotification(alert: AlertConfig, trigger: AlertTrigger): void {
    const { notifications } = alert;

    // Browser notification
    if (notifications.browser && this.notificationPermission === 'granted') {
      const title = `🚨 ${alert.name}`;
      const body = notifications.customMessage || 
        `Alert triggered: ${trigger.feedItem.title.substring(0, 100)}...`;
      
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `alert-${alert.id}`,
        requireInteraction: alert.priority === 'critical',
        data: {
          alertId: alert.id,
          triggerId: trigger.id,
          link: trigger.feedItem.link
        }
      });

      notification.onclick = () => {
        window.focus();
        window.open(trigger.feedItem.link, '_blank');
        notification.close();
      };
    }

    // Sound notification
    if (notifications.sound) {
      this.playAlertSound(notifications.soundFile || this.getDefaultSoundForPriority(alert.priority));
    }

    // TODO: Implement email and webhook notifications
  }

  /**
   * Play alert sound
   */
  private playAlertSound(soundFile: string): void {
    try {
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  /**
   * Get default sound file for priority level
   */
  private getDefaultSoundForPriority(priority: string): string {
    const sounds = {
      low: '/sounds/alert-low.mp3',
      medium: '/sounds/alert-medium.mp3',
      high: '/sounds/alert-high.mp3',
      critical: '/sounds/alert-critical.mp3'
    };
    return sounds[priority as keyof typeof sounds] || sounds.medium;
  }

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
   * Get monitoring status
   */
  public isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get alert history
   */
  public getAlertHistory(alertId?: string, limit?: number): AlertTrigger[] {
    this.loadAlertHistory();
    
    let history = alertId 
      ? this.alertHistory.filter(trigger => trigger.alertId === alertId)
      : this.alertHistory;

    history = history.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());

    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Clear alert history
   */
  public clearAlertHistory(alertId?: string): void {
    if (alertId) {
      this.alertHistory = this.alertHistory.filter(trigger => trigger.alertId !== alertId);
    } else {
      this.alertHistory = [];
    }
    this.saveAlertHistory();
  }

  /**
   * Snooze an alert for a specified duration
   */
  public snoozeAlert(alertId: string, durationMinutes: number): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + durationMinutes);
    
    alert.scheduling.snoozeUntil = snoozeUntil;
    this.saveAlerts();
    return true;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique trigger ID
   */
  private generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Additional methods for testing compatibility
  
  /**
   * Add alert with legacy interface support
   */
  public addAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'triggeredAt'>): Alert {
    const alertConfig: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'> = {
      name: alertData.name,
      keywords: alertData.keywords || [],
      priority: alertData.level as any,
      active: alertData.enabled,
      sources: alertData.feedSources,
      notifications: {
        browser: alertData.notificationEnabled,
        sound: false
      },
      scheduling: {
        activeDays: alertData.schedule === AlertSchedule.WEEKDAYS ? [1, 2, 3, 4, 5] : undefined,
        activeHours: alertData.schedule === AlertSchedule.BUSINESS_HOURS ? 
          { start: '09:00', end: '17:00' } : undefined
      }
    };

    const alertId = this.createAlert(alertConfig);
    const createdAlert = this.getAlert(alertId)!;
    
    return {
      id: createdAlert.id,
      name: createdAlert.name,
      keywords: createdAlert.keywords,
      level: createdAlert.priority as AlertLevel,
      enabled: createdAlert.active,
      schedule: AlertSchedule.ALWAYS, // Simplified for compatibility
      feedSources: createdAlert.sources || [],
      notificationEnabled: createdAlert.notifications.browser,
      createdAt: createdAlert.createdAt,
      triggeredAt: createdAlert.lastTriggered
    };
  }

  /**
   * Update alert with partial data (legacy interface)
   */
  public updateAlertLegacy(alertId: string, updates: Partial<AlertConfig>): Alert | null {
    const success = this.updateAlert(alertId, updates);
    if (!success) return null;
    
    const updated = this.getAlert(alertId);
    if (!updated) return null;

    return {
      id: updated.id,
      name: updated.name,
      keywords: updated.keywords,
      level: updated.priority as AlertLevel,
      enabled: updated.active,
      schedule: AlertSchedule.ALWAYS,
      feedSources: updated.sources || [],
      notificationEnabled: updated.notifications.browser,
      createdAt: updated.createdAt,
      triggeredAt: updated.lastTriggered
    };
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
    this.saveAlerts();
  }

  /**
   * Clear all subscribers
   */
  public clearSubscribers(): void {
    this.subscribers = [];
  }

  /**
   * Subscribe to alert notifications
   */
  public subscribe(callback: (matches: any[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Check for matches with legacy interface
   */
  public checkForMatches(feedItems: any[]): Array<{ alert: Alert; feedItem: any; matchedKeywords: string[] }> {
    const triggers = this.checkFeedItems(feedItems);
    const matches: Array<{ alert: Alert; feedItem: any; matchedKeywords: string[] }> = [];

    for (const trigger of triggers) {
      const alertConfig = this.getAlert(trigger.alertId);
      if (!alertConfig) continue;

      const alert: Alert = {
        id: alertConfig.id,
        name: alertConfig.name,
        keywords: alertConfig.keywords,
        level: alertConfig.priority as AlertLevel,
        enabled: alertConfig.active,
        schedule: AlertSchedule.ALWAYS,
        feedSources: alertConfig.sources || [],
        notificationEnabled: alertConfig.notifications.browser,
        createdAt: alertConfig.createdAt,
        triggeredAt: alertConfig.lastTriggered
      };

      matches.push({
        alert,
        feedItem: trigger.feedItem,
        matchedKeywords: trigger.matchedKeywords
      });
    }

    // Notify subscribers
    if (matches.length > 0) {
      this.subscribers.forEach(callback => {
        try {
          callback(matches);
        } catch (error) {
          console.error('Error in alert subscriber callback:', error);
        }
      });
    }

    return matches;
  }
}

export default AlertService;
