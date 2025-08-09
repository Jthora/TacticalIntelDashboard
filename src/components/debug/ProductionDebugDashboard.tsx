// src/components/debug/ProductionDebugDashboard.tsx
import './ProductionDebugDashboard.css';

import React, { useEffect, useRef,useState } from 'react';

import { ProductionPerformanceMonitor } from '../../utils/ProductionPerformanceMonitor';
import { ProductionTestingStrategy } from '../../utils/ProductionTestingStrategy';
import { ResourceExhaustionPrevention } from '../../utils/ResourceExhaustionPrevention';
import { StackOverflowPrevention } from '../../utils/StackOverflowPrevention';

interface DebugMetrics {
  performance: any;
  stack: any;
  resources: any;
  tests: any;
}

export const ProductionDebugDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<DebugMetrics | null>(null);
  const [alerts, setAlerts] = useState<Array<{ message: string; severity: string; timestamp: number }>>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'tests' | 'logs'>('overview');
  const [isRecording, setIsRecording] = useState(false);
  const logBufferRef = useRef<string[]>([]);
  const maxLogEntries = 1000;
  
  const performanceMonitor = ProductionPerformanceMonitor.getInstance();
  const stackPrevention = StackOverflowPrevention.getInstance();
  const resourcePrevention = ResourceExhaustionPrevention.getInstance();
  const testingStrategy = ProductionTestingStrategy.getInstance();
  
  useEffect(() => {
    // Check if debug mode is enabled
    const isDebugMode = localStorage.getItem('tactical-debug') === 'true';
    if (!isDebugMode) return;
    
    // Set up hotkey to toggle dashboard (Ctrl+Shift+D)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Update metrics every 5 seconds
    const updateMetrics = () => {
      const newMetrics: DebugMetrics = {
        performance: performanceMonitor.getMetrics(),
        stack: stackPrevention.getStackStats(),
        resources: resourcePrevention.getMetrics(),
        tests: testingStrategy.getTestResults()
      };
      setMetrics(newMetrics);
    };
    
    const metricsInterval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial load
    
    // Set up alert monitoring
    const unsubscribeAlerts = testingStrategy.onAlert((message, severity) => {
      setAlerts(prev => {
        const newAlert = { message, severity, timestamp: Date.now() };
        const updated = [newAlert, ...prev].slice(0, 50); // Keep last 50 alerts
        return updated;
      });
    });
    
    // Set up console log capture
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    const captureLog = (level: string, ...args: any[]) => {
      const timestamp = new Date().toISOString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      logBufferRef.current.push(`[${timestamp}] [${level}] ${message}`);
      
      // Keep only last maxLogEntries
      if (logBufferRef.current.length > maxLogEntries) {
        logBufferRef.current = logBufferRef.current.slice(-maxLogEntries);
      }
    };
    
    if (isRecording) {
      console.log = (...args) => {
        captureLog('LOG', ...args);
        originalLog(...args);
      };
      
      console.warn = (...args) => {
        captureLog('WARN', ...args);
        originalWarn(...args);
      };
      
      console.error = (...args) => {
        captureLog('ERROR', ...args);
        originalError(...args);
      };
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      clearInterval(metricsInterval);
      unsubscribeAlerts();
      
      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, [isRecording]);
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffaa00';
      case 'low': return '#88aa00';
      default: return '#666666';
    }
  };
  
  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      performance: performanceMonitor.exportReport(),
      resources: resourcePrevention.exportReport(),
      tests: testingStrategy.exportTestReport(),
      logs: logBufferRef.current.slice(-100), // Last 100 log entries
      alerts: alerts.slice(-20) // Last 20 alerts
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tactical-debug-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleForceCleanup = () => {
    resourcePrevention.forceCleanup();
    performanceMonitor.triggerManualCleanup();
    setAlerts(prev => [{
      message: 'Manual cleanup triggered',
      severity: 'info',
      timestamp: Date.now()
    }, ...prev]);
  };
  
  const handleRunTests = async () => {
    setAlerts(prev => [{
      message: 'Manual test suite started',
      severity: 'info',
      timestamp: Date.now()
    }, ...prev]);
    
    await testingStrategy.runManualTestSuite();
    
    setAlerts(prev => [{
      message: 'Manual test suite completed',
      severity: 'info',
      timestamp: Date.now()
    }, ...prev]);
  };
  
  if (!isVisible || !metrics) {
    return null;
  }
  
  return (
    <div className="production-debug-dashboard">
      <div className="debug-header">
        <h2>🛡️ Tactical Production Debug</h2>
        <div className="debug-controls">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`debug-btn ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹️ Stop Recording' : '▶️ Start Recording'}
          </button>
          <button onClick={handleRunTests} className="debug-btn">
            🧪 Run Tests
          </button>
          <button onClick={handleForceCleanup} className="debug-btn">
            🧹 Force Cleanup
          </button>
          <button onClick={handleExportReport} className="debug-btn">
            📥 Export Report
          </button>
          <button onClick={() => setIsVisible(false)} className="debug-btn close-btn">
            ✕
          </button>
        </div>
      </div>
      
      <div className="debug-tabs">
        <button 
          className={`debug-tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`debug-tab ${selectedTab === 'performance' ? 'active' : ''}`}
          onClick={() => setSelectedTab('performance')}
        >
          Performance
        </button>
        <button 
          className={`debug-tab ${selectedTab === 'tests' ? 'active' : ''}`}
          onClick={() => setSelectedTab('tests')}
        >
          Tests
        </button>
        <button 
          className={`debug-tab ${selectedTab === 'logs' ? 'active' : ''}`}
          onClick={() => setSelectedTab('logs')}
        >
          Logs
        </button>
      </div>
      
      <div className="debug-content">
        {selectedTab === 'overview' && (
          <div className="overview-panel">
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Memory</h3>
                <div className="metric-value">
                  {formatBytes(metrics.performance.memoryUsage)}
                </div>
                <div className="metric-subtext">
                  {((metrics.performance.memoryUsage / metrics.performance.memoryLimit) * 100).toFixed(1)}% used
                </div>
              </div>
              
              <div className="metric-card">
                <h3>DOM Nodes</h3>
                <div className="metric-value">
                  {metrics.performance.domNodes?.toLocaleString() || 'N/A'}
                </div>
                <div className="metric-subtext">
                  Limit: {metrics.resources.limits?.maxDomNodes?.toLocaleString() || 'N/A'}
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Active Timers</h3>
                <div className="metric-value">
                  {metrics.resources.timerCount}
                </div>
                <div className="metric-subtext">
                  Intervals: {metrics.resources.intervalCount}
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Web3 Connections</h3>
                <div className="metric-value">
                  {metrics.performance.web3Connections}
                </div>
                <div className="metric-subtext">
                  Network Reqs: {metrics.performance.networkRequests}
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Event Listeners</h3>
                <div className="metric-value">
                  {metrics.resources.eventListenerCount}
                </div>
                <div className="metric-subtext">
                  Limit: {metrics.resources.limits?.maxEventListeners}
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Stack Depth</h3>
                <div className="metric-value">
                  {metrics.stack.totalDepth}
                </div>
                <div className="metric-subtext">
                  Max: {metrics.stack.maxDepth}
                </div>
              </div>
            </div>
            
            <div className="alerts-section">
              <h3>Recent Alerts</h3>
              <div className="alerts-list">
                {alerts.slice(0, 10).map((alert, index) => (
                  <div 
                    key={index} 
                    className="alert-item"
                    style={{ borderLeft: `4px solid ${getAlertColor(alert.severity)}` }}
                  >
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="no-alerts">No alerts</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'performance' && (
          <div className="performance-panel">
            <h3>Performance Metrics</h3>
            <div className="performance-details">
              <div className="perf-section">
                <h4>Memory Usage</h4>
                <div className="perf-bar">
                  <div 
                    className="perf-fill"
                    style={{ 
                      width: `${(metrics.performance.memoryUsage / metrics.performance.memoryLimit) * 100}%`,
                      backgroundColor: metrics.performance.memoryUsage / metrics.performance.memoryLimit > 0.8 ? '#ff4444' : '#44aa44'
                    }}
                  />
                </div>
                <div className="perf-text">
                  {formatBytes(metrics.performance.memoryUsage)} / {formatBytes(metrics.performance.memoryLimit)}
                </div>
              </div>
              
              <div className="perf-section">
                <h4>DOM Nodes</h4>
                <div className="perf-bar">
                  <div 
                    className="perf-fill"
                    style={{ 
                      width: `${Math.min(100, (metrics.performance.domNodes / metrics.resources.limits.maxDomNodes) * 100)}%`,
                      backgroundColor: metrics.performance.domNodes / metrics.resources.limits.maxDomNodes > 0.8 ? '#ff4444' : '#44aa44'
                    }}
                  />
                </div>
                <div className="perf-text">
                  {metrics.performance.domNodes} / {metrics.resources.limits.maxDomNodes}
                </div>
              </div>
              
              <div className="perf-section">
                <h4>Error Count</h4>
                <div className="perf-text error-count">
                  {metrics.performance.errorCount}
                  {metrics.performance.lastError && (
                    <div className="last-error">Last: {metrics.performance.lastError}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'tests' && (
          <div className="tests-panel">
            <h3>Test Results</h3>
            <div className="test-suites">
              {Array.from(metrics.tests.entries()).map((entry: any) => {
                const [suiteName, suite] = entry;
                return (
                  <div key={suiteName} className="test-suite">
                    <h4>{suiteName}</h4>
                    <div className="suite-stats">
                      <span className="pass-rate">
                        Pass Rate: {suite.passRate.toFixed(1)}%
                      </span>
                      <span className="test-count">
                        Tests: {suite.tests.length}
                      </span>
                      <span className="total-time">
                        Time: {suite.totalTime.toFixed(2)}ms
                      </span>
                    </div>
                    <div className="recent-tests">
                      {suite.tests.slice(-5).map((test: any, index: number) => (
                        <div 
                          key={index} 
                          className={`test-result ${test.passed ? 'passed' : 'failed'}`}
                        >
                          <span className="test-name">{test.testName}</span>
                          <span className="test-duration">{test.duration.toFixed(2)}ms</span>
                          {test.error && (
                            <div className="test-error">{test.error}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {selectedTab === 'logs' && (
          <div className="logs-panel">
            <h3>Console Logs</h3>
            <div className="logs-container">
              {logBufferRef.current.slice(-50).map((log, index) => {
                const isError = log.includes('[ERROR]');
                const isWarn = log.includes('[WARN]');
                
                return (
                  <div 
                    key={index} 
                    className={`log-entry ${isError ? 'error' : isWarn ? 'warn' : 'info'}`}
                  >
                    {log}
                  </div>
                );
              })}
              {logBufferRef.current.length === 0 && (
                <div className="no-logs">
                  {isRecording ? 'Waiting for logs...' : 'Start recording to capture logs'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="debug-footer">
        <div className="debug-info">
          Press Ctrl+Shift+D to toggle | Debug Mode: {localStorage.getItem('tactical-debug') === 'true' ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  );
};
