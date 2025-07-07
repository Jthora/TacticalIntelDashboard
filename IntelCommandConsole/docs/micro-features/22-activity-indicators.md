# Activity Indicators

## 🔴 Feature Overview

Activity Indicators provide real-time visual feedback on intelligence source activity levels through color-coded status dots, enabling instant assessment of source productivity and operational status without detailed inspection.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Real-Time Awareness**: Instant visual feedback on source activity levels
- **Operational Efficiency**: Quick identification of active vs inactive sources
- **Resource Management**: Focus attention on most productive intelligence sources
- **Status Monitoring**: Continuous monitoring without manual checking

## 🏗 Technical Implementation

### React State Management
```typescript
type ActivityLevel = 'active' | 'idle' | 'stale' | 'offline';

interface ActivityStatus {
  level: ActivityLevel;
  lastUpdate: Date;
  updateCount: number;
  avgUpdateInterval: number;
}

const [sourceActivity, setSourceActivity] = useState<Map<string, ActivityStatus>>(new Map());

const calculateActivityLevel = (source: IntelligenceSource): ActivityLevel => {
  const now = new Date();
  const lastUpdate = new Date(source.lastUpdate);
  const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

  if (!source.isOnline) return 'offline';
  if (minutesSinceUpdate < 15) return 'active';
  if (minutesSinceUpdate < 60) return 'idle';
  return 'stale';
};

const updateActivityIndicators = useCallback(() => {
  const activityMap = new Map<string, ActivityStatus>();
  
  sources.forEach(source => {
    const level = calculateActivityLevel(source);
    const lastUpdate = new Date(source.lastUpdate);
    
    activityMap.set(source.id, {
      level,
      lastUpdate,
      updateCount: source.updateCount || 0,
      avgUpdateInterval: source.avgUpdateInterval || 0
    });
  });
  
  setSourceActivity(activityMap);
}, [sources]);

// Update activity indicators every 30 seconds
useEffect(() => {
  updateActivityIndicators();
  const interval = setInterval(updateActivityIndicators, 30000);
  return () => clearInterval(interval);
}, [updateActivityIndicators]);
```

### Visual Component
```tsx
const ActivityIndicator: React.FC<{ sourceId: string; size?: 'small' | 'medium' }> = ({ 
  sourceId, 
  size = 'small' 
}) => {
  const activity = sourceActivity.get(sourceId);
  
  if (!activity) return null;

  const getActivityInfo = (level: ActivityLevel) => {
    switch (level) {
      case 'active':
        return { color: 'var(--accent-green)', label: 'Active (< 15min)', pulse: true };
      case 'idle':
        return { color: 'var(--accent-yellow)', label: 'Idle (< 1hr)', pulse: false };
      case 'stale':
        return { color: 'var(--accent-orange)', label: 'Stale (> 1hr)', pulse: false };
      case 'offline':
        return { color: 'var(--text-muted)', label: 'Offline', pulse: false };
    }
  };

  const info = getActivityInfo(activity.level);

  return (
    <span 
      className={`activity-indicator ${activity.level} ${size} ${info.pulse ? 'pulse' : ''}`}
      style={{ color: info.color }}
      title={`${info.label} - Last update: ${activity.lastUpdate.toLocaleTimeString()}`}
    >
      ●
    </span>
  );
};

// Usage in source list
<div className="source-item">
  <ActivityIndicator sourceId={source.id} />
  <span className="source-name">{source.name}</span>
  <span className="source-type">{source.type}</span>
</div>
```

### CSS Styling System
```css
.activity-indicator {
  font-size: 6px;
  margin-right: 2px;
  transition: all 0.2s ease;
}

.activity-indicator.medium {
  font-size: 8px;
}

.activity-indicator.pulse {
  animation: activity-pulse 2s infinite;
}

@keyframes activity-pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.6; 
    transform: scale(1.2);
  }
}

/* Activity level specific styles */
.activity-indicator.active {
  color: var(--accent-green);
  text-shadow: 0 0 2px var(--accent-green);
}

.activity-indicator.idle {
  color: var(--accent-yellow);
}

.activity-indicator.stale {
  color: var(--accent-orange);
}

.activity-indicator.offline {
  color: var(--text-muted);
  opacity: 0.5;
}

/* Hover effects for detailed information */
.activity-indicator:hover {
  transform: scale(1.3);
  cursor: help;
}
```

## 📐 Architectural Integration

### Left Sidebar Integration
- **Position**: Leading each source item in the list
- **Size**: 6px dot for compact display
- **Color Coding**: Green (active), Yellow (idle), Orange (stale), Gray (offline)
- **Animation**: Pulsing effect for active sources

### Real-Time Update System
```typescript
interface ActivityMonitor {
  sources: Map<string, IntelligenceSource>;
  activityThresholds: ActivityThresholds;
  updateInterval: number;
  observers: ActivityObserver[];
}

interface ActivityThresholds {
  activeMinutes: number;    // < 15 minutes = active
  idleMinutes: number;      // < 60 minutes = idle
  staleMinutes: number;     // > 60 minutes = stale
}

const defaultThresholds: ActivityThresholds = {
  activeMinutes: 15,
  idleMinutes: 60,
  staleMinutes: 1440 // 24 hours
};

// Observer pattern for activity changes
const notifyActivityChange = (sourceId: string, oldLevel: ActivityLevel, newLevel: ActivityLevel) => {
  // Trigger any necessary actions based on activity changes
  if (oldLevel === 'active' && newLevel !== 'active') {
    // Source became inactive
    logActivityChange(sourceId, 'deactivated');
  } else if (oldLevel !== 'active' && newLevel === 'active') {
    // Source became active
    logActivityChange(sourceId, 'activated');
  }
};
```

## 🚀 Usage Guidelines

### Activity Level Interpretation

#### Active (● Green, Pulsing)
- **Meaning**: Source updated within last 15 minutes
- **Indication**: High-value, real-time intelligence flow
- **Action**: Monitor closely for breaking developments
- **Priority**: Highest attention for current operations

#### Idle (● Yellow, Static)
- **Meaning**: Source updated within last hour but not recently active
- **Indication**: Moderate activity, normal operational pattern
- **Action**: Regular monitoring, no immediate concern
- **Priority**: Standard operational monitoring

#### Stale (● Orange, Static)
- **Meaning**: Source hasn't updated for over an hour
- **Indication**: Low activity or potential issues
- **Action**: Check source status, consider troubleshooting
- **Priority**: Review for potential problems

#### Offline (● Gray, Static)
- **Meaning**: Source is not responding or connected
- **Indication**: Technical issues or deliberate shutdown
- **Action**: Immediate technical investigation required
- **Priority**: High - potential intelligence gap

### Operational Protocols
1. **Active Monitoring**: Focus primary attention on active (green) sources
2. **Stale Investigation**: Check stale (orange) sources for technical issues
3. **Offline Response**: Immediately investigate offline (gray) sources
4. **Pattern Recognition**: Watch for unusual activity pattern changes

## 🔧 Performance Considerations

### Efficient Activity Calculation
```typescript
// Optimized activity level calculation with caching
const activityCache = new Map<string, { level: ActivityLevel, timestamp: number }>();

const getActivityLevelCached = (source: IntelligenceSource): ActivityLevel => {
  const cacheKey = source.id;
  const cached = activityCache.get(cacheKey);
  const now = Date.now();
  
  // Cache for 30 seconds to reduce calculation overhead
  if (cached && (now - cached.timestamp) < 30000) {
    return cached.level;
  }
  
  const level = calculateActivityLevel(source);
  activityCache.set(cacheKey, { level, timestamp: now });
  
  return level;
};
```

### Rendering Optimization
- **Virtual Scrolling**: Efficient rendering of large source lists with indicators
- **Selective Updates**: Only update indicators for visible sources
- **Batched Updates**: Group activity updates to prevent excessive re-renders
- **CSS Animations**: Hardware-accelerated animations for smooth performance

## 🔮 Future Enhancement Opportunities

### Advanced Activity Analytics
- **Predictive Indicators**: Forecast source activity based on historical patterns
- **Anomaly Detection**: Identify unusual activity pattern changes
- **Activity Trends**: Visual representation of activity patterns over time
- **Smart Grouping**: Group sources by similar activity patterns

### Enhanced Visualization
```typescript
interface AdvancedActivitySystem {
  predictiveIndicators: boolean;
  anomalyDetection: boolean;
  activityTrends: ActivityTrendData[];
  smartGrouping: ActivityGroupingRule[];
  customThresholds: UserDefinedThresholds;
}
```

### Integration Features
- **Alert Integration**: Activity-based automated alerts
- **Workflow Integration**: Activity-triggered workflow actions
- **Reporting**: Activity pattern reports for analysis
- **API Integration**: External system activity monitoring

## 📊 Metrics & Analytics

### Activity Pattern Analysis
- **Activity Distribution**: Percentage of sources at each activity level
- **Pattern Stability**: Consistency of source activity patterns over time
- **Correlation Analysis**: Relationship between activity and intelligence quality
- **Operational Impact**: Effect of activity monitoring on operational efficiency

### Performance Metrics
- **Update Frequency**: How often activity indicators refresh
- **Accuracy**: Correctness of activity level assessments
- **Response Time**: Speed of activity level updates
- **User Engagement**: How often users reference activity indicators

## 🛡 Reliability & Error Handling

### Data Quality Assurance
- **Timestamp Validation**: Ensure accurate last update timestamps
- **Network Resilience**: Handle network interruptions gracefully
- **Error Recovery**: Automatic recovery from activity monitoring failures
- **Fallback Indicators**: Default indicators when data is unavailable

### Monitoring System Health
- **Activity Monitor Health**: Monitor the monitoring system itself
- **Performance Tracking**: Ensure activity calculations don't impact performance
- **Resource Usage**: Monitor memory and CPU usage of activity system
- **Error Logging**: Comprehensive logging for troubleshooting activity issues
