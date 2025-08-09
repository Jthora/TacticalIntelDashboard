// Micro-Features Export Index
// Tactical Intel Dashboard - Interactive Components

// Header Control Features (Features 1-5)
export type { AlertLevelCyclingProps } from './AlertLevelCycling';
export { AlertLevelCycling } from './AlertLevelCycling';
export type { ConnectionStatusToggleProps } from './ConnectionStatusToggle';
export { ConnectionStatusToggle } from './ConnectionStatusToggle';
export type { RealTimeClockDisplayProps } from './RealTimeClockDisplay';
export { RealTimeClockDisplay } from './RealTimeClockDisplay';
export type { SortOption,SortPreferenceSelectorProps } from './SortPreferenceSelector';
export { SortPreferenceSelector } from './SortPreferenceSelector';
export type { ViewMode,ViewModeSwitcherProps } from './ViewModeSwitcher';
export { ViewModeSwitcher } from './ViewModeSwitcher';

// TODO: Add remaining micro-features as they are implemented
// ... etc

// Core Filter Features (Features 6-10)
export { default as ActiveFilterToggle } from './ActiveFilterToggle';
export { default as AutoRefreshControl } from './AutoRefreshControl';
export { default as MetricsVisibilityToggle } from './MetricsVisibilityToggle';
export type { PerformanceMode,PerformanceModeSelectorProps } from './PerformanceModeSelector';
export { default as PerformanceModeSelector } from './PerformanceModeSelector';
export type { ThemeConfiguration,ThemeMode, ThemeSwitcherProps } from './ThemeSwitcher';
export { default as ThemeSwitcher } from './ThemeSwitcher';

// Display Control Features (Features 11-15)
export { default as AutoExportScheduler } from './AutoExportScheduler';
export { default as CompactModeToggle } from './CompactModeToggle';

// Display & Layout Features (Features 14-15)
export { FilterMatrixButtons } from './FilterMatrixButtons';
export { type FilterConfiguration,type FilterPreset, QuickFilterPresets } from './QuickFilterPresets';

// Utility type for all micro-feature status
export type MicroFeatureStatus = 'active' | 'inactive' | 'disabled' | 'error';

// Common props interface for all micro-features
export interface BaseMicroFeatureProps {
  className?: string;
  disabled?: boolean;
  onStatusChange?: (status: MicroFeatureStatus) => void;
}
