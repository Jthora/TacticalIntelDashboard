import React from 'react';
import { Navigate,useParams } from 'react-router-dom';

import { SettingsTab } from '../../contexts/SettingsContext';
import SettingsError from './SettingsError';
import AdvancedSettings from './tabs/AdvancedSettings';
import CORSSettings from './tabs/CORSSettings';
import DisplaySettings from './tabs/DisplaySettings';
import GeneralSettings from './tabs/GeneralSettings';
import ProtocolSettings from './tabs/ProtocolSettings';
import VerificationSettings from './tabs/VerificationSettings';

/**
 * Dynamic settings content loader that renders the appropriate
 * tab component based on the URL parameter.
 */
const SettingsTabContent: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  
  // Safety check - if no tab is specified, redirect to general
  if (!tab) {
    console.log('[SettingsTabContent] No tab specified, redirecting to general');
    return <Navigate to="/settings/general" replace />;
  }
  
  // Log which tab we're trying to render
  console.log(`[SettingsTabContent] Rendering tab: ${tab}`);
  
  // Render the appropriate component based on the tab parameter
  switch (tab) {
    case SettingsTab.GENERAL:
      return <GeneralSettings />;
    case SettingsTab.CORS:
      return <CORSSettings />;
    case SettingsTab.PROTOCOLS:
      return <ProtocolSettings />;
    case SettingsTab.VERIFICATION:
      return <VerificationSettings />;
    case SettingsTab.DISPLAY:
      return <DisplaySettings />;
    case SettingsTab.ADVANCED:
      return <AdvancedSettings />;
    default:
      console.error(`[SettingsTabContent] Invalid tab: ${tab}`);
      return (
        <SettingsError
          message="Invalid Settings Tab"
          details={`The requested tab "${tab}" does not exist.`}
          code={`Expected one of: ${Object.values(SettingsTab).join(', ')}`}
        />
      );
  }
};

export default SettingsTabContent;
