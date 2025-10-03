import React, { useState } from 'react';
import { SettingsTab } from '../../contexts/SettingsContext';
import CORSSettings from './tabs/CORSSettings';
import ProtocolSettings from './tabs/ProtocolSettings';
import VerificationSettings from './tabs/VerificationSettings';
import DisplaySettings from './tabs/DisplaySettings';
import GeneralSettings from './tabs/GeneralSettings';
// IntegrationSettings removed from modal (deprecated)

export const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.GENERAL);
  const tabs: { key: SettingsTab; label: string }[] = [
    { key: SettingsTab.GENERAL, label: 'General' },
    { key: SettingsTab.CORS, label: 'CORS' },
    { key: SettingsTab.PROTOCOLS, label: 'Protocols' },
    { key: SettingsTab.VERIFICATION, label: 'Verification' },
    { key: SettingsTab.DISPLAY, label: 'Display' }
  ];
  const renderTab = () => {
    switch (activeTab) {
      case SettingsTab.GENERAL: return <GeneralSettings />;
      case SettingsTab.CORS: return <CORSSettings />;
      case SettingsTab.PROTOCOLS: return <ProtocolSettings />;
      case SettingsTab.VERIFICATION: return <VerificationSettings />;
      case SettingsTab.DISPLAY: return <DisplaySettings />;
      default: return null;
    }
  };
  return (
    <div className="settings-modal" role="dialog" aria-modal="true">
      <div className="settings-modal-header">
        <h2>Settings</h2>
        <button onClick={onClose} aria-label="Close Settings">×</button>
      </div>
      <div className="settings-modal-tabs">
        {tabs.map(t => (
          <button key={t.key} className={activeTab === t.key ? 'active' : ''} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="settings-modal-content">
        {renderTab()}
      </div>
    </div>
  );
};
