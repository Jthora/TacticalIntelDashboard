/**
 * Alert Matching Engine
 * Handles matching feed items against alert configurations
 */

import { AlertConfig, AlertTrigger } from '../../../types/AlertTypes';

export interface FeedItem {
  title: string;
  description?: string;
  link: string;
  source: string;
  pubDate: string;
  [key: string]: any;
}

export class AlertMatchingService {
  /**
   * Check feed items against all active alerts
   */
  public static checkFeedItems(feedItems: FeedItem[], alerts: AlertConfig[]): AlertTrigger[] {
    const triggers: AlertTrigger[] = [];
    const activeAlerts = alerts.filter(alert => alert.active);

    for (const feedItem of feedItems) {
      for (const alert of activeAlerts) {
        const matchedKeywords = this.matchKeywords(feedItem, alert.keywords);
        
        if (matchedKeywords.length > 0 && this.isSourceAllowed(feedItem.source, alert.sources)) {
          if (this.isScheduleActive(alert.scheduling)) {
            const trigger: AlertTrigger = {
              id: this.generateTriggerId(),
              alertId: alert.id,
              triggeredAt: new Date(),
              feedItem,
              matchedKeywords,
              priority: alert.priority,
              acknowledged: false
            };
            triggers.push(trigger);
          }
        }
      }
    }

    return triggers;
  }

  /**
   * Match keywords against feed item content
   */
  private static matchKeywords(feedItem: FeedItem, keywords: string[]): string[] {
    const matchedKeywords: string[] = [];
    const content = `${feedItem.title} ${feedItem.description || ''}`.toLowerCase();

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Support for exact phrases (enclosed in quotes)
      if (keyword.startsWith('"') && keyword.endsWith('"')) {
        const phrase = keyword.slice(1, -1).toLowerCase();
        if (content.includes(phrase)) {
          matchedKeywords.push(keyword);
        }
      }
      // Support for regex patterns (enclosed in forward slashes)
      else if (keyword.startsWith('/') && keyword.endsWith('/')) {
        try {
          const pattern = new RegExp(keyword.slice(1, -1), 'i');
          if (pattern.test(content)) {
            matchedKeywords.push(keyword);
          }
        } catch (error) {
          console.warn(`Invalid regex pattern: ${keyword}`, error);
        }
      }
      // Simple word matching
      else {
        const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(keywordLower)}\\b`, 'i');
        if (wordBoundaryRegex.test(content)) {
          matchedKeywords.push(keyword);
        }
      }
    }

    return matchedKeywords;
  }

  /**
   * Check if the source is allowed for this alert
   */
  private static isSourceAllowed(source: string, allowedSources?: string[]): boolean {
    // If no sources specified, allow all sources
    if (!allowedSources || allowedSources.length === 0) {
      return true;
    }

    // Check if source matches any of the allowed sources
    return allowedSources.some(allowedSource => 
      source.toLowerCase().includes(allowedSource.toLowerCase()) ||
      allowedSource.toLowerCase().includes(source.toLowerCase())
    );
  }

  /**
   * Check if alert should be active based on scheduling
   */
  private static isScheduleActive(scheduling: AlertConfig['scheduling']): boolean {
    const now = new Date();

    // Check if snoozed
    if (scheduling.snoozeUntil && now < scheduling.snoozeUntil) {
      return false;
    }

    // Check active days
    if (scheduling.activeDays && scheduling.activeDays.length > 0) {
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      if (!scheduling.activeDays.includes(currentDay)) {
        return false;
      }
    }

    // Check active hours
    if (scheduling.activeHours) {
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
      const { start, end } = scheduling.activeHours;

      if (start && end) {
        // Handle overnight periods (e.g., 22:00 to 06:00)
        if (start > end) {
          if (!(currentTime >= start || currentTime <= end)) {
            return false;
          }
        } else {
          // Normal day period (e.g., 09:00 to 17:00)
          if (!(currentTime >= start && currentTime <= end)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Escape special regex characters in strings
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate unique trigger ID
   */
  private static generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate match relevance score
   */
  public static calculateRelevanceScore(trigger: AlertTrigger, alert: AlertConfig): number {
    let score = 0;

    // Base score for keyword matches
    score += trigger.matchedKeywords.length * 10;

    // Boost for exact matches
    const content = `${trigger.feedItem.title} ${trigger.feedItem.description || ''}`.toLowerCase();
    for (const keyword of trigger.matchedKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }

    // Priority multiplier
    const priorityMultipliers = {
      low: 1,
      medium: 1.2,
      high: 1.5,
      critical: 2
    };
    score *= priorityMultipliers[alert.priority];

    // Title match gets extra points
    if (trigger.matchedKeywords.some(keyword => 
      trigger.feedItem.title.toLowerCase().includes(keyword.toLowerCase())
    )) {
      score += 15;
    }

    return Math.round(score);
  }

  /**
   * Group triggers by alert and priority
   */
  public static groupTriggers(triggers: AlertTrigger[], alerts: AlertConfig[]): {
    byAlert: Map<string, AlertTrigger[]>;
    byPriority: Map<string, AlertTrigger[]>;
    total: number;
  } {
    const byAlert = new Map<string, AlertTrigger[]>();
    const byPriority = new Map<string, AlertTrigger[]>();

    for (const trigger of triggers) {
      // Group by alert ID
      if (!byAlert.has(trigger.alertId)) {
        byAlert.set(trigger.alertId, []);
      }
      byAlert.get(trigger.alertId)!.push(trigger);

      // Group by priority
      const alert = alerts.find(a => a.id === trigger.alertId);
      if (alert) {
        if (!byPriority.has(alert.priority)) {
          byPriority.set(alert.priority, []);
        }
        byPriority.get(alert.priority)!.push(trigger);
      }
    }

    return {
      byAlert,
      byPriority,
      total: triggers.length
    };
  }
}
