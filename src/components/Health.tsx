import React, { useCallback,useState } from 'react';

import { useHealth } from '../contexts/HealthContext';
import { DiagnosticResult } from '../services/DiagnosticService';

interface HealthProps {
  feedCount?: number;
  onScan?: () => void;
  onClean?: () => void;
  onRepair?: () => void;
  connectionStatus?: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  securityStatus?: 'SECURE' | 'COMPROMISED' | 'UNKNOWN';
  overallStatus?: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

const Health: React.FC<HealthProps> = ({
  feedCount = 0,
  onScan,
  onClean,
  onRepair
}) => {
  const { healthState, performScan, performClean, performRepair, isOperationInProgress } = useHealth();
  const [, setLastOperation] = useState<string>('');
  const [operationResult, setOperationResult] = useState<DiagnosticResult | null>(null);

  // Use health state from context, falling back to props or defaults
  const connectionStatus = healthState.connectionStatus;
  const securityStatus = healthState.securityStatus;
  const overallStatus = healthState.overallStatus;
  const currentIssues = healthState.issues;
  const metrics = healthState.metrics;

  const handleScan = useCallback(async () => {
    setLastOperation('scan');
    try {
      const result = await performScan();
      setOperationResult(result);
      onScan?.();
    } catch (error) {
      console.error('Scan failed:', error);
    }
  }, [performScan, onScan]);

  const handleClean = useCallback(async () => {
    setLastOperation('clean');
    try {
      const result = await performClean();
      setOperationResult(result);
      onClean?.();
    } catch (error) {
      console.error('Clean failed:', error);
    }
  }, [performClean, onClean]);

  const handleRepair = useCallback(async () => {
    setLastOperation('repair');
    try {
      const result = await performRepair();
      setOperationResult(result);
      onRepair?.();
    } catch (error) {
      console.error('Repair failed:', error);
    }
  }, [performRepair, onRepair]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
      case 'ONLINE':
      case 'SECURE':
        return '#00ff41';
      case 'WARNING':
      case 'CONNECTING':
        return '#ffa500';
      case 'CRITICAL':
      case 'OFFLINE':
      case 'COMPROMISED':
        return '#ff0000';
      default:
        return '#ffffff';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'online';
      case 'SECURE':
        return 'secure';
      case 'ACTIVE':
        return 'active';
      default:
        return '';
    }
  };

  return (
    <div className="tactical-module module-health">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">💚</span>
          <h3>HEALTH</h3>
        </div>
        <div className="header-status">
          <span className="status-dot" style={{ background: getStatusColor(overallStatus) }}></span>
          <span className="status-text">{overallStatus}</span>
        </div>
      </div>
      <div className="tactical-content">
        <div className="health-indicators-micro">
          <div className="health-item">
            <span className="health-icon">🔗</span>
            <span className="health-label">CONNECTIONS</span>
            <span className={`health-status ${getStatusClass(connectionStatus)}`}>{connectionStatus}</span>
          </div>
          <div className="health-item">
            <span className="health-icon">🛡</span>
            <span className="health-label">SECURITY</span>
            <span className={`health-status ${getStatusClass(securityStatus)}`}>{securityStatus}</span>
          </div>
          <div className="health-item">
            <span className="health-icon">📊</span>
            <span className="health-label">FEEDS</span>
            <span className={`health-status ${getStatusClass('ACTIVE')}`}>{feedCount} ACTIVE</span>
          </div>
        </div>
        
        <div className="diagnostic-actions">
          <button 
            className={`diagnostic-btn scan ${healthState.isScanning ? 'scanning' : ''}`}
            onClick={handleScan}
            disabled={isOperationInProgress}
          >
            {healthState.isScanning ? '⏳ SCANNING...' : '🔍 SCAN'}
          </button>
          <button 
            className={`diagnostic-btn clean ${healthState.isCleaning ? 'cleaning' : ''}`}
            onClick={handleClean}
            disabled={isOperationInProgress}
          >
            {healthState.isCleaning ? '⏳ CLEANING...' : '🧹 CLEAN'}
          </button>
          <button 
            className={`diagnostic-btn repair ${healthState.isRepairing ? 'repairing' : ''}`}
            onClick={handleRepair}
            disabled={isOperationInProgress}
          >
            {healthState.isRepairing ? '⏳ REPAIRING...' : '🔧 REPAIR'}
          </button>
        </div>
        
        {currentIssues.length > 0 && (
          <div className="health-issues">
            <div className="issues-header">
              <span className="issues-count">{currentIssues.length} Issue{currentIssues.length !== 1 ? 's' : ''}</span>
              <span className="issues-critical">
                {currentIssues.filter(i => i.severity === 'critical').length} Critical
              </span>
            </div>
            <div className="issues-summary">
              {currentIssues.slice(0, 3).map((issue) => (
                <div key={issue.id} className={`issue-item ${issue.severity}`}>
                  <span className="issue-severity">{issue.severity.toUpperCase()}</span>
                  <span className="issue-title">{issue.title}</span>
                </div>
              ))}
              {currentIssues.length > 3 && (
                <div className="issue-item more">
                  <span className="more-count">+{currentIssues.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {operationResult && (
          <div className={`operation-result ${operationResult.status}`}>
            <div className="result-header">
              <span className="result-type">{operationResult.type.toUpperCase()}</span>
              <span className="result-status">{operationResult.status.toUpperCase()}</span>
            </div>
            <div className="result-details">
              <span className="result-duration">{operationResult.duration}ms</span>
              {operationResult.itemsFixed !== undefined && (
                <span className="result-fixed">{operationResult.itemsFixed} fixed</span>
              )}
            </div>
            {operationResult.recommendations.length > 0 && (
              <div className="result-recommendations">
                {operationResult.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="recommendation">{rec}</div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="health-metrics">
          <div className="metric-item">
            <span className="metric-label">RESPONSE</span>
            <span className="metric-value">{metrics.responseTime}ms</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">MEMORY</span>
            <span className="metric-value">{metrics.memoryUsage}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">UPTIME</span>
            <span className="metric-value">{Math.floor(metrics.uptime / 60)}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
