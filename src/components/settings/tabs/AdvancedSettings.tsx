import '../../../assets/styles/components/general-settings.css';

import React from 'react';

import { SettingsTab,useSettings } from '../../../contexts/SettingsContext';

const AdvancedSettings: React.FC = () => {
  const { resetSettings } = useSettings();
  
  return (
    <div className="settings-form">
      <h2>Advanced System Configuration</h2>
      
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Performance Optimization</h3>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Enable hardware acceleration
            </label>
            <p className="settings-description">
              Uses GPU for rendering when available (recommended for complex visualizations)
            </p>
          </div>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Background processing for intelligence analysis
            </label>
          </div>
          
          <div className="form-group">
            <label>Worker Threads</label>
            <select className="form-control">
              <option value="1">1 (Minimal)</option>
              <option value="2" selected>2 (Balanced)</option>
              <option value="4">4 (Performance)</option>
              <option value="8">8 (Maximum)</option>
            </select>
            <p className="settings-description">
              Number of parallel processing threads for background operations
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Advanced Data Management</h3>
          
          <div className="form-group">
            <label>Indexing Strategy</label>
            <select className="form-control">
              <option value="standard" selected>Standard (Balanced)</option>
              <option value="aggressive">Aggressive (Faster Search)</option>
              <option value="minimal">Minimal (Lower Resource Usage)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked />
              Enable enhanced content extraction
            </label>
            <p className="settings-description">
              Deeper analysis of feed content (uses more processing power)
            </p>
          </div>
          
          <div className="form-group">
            <label>Log Level</label>
            <select className="form-control">
              <option value="error">Error Only</option>
              <option value="warn" selected>Warning</option>
              <option value="info">Information</option>
              <option value="debug">Debug</option>
              <option value="trace">Trace (Verbose)</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>System Operations</h3>
          
          <div className="form-group">
            <label>
              <input type="checkbox" />
              Enable telemetry (anonymous usage statistics)
            </label>
          </div>
          
          <div className="form-group">
            <button className="btn-secondary">Export Diagnostic Data</button>
          </div>
          
          <div className="form-group">
            <button className="btn-danger">Clear All Application Data</button>
            <p className="settings-description warning-text">
              Warning: This will reset all settings and clear cached intelligence data
            </p>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="btn-primary">Save Advanced Settings</button>
        <button 
          className="btn-secondary" 
          onClick={() => resetSettings(SettingsTab.ADVANCED)}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default AdvancedSettings;
