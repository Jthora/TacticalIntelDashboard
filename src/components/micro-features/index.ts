// Micro-Features Export Index
// Tactical Intel Dashboard - Interactive Components

// Header Control Features (Features 1-5)
export { ConnectionStatusToggle } from './ConnectionStatusToggle';
export type { ConnectionStatusToggleProps } from './ConnectionStatusToggle';

export { AlertLevelCycling } from './AlertLevelCycling';
export type { AlertLevelCyclingProps } from './AlertLevelCycling';

export { RealTimeClockDisplay } from './RealTimeClockDisplay';
export type { RealTimeClockDisplayProps } from './RealTimeClockDisplay';

export { ViewModeSwitcher } from './ViewModeSwitcher';
export type { ViewModeSwitcherProps, ViewMode } from './ViewModeSwitcher';

export { SortPreferenceSelector } from './SortPreferenceSelector';
export type { SortPreferenceSelectorProps, SortOption } from './SortPreferenceSelector';

// TODO: Add remaining micro-features as they are implemented
// ... etc

// Core Filter Features (Features 6-10)
export { default as ActiveFilterToggle } from './ActiveFilterToggle';
export { default as AutoRefreshControl } from './AutoRefreshControl';
export { default as MetricsVisibilityToggle } from './MetricsVisibilityToggle';
export { default as PerformanceModeSelector } from './PerformanceModeSelector';
export type { PerformanceModeSelectorProps, PerformanceMode } from './PerformanceModeSelector';
export { default as ThemeSwitcher } from './ThemeSwitcher';
export type { ThemeSwitcherProps, ThemeMode, ThemeConfiguration } from './ThemeSwitcher';

// Display Control Features (Features 11-15)
export { default as CompactModeToggle } from './CompactModeToggle';
export { default as AutoExportScheduler } from './AutoExportScheduler';

// Display & Layout Features (Features 14-15)
export { FilterMatrixButtons } from './FilterMatrixButtons';
export { QuickFilterPresets, type FilterPreset, type FilterConfiguration } from './QuickFilterPresets';

// Utility type for all micro-feature status
export type MicroFeatureStatus = 'active' | 'inactive' | 'disabled' | 'error';

// Common props interface for all micro-features
export interface BaseMicroFeatureProps {
  className?: string;
  disabled?: boolean;
  onStatusChange?: (status: MicroFeatureStatus) => void;
}
