import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SettingsService, SystemSettings } from '../services/SettingsService';

interface SystemControlProps {
  // Optional props for parent components to control or observe system settings
  onThemeChange?: (theme: 'dark' | 'night' | 'combat') => void;
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
  const { theme, compactMode, setTheme, setCompactMode } = useTheme();
  const [settings, setSettings] = useState<SystemSettings>();
  const [settingsService] = useState(() => SettingsService.getInstance());

  useEffect(() => {
    // Load initial settings
    const currentSettings = settingsService.getSettings();
    setSettings(currentSettings);

    // Subscribe to settings changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, [settingsService]);

  const handleThemeChange = useCallback((newTheme: 'dark' | 'night' | 'combat') => {
    setTheme(newTheme);
    settingsService.updateSettingWithNotification('theme', newTheme);
    onThemeChange?.(newTheme);
  }, [setTheme, settingsService, onThemeChange]);

  const handleCompactModeToggle = useCallback(() => {
    const newMode = !compactMode;
    setCompactMode(newMode);
    settingsService.updateSettingWithNotification('compactMode', newMode);
    onCompactModeChange?.(newMode);
  }, [compactMode, setCompactMode, settingsService, onCompactModeChange]);

  const handleRealTimeUpdatesToggle = useCallback(() => {
    if (!settings) return;
    const newUpdates = !settings.realTimeUpdates;
    settingsService.updateSettingWithNotification('realTimeUpdates', newUpdates);
    onRealTimeUpdatesChange?.(newUpdates);
  }, [settings, settingsService, onRealTimeUpdatesChange]);

  const handleHealthAlertsToggle = useCallback(() => {
    if (!settings) return;
    const newAlerts = !settings.healthAlerts;
    settingsService.updateSettingWithNotification('healthAlerts', newAlerts);
    onHealthAlertsChange?.(newAlerts);
  }, [settings, settingsService, onHealthAlertsChange]);

  const handleAutoExportToggle = useCallback(() => {
    if (!settings) return;
    const newAutoExport = !settings.autoExport;
    settingsService.updateSettingWithNotification('autoExport', newAutoExport);
    onAutoExportChange?.(newAutoExport);
  }, [settings, settingsService, onAutoExportChange]);

  if (!settings) {
    return <div className="tactical-module module-system-control">Loading...</div>;
  }

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
            onChange={(e) => handleThemeChange(e.target.value as any)}
            className="micro-select"
            title="Theme"
          >
            <option value="dark">DARK</option>
            <option value="night">NIGHT</option>
            <option value="combat">COMBAT</option>
          </select>
          <button 
            className={`micro-btn ${compactMode ? 'active' : ''}`}
            onClick={handleCompactModeToggle}
            title="Compact Mode"
          >
            ▣
          </button>
          <button 
            className={`micro-btn ${settings.realTimeUpdates ? 'active' : ''}`}
            onClick={handleRealTimeUpdatesToggle}
            title="Real-time Updates"
          >
            ⟲
          </button>
        </div>
      </div>
      <div className="tactical-content">
        <div className="system-controls-grid">
          <div className="control-group">
            <label className="control-label">ALERTS</label>
            <button 
              className={`control-toggle ${settings.healthAlerts ? 'active' : ''}`}
              onClick={handleHealthAlertsToggle}
            >
              {settings.healthAlerts ? '◉' : '○'}
            </button>
          </div>
          <div className="control-group">
            <label className="control-label">AUTO-EXPORT</label>
            <button 
              className={`control-toggle ${settings.autoExport ? 'active' : ''}`}
              onClick={handleAutoExportToggle}
            >
              {settings.autoExport ? '◉' : '○'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SystemControl;
