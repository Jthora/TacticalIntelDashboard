import React, { useCallback, useEffect, useMemo, useRef,useState } from 'react';

// Health alert interfaces
interface HealthAlert {
  id: string;
  type: 'source' | 'system' | 'network' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  sourceId?: string;
  acknowledged: boolean;
}

interface AlertThresholds {
  sourceOfflineTime: number; // seconds
  errorThreshold: number;
  responseTimeThreshold: number; // milliseconds
  dataFreshnessThreshold: number; // seconds
}

interface IntelligenceSource {
  id: string;
  name: string;
  isOnline: boolean;
  status: string;
  lastSeen: string;
  errorCount: number;
}

interface HealthConfig {
  alertsEnabled: boolean;
  activeAlerts: HealthAlert[];
  alertThresholds: AlertThresholds;
}

interface HealthAlertsSwitchProps {
  onHealthAlertsChange?: (enabled: boolean, config: HealthConfig) => void;
  initialEnabled?: boolean;
  disabled?: boolean;
  className?: string;
  sources?: IntelligenceSource[];
  alertThresholds?: AlertThresholds;
}

// Default alert thresholds
const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  sourceOfflineTime: 300, // 5 minutes
  errorThreshold: 3,
  responseTimeThreshold: 5000, // 5 seconds
  dataFreshnessThreshold: 3600 // 1 hour
};

const HealthAlertsSwitch: React.FC<HealthAlertsSwitchProps> = ({
  onHealthAlertsChange,
  initialEnabled = true,
  disabled = false,
  className = '',
  sources = [],
  alertThresholds = DEFAULT_ALERT_THRESHOLDS
}) => {
  // Validate initial state
  const validInitialEnabled = typeof initialEnabled === 'boolean' ? initialEnabled : true;
  
  const [isEnabled, setIsEnabled] = useState<boolean>(validInitialEnabled);
  const [activeAlerts, setActiveAlerts] = useState<HealthAlert[]>([]);
  const alertCacheRef = useRef<Map<string, HealthAlert>>(new Map());
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabledRef = useRef<boolean>(validInitialEnabled);

  // Memoize alert thresholds to prevent unnecessary re-renders
  const thresholds = useMemo(() => ({
    ...DEFAULT_ALERT_THRESHOLDS,
    ...alertThresholds
  }), [alertThresholds]);

  // Memoize sources to prevent unnecessary re-renders from array recreation
  const memoizedSources = useMemo(() => sources, [JSON.stringify(sources)]);

  // Check source health and generate alerts
  const checkSourceHealth = useCallback((source: IntelligenceSource): HealthAlert[] => {
    const alerts: HealthAlert[] = [];
    const now = new Date();
    
    // Check if source is offline too long
    if (!source.isOnline) {
      const offlineTime = now.getTime() - new Date(source.lastSeen).getTime();
      if (offlineTime > thresholds.sourceOfflineTime * 1000) {
        alerts.push({
          id: `source-offline-${source.id}`,
          type: 'source',
          severity: 'high',
          message: `Source ${source.name} offline for ${Math.round(offlineTime / 60000)} minutes`,
          timestamp: now,
          sourceId: source.id,
          acknowledged: false
        });
      }
    }
    
    // Check error rate
    if (source.errorCount > thresholds.errorThreshold) {
      alerts.push({
        id: `source-errors-${source.id}`,
        type: 'source',
        severity: 'medium',
        message: `Source ${source.name} has ${source.errorCount} errors`,
        timestamp: now,
        sourceId: source.id,
        acknowledged: false
      });
    }
    
    return alerts;
  }, [thresholds]);

  // Check system health
  const checkSystemHealth = useCallback((): HealthAlert[] => {
    // Placeholder for system health checks
    // In real implementation, this would check memory, CPU, disk, etc.
    return [];
  }, []);

  // Check network health
  const checkNetworkHealth = useCallback((): HealthAlert[] => {
    // Placeholder for network health checks
    // In real implementation, this would check connectivity, latency, etc.
    return [];
  }, []);

  // Check for duplicate alerts
  const isDuplicateAlert = useCallback((alert: HealthAlert): boolean => {
    const existing = alertCacheRef.current.get(alert.id);
    if (!existing) return false;
    
    // Consider duplicate if same alert within 5 minutes
    const timeDiff = alert.timestamp.getTime() - existing.timestamp.getTime();
    return timeDiff < 300000; // 5 minutes
  }, []);

  // Perform comprehensive health check
  const performHealthCheck = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    const newAlerts: HealthAlert[] = [];
    
    // Check source health
    memoizedSources.forEach(source => {
      const sourceAlerts = checkSourceHealth(source);
      newAlerts.push(...sourceAlerts);
    });
    
    // Check system health
    const systemAlerts = checkSystemHealth();
    newAlerts.push(...systemAlerts);
    
    // Check network health
    const networkAlerts = checkNetworkHealth();
    newAlerts.push(...networkAlerts);
    
    // Filter out duplicates
    const uniqueAlerts = newAlerts.filter(alert => !isDuplicateAlert(alert));
    
    // Update alert cache
    uniqueAlerts.forEach(alert => {
      alertCacheRef.current.set(alert.id, alert);
    });
    
    // Only update state if alerts have actually changed
    setActiveAlerts(prevAlerts => {
      // Compare alert IDs to see if anything changed
      const newIds = new Set(uniqueAlerts.map(a => a.id));
      const prevIds = new Set(prevAlerts.map(a => a.id));
      
      // Check if we have the same alerts
      if (newIds.size === prevIds.size && 
          [...newIds].every(id => prevIds.has(id))) {
        return prevAlerts; // No change, return previous state
      }
      
      return uniqueAlerts; // Return new alerts
    });
    
  }, [memoizedSources]); // Only depend on memoized sources to prevent infinite loops

  // Initialize health monitoring
  const initializeHealthMonitoring = useCallback(() => {
    // Clear any existing interval
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }
    
    // Start new monitoring interval
    healthCheckIntervalRef.current = setInterval(performHealthCheck, 30000); // Every 30 seconds
    
    // Perform initial check
    performHealthCheck();
  }, [performHealthCheck]);

  // Disable health monitoring
  const disableHealthMonitoring = useCallback(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    
    // Clear all alerts
    setActiveAlerts([]);
    alertCacheRef.current.clear();
  }, []);

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (disabled) return;

    setIsEnabled(prev => {
      const newState = !prev;
      isEnabledRef.current = newState; // Keep ref in sync

      // Prepare configuration
      const config: HealthConfig = {
        alertsEnabled: newState,
        activeAlerts: newState ? activeAlerts : [],
        alertThresholds: thresholds
      };

      // Initialize or disable monitoring based on new state
      if (newState) {
        initializeHealthMonitoring();
      } else {
        disableHealthMonitoring();
      }

      // Call callback with error handling
      if (onHealthAlertsChange) {
        try {
          onHealthAlertsChange(newState, config);
        } catch (error) {
          console.warn('Error in health alerts change callback:', error);
        }
      }

      return newState;
    });
  }, [disabled, activeAlerts, thresholds, onHealthAlertsChange, initializeHealthMonitoring, disableHealthMonitoring]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  // Initialize monitoring when component mounts or when enabled state changes
  useEffect(() => {
    isEnabledRef.current = isEnabled; // Keep ref in sync
    
    if (isEnabled) {
      initializeHealthMonitoring();
    } else {
      disableHealthMonitoring();
    }

    // Cleanup on unmount
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [isEnabled]); // Remove function dependencies that cause infinite loops

  // Trigger immediate health check when sources change
  useEffect(() => {
    if (isEnabled && memoizedSources.length > 0) {
      // Create a new health check function that doesn't cause dependency issues
      const checkHealth = () => {
        if (!isEnabledRef.current) return;
        
        const newAlerts: HealthAlert[] = [];
        
        // Check each source
        memoizedSources.forEach(source => {
          const sourceAlerts = checkSourceHealth(source);
          newAlerts.push(...sourceAlerts);
        });
        
        // Check system health
        const systemAlerts = checkSystemHealth();
        newAlerts.push(...systemAlerts);
        
        // Check network health
        const networkAlerts = checkNetworkHealth();
        newAlerts.push(...networkAlerts);
        
        // Filter out duplicates
        const uniqueAlerts = newAlerts.filter(alert => !isDuplicateAlert(alert));
        
        // Update alert cache
        uniqueAlerts.forEach(alert => {
          alertCacheRef.current.set(alert.id, alert);
        });
        
        // Only update state if alerts have actually changed
        setActiveAlerts(prevAlerts => {
          // Compare alert IDs to see if anything changed
          const newIds = new Set(uniqueAlerts.map(a => a.id));
          const prevIds = new Set(prevAlerts.map(a => a.id));
          
          // Check if we have the same alerts
          if (newIds.size === prevIds.size && 
              [...newIds].every(id => prevIds.has(id))) {
            return prevAlerts; // No change, return previous state
          }
          
          return uniqueAlerts; // Return new alerts
        });
      };
      
      // Use a timeout to debounce rapid changes
      const timeoutId = setTimeout(checkHealth, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [memoizedSources, isEnabled]); // Removed function dependencies to prevent infinite loops

  return (
    <div className={`health-alerts-switch ${className}`.trim()}>
      <button
        type="button"
        className={`health-btn ${isEnabled ? 'active' : 'inactive'}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        title={`Health Alerts: ${isEnabled ? 'ENABLED' : 'DISABLED'}`}
        aria-pressed={isEnabled}
      >
        <span className="health-icon">
          {isEnabled ? '🚨' : '🔕'}
        </span>
      </button>
      {isEnabled && activeAlerts.length > 0 && (
        <span className="alert-count">
          {activeAlerts.length}
        </span>
      )}
    </div>
  );
};

export default HealthAlertsSwitch;
