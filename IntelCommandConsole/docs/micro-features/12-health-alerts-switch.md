# Health Alerts Switch

## 🚨 Feature Overview

The Health Alerts Switch controls system-wide health monitoring notifications, enabling or disabling automated alerts for source failures, system issues, and operational anomalies. This micro-feature provides control over the tactical intelligence system's autonomous monitoring capabilities.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Proactive Monitoring**: Early warning system for intelligence source issues
- **Operational Continuity**: Prevent intelligence gaps through timely alerts
- **Resource Management**: Focus attention on sources requiring immediate action
- **Mission Assurance**: Maintain situational awareness of system health

### Intelligence Operations Context
Health alerts are essential for:
- **Continuous Operations**: 24/7 monitoring of intelligence infrastructure
- **Early Warning**: Detection of source degradation before complete failure
- **Quality Assurance**: Monitoring of data integrity and source reliability
- **Operational Security**: Detection of potential security breaches or interference

## 🏗 Technical Implementation

### React State Management
```typescript
const [healthAlertsEnabled, setHealthAlertsEnabled] = useState<boolean>(true);
const [alertThresholds, setAlertThresholds] = useState<AlertThresholds>({
  sourceOfflineTime: 300, // 5 minutes
  errorThreshold: 3,
  responseTimeThreshold: 5000, // 5 seconds
  dataFreshnessThreshold: 3600 // 1 hour
});

const toggleHealthAlerts = () => {
  setHealthAlertsEnabled(prev => {
    const newState = !prev;
    
    if (newState) {
      initializeHealthMonitoring();
    } else {
      disableHealthMonitoring();
    }
    
    return newState;
  });
};

const initializeHealthMonitoring = () => {
  // Start health monitoring interval
  startSourceHealthCheck();
  startSystemHealthCheck();
  startNetworkHealthCheck();
  
  // Register alert handlers
  registerAlertHandlers();
};

const disableHealthMonitoring = () => {
  // Stop all monitoring
  clearAllHealthIntervals();
  unregisterAlertHandlers();
  clearPendingAlerts();
};
```

### Health Monitoring System
```typescript
interface HealthAlert {
  id: string;
  type: 'source' | 'system' | 'network' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  sourceId?: string;
  acknowledged: boolean;
}

const performHealthCheck = () => {
  if (!healthAlertsEnabled) return;
  
  const alerts: HealthAlert[] = [];
  
  // Check source health
  sources.forEach(source => {
    const sourceAlerts = checkSourceHealth(source);
    alerts.push(...sourceAlerts);
  });
  
  // Check system health
  const systemAlerts = checkSystemHealth();
  alerts.push(...systemAlerts);
  
  // Check network health
  const networkAlerts = checkNetworkHealth();
  alerts.push(...networkAlerts);
  
  // Process new alerts
  processNewAlerts(alerts);
};

const checkSourceHealth = (source: IntelligenceSource): HealthAlert[] => {
  const alerts: HealthAlert[] = [];
  const now = new Date();
  
  // Check if source is offline too long
  if (!source.isOnline) {
    const offlineTime = now.getTime() - new Date(source.lastSeen).getTime();
    if (offlineTime > alertThresholds.sourceOfflineTime * 1000) {
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
  if (source.errorCount > alertThresholds.errorThreshold) {
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
};
```

### Visual Component
```tsx
<div className="health-alerts-switch">
  <button 
    className={`health-btn ${healthAlertsEnabled ? 'active' : 'inactive'}`}
    onClick={toggleHealthAlerts}
    title={`Health Alerts: ${healthAlertsEnabled ? 'ENABLED' : 'DISABLED'}`}
  >
    <span className="health-icon">
      {healthAlertsEnabled ? '🚨' : '🔕'}
    </span>
  </button>
  {healthAlertsEnabled && (
    <span className="alert-count">
      {activeAlerts.length}
    </span>
  )}
</div>
```

### CSS Styling System
```css
.health-btn {
  width: 14px;
  height: 12px;
  border: 1px solid var(--text-muted);
  background: transparent;
  transition: all 0.2s ease;
}

.health-btn.active {
  color: var(--accent-red);
  border-color: var(--accent-red);
  background: rgba(255, 0, 64, 0.1);
  animation: alert-pulse 3s infinite;
}

.health-btn.inactive {
  color: var(--text-muted);
  border-color: var(--text-muted);
  opacity: 0.6;
}

@keyframes alert-pulse {
  0%, 100% { 
    box-shadow: 0 0 4px rgba(255, 0, 64, 0.3);
  }
  50% { 
    box-shadow: 0 0 8px rgba(255, 0, 64, 0.6);
  }
}

.alert-count {
  font-size: 6px;
  color: var(--accent-red);
  margin-left: 2px;
  font-family: var(--font-mono);
  background: var(--accent-red);
  color: var(--primary-bg);
  padding: 0 2px;
  border-radius: 1px;
}
```

## 📐 Architectural Integration

### Right Sidebar Position
- **Location**: System Control Panel, below theme switcher
- **Dimensions**: 14px button + alert count badge
- **Visual Feedback**: Pulsing animation when alerts are active
- **Context**: Part of system monitoring and alerting cluster

### Alert Processing Pipeline
```typescript
interface AlertManager {
  alerts: HealthAlert[];
  processors: AlertProcessor[];
  handlers: AlertHandler[];
  notifications: NotificationService;
}

const processNewAlerts = (newAlerts: HealthAlert[]) => {
  newAlerts.forEach(alert => {
    // Check if alert already exists
    if (!isDuplicateAlert(alert)) {
      // Add to alert queue
      addAlert(alert);
      
      // Trigger notifications
      triggerNotification(alert);
      
      // Log alert
      logAlert(alert);
      
      // Update UI indicators
      updateAlertIndicators();
    }
  });
};
```

## 🚀 Usage Guidelines

### Alert Management Scenarios

#### Health Alerts Enabled (🚨)
- **Continuous Operations**: 24/7 monitoring environments
- **Critical Missions**: High-stakes intelligence operations
- **Automated Monitoring**: Unmanned or lightly supervised operations
- **Quality Assurance**: Maintaining data integrity standards

#### Health Alerts Disabled (🔕)
- **Focused Analysis**: Deep dive work requiring minimal interruptions
- **Testing/Development**: When false alerts might be generated
- **Maintenance Windows**: During planned system maintenance
- **Manual Monitoring**: When operators are actively monitoring sources

### Alert Response Protocols
1. **Immediate Assessment**: Evaluate alert severity and required response
2. **Source Investigation**: Check specific source causing alert
3. **Corrective Action**: Take appropriate action based on alert type
4. **Acknowledgment**: Mark alerts as addressed to clear indicators

## 🔧 Performance Considerations

### Monitoring Efficiency
```typescript
// Optimized health checking with debouncing
const debouncedHealthCheck = useMemo(
  () => debounce(performHealthCheck, 30000), // Check every 30 seconds
  [healthAlertsEnabled, alertThresholds]
);

// Efficient alert deduplication
const alertCache = new Map<string, HealthAlert>();

const isDuplicateAlert = (alert: HealthAlert): boolean => {
  const existing = alertCache.get(alert.id);
  if (!existing) return false;
  
  // Consider duplicate if same alert within 5 minutes
  const timeDiff = alert.timestamp.getTime() - existing.timestamp.getTime();
  return timeDiff < 300000; // 5 minutes
};
```

### Resource Management
- **Selective Monitoring**: Only monitor when alerts are enabled
- **Batch Processing**: Process multiple alerts efficiently
- **Memory Cleanup**: Remove old alerts and clear caches
- **Network Optimization**: Minimize health check network overhead

## 🔮 Future Enhancement Opportunities

### Intelligent Alerting
- **Smart Thresholds**: AI-adjusted alert thresholds based on normal patterns
- **Predictive Alerts**: Early warning based on trend analysis
- **Context-Aware Alerts**: Different thresholds for different operation types
- **Alert Correlation**: Group related alerts to reduce noise

### Advanced Features
```typescript
interface IntelligentAlertSystem {
  smartThresholds: boolean;
  predictiveAlerting: boolean;
  contextAware: boolean;
  alertCorrelation: boolean;
  customAlertTypes: UserDefinedAlert[];
}
```

## 📊 Metrics & Analytics

### Alert Effectiveness
- **Alert Frequency**: Rate of alerts generated over time
- **False Positive Rate**: Percentage of alerts that don't require action
- **Response Time**: Time from alert to acknowledgment
- **Resolution Rate**: Percentage of alerts that are successfully resolved

### System Health Trends
- **Source Reliability**: Historical reliability patterns
- **System Stability**: Overall system health trends
- **Alert Patterns**: Common alert types and frequency
- **User Response Patterns**: How quickly users respond to different alert types

## 🛡 Reliability & Error Handling

### Alert System Reliability
- **Failsafe Mechanisms**: Ensure critical alerts are never missed
- **Redundant Monitoring**: Multiple check mechanisms for critical functions
- **Alert Escalation**: Automatic escalation of unacknowledged critical alerts
- **System Recovery**: Automatic alert system restart after failures

### Error Prevention
- **Threshold Validation**: Prevent invalid alert threshold settings
- **Alert Deduplication**: Prevent alert spam from repeated issues
- **Grace Periods**: Allow for temporary issues before alerting
- **Circuit Breaker**: Disable monitoring if it becomes unstable
