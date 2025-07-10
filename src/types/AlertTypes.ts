// Alert Type Definitions for the Tactical Intel Dashboard

export interface AlertConfig {
  id: string;
  name: string;
  description?: string;
  keywords: string[];
  sources?: string[]; // Empty array means all sources
  priority: AlertPriority;
  notifications: NotificationSettings;
  scheduling: AlertScheduling;
  active: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationSettings {
  browser: boolean;
  sound: boolean;
  soundFile?: string;
  email?: string;
  webhook?: string;
  customMessage?: string;
}

export interface AlertScheduling {
  activeHours?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  activeDays?: number[]; // 0-6, Sunday-Saturday
  timezone?: string;
  snoozeUntil?: Date;
}

export interface AlertTrigger {
  id: string;
  alertId: string;
  triggeredAt: Date;
  feedItem: {
    title: string;
    description?: string;
    link: string;
    source: string;
    pubDate: string;
  };
  matchedKeywords: string[];
  priority: AlertPriority;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export interface AlertHistory {
  triggers: AlertTrigger[];
  totalCount: number;
  lastCleanup: Date;
}

export interface KeywordMatch {
  keyword: string;
  matches: number;
  context: string[]; // Surrounding text for context
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggersToday: number;
  triggersThisWeek: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

// Alert Engine Configuration
export interface AlertEngineConfig {
  maxHistoryItems: number;
  cleanupInterval: number; // milliseconds
  maxKeywordsPerAlert: number;
  keywordMatchingOptions: KeywordMatchingOptions;
}

export interface KeywordMatchingOptions {
  caseSensitive: boolean;
  wholeWordsOnly: boolean;
  fuzzyMatching: boolean;
  stemming: boolean;
  synonyms: boolean;
}

// Notification Manager Types
export interface NotificationRequest {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  priority: AlertPriority;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Alert Service Events
export type AlertEvent = 
  | { type: 'ALERT_CREATED'; payload: AlertConfig }
  | { type: 'ALERT_UPDATED'; payload: AlertConfig }
  | { type: 'ALERT_DELETED'; payload: string }
  | { type: 'ALERT_TRIGGERED'; payload: AlertTrigger }
  | { type: 'ALERT_ACKNOWLEDGED'; payload: string }
  | { type: 'ALERT_SNOOZED'; payload: { alertId: string; until: Date } };

// React Hook Types
export interface UseAlertsReturn {
  alerts: AlertConfig[];
  activeAlerts: AlertConfig[];
  loading: boolean;
  error: string | null;
  stats: AlertStats;
  createAlert: (alert: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>) => void;
  updateAlert: (id: string, updates: Partial<AlertConfig>) => void;
  deleteAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  acknowledgeAlert: (triggerId: string) => void;
  snoozeAlert: (alertId: string, duration: number) => void;
  testAlert: (alertId: string) => void;
}

export interface UseAlertHistoryReturn {
  history: AlertTrigger[];
  loading: boolean;
  error: string | null;
  clearHistory: () => void;
  acknowledgeAll: () => void;
  getHistoryForAlert: (alertId: string) => AlertTrigger[];
}

// Component Props Types
export interface AlertManagerProps {
  className?: string;
  onAlertCreated?: (alert: AlertConfig) => void;
  onAlertTriggered?: (trigger: AlertTrigger) => void;
}

export interface AlertFormProps {
  alert?: AlertConfig;
  onSave: (alert: AlertConfig) => void;
  onCancel: () => void;
}

export interface AlertListProps {
  alerts: AlertConfig[];
  onEdit: (alert: AlertConfig) => void;
  onDelete: (alertId: string) => void;
  onToggle: (alertId: string) => void;
  onTest: (alertId: string) => void;
}

export interface AlertNotificationProps {
  trigger: AlertTrigger;
  onAcknowledge: (triggerId: string) => void;
  onDismiss: (triggerId: string) => void;
  autoHide?: boolean;
  duration?: number;
}
