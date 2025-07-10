import React, { useEffect, useState, useCallback, memo } from 'react';
import { useSettings, SettingsTab } from '../../../contexts/SettingsContext';
import { SettingsIntegrationService } from '../../../services/SettingsIntegrationService';
import DebugInfo from '../../debug/DebugInfo';
import SettingsChangeIndicator from '../SettingsChangeIndicator';
import ConfirmationDialog from '../ConfirmationDialog';
import '../../../assets/styles/components/general-settings.css';

const GeneralSettings: React.FC = memo(() => {
  const { settings } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes default
  const [preserveHistory, setPreserveHistory] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [notificationSound, setNotificationSound] = useState('ping');
  const [showNotificationCount, setShowNotificationCount] = useState(true);
  const [cacheDuration, setCacheDuration] = useState(1800); // 30 minutes default
  const [storageLimit, setStorageLimit] = useState(50); // 50 MB default
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // Initialize state from settings
  useEffect(() => {
    const generalSettings = SettingsIntegrationService.getGeneralSettings();
    setAutoRefresh(generalSettings.autoRefresh);
    setRefreshInterval(generalSettings.refreshInterval);
    setPreserveHistory(generalSettings.preserveHistory);
    setNotifications(generalSettings.notifications);
    setNotificationSound(generalSettings.notificationSound);
    setShowNotificationCount(generalSettings.showNotificationCount);
    setCacheDuration(generalSettings.cacheDuration);
    setStorageLimit(generalSettings.storageLimit);
    
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Validate that required context values are available
  useEffect(() => {
    if (!settings) {
      throw new Error('Settings context is not available. Make sure SettingsProvider is properly configured.');
    }
  }, [settings]);
  
  // Handle notification permission request
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotifications(true);
        setHasChanges(true);
      }
    }
  };
  
  // Test notification
  const testNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Tactical Intel Dashboard', {
        body: 'Test notification - your dashboard is working correctly!',
        icon: '/favicon.ico'
      });
    }
  };
  
  // Clear cache function with confirmation
  const clearCache = useCallback(() => {
    // Clear localStorage items related to feeds
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('feed_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Show feedback
    const settingsPanel = document.querySelector('.settings-content');
    if (settingsPanel) {
      const feedback = document.createElement('div');
      feedback.className = 'settings-feedback success';
      feedback.textContent = 'Cache cleared successfully!';
      settingsPanel.appendChild(feedback);
      
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
    
    setShowClearCacheDialog(false);
  }, []);
  
  // Save settings
  const saveSettings = useCallback(async () => {
    setIsApplying(true);
    
    try {
      // Update the general settings in the context
      // Note: Since we don't have general settings in SettingsContext yet, 
      // we'll save them to localStorage directly for now
      const generalSettings = {
        autoRefresh,
        refreshInterval,
        preserveHistory,
        notifications,
        notificationSound,
        showNotificationCount,
        cacheDuration,
        storageLimit
      };
      
      localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
      setHasChanges(false);
      
      // Reset the SettingsIntegrationService cache
      SettingsIntegrationService.resetCache();
      
      // Show feedback
      const settingsPanel = document.querySelector('.settings-content');
      if (settingsPanel) {
        const feedback = document.createElement('div');
        feedback.className = 'settings-feedback success';
        feedback.textContent = 'General settings saved successfully!';
        settingsPanel.appendChild(feedback);
        
        setTimeout(() => {
          feedback.remove();
        }, 3000);
      }
    } finally {
      setIsApplying(false);
    }
  }, [
    autoRefresh,
    refreshInterval,
    preserveHistory,
    notifications,
    notificationSound,
    showNotificationCount,
    cacheDuration,
    storageLimit
  ]);
  
  return (
    <div className="settings-form">
      <DebugInfo componentName="GeneralSettings" />
      <h2>General Dashboard Configuration</h2>
      
      <SettingsChangeIndicator
        hasChanges={hasChanges}
        isApplying={isApplying}
        onApply={saveSettings}
        onDiscard={() => setHasChanges(false)}
      />
      
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Application Information</h3>
          
          <div className="form-group">
            <label>Tactical Intel Dashboard Version</label>
            <div className="static-field">{settings.version}</div>
            <p className="settings-description">
              Current software version of your tactical intelligence platform.
            </p>
          </div>
          
          <div className="form-group">
            <label>System Status</label>
            <div className="status-indicator online">● OPERATIONAL</div>
          </div>
          
          <div className="form-group">
            <label>Notification Permission</label>
            <div className={`status-indicator ${notificationPermission === 'granted' ? 'online' : 'offline'}`}>
              {notificationPermission === 'granted' ? '● GRANTED' : 
               notificationPermission === 'denied' ? '● DENIED' : 
               '● NOT REQUESTED'}
            </div>
            {notificationPermission !== 'granted' && (
              <button 
                className="btn-secondary"
                onClick={requestNotificationPermission}
              >
                Request Permission
              </button>
            )}
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Dashboard Behavior</h3>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={autoRefresh}
                onChange={(e) => {
                  setAutoRefresh(e.target.checked);
                  setHasChanges(true);
                }}
              />
              Auto-refresh feeds in background
            </label>
          </div>
          
          <div className="form-group">
            <label>Refresh Interval</label>
            <select 
              className="form-control"
              value={refreshInterval}
              onChange={(e) => {
                setRefreshInterval(parseInt(e.target.value, 10));
                setHasChanges(true);
              }}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={preserveHistory}
                onChange={(e) => {
                  setPreserveHistory(e.target.checked);
                  setHasChanges(true);
                }}
              />
              Preserve feed history
            </label>
            <p className="settings-description">
              Keeps track of previously viewed items across sessions
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Notifications</h3>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={notifications}
                disabled={notificationPermission !== 'granted'}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  setHasChanges(true);
                }}
              />
              Enable desktop notifications
            </label>
            {notificationPermission !== 'granted' && (
              <p className="settings-description warning">
                Notification permission required
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label>Notification Sound</label>
            <select 
              className="form-control"
              value={notificationSound}
              onChange={(e) => {
                setNotificationSound(e.target.value);
                setHasChanges(true);
              }}
            >
              <option value="none">None</option>
              <option value="ping">Ping</option>
              <option value="alert">Alert</option>
              <option value="tactical">Tactical Alert</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={showNotificationCount}
                onChange={(e) => {
                  setShowNotificationCount(e.target.checked);
                  setHasChanges(true);
                }}
              />
              Show notification count in title
            </label>
          </div>
          
          {notificationPermission === 'granted' && (
            <div className="form-group">
              <button 
                className="btn-secondary"
                onClick={testNotification}
              >
                Test Notification
              </button>
            </div>
          )}
        </div>
        
        <div className="settings-section">
          <h3>Data Management</h3>
          
          <div className="form-group">
            <label>Cache Duration</label>
            <select 
              className="form-control"
              value={cacheDuration}
              onChange={(e) => {
                setCacheDuration(parseInt(e.target.value, 10));
                setHasChanges(true);
              }}
            >
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 hour</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Storage Limit</label>
            <select 
              className="form-control"
              value={storageLimit}
              onChange={(e) => {
                setStorageLimit(parseInt(e.target.value, 10));
                setHasChanges(true);
              }}
            >
              <option value={10}>10 MB</option>
              <option value={50}>50 MB</option>
              <option value={100}>100 MB</option>
              <option value={200}>200 MB</option>
            </select>
          </div>
          
          <div className="form-group">
            <button 
              className="btn-secondary btn-destructive"
              onClick={() => setShowClearCacheDialog(true)}
            >
              Clear All Cache
            </button>
            <p className="settings-description">
              This will remove all cached feed data and force fresh downloads.
            </p>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="btn-primary"
          onClick={saveSettings}
          disabled={!hasChanges}
        >
          Apply General Settings
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => resetSettings(SettingsTab.GENERAL)}
        >
          Reset to Defaults
        </button>
      </div>
      
      <ConfirmationDialog
        isOpen={showClearCacheDialog}
        title="Clear All Cache"
        message="This will permanently delete all cached feed data. Fresh data will be downloaded on the next request. This action cannot be undone."
        confirmText="Clear Cache"
        cancelText="Cancel"
        type="warning"
        onConfirm={clearCache}
        onCancel={() => setShowClearCacheDialog(false)}
      />
    </div>
  );
});

GeneralSettings.displayName = 'GeneralSettings';

export default GeneralSettings;
