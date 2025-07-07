# Auto-Refresh Control

## 🔄 Feature Overview

The Auto-Refresh Control enables automated periodic updates of intelligence sources, maintaining current data flow without manual intervention. This micro-feature provides configurable automatic refresh cycles optimized for real-time operations while preserving system resources.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Real-Time Intelligence**: Continuous data updates without manual intervention
- **Operational Continuity**: Maintained situational awareness during extended operations
- **Resource Optimization**: Configurable refresh rates balance currency with system load
- **Hands-Free Operation**: Allows focus on analysis rather than data management

### Intelligence Operations Context
Auto-refresh is crucial for:
- **Live Monitoring**: Continuous surveillance of evolving situations
- **Breaking News**: Immediate updates on developing intelligence
- **Extended Operations**: Multi-hour missions requiring sustained data flow
- **Crisis Management**: Uninterrupted intelligence during high-tempo operations

## 🏗 Technical Implementation

### React State Management
```typescript
const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

const toggleAutoRefresh = () => {
  setAutoRefresh(prev => {
    const newState = !prev;
    
    if (newState) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    
    return newState;
  });
};

const startAutoRefresh = () => {
  if (refreshIntervalRef.current) {
    clearInterval(refreshIntervalRef.current);
  }
  
  refreshIntervalRef.current = setInterval(() => {
    refreshAllSources();
  }, refreshInterval * 1000);
};

const stopAutoRefresh = () => {
  if (refreshIntervalRef.current) {
    clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = null;
  }
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };
}, []);
```

### Visual Component
```tsx
<div className="auto-refresh-control">
  <button 
    className={`refresh-btn ${autoRefresh ? 'active' : 'inactive'}`}
    onClick={toggleAutoRefresh}
    title={`Auto-refresh: ${autoRefresh ? 'ON' : 'OFF'} (${refreshInterval}s)`}
  >
    <span className={`refresh-icon ${autoRefresh ? 'spinning' : ''}`}>
      ⟲
    </span>
  </button>
  {autoRefresh && (
    <span className="refresh-interval">{refreshInterval}s</span>
  )}
</div>
```

### CSS Animation System
```css
.refresh-btn {
  width: 14px;
  height: 12px;
  border: 1px solid var(--text-muted);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.refresh-btn.active {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: rgba(0, 212, 255, 0.1);
}

.refresh-icon.spinning {
  animation: continuous-spin 2s linear infinite;
}

@keyframes continuous-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-interval {
  font-size: 6px;
  color: var(--accent-cyan);
  margin-left: 2px;
  font-family: var(--font-mono);
}
```

## 📐 Architectural Integration

### Left Sidebar Position
- **Location**: Control cluster, below active filter
- **Dimensions**: 14px button + interval display
- **Visual State**: Spinning icon when active
- **Context**: Part of source management automation

### Refresh Logic Integration
```typescript
interface RefreshState {
  autoRefresh: boolean;
  refreshInterval: number;
  lastRefreshTime: Date;
  refreshInProgress: boolean;
  failedRefreshCount: number;
}

const refreshAllSources = async () => {
  if (refreshInProgress) return; // Prevent overlapping refreshes
  
  setRefreshInProgress(true);
  
  try {
    const refreshPromises = sources.map(source => refreshSource(source.id));
    await Promise.allSettled(refreshPromises);
    
    setLastRefreshTime(new Date());
    setFailedRefreshCount(0);
  } catch (error) {
    setFailedRefreshCount(prev => prev + 1);
    console.error('Auto-refresh failed:', error);
  } finally {
    setRefreshInProgress(false);
  }
};
```

### Error Handling & Recovery
```typescript
// Smart refresh with exponential backoff on failures
const getRefreshInterval = (failedCount: number): number => {
  const baseInterval = refreshInterval;
  const backoffMultiplier = Math.min(Math.pow(2, failedCount), 8); // Max 8x delay
  return baseInterval * backoffMultiplier;
};

// Auto-disable after persistent failures
useEffect(() => {
  if (failedRefreshCount >= 5) {
    setAutoRefresh(false);
    // Could trigger notification about auto-refresh disabled
  }
}, [failedRefreshCount]);
```

## 🚀 Usage Guidelines

### Operational Scenarios

#### Auto-Refresh Enabled (⟲ spinning)
- **Live Operations**: Real-time monitoring of developing situations
- **Extended Missions**: Long-duration intelligence gathering
- **Crisis Response**: Continuous updates during emergency situations
- **Background Monitoring**: Passive intelligence collection

#### Auto-Refresh Disabled (⟲ static)
- **Focused Analysis**: Deep analysis of specific intelligence
- **Resource Conservation**: Reducing system load during low-priority periods
- **Manual Control**: Selective refresh of specific sources only
- **Offline Operations**: Working with cached/historical data

### Configuration Guidelines
- **30 seconds**: Standard real-time monitoring
- **60 seconds**: Balanced refresh for extended operations
- **120 seconds**: Conservative refresh for resource preservation
- **Custom**: Adjustable based on operational requirements

## 🔧 Performance Considerations

### Resource Management
```typescript
// Efficient refresh batching
const batchRefreshSources = async (sources: IntelligenceSource[]) => {
  const BATCH_SIZE = 5; // Limit concurrent requests
  
  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(source => refreshSource(source.id))
    );
    
    // Small delay between batches to prevent API throttling
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```

### Memory Management
- **Interval Cleanup**: Proper cleanup of setTimeout/setInterval
- **Request Cancellation**: Cancel pending requests when disabled
- **Cache Management**: Intelligent caching to reduce redundant requests
- **Error Recovery**: Graceful handling of network failures

## 🔮 Future Enhancement Opportunities

### Intelligent Refresh Strategies
- **Adaptive Intervals**: Dynamic refresh rates based on source activity
- **Priority-Based Refresh**: More frequent updates for high-priority sources
- **Smart Scheduling**: Optimal refresh timing based on historical patterns
- **Network-Aware Refresh**: Adjust rates based on connection quality

### Advanced Features
```typescript
interface IntelligentRefreshSystem {
  adaptiveIntervals: boolean;
  priorityBasedRefresh: boolean;
  networkAwareRefresh: boolean;
  smartScheduling: boolean;
  refreshAnalytics: RefreshMetrics;
}
```

## 📊 Metrics & Analytics

### Refresh Performance
- **Success Rate**: Percentage of successful refresh attempts
- **Average Refresh Time**: Time to complete full source refresh
- **Network Usage**: Bandwidth consumption during auto-refresh
- **Error Frequency**: Rate of refresh failures and recovery

### Operational Effectiveness
- **Data Currency**: How fresh intelligence data remains
- **User Interaction**: Manual refresh frequency when auto-refresh enabled
- **Mission Impact**: Correlation between refresh rate and operational success
- **Resource Utilization**: System load during different refresh intervals

## 🛡 Reliability & Error Handling

### Failure Recovery
- **Exponential Backoff**: Increasing delays after failures
- **Selective Retry**: Retry only failed sources, not successful ones
- **Auto-Disable**: Automatic shutdown after persistent failures
- **User Notification**: Alert users when auto-refresh encounters issues

### Network Resilience
- **Connection Monitoring**: Detect network status changes
- **Offline Mode**: Graceful handling of network disconnection
- **Bandwidth Optimization**: Efficient request patterns
- **Rate Limiting**: Respect API limits and throttling
