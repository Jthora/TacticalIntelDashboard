import './AlertManager.css';

import React, { useState } from 'react';

import useAlerts from '../../../hooks/alerts/useAlerts';
import { AlertConfig } from '../../../types/AlertTypes';
import AlertForm from './AlertForm';
import AlertHistory from './AlertHistory';
import AlertList from './AlertList';
import AlertStats from './AlertStats';

interface AlertManagerProps {
  className?: string;
}

type AlertManagerView = 'list' | 'create' | 'edit' | 'history' | 'stats';

const AlertManager: React.FC<AlertManagerProps> = ({ className = '' }) => {
  const [currentView, setCurrentView] = useState<AlertManagerView>('list');
  const [editingAlert, setEditingAlert] = useState<AlertConfig | null>(null);
  
  const {
    alerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    alertHistory,
    clearAlertHistory,
    snoozeAlert,
    acknowledgeAlert,
    alertStats,
    loading,
    error
  } = useAlerts();

  const handleCreateAlert = (alertData: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>) => {
    try {
      createAlert(alertData);
      setCurrentView('list');
    } catch (err) {
      console.error('Failed to create alert:', err);
    }
  };

  const handleEditAlert = (alert: AlertConfig) => {
    setEditingAlert(alert);
    setCurrentView('edit');
  };

  const handleUpdateAlert = (alertData: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>) => {
    if (!editingAlert) return;
    
    try {
      updateAlert(editingAlert.id, alertData);
      setEditingAlert(null);
      setCurrentView('list');
    } catch (err) {
      console.error('Failed to update alert:', err);
    }
  };

  const handleDeleteAlert = (alertId: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      deleteAlert(alertId);
    }
  };

  const handleCancelEdit = () => {
    setEditingAlert(null);
    setCurrentView('list');
  };

  const renderNavigation = () => (
    <div className="alert-manager-nav">
      <div className="nav-buttons">
        <button
          className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => setCurrentView('list')}
        >
          <span className="nav-icon">📋</span>
          Alerts ({alerts.length})
        </button>
        <button
          className={`nav-btn ${currentView === 'create' ? 'active' : ''}`}
          onClick={() => setCurrentView('create')}
        >
          <span className="nav-icon">➕</span>
          Create Alert
        </button>
        <button
          className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <span className="nav-icon">📜</span>
          History ({alertHistory.length})
        </button>
        <button
          className={`nav-btn ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentView('stats')}
        >
          <span className="nav-icon">📊</span>
          Statistics
        </button>
      </div>
      
      <div className="monitoring-controls">
        <div className={`monitoring-status ${isMonitoring ? 'active' : 'inactive'}`}>
          <span className="status-indicator"></span>
          {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
        </div>
        <button
          className={`monitoring-btn ${isMonitoring ? 'stop' : 'start'}`}
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
        >
          {isMonitoring ? '⏹️ Stop' : '▶️ Start'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="alert-loading">
          <div className="loading-spinner"></div>
          <p>Loading alerts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert-error">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'create':
        return (
          <AlertForm
            onSubmit={handleCreateAlert}
            onCancel={() => setCurrentView('list')}
          />
        );
        
      case 'edit':
        return editingAlert ? (
          <AlertForm
            initialAlert={editingAlert}
            onSubmit={handleUpdateAlert}
            onCancel={handleCancelEdit}
            isEditing
          />
        ) : null;
        
      case 'history':
        return (
          <AlertHistory
            history={alertHistory}
            onClearHistory={clearAlertHistory}
            onAcknowledge={acknowledgeAlert}
          />
        );
        
      case 'stats':
        return (
          <AlertStats
            stats={alertStats}
            alerts={alerts}
          />
        );
        
      case 'list':
      default:
        return (
          <AlertList
            alerts={alerts}
            onEdit={handleEditAlert}
            onDelete={handleDeleteAlert}
            onToggle={toggleAlert}
            onSnooze={snoozeAlert}
          />
        );
    }
  };

  return (
    <div className={`alert-manager ${className}`}>
      <div className="alert-manager-header">
        <h2>🚨 Alert Management</h2>
        <p>Configure and monitor real-time intelligence alerts</p>
      </div>
      
      {renderNavigation()}
      
      <div className="alert-manager-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AlertManager;
