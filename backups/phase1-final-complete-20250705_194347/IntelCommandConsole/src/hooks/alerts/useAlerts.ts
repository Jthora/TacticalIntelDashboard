import { useState, useEffect, useCallback } from 'react';
import { AlertConfig, AlertTrigger } from '../../types/AlertTypes';
import AlertService from '../../services/alerts/AlertService';

export interface UseAlertsReturn {
  // Alert management
  alerts: AlertConfig[];
  createAlert: (config: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>) => string;
  updateAlert: (id: string, updates: Partial<AlertConfig>) => boolean;
  deleteAlert: (id: string) => boolean;
  toggleAlert: (id: string) => boolean;
  
  // Alert monitoring
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  
  // Alert history
  alertHistory: AlertTrigger[];
  getAlertHistory: (alertId?: string, limit?: number) => AlertTrigger[];
  clearAlertHistory: (alertId?: string) => void;
  
  // Alert operations
  snoozeAlert: (id: string, minutes: number) => boolean;
  acknowledgeAlert: (triggerId: string) => void;
  
  // Statistics
  alertStats: {
    totalAlerts: number;
    activeAlerts: number;
    totalTriggers: number;
    triggersToday: number;
  };
  
  // Feed monitoring
  checkFeedItems: (feedItems: any[]) => AlertTrigger[];
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertTrigger[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertStats, setAlertStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    totalTriggers: 0,
    triggersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const alertService = AlertService.getInstance();

  // Initialize alerts service and load data
  useEffect(() => {
    const initializeAlerts = async () => {
      try {
        setLoading(true);
        await alertService.initialize();
        refreshData();
        setIsMonitoring(alertService.isCurrentlyMonitoring());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize alerts');
      } finally {
        setLoading(false);
      }
    };

    initializeAlerts();
  }, []);

  // Refresh all alert data
  const refreshData = useCallback(() => {
    try {
      setAlerts(alertService.getAlerts());
      setAlertHistory(alertService.getAlertHistory());
      setAlertStats(alertService.getAlertStats());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh alert data');
    }
  }, [alertService]);

  // Create a new alert
  const createAlert = useCallback((config: Omit<AlertConfig, 'id' | 'createdAt' | 'triggerCount'>) => {
    try {
      const alertId = alertService.createAlert(config);
      refreshData();
      return alertId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
      throw err;
    }
  }, [alertService, refreshData]);

  // Update an existing alert
  const updateAlert = useCallback((id: string, updates: Partial<AlertConfig>) => {
    try {
      const success = alertService.updateAlert(id, updates);
      if (success) {
        refreshData();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
      return false;
    }
  }, [alertService, refreshData]);

  // Delete an alert
  const deleteAlert = useCallback((id: string) => {
    try {
      const success = alertService.deleteAlert(id);
      if (success) {
        refreshData();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
      return false;
    }
  }, [alertService, refreshData]);

  // Toggle alert active status
  const toggleAlert = useCallback((id: string) => {
    try {
      const success = alertService.toggleAlert(id);
      if (success) {
        refreshData();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle alert');
      return false;
    }
  }, [alertService, refreshData]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    try {
      alertService.startMonitoring();
      setIsMonitoring(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring');
    }
  }, [alertService]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    try {
      alertService.stopMonitoring();
      setIsMonitoring(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop monitoring');
    }
  }, [alertService]);

  // Get alert history
  const getAlertHistory = useCallback((alertId?: string, limit?: number) => {
    try {
      return alertService.getAlertHistory(alertId, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get alert history');
      return [];
    }
  }, [alertService]);

  // Clear alert history
  const clearAlertHistory = useCallback((alertId?: string) => {
    try {
      alertService.clearAlertHistory(alertId);
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear alert history');
    }
  }, [alertService, refreshData]);

  // Snooze an alert
  const snoozeAlert = useCallback((id: string, minutes: number) => {
    try {
      const success = alertService.snoozeAlert(id, minutes);
      if (success) {
        refreshData();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to snooze alert');
      return false;
    }
  }, [alertService, refreshData]);

  // Acknowledge an alert trigger
  const acknowledgeAlert = useCallback((triggerId: string) => {
    try {
      // Find and update the trigger in history
      const updatedHistory = alertHistory.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, acknowledged: true }
          : trigger
      );
      setAlertHistory(updatedHistory);
      
      // TODO: Persist acknowledgment to localStorage
      // This could be enhanced to save acknowledgments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  }, [alertHistory]);

  // Check feed items for alerts
  const checkFeedItems = useCallback((feedItems: any[]) => {
    try {
      const triggers = alertService.checkFeedItems(feedItems);
      if (triggers.length > 0) {
        refreshData();
      }
      return triggers;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check feed items');
      return [];
    }
  }, [alertService, refreshData]);

  return {
    // Alert management
    alerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    
    // Alert monitoring
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    
    // Alert history
    alertHistory,
    getAlertHistory,
    clearAlertHistory,
    
    // Alert operations
    snoozeAlert,
    acknowledgeAlert,
    
    // Statistics
    alertStats,
    
    // Feed monitoring
    checkFeedItems,
    
    // Loading states
    loading,
    error
  };
};

export default useAlerts;
