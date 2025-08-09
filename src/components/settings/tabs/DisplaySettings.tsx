import '../../../assets/styles/components/general-settings.css';

import React, { useCallback,useEffect, useState } from 'react';

import { SettingsTab,useSettings } from '../../../contexts/SettingsContext';
import { displaySettings } from '../../../utils/DisplaySettingsManager';

const DisplaySettings: React.FC = React.memo(() => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      display: {
        ...settings.display,
        theme: e.target.value as 'light' | 'dark' | 'system' | 'alliance'
      }
    });
    setHasChanges(true);
  }, [settings.display, updateSettings]);
  
  const handleDensityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      display: {
        ...settings.display,
        density: e.target.value as 'comfortable' | 'compact' | 'spacious'
      }
    });
    setHasChanges(true);
  }, [settings.display, updateSettings]);
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      display: {
        ...settings.display,
        fontSize: parseInt(e.target.value, 10)
      }
    });
    setHasChanges(true);
  };
  
  // Apply settings changes immediately for real-time preview
  useEffect(() => {
    if (hasChanges) {
      displaySettings.apply();
    }
  }, [settings.display, hasChanges]);
  
  const handleApplySettings = () => {
    displaySettings.apply();
    setHasChanges(false);
    
    // Show feedback to the user
    const settingsPanel = document.querySelector('.settings-content');
    if (settingsPanel) {
      const feedback = document.createElement('div');
      feedback.className = 'settings-feedback success';
      feedback.textContent = 'Display settings applied successfully!';
      settingsPanel.appendChild(feedback);
      
      // Remove feedback after 3 seconds
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
  };
  
  const handleResetSettings = () => {
    resetSettings(SettingsTab.DISPLAY);
    setHasChanges(true);
  };
  
  return (
    <div className="settings-form">
      <h2>Tactical Display Configuration</h2>
      
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Visual Theme</h3>
          
          <div className="form-group">
            <label htmlFor="theme-select">Interface Theme</label>
            <select
              id="theme-select"
              value={settings.display.theme}
              onChange={handleThemeChange}
            >
              <option value="dark">Dark Ops (Default)</option>
              <option value="night">Night Operations</option>
              <option value="combat">Combat Mode</option>
              <option value="light">Daylight Operations</option>
              <option value="system">System-Matched</option>
              <option value="alliance">Earth Alliance Standard</option>
            </select>
            <p className="settings-description">
              Select the visual theme for your tactical interface.
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="density-select">Information Density</label>
            <select
              id="density-select"
              value={settings.display.density}
              onChange={handleDensityChange}
            >
              <option value="compact">Compact (Maximum Intel)</option>
              <option value="comfortable">Comfortable (Balanced)</option>
              <option value="spacious">Spacious (Enhanced Readability)</option>
            </select>
            <p className="settings-description">
              Controls how densely information is displayed on your dashboard.
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Text Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="font-size-slider">Base Font Size: {settings.display.fontSize}px</label>
            <input
              id="font-size-slider"
              type="range"
              min="10"
              max="20"
              step="1"
              value={settings.display.fontSize}
              onChange={handleFontSizeChange}
            />
            <div className="font-size-example" style={{ fontSize: `${settings.display.fontSize}px` }}>
              Sample text at current size
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Use high-contrast text for critical data
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Dashboard Layout</h3>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Show timestamp for all intelligence items
            </label>
          </div>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Show source indicator badges
            </label>
          </div>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Enable tactical animations
            </label>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="btn-primary"
          onClick={handleApplySettings}
        >
          Apply Display Settings
        </button>
        <button 
          className="btn-secondary" 
          onClick={handleResetSettings}
        >
          Reset Display
        </button>
      </div>
      
      {hasChanges && (
        <div className="settings-feedback">
          <p>You have unsaved changes to your display settings.</p>
        </div>
      )}
    </div>
  );
});

export default DisplaySettings;
