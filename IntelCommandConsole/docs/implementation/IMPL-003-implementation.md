# IMPL-003: Health Diagnostic Actions Implementation

## Overview

**Priority**: High (Critical)  
**Component**: Health, SystemHealth, DiagnosticService  
**Estimated Effort**: 3-4 days  
**Dependencies**: IMPL-002 (SettingsService)

## Problem Statement

The Health component has SCAN, CLEAN, and REPAIR buttons that are completely non-functional. They call parent callbacks but no actual system diagnostics or maintenance actions are performed.

## Implementation Goals

1. **Primary**: Implement functional system scanning capabilities
2. **Secondary**: Create system cleaning and repair functions
3. **Tertiary**: Integrate with FeedHealthService for comprehensive health monitoring
4. **Bonus**: Add automated health monitoring and alerts

## Technical Architecture

### Diagnostic Service Architecture
```typescript
interface DiagnosticResult {
  timestamp: Date;
  type: 'scan' | 'clean' | 'repair';
  status: 'success' | 'warning' | 'error';
  issues: HealthIssue[];
  metrics: HealthMetrics;
  recommendations: string[];
  duration: number;
}

interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'connectivity' | 'data' | 'security';
  title: string;
  description: string;
  solution?: string;
  autoFixable: boolean;
}

interface HealthMetrics {
  responseTime: number;
  errorRate: number;
  dataIntegrity: number;
  connectionStability: number;
  memoryUsage: number;
  overallScore: number;
}
```

### Health Monitoring System
```typescript
interface SystemHealthState {
  overallStatus: 'optimal' | 'warning' | 'critical';
  lastScan: Date | null;
  lastClean: Date | null;
  lastRepair: Date | null;
  activeIssues: HealthIssue[];
  metrics: HealthMetrics;
  isScanning: boolean;
  isCleaning: boolean;
  isRepairing: boolean;
}
```

## Implementation Steps

### Step 1: Create Diagnostic Service
**File**: `src/services/DiagnosticService.ts`

```typescript
export class DiagnosticService {
  private static readonly SCAN_TIMEOUT = 30000; // 30 seconds max scan time
  
  static async performSystemScan(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    console.log('Starting system scan...');
    
    const issues: HealthIssue[] = [];
    const metrics: HealthMetrics = {
      responseTime: 0,
      errorRate: 0,
      dataIntegrity: 0,
      connectionStability: 0,
      memoryUsage: 0,
      overallScore: 0
    };
    
    try {
      // Scan feed health
      const feedIssues = await this.scanFeedHealth();
      issues.push(...feedIssues);
      
      // Scan data integrity
      const dataIssues = await this.scanDataIntegrity();
      issues.push(...dataIssues);
      
      // Scan performance
      const performanceIssues = await this.scanPerformance();
      issues.push(...performanceIssues);
      
      // Scan connectivity
      const connectivityIssues = await this.scanConnectivity();
      issues.push(...connectivityIssues);
      
      // Calculate metrics
      metrics.responseTime = await this.measureResponseTime();
      metrics.errorRate = await this.calculateErrorRate();
      metrics.dataIntegrity = await this.checkDataIntegrity();
      metrics.connectionStability = await this.checkConnectionStability();
      metrics.memoryUsage = this.getMemoryUsage();
      metrics.overallScore = this.calculateOverallScore(metrics, issues);
      
      const duration = Date.now() - startTime;
      
      return {
        timestamp: new Date(),
        type: 'scan',
        status: this.determineStatus(issues),
        issues,
        metrics,
        recommendations: this.generateRecommendations(issues, metrics),
        duration
      };
      
    } catch (error) {
      console.error('System scan failed:', error);
      return {
        timestamp: new Date(),
        type: 'scan',
        status: 'error',
        issues: [{
          id: 'scan-error',
          severity: 'critical',
          category: 'performance',
          title: 'Scan Failed',
          description: error instanceof Error ? error.message : 'Unknown scan error',
          autoFixable: false
        }],
        metrics,
        recommendations: ['Restart the application and try again'],
        duration: Date.now() - startTime
      };
    }
  }
  
  static async performSystemClean(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    console.log('Starting system clean...');
    
    const issues: HealthIssue[] = [];
    const cleanedItems: string[] = [];
    
    try {
      // Clean localStorage of old data
      const storageClean = await this.cleanLocalStorage();
      if (storageClean.cleaned > 0) {
        cleanedItems.push(`Cleaned ${storageClean.cleaned} old storage items`);
      }
      
      // Clean feed cache
      const feedCacheClean = await this.cleanFeedCache();
      if (feedCacheClean.cleaned > 0) {
        cleanedItems.push(`Cleaned ${feedCacheClean.cleaned} cached feed items`);
      }
      
      // Clean error logs
      const errorLogClean = await this.cleanErrorLogs();
      if (errorLogClean.cleaned > 0) {
        cleanedItems.push(`Cleaned ${errorLogClean.cleaned} old error logs`);
      }
      
      // Reset connection states
      await this.resetConnectionStates();
      cleanedItems.push('Reset connection states');
      
      // Clear temporary data
      await this.clearTemporaryData();
      cleanedItems.push('Cleared temporary data');
      
      const duration = Date.now() - startTime;
      
      return {
        timestamp: new Date(),
        type: 'clean',
        status: 'success',
        issues: [],
        metrics: await this.getQuickMetrics(),
        recommendations: [
          'System clean completed successfully',
          ...cleanedItems,
          'Consider running a system scan to verify improvements'
        ],
        duration
      };
      
    } catch (error) {
      console.error('System clean failed:', error);
      return {
        timestamp: new Date(),
        type: 'clean',
        status: 'error',
        issues: [{
          id: 'clean-error',
          severity: 'high',
          category: 'performance',
          title: 'Clean Failed',
          description: error instanceof Error ? error.message : 'Unknown clean error',
          autoFixable: false
        }],
        metrics: await this.getQuickMetrics(),
        recommendations: ['Try cleaning individual components manually'],
        duration: Date.now() - startTime
      };
    }
  }
  
  static async performSystemRepair(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    console.log('Starting system repair...');
    
    const issues: HealthIssue[] = [];
    const repairActions: string[] = [];
    
    try {
      // First scan to identify issues
      const scanResult = await this.performSystemScan();
      const autoFixableIssues = scanResult.issues.filter(issue => issue.autoFixable);
      
      for (const issue of autoFixableIssues) {
        try {
          const repairResult = await this.repairIssue(issue);
          if (repairResult.success) {
            repairActions.push(`Fixed: ${issue.title}`);
          } else {
            issues.push({
              ...issue,
              title: `Failed to repair: ${issue.title}`,
              description: repairResult.error || 'Repair failed'
            });
          }
        } catch (error) {
          issues.push({
            ...issue,
            title: `Repair error: ${issue.title}`,
            description: error instanceof Error ? error.message : 'Unknown repair error'
          });
        }
      }
      
      // Attempt common repairs
      const commonRepairs = await this.performCommonRepairs();
      repairActions.push(...commonRepairs);
      
      const duration = Date.now() - startTime;
      
      return {
        timestamp: new Date(),
        type: 'repair',
        status: issues.length === 0 ? 'success' : 'warning',
        issues,
        metrics: await this.getQuickMetrics(),
        recommendations: [
          `Repaired ${repairActions.length} issues`,
          ...repairActions,
          ...(issues.length > 0 ? ['Some issues require manual intervention'] : [])
        ],
        duration
      };
      
    } catch (error) {
      console.error('System repair failed:', error);
      return {
        timestamp: new Date(),
        type: 'repair',
        status: 'error',
        issues: [{
          id: 'repair-error',
          severity: 'critical',
          category: 'performance',
          title: 'Repair Failed',
          description: error instanceof Error ? error.message : 'Unknown repair error',
          autoFixable: false
        }],
        metrics: await this.getQuickMetrics(),
        recommendations: ['Manual intervention required'],
        duration: Date.now() - startTime
      };
    }
  }
  
  // Private helper methods
  private static async scanFeedHealth(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    const feedHealthData = FeedHealthService.getAllFeedHealth();
    
    Object.values(feedHealthData).forEach(health => {
      if (health.status === 'error') {
        issues.push({
          id: `feed-error-${health.feedId}`,
          severity: 'high',
          category: 'connectivity',
          title: `Feed Error: ${health.feedUrl}`,
          description: health.lastError || 'Feed is experiencing errors',
          solution: 'Check feed URL and network connectivity',
          autoFixable: true
        });
      } else if (health.responseTime && health.responseTime > 10000) {
        issues.push({
          id: `feed-slow-${health.feedId}`,
          severity: 'medium',
          category: 'performance',
          title: `Slow Feed: ${health.feedUrl}`,
          description: `Response time: ${health.responseTime}ms`,
          solution: 'Check network connectivity or consider removing slow feeds',
          autoFixable: false
        });
      }
    });
    
    return issues;
  }
  
  private static async scanDataIntegrity(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    
    try {
      // Check for corrupted localStorage data
      const feeds = JSON.parse(localStorage.getItem('feeds') || '[]');
      const invalidFeeds = feeds.filter((feed: any) => !feed.id || !feed.url);
      
      if (invalidFeeds.length > 0) {
        issues.push({
          id: 'invalid-feeds',
          severity: 'medium',
          category: 'data',
          title: 'Invalid Feed Data',
          description: `Found ${invalidFeeds.length} feeds with missing required fields`,
          solution: 'Clean invalid feed data',
          autoFixable: true
        });
      }
      
      // Check for duplicate feeds
      const duplicates = this.findDuplicateFeeds(feeds);
      if (duplicates.length > 0) {
        issues.push({
          id: 'duplicate-feeds',
          severity: 'low',
          category: 'data',
          title: 'Duplicate Feeds',
          description: `Found ${duplicates.length} duplicate feed entries`,
          solution: 'Remove duplicate feeds',
          autoFixable: true
        });
      }
      
    } catch (error) {
      issues.push({
        id: 'data-corruption',
        severity: 'high',
        category: 'data',
        title: 'Data Corruption',
        description: 'Unable to parse stored feed data',
        solution: 'Reset feed data to default state',
        autoFixable: true
      });
    }
    
    return issues;
  }
  
  private static async scanPerformance(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    
    // Check memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (usedMemory > 0.8) {
        issues.push({
          id: 'high-memory',
          severity: 'medium',
          category: 'performance',
          title: 'High Memory Usage',
          description: `Memory usage: ${Math.round(usedMemory * 100)}%`,
          solution: 'Clear caches and restart application',
          autoFixable: true
        });
      }
    }
    
    // Check for large localStorage
    const storageSize = this.calculateStorageSize();
    if (storageSize > 5 * 1024 * 1024) { // 5MB
      issues.push({
        id: 'large-storage',
        severity: 'medium',
        category: 'performance',
        title: 'Large Storage Size',
        description: `localStorage size: ${Math.round(storageSize / 1024 / 1024)}MB`,
        solution: 'Clean old storage data',
        autoFixable: true
      });
    }
    
    return issues;
  }
  
  private static async scanConnectivity(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    
    // Check network connectivity
    if (!navigator.onLine) {
      issues.push({
        id: 'offline',
        severity: 'critical',
        category: 'connectivity',
        title: 'No Network Connection',
        description: 'Application is offline',
        solution: 'Check network connection',
        autoFixable: false
      });
    }
    
    // Test connectivity to sample feeds
    try {
      const testResponse = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!testResponse.ok) {
        issues.push({
          id: 'api-connectivity',
          severity: 'high',
          category: 'connectivity',
          title: 'API Connectivity Issue',
          description: `API returned status: ${testResponse.status}`,
          solution: 'Check API server status',
          autoFixable: false
        });
      }
    } catch (error) {
      // API might not exist, this is not necessarily an error
    }
    
    return issues;
  }
  
  private static async repairIssue(issue: HealthIssue): Promise<{ success: boolean; error?: string }> {
    try {
      switch (issue.id) {
        case 'invalid-feeds':
          return await this.repairInvalidFeeds();
        case 'duplicate-feeds':
          return await this.repairDuplicateFeeds();
        case 'data-corruption':
          return await this.repairDataCorruption();
        case 'large-storage':
          return await this.repairLargeStorage();
        case 'high-memory':
          return await this.repairHighMemory();
        default:
          return { success: false, error: 'No repair method available' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Repair methods
  private static async repairInvalidFeeds(): Promise<{ success: boolean; error?: string }> {
    try {
      const feeds = JSON.parse(localStorage.getItem('feeds') || '[]');
      const validFeeds = feeds.filter((feed: any) => feed.id && feed.url);
      localStorage.setItem('feeds', JSON.stringify(validFeeds));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to clean invalid feeds' };
    }
  }
  
  private static async repairDuplicateFeeds(): Promise<{ success: boolean; error?: string }> {
    try {
      const feeds = JSON.parse(localStorage.getItem('feeds') || '[]');
      const uniqueFeeds = this.removeDuplicateFeeds(feeds);
      localStorage.setItem('feeds', JSON.stringify(uniqueFeeds));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove duplicate feeds' };
    }
  }
  
  // Additional helper methods...
  private static findDuplicateFeeds(feeds: any[]): any[] {
    const seen = new Set();
    const duplicates: any[] = [];
    
    feeds.forEach(feed => {
      if (seen.has(feed.url)) {
        duplicates.push(feed);
      } else {
        seen.add(feed.url);
      }
    });
    
    return duplicates;
  }
  
  private static removeDuplicateFeeds(feeds: any[]): any[] {
    const seen = new Set();
    return feeds.filter(feed => {
      if (seen.has(feed.url)) {
        return false;
      }
      seen.add(feed.url);
      return true;
    });
  }
  
  private static calculateStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  }
  
  // ... additional helper methods for metrics calculation
}
```

### Step 2: Create Health Context
**File**: `src/contexts/HealthContext.tsx`

```typescript
interface HealthContextType {
  healthState: SystemHealthState;
  performScan: () => Promise<DiagnosticResult>;
  performClean: () => Promise<DiagnosticResult>;
  performRepair: () => Promise<DiagnosticResult>;
  getLastDiagnostic: (type: 'scan' | 'clean' | 'repair') => DiagnosticResult | null;
  isHealthy: boolean;
}

export const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [healthState, setHealthState] = useState<SystemHealthState>({
    overallStatus: 'optimal',
    lastScan: null,
    lastClean: null,
    lastRepair: null,
    activeIssues: [],
    metrics: {
      responseTime: 0,
      errorRate: 0,
      dataIntegrity: 100,
      connectionStability: 100,
      memoryUsage: 0,
      overallScore: 100
    },
    isScanning: false,
    isCleaning: false,
    isRepairing: false
  });
  
  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticResult[]>([]);
  
  const performScan = useCallback(async (): Promise<DiagnosticResult> => {
    setHealthState(prev => ({ ...prev, isScanning: true }));
    
    try {
      const result = await DiagnosticService.performSystemScan();
      
      setHealthState(prev => ({
        ...prev,
        isScanning: false,
        lastScan: result.timestamp,
        activeIssues: result.issues,
        metrics: result.metrics,
        overallStatus: result.status === 'success' ? 'optimal' : 
                      result.status === 'warning' ? 'warning' : 'critical'
      }));
      
      setDiagnosticHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      
      return result;
    } catch (error) {
      setHealthState(prev => ({ ...prev, isScanning: false }));
      throw error;
    }
  }, []);
  
  const performClean = useCallback(async (): Promise<DiagnosticResult> => {
    setHealthState(prev => ({ ...prev, isCleaning: true }));
    
    try {
      const result = await DiagnosticService.performSystemClean();
      
      setHealthState(prev => ({
        ...prev,
        isCleaning: false,
        lastClean: result.timestamp
      }));
      
      setDiagnosticHistory(prev => [result, ...prev.slice(0, 9)]);
      
      return result;
    } catch (error) {
      setHealthState(prev => ({ ...prev, isCleaning: false }));
      throw error;
    }
  }, []);
  
  const performRepair = useCallback(async (): Promise<DiagnosticResult> => {
    setHealthState(prev => ({ ...prev, isRepairing: true }));
    
    try {
      const result = await DiagnosticService.performSystemRepair();
      
      setHealthState(prev => ({
        ...prev,
        isRepairing: false,
        lastRepair: result.timestamp,
        activeIssues: result.issues
      }));
      
      setDiagnosticHistory(prev => [result, ...prev.slice(0, 9)]);
      
      return result;
    } catch (error) {
      setHealthState(prev => ({ ...prev, isRepairing: false }));
      throw error;
    }
  }, []);
  
  const getLastDiagnostic = useCallback((type: 'scan' | 'clean' | 'repair'): DiagnosticResult | null => {
    return diagnosticHistory.find(result => result.type === type) || null;
  }, [diagnosticHistory]);
  
  const isHealthy = useMemo(() => {
    return healthState.overallStatus === 'optimal' && healthState.activeIssues.length === 0;
  }, [healthState]);
  
  const value = {
    healthState,
    performScan,
    performClean,
    performRepair,
    getLastDiagnostic,
    isHealthy
  };
  
  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
};
```

### Step 3: Update Health Component
**File**: `src/components/Health.tsx`

```typescript
import { useHealth } from '../contexts/HealthContext';
import { useSettings } from '../contexts/SettingsContext'; // From IMPL-002

const Health: React.FC<HealthProps> = ({
  feedCount = 0,
  onScan,
  onClean,
  onRepair,
  connectionStatus = 'ONLINE',
  securityStatus = 'SECURE',
  overallStatus = 'OPTIMAL'
}) => {
  const { healthState, performScan, performClean, performRepair } = useHealth();
  const { settings } = useSettings();
  const [lastResult, setLastResult] = useState<DiagnosticResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const handleScan = async () => {
    try {
      const result = await performScan();
      setLastResult(result);
      setShowResults(true);
      onScan?.();
      
      // Show health alerts if enabled
      if (settings.healthAlerts && result.issues.length > 0) {
        const criticalIssues = result.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
          // Could integrate with notification system
          console.warn('Critical health issues detected:', criticalIssues);
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };
  
  const handleClean = async () => {
    try {
      const result = await performClean();
      setLastResult(result);
      setShowResults(true);
      onClean?.();
    } catch (error) {
      console.error('Clean failed:', error);
    }
  };
  
  const handleRepair = async () => {
    try {
      const result = await performRepair();
      setLastResult(result);
      setShowResults(true);
      onRepair?.();
    } catch (error) {
      console.error('Repair failed:', error);
    }
  };
  
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
  
  const getCurrentStatus = () => {
    if (healthState.activeIssues.some(issue => issue.severity === 'critical')) {
      return 'CRITICAL';
    }
    if (healthState.activeIssues.some(issue => issue.severity === 'high')) {
      return 'WARNING';
    }
    return 'OPTIMAL';
  };
  
  const currentStatus = getCurrentStatus();
  
  return (
    <div className="tactical-module module-health">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">💚</span>
          <h3>HEALTH</h3>
        </div>
        <div className="header-status">
          <span className="status-dot" style={{ background: getStatusColor(currentStatus) }}></span>
          <span className="status-text">{currentStatus}</span>
        </div>
      </div>
      <div className="tactical-content">
        {/* Health Metrics Display */}
        <div className="health-metrics-display">
          <div className="metric-row">
            <span className="metric-label">RESPONSE TIME</span>
            <span className="metric-value">{healthState.metrics.responseTime}ms</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">ERROR RATE</span>
            <span className="metric-value">{healthState.metrics.errorRate.toFixed(1)}%</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">OVERALL SCORE</span>
            <span className="metric-value">{healthState.metrics.overallScore}/100</span>
          </div>
        </div>
        
        {/* Active Issues */}
        {healthState.activeIssues.length > 0 && (
          <div className="health-issues-panel">
            <div className="issues-header">
              <span className="issues-icon">⚠</span>
              <span className="issues-title">ACTIVE ISSUES ({healthState.activeIssues.length})</span>
            </div>
            <div className="issues-list">
              {healthState.activeIssues.slice(0, 3).map(issue => (
                <div key={issue.id} className={`issue-item severity-${issue.severity}`}>
                  <span className="issue-title">{issue.title}</span>
                  <span className="issue-category">{issue.category.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="health-indicators-micro">
          <div className="health-item">
            <span className="health-icon">🔗</span>
            <span className="health-label">CONNECTIONS</span>
            <span className={`health-status`}>{connectionStatus}</span>
          </div>
          <div className="health-item">
            <span className="health-icon">🛡</span>
            <span className="health-label">SECURITY</span>
            <span className={`health-status`}>{securityStatus}</span>
          </div>
          <div className="health-item">
            <span className="health-icon">📊</span>
            <span className="health-label">FEEDS</span>
            <span className={`health-status`}>{feedCount} ACTIVE</span>
          </div>
        </div>
        
        <div className="diagnostic-actions">
          <button 
            className={`diagnostic-btn ${healthState.isScanning ? 'loading' : ''}`}
            onClick={handleScan}
            disabled={healthState.isScanning}
          >
            {healthState.isScanning ? '🔄' : '🔍'} 
            {healthState.isScanning ? 'SCANNING...' : 'SCAN'}
          </button>
          <button 
            className={`diagnostic-btn ${healthState.isCleaning ? 'loading' : ''}`}
            onClick={handleClean}
            disabled={healthState.isCleaning}
          >
            {healthState.isCleaning ? '🔄' : '🧹'} 
            {healthState.isCleaning ? 'CLEANING...' : 'CLEAN'}
          </button>
          <button 
            className={`diagnostic-btn ${healthState.isRepairing ? 'loading' : ''}`}
            onClick={handleRepair}
            disabled={healthState.isRepairing}
          >
            {healthState.isRepairing ? '🔄' : '🔧'} 
            {healthState.isRepairing ? 'REPAIRING...' : 'REPAIR'}
          </button>
        </div>
        
        {/* Last Diagnostic Times */}
        <div className="diagnostic-history">
          {healthState.lastScan && (
            <div className="history-item">
              <span className="history-label">LAST SCAN:</span>
              <span className="history-time">{formatRelativeTime(healthState.lastScan)}</span>
            </div>
          )}
          {healthState.lastClean && (
            <div className="history-item">
              <span className="history-label">LAST CLEAN:</span>
              <span className="history-time">{formatRelativeTime(healthState.lastClean)}</span>
            </div>
          )}
          {healthState.lastRepair && (
            <div className="history-item">
              <span className="history-label">LAST REPAIR:</span>
              <span className="history-time">{formatRelativeTime(healthState.lastRepair)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Results Modal */}
      {showResults && lastResult && (
        <DiagnosticResultsModal 
          result={lastResult}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

// Helper component for displaying results
const DiagnosticResultsModal: React.FC<{
  result: DiagnosticResult;
  onClose: () => void;
}> = ({ result, onClose }) => {
  return (
    <div className="diagnostic-modal-overlay" onClick={onClose}>
      <div className="diagnostic-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{result.type.toUpperCase()} RESULTS</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          <div className="result-summary">
            <div className={`result-status status-${result.status}`}>
              {result.status.toUpperCase()}
            </div>
            <div className="result-duration">
              Completed in {(result.duration / 1000).toFixed(1)}s
            </div>
          </div>
          
          {result.issues.length > 0 && (
            <div className="result-issues">
              <h4>Issues Found ({result.issues.length})</h4>
              {result.issues.map(issue => (
                <div key={issue.id} className={`issue-detail severity-${issue.severity}`}>
                  <div className="issue-title">{issue.title}</div>
                  <div className="issue-description">{issue.description}</div>
                  {issue.solution && (
                    <div className="issue-solution">💡 {issue.solution}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="result-recommendations">
            <h4>Recommendations</h4>
            {result.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                • {rec}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
```

## Testing Strategy

### Unit Tests
**File**: `src/services/__tests__/DiagnosticService.test.ts`

```typescript
describe('DiagnosticService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  describe('performSystemScan', () => {
    it('should complete scan without errors when system is healthy', async () => {
      // Mock healthy system state
      localStorage.setItem('feeds', JSON.stringify([
        { id: '1', url: 'https://example.com/feed', title: 'Test Feed' }
      ]));
      
      const result = await DiagnosticService.performSystemScan();
      
      expect(result.type).toBe('scan');
      expect(result.status).toBe('success');
      expect(result.duration).toBeGreaterThan(0);
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
    
    it('should detect invalid feed data', async () => {
      // Mock corrupted feed data
      localStorage.setItem('feeds', JSON.stringify([
        { id: '1' }, // Missing url
        { url: 'https://example.com' } // Missing id
      ]));
      
      const result = await DiagnosticService.performSystemScan();
      
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'invalid-feeds',
          severity: 'medium',
          category: 'data'
        })
      );
    });
    
    it('should detect duplicate feeds', async () => {
      localStorage.setItem('feeds', JSON.stringify([
        { id: '1', url: 'https://example.com/feed' },
        { id: '2', url: 'https://example.com/feed' } // Duplicate
      ]));
      
      const result = await DiagnosticService.performSystemScan();
      
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'duplicate-feeds',
          category: 'data'
        })
      );
    });
  });
  
  describe('performSystemClean', () => {
    it('should clean invalid data successfully', async () => {
      const result = await DiagnosticService.performSystemClean();
      
      expect(result.type).toBe('clean');
      expect(result.status).toBe('success');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
  
  describe('performSystemRepair', () => {
    it('should repair auto-fixable issues', async () => {
      // Setup issues that can be auto-fixed
      localStorage.setItem('feeds', JSON.stringify([
        { id: '1' }, // Invalid feed
        { id: '2', url: 'https://example.com/feed' },
        { id: '3', url: 'https://example.com/feed' } // Duplicate
      ]));
      
      const result = await DiagnosticService.performSystemRepair();
      
      expect(result.type).toBe('repair');
      expect(result.recommendations).toContain(
        expect.stringMatching(/Fixed:/)
      );
    });
  });
});
```

### Integration Tests
**File**: `src/components/__tests__/HealthIntegration.test.tsx`

```typescript
describe('Health Integration', () => {
  it('should perform scan and display results', async () => {
    render(
      <HealthProvider>
        <Health />
      </HealthProvider>
    );
    
    const scanButton = screen.getByText('SCAN');
    fireEvent.click(scanButton);
    
    // Should show loading state
    expect(screen.getByText('SCANNING...')).toBeInTheDocument();
    
    // Wait for scan to complete
    await waitFor(() => {
      expect(screen.queryByText('SCANNING...')).not.toBeInTheDocument();
    });
    
    // Should show updated status
    expect(screen.getByText(/LAST SCAN:/)).toBeInTheDocument();
  });
  
  it('should display health issues when found', async () => {
    // Mock DiagnosticService to return issues
    jest.spyOn(DiagnosticService, 'performSystemScan').mockResolvedValue({
      timestamp: new Date(),
      type: 'scan',
      status: 'warning',
      issues: [{
        id: 'test-issue',
        severity: 'high',
        category: 'data',
        title: 'Test Issue',
        description: 'Test issue description',
        autoFixable: true
      }],
      metrics: mockMetrics,
      recommendations: ['Fix the test issue'],
      duration: 1000
    });
    
    render(
      <HealthProvider>
        <Health />
      </HealthProvider>
    );
    
    fireEvent.click(screen.getByText('SCAN'));
    
    await waitFor(() => {
      expect(screen.getByText('ACTIVE ISSUES (1)')).toBeInTheDocument();
      expect(screen.getByText('Test Issue')).toBeInTheDocument();
    });
  });
});
```

## Acceptance Criteria

### Must Have
- [ ] SCAN button performs actual system diagnostics
- [ ] CLEAN button removes unnecessary data and resets states
- [ ] REPAIR button fixes auto-repairable issues
- [ ] Diagnostic results are displayed to user
- [ ] Health status reflects actual system state

### Should Have
- [ ] Diagnostic operations show progress indicators
- [ ] Results include actionable recommendations
- [ ] Health alerts integrate with system settings
- [ ] Diagnostic history is maintained

### Could Have
- [ ] Automated health monitoring
- [ ] Custom diagnostic rules
- [ ] Health report export
- [ ] Scheduled maintenance

## Performance Considerations

1. **Timeout Handling**: All operations have timeout limits
2. **Async Operations**: All diagnostics run asynchronously
3. **Memory Management**: Clean operations reduce memory usage
4. **Progress Feedback**: Loading states for long operations

## Related Documents

- [IMPL-002: SystemControl Settings](./IMPL-002-implementation.md)
- [Component Functionality Audit](../COMPONENT_FUNCTIONALITY_AUDIT.md)
- [Health Service Architecture](./shared/health-architecture.md)
