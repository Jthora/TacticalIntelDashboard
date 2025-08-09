import React, { useEffect } from 'react';
import { Outlet, useLocation,useNavigate, useParams } from 'react-router-dom';

import SettingsDebug from '../components/settings/SettingsDebug';
import SettingsErrorBoundary from '../components/settings/SettingsErrorBoundary';
import { SettingsTab,useSettings } from '../contexts/SettingsContext';

/**
 * SettingsPage displays the settings interface with tabs for different sections.
 * Each navigation item is a screen (route) with the complete cool styling.
 */
const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams<{ tab?: string }>();
  const { settings, updateSettings } = useSettings();
  
  // Extract tab from URL path directly as a backup method
  const pathSegments = location.pathname.split('/');
  const urlTab = pathSegments.length >= 3 ? pathSegments[2] : null;
  
  // Use either the param tab or extract from URL as fallback
  const activeTab = (tab || urlTab) as SettingsTab || SettingsTab.GENERAL;
  
  // If no tab is selected, redirect to default tab
  useEffect(() => {
    if (!tab && !urlTab) {
      console.log('[SettingsPage] No tab in URL, redirecting to general');
      navigate('/settings/general', { replace: true });
    }
  }, [tab, urlTab, navigate]);
  
  // Update last active tab in settings
  useEffect(() => {
    if (activeTab && Object.values(SettingsTab).includes(activeTab as SettingsTab)) {
      if (settings.lastTab !== activeTab) {
        console.log(`[SettingsPage] Updating last active tab to: ${activeTab}`);
        updateSettings({ lastTab: activeTab as SettingsTab });
      }
    }
  }, [activeTab, settings.lastTab, updateSettings]);

  const handleTabChange = (newTab: SettingsTab) => {
    console.log(`[SettingsPage] Tab click: ${newTab}`);
    
    // Navigate to the selected tab
    const newPath = `/settings/${newTab}`;
    navigate(newPath);
  };

  const handleBack = () => {
    navigate('/');
  };
  
  const getTabIcon = (tabValue: SettingsTab): string => {
    switch(tabValue) {
      case SettingsTab.GENERAL: return '⚙️';
      case SettingsTab.CORS: return '🔄';
      case SettingsTab.PROTOCOLS: return '📡';
      case SettingsTab.VERIFICATION: return '🔐';
      case SettingsTab.DISPLAY: return '🖥️';
      case SettingsTab.ADVANCED: return '⚡';
      default: return '•';
    }
  };
  
  return (
    <div className="settings-page">
      <SettingsDebug />
      {/* Sidebar for desktop view */}
      <div className="settings-sidebar">
        <div className="sidebar-header">
          <h3>Settings</h3>
          <p>v{settings.version}</p>
        </div>
        
        <div className="settings-sidebar-nav">
          {Object.values(SettingsTab).map((tabValue) => (
            <button 
              key={tabValue}
              className={`settings-tab ${activeTab === tabValue ? 'active' : ''}`}
              onClick={() => handleTabChange(tabValue)}
            >
              <span className="tab-icon">{getTabIcon(tabValue)}</span>
              {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="settings-main-content">
        <div className="settings-page-header">
          <button className="back-button" onClick={handleBack}>← Back to Dashboard</button>
          <h1>Tactical Control Settings</h1>
          <p>Configure system parameters and operational preferences {tab && `• ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}</p>
        </div>
        
        {/* Mobile view tabs (hidden on desktop) */}
        <div className="settings-tabs">
          {Object.values(SettingsTab).map((tabValue) => (
            <button 
              key={tabValue}
              className={`settings-tab ${activeTab === tabValue ? 'active' : ''}`}
              onClick={() => handleTabChange(tabValue)}
            >
              {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="settings-content">
          {/* This is where the tab content is rendered via nested routes */}
          <SettingsErrorBoundary>
            <Outlet />
          </SettingsErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
