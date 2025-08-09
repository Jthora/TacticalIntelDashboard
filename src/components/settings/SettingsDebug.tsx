import React from 'react';
import { useLocation,useParams } from 'react-router-dom';

import { SettingsTab } from '../../contexts/SettingsContext';

/**
 * SettingsDebug - Displays debugging information for settings navigation
 * This helps troubleshoot issues with tab switching and route changes
 */
const SettingsDebug: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const location = useLocation();
  
  // Extract tab from URL path directly as a backup method
  const pathSegments = location.pathname.split('/');
  const urlTab = pathSegments.length >= 3 ? pathSegments[2] : null;
  
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }
  
  // Check if tab from params is a valid SettingsTab enum value
  const isParamTabValid = tab ? Object.values(SettingsTab).includes(tab as SettingsTab) : false;
  
  // Check if tab extracted from URL is a valid SettingsTab enum value
  const isUrlTabValid = urlTab ? Object.values(SettingsTab).includes(urlTab as SettingsTab) : false;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      color: isParamTabValid ? '#0f0' : '#f00',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <div><strong>Param Tab:</strong> {tab || 'none'} ({isParamTabValid ? 'valid' : 'invalid'})</div>
      <div><strong>URL Tab:</strong> {urlTab || 'none'} ({isUrlTabValid ? 'valid' : 'invalid'})</div>
      <div><strong>Path:</strong> {location.pathname}</div>
      <div><strong>Path Segments:</strong> {JSON.stringify(pathSegments)}</div>
      <div><strong>All Tabs:</strong> {Object.values(SettingsTab).join(', ')}</div>
    </div>
  );
};

export default SettingsDebug;
