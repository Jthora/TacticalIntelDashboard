import React, { useState } from 'react';
import { useSettings, SettingsTab } from '../../contexts/SettingsContext';
import CORSSettings from './tabs/CORSSettings';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>(settings.lastTab);
  
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    updateSettings({ lastTab: tab });
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case SettingsTab.GENERAL:
        return <div>General Settings Content</div>;
      case SettingsTab.CORS:
        return <CORSSettings />;
      case SettingsTab.PROTOCOLS:
        return <div>Protocol Settings Content</div>;
      case SettingsTab.VERIFICATION:
        return <div>Verification Settings Content</div>;
      case SettingsTab.DISPLAY:
        return <div>Display Settings Content</div>;
      case SettingsTab.ADVANCED:
        return <div>Advanced Settings Content</div>;
      default:
        return <div>General Settings Content</div>;
    }
  };
  
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button 
            className="settings-modal-close" 
            onClick={onClose}
            aria-label="Close Settings"
          >
            ✕
          </button>
        </div>
        
        <div className="settings-modal-content">
          <div className="settings-tabs">
            <ul>
              {Object.values(SettingsTab).map(tab => (
                <li 
                  key={tab}
                  className={tab === activeTab ? 'active' : ''}
                >
                  <button onClick={() => handleTabChange(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="settings-tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
