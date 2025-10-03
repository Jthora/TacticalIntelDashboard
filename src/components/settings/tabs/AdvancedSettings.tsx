import '../../../assets/styles/components/general-settings.css';
import React from 'react';
import { SettingsTab,useSettings } from '../../../contexts/SettingsContext';

// DEPRECATED: AdvancedSettings currently placeholder; hidden from navigation. Pending implementation or removal.
const AdvancedSettings: React.FC = () => {
  const { resetSettings } = useSettings();
  return (
    <div className="settings-form">
      <h2>Advanced System Configuration (Inactive)</h2>
      <p>Advanced settings are currently disabled.</p>
      <div className="settings-actions">
        <button 
          className="btn-secondary" 
          onClick={() => resetSettings(SettingsTab.ADVANCED)}
        >
          Reset Placeholder
        </button>
      </div>
    </div>
  );
};

export default AdvancedSettings;
