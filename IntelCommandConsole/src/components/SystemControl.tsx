import React, { useState } from 'react';

interface SystemControlProps {
  // Optional props for parent components to control or observe system settings
  onThemeChange?: (theme: 'dark' | 'night' | 'combat') => void;
  onCompactModeChange?: (enabled: boolean) => void;
  onRealTimeUpdatesChange?: (enabled: boolean) => void;
  onHealthAlertsChange?: (enabled: boolean) => void;
  onAutoExportChange?: (enabled: boolean) => void;
}

const SystemControl: React.FC<SystemControlProps> = ({
  onThemeChange,
  onCompactModeChange,
  onRealTimeUpdatesChange,
  onHealthAlertsChange,
  onAutoExportChange,
}) => {
  const [systemTheme, setSystemTheme] = useState<'dark' | 'night' | 'combat'>('dark');
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);
  const [healthAlerts, setHealthAlerts] = useState<boolean>(true);
  const [autoExport, setAutoExport] = useState<boolean>(false);

  const handleThemeChange = (theme: 'dark' | 'night' | 'combat') => {
    setSystemTheme(theme);
    onThemeChange?.(theme);
  };

  const handleCompactModeToggle = () => {
    const newMode = !compactMode;
    setCompactMode(newMode);
    onCompactModeChange?.(newMode);
  };

  const handleRealTimeUpdatesToggle = () => {
    const newUpdates = !realTimeUpdates;
    setRealTimeUpdates(newUpdates);
    onRealTimeUpdatesChange?.(newUpdates);
  };

  const handleHealthAlertsToggle = () => {
    const newAlerts = !healthAlerts;
    setHealthAlerts(newAlerts);
    onHealthAlertsChange?.(newAlerts);
  };

  const handleAutoExportToggle = () => {
    const newAutoExport = !autoExport;
    setAutoExport(newAutoExport);
    onAutoExportChange?.(newAutoExport);
  };

  return (
    <div className="tactical-module module-system-control">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">⚙</span>
          <h3>SYSTEM CONTROL</h3>
        </div>
        <div className="header-controls-micro">
          <select 
            value={systemTheme} 
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
            className={`micro-btn ${realTimeUpdates ? 'active' : ''}`}
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
};

export default SystemControl;
