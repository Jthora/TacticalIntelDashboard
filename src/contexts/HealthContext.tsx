/**
 * HealthContext - React Context for System Health Management
 * Provides health state management and diagnostic operations
 */

import React, { createContext, ReactNode,useContext, useEffect, useState } from 'react';

import DiagnosticService, { DiagnosticResult,SystemHealthState } from '../services/DiagnosticService';

interface HealthContextType {
  healthState: SystemHealthState;
  performScan: () => Promise<DiagnosticResult>;
  performClean: () => Promise<DiagnosticResult>;
  performRepair: () => Promise<DiagnosticResult>;
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  clearIssues: () => void;
  exportHealthData: () => object;
  isOperationInProgress: boolean;
  lastResult: DiagnosticResult | null;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

interface HealthProviderProps {
  children: ReactNode;
}

export const HealthProvider: React.FC<HealthProviderProps> = ({ children }) => {
  const [healthState, setHealthState] = useState<SystemHealthState>({
    overallStatus: 'OPTIMAL',
    connectionStatus: 'ONLINE',
    securityStatus: 'SECURE',
    issues: [],
    metrics: {
      responseTime: 50,
      errorRate: 0,
      dataIntegrity: 100,
      connectionStability: 98,
      memoryUsage: 45,
      feedHealth: 95,
      lastScanTime: new Date(),
      uptime: 0
    },
    isScanning: false,
    isCleaning: false,
    isRepairing: false
  });

  const [lastResult, setLastResult] = useState<DiagnosticResult | null>(null);
  const diagnosticService = DiagnosticService.getInstance();

  useEffect(() => {
    // Subscribe to diagnostic service updates
    const unsubscribe = diagnosticService.subscribe((state: SystemHealthState) => {
      setHealthState(state);
    });

    // Start lightweight monitoring
    diagnosticService.startMonitoring(30000); // 30 seconds

    return () => {
      unsubscribe();
      diagnosticService.stopMonitoring();
    };
  }, [diagnosticService]);

  const performScan = async (): Promise<DiagnosticResult> => {
    const result = await diagnosticService.performScan();
    setLastResult(result);
    return result;
  };

  const performClean = async (): Promise<DiagnosticResult> => {
    const result = await diagnosticService.performClean();
    setLastResult(result);
    return result;
  };

  const performRepair = async (): Promise<DiagnosticResult> => {
    const result = await diagnosticService.performRepair();
    setLastResult(result);
    return result;
  };

  const startMonitoring = (intervalMs?: number): void => {
    diagnosticService.startMonitoring(intervalMs);
  };

  const stopMonitoring = (): void => {
    diagnosticService.stopMonitoring();
  };

  const clearIssues = (): void => {
    diagnosticService.clearIssues();
  };

  const exportHealthData = (): object => {
    return diagnosticService.exportHealthData();
  };

  const isOperationInProgress = healthState.isScanning || healthState.isCleaning || healthState.isRepairing;

  const value: HealthContextType = {
    healthState,
    performScan,
    performClean,
    performRepair,
    startMonitoring,
    stopMonitoring,
    clearIssues,
    exportHealthData,
    isOperationInProgress,
    lastResult
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};

export default HealthContext;
