/**
 * Central Event Bus for Inter-Component Communication
 * Provides a decoupled way for components to communicate across the application
 */

import { log } from '../utils/LoggerService';

export interface EventBusMessage {
  type: string;
  data: any;
  timestamp: Date;
  source?: string;
}

export type EventBusHandler = (message: EventBusMessage) => void;

class EventBusService {
  private static instance: EventBusService;
  private handlers: Map<string, EventBusHandler[]> = new Map();
  private messageHistory: EventBusMessage[] = [];
  private maxHistorySize = 100;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): EventBusService {
    if (!this.instance) {
      this.instance = new EventBusService();
    }
    return this.instance;
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, handler: EventBusHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler);
    
    log.debug('EventBus', `Subscribed to event: ${eventType}`);
    
    // Return unsubscribe function
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * Unsubscribe from events
   */
  off(eventType: string, handler: EventBusHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        log.debug('EventBus', `Unsubscribed from event: ${eventType}`);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(eventType: string, data: any, source?: string): void {
    const messageBase = {
      type: eventType,
      data,
      timestamp: new Date()
    } as const;

    const message: EventBusMessage = source !== undefined
      ? { ...messageBase, source }
      : { ...messageBase };

    // Add to history
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }

    // Emit to handlers
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          log.error('EventBus', `Error in event handler for ${eventType}`, { error, message });
        }
      });
    }

    log.debug('EventBus', `Emitted event: ${eventType}`, { data, source });
  }

  /**
   * Get message history
   */
  getHistory(eventType?: string): EventBusMessage[] {
    if (eventType) {
      return this.messageHistory.filter(msg => msg.type === eventType);
    }
    return [...this.messageHistory];
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
    log.debug('EventBus', 'Message history cleared');
  }

  /**
   * Get current subscribers count
   */
  getSubscriberCount(eventType?: string): number {
    if (eventType) {
      return this.handlers.get(eventType)?.length || 0;
    }
    return Array.from(this.handlers.values()).reduce((total, handlers) => total + handlers.length, 0);
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Export singleton instance
export const eventBus = EventBusService.getInstance();

// Event type constants
export const EventTypes = {
  // Feed events
  FEED_UPDATED: 'feed.updated',
  FEED_SELECTED: 'feed.selected',
  FEED_FILTERED: 'feed.filtered',
  FEED_REFRESHED: 'feed.refreshed',
  
  // Filter events
  FILTER_APPLIED: 'filter.applied',
  FILTER_CLEARED: 'filter.cleared',
  FILTER_CHANGED: 'filter.changed',
  
  // Health events
  HEALTH_STATUS_CHANGED: 'health.status.changed',
  HEALTH_DIAGNOSTIC_STARTED: 'health.diagnostic.started',
  HEALTH_DIAGNOSTIC_COMPLETED: 'health.diagnostic.completed',
  
  // System events
  SYSTEM_SETTINGS_CHANGED: 'system.settings.changed',
  THEME_CHANGED: 'theme.changed',
  SYSTEM_STATUS_CHANGED: 'system.status.changed',
  
  // Export events
  EXPORT_STARTED: 'export.started',
  EXPORT_COMPLETED: 'export.completed',
  EXPORT_FAILED: 'export.failed',
  
  // Alert events
  ALERT_TRIGGERED: 'alert.triggered',
  ALERT_DISMISSED: 'alert.dismissed',
  
  // Navigation events
  NAVIGATION_CHANGED: 'navigation.changed',
  SIDEBAR_TOGGLED: 'sidebar.toggled',
  
  // Performance events
  PERFORMANCE_METRIC: 'performance.metric',
  PERFORMANCE_WARNING: 'performance.warning'
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

export default EventBusService;
