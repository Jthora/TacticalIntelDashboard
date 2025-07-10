// src/components/monitoring/ProductionMonitoringProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ProductionMonitoringSystem, SystemAlert } from '../../utils/ProductionMonitoringSystem';
import { ProductionDebugDashboard } from '../debug/ProductionDebugDashboard';

interface MonitoringContextType {
  monitoring: ProductionMonitoringSystem;
  systemStatus: any;
  alerts: SystemAlert[];
  isMonitoring: boolean;
  exportReport: () => void;
  triggerCleanup: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | null>(null);

interface ProductionMonitoringProviderProps {
  children: ReactNode;
  enableInProduction?: boolean;
  customConfig?: any;
}

export const ProductionMonitoringProvider: React.FC<ProductionMonitoringProviderProps> = ({
  children,
  enableInProduction = true,
  customConfig
}) => {
  const [monitoring] = useState(() => ProductionMonitoringSystem.getInstance());
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Initialize monitoring system
    const shouldEnable = process.env.NODE_ENV === 'production' ? enableInProduction : true;
    
    if (shouldEnable) {
      monitoring.initialize(customConfig);
      setIsMonitoring(true);
      
      // Subscribe to alerts
      const unsubscribeAlerts = monitoring.onAlert((alert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
      });
      
      // Subscribe to status updates
      const unsubscribeStatus = monitoring.onStatus((status) => {
        setSystemStatus(status);
      });
      
      // Initial status update
      setSystemStatus(monitoring.getSystemStatus());
      
      return () => {
        unsubscribeAlerts();
        unsubscribeStatus();
        monitoring.shutdown();
      };
    }
  }, [monitoring, enableInProduction, customConfig]);
  
  const exportReport = () => {
    const report = monitoring.exportSystemReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tactical-monitoring-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const triggerCleanup = () => {
    // This will be handled by the monitoring system's emergency cleanup
    window.dispatchEvent(new CustomEvent('tactical-manual-cleanup'));
  };
  
  const contextValue: MonitoringContextType = {
    monitoring,
    systemStatus,
    alerts,
    isMonitoring,
    exportReport,
    triggerCleanup
  };
  
  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
      <ProductionDebugDashboard />
    </MonitoringContext.Provider>
  );
};

export const useProductionMonitoring = (): MonitoringContextType => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useProductionMonitoring must be used within a ProductionMonitoringProvider');
  }
  return context;
};

// Hook for components to register cleanup callbacks
export const useMonitoringCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    const handleCleanup = () => {
      try {
        cleanupFn();
      } catch (error) {
        console.error('Error in component cleanup:', error);
      }
    };
    
    window.addEventListener('tactical-emergency-cleanup', handleCleanup);
    window.addEventListener('tactical-manual-cleanup', handleCleanup);
    
    return () => {
      window.removeEventListener('tactical-emergency-cleanup', handleCleanup);
      window.removeEventListener('tactical-manual-cleanup', handleCleanup);
    };
  }, [cleanupFn]);
};

// Hook for components to report performance metrics
export const usePerformanceTracking = (componentName: string) => {
  const { monitoring } = useProductionMonitoring();
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Report slow renders
      if (renderTime > 100) {
        console.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
  
  const trackNetworkRequest = () => {
    monitoring.getSystemStatus().performance && 
    monitoring.getSystemStatus().performance.trackNetworkRequest();
  };
  
  const trackWeb3Connection = () => {
    monitoring.getSystemStatus().performance && 
    monitoring.getSystemStatus().performance.trackWeb3Connection();
  };
  
  return { trackNetworkRequest, trackWeb3Connection };
};
