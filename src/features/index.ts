/**
 * Features - Main feature modules index
 * Provides clean exports for all feature modules
 */

// Alert Feature
export { AlertMatchingService } from './alerts/matching/AlertMatchingService';
export { AlertNotificationService } from './alerts/notifications/AlertNotificationService';
export { ArchAngelAlertService } from './alerts/services/ArchAngelAlertService';
export { AlertStorageService } from './alerts/storage/AlertStorageService';

// Feed Feature
export { default as FeedService } from './feeds/services/FeedService';

// Dashboard Feature exports will be added as components are updated

// Component re-exports for backward compatibility
export { default as AlertForm } from './alerts/components/AlertForm';
export { default as AlertHistory } from './alerts/components/AlertHistory';
export { default as AlertList } from './alerts/components/AlertList';
export { default as AlertManager } from './alerts/components/AlertManager';
export { default as AlertNotificationPanel } from './alerts/components/AlertNotificationPanel';
export { default as AlertStats } from './alerts/components/AlertStats';
export { default as CentralView } from './dashboard/components/CentralView';
export { default as Header } from './dashboard/components/Header';
export { default as LeftSidebar } from './dashboard/components/LeftSidebar';
export { default as QuickActions } from './dashboard/components/QuickActions';
export { default as RightSidebar } from './dashboard/components/RightSidebar';
export { default as FeedItem } from './feeds/components/FeedItem';
export { default as FeedList } from './feeds/components/FeedList';
export { default as FeedVisualizer } from './feeds/components/FeedVisualizer';
export { default as SearchAndFilter } from './feeds/components/SearchAndFilter';
