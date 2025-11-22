import React, { memo,useCallback,useMemo } from 'react';

import { DEFAULT_MISSION_MODE } from '../constants/MissionMode';
import { useMissionMode } from '../contexts/MissionModeContext';
import { useSettings } from '../contexts/SettingsContext';
import { Theme, useTheme } from '../contexts/ThemeContext';

interface SystemControlProps {
  // Optional props for parent components to control or observe system settings
  onThemeChange?: (theme: Theme) => void;
  onCompactModeChange?: (enabled: boolean) => void;
  onRealTimeUpdatesChange?: (enabled: boolean) => void;
  onHealthAlertsChange?: (enabled: boolean) => void;
  onAutoExportChange?: (enabled: boolean) => void;
}

const SystemControl: React.FC<SystemControlProps> = memo(({
  onThemeChange,
  onCompactModeChange,
  onRealTimeUpdatesChange,
  onHealthAlertsChange,
  onAutoExportChange,
}) => {
  const {
    theme,
    compactMode,
    isUserOverride,
    setTheme,
    setCompactMode,
    applyModeTheme,
    clearThemeOverride
  } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { profile } = useMissionMode();

  const themeOptions = useMemo<Theme[]>(() => {
    const baseOptions: Theme[] = ['spaceforce', 'dark', 'night', 'combat', 'alliance', 'light', 'system'];
    return baseOptions.includes(profile.defaultTheme)
      ? baseOptions
      : [profile.defaultTheme, ...baseOptions];
  }, [profile.defaultTheme]);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    updateSettings({
      display: {
        ...settings.display,
        theme: newTheme as any
      }
    });
    onThemeChange?.(newTheme);
  }, [setTheme, settings.display, updateSettings, onThemeChange]);

  const handleCompactModeToggle = useCallback(() => {
    const newMode = !compactMode;
    setCompactMode(newMode);
    updateSettings({
      display: {
        ...settings.display,
        density: newMode ? 'compact' : 'comfortable'
      }
    });
    onCompactModeChange?.(newMode);
  }, [compactMode, setCompactMode, settings.display, updateSettings, onCompactModeChange]);

  const handleRealTimeUpdatesToggle = useCallback(() => {
    const currentRefreshInterval = settings.general?.refreshInterval ?? 300000;
    const newInterval = currentRefreshInterval === 300000 ? 60000 : 300000; // Toggle between 1min and 5min
    
    updateSettings({
      general: {
        mode: settings.general?.mode ?? DEFAULT_MISSION_MODE,
        refreshInterval: newInterval,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: settings.general?.notifications ?? { enabled: true, sound: false },
        export: settings.general?.export ?? {
          format: 'json',
          autoExport: false,
          includeMetadata: true,
          compress: false,
          encrypt: true
        }
      }
    });
    
    onRealTimeUpdatesChange?.(newInterval === 60000);
  }, [settings.general, updateSettings, onRealTimeUpdatesChange]);

  const handleHealthAlertsToggle = useCallback(() => {
    const currentNotifications = settings.general?.notifications?.enabled ?? true;
    
    updateSettings({
      general: {
        mode: settings.general?.mode ?? DEFAULT_MISSION_MODE,
        refreshInterval: settings.general?.refreshInterval ?? 300000,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: {
          enabled: !currentNotifications,
          sound: settings.general?.notifications?.sound ?? false
        },
        export: settings.general?.export ?? {
          format: 'json',
          autoExport: false,
          includeMetadata: true,
          compress: false,
          encrypt: true
        }
      }
    });
    
    onHealthAlertsChange?.(!currentNotifications);
  }, [settings.general, updateSettings, onHealthAlertsChange]);

  const handleAutoExportToggle = useCallback(() => {
    const currentAutoExport = settings.general?.export?.autoExport ?? false;
    
    updateSettings({
      general: {
        mode: settings.general?.mode ?? DEFAULT_MISSION_MODE,
        refreshInterval: settings.general?.refreshInterval ?? 300000,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: settings.general?.notifications ?? { enabled: true, sound: false },
        export: {
          format: settings.general?.export?.format ?? 'json',
          autoExport: !currentAutoExport,
          includeMetadata: settings.general?.export?.includeMetadata ?? true,
          compress: settings.general?.export?.compress ?? false,
          encrypt: settings.general?.export?.encrypt ?? true
        }
      }
    });
    
    onAutoExportChange?.(!currentAutoExport);
  }, [settings.general, updateSettings, onAutoExportChange]);

  const handleResetTheme = useCallback(() => {
    clearThemeOverride();
    applyModeTheme(profile.defaultTheme);
  }, [applyModeTheme, clearThemeOverride, profile.defaultTheme]);

  if (!settings) {
    return <div className="tactical-module module-system-control">Loading...</div>;
  }

  // Derived state from settings
  const realTimeUpdates = (settings.general?.refreshInterval ?? 300000) === 60000;
  const healthAlerts = settings.general?.notifications?.enabled ?? true;
  const autoExport = settings.general?.export?.autoExport ?? false;

  return (
    <div className="tactical-module module-system-control">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">⚙</span>
          <h3>SYSTEM CONTROL</h3>
        </div>
        <div className="header-controls-micro">
          <select 
            value={theme} 
            onChange={(e) => handleThemeChange(e.target.value as Theme)}
            className="micro-select"
            title="Theme"
            aria-label="Select interface theme"
          >
            {themeOptions.map(option => (
              <option key={option} value={option}>{option.toUpperCase()}</option>
            ))}
          </select>
          <button 
            className={`micro-btn ${compactMode ? 'active' : ''}`}
            onClick={handleCompactModeToggle}
            title="Compact Mode"
            aria-label="Toggle compact mode"
            aria-pressed={compactMode}
          >
            ▣
          </button>
          <button 
            className={`micro-btn ${realTimeUpdates ? 'active' : ''}`}
            onClick={handleRealTimeUpdatesToggle}
            title="Real-time Updates"
            aria-label="Toggle real-time updates"
            aria-pressed={realTimeUpdates}
          >
            ⟲
          </button>
        </div>
      </div>
      <div className="tactical-content">
        <div className="mission-theme-status" role="status" aria-live="polite">
          <span className="status-label">
            {isUserOverride ? 'Custom theme active' : `${profile.label} theme active`}
          </span>
          {isUserOverride && (
            <button
              className="micro-btn reset-theme-btn"
              onClick={handleResetTheme}
              title="Reset to mission theme"
              aria-label="Reset theme to mission default"
            >
              RESET TO MISSION
            </button>
          )}
        </div>
        <div className="system-controls-grid">
          <div className="control-group">
            <label className="control-label">ALERTS</label>
            <button 
              className={`control-toggle ${healthAlerts ? 'active' : ''}`}
              onClick={handleHealthAlertsToggle}
            >
              {healthAlerts ? '◉' : '○'}
            </button>
          </div>
          <div className="control-group">
            <label className="control-label">AUTO-EXPORT</label>
            <button 
              className={`control-toggle ${autoExport ? 'active' : ''}`}
              onClick={handleAutoExportToggle}
            >
              {autoExport ? '◉' : '○'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SystemControl;
