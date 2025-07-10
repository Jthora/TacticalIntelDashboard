# Metrics Visibility Toggle

## 📊 Feature Overview

The Metrics Visibility Toggle provides instant show/hide control for the intelligence source metrics panel, allowing operators to balance detailed statistical information with screen space optimization. This micro-feature enables contextual information density management.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Information Density Control**: Toggle detailed metrics based on operational needs
- **Screen Space Optimization**: Hide metrics when focus is needed elsewhere
- **Contextual Awareness**: Show metrics during analysis, hide during action phases
- **Cognitive Load Management**: Reduce visual complexity when metrics aren't needed

### Intelligence Operations Context
Metrics visibility varies by operational phase:
- **Analysis Phase**: Metrics visible for detailed source assessment
- **Action Phase**: Metrics hidden to focus on intelligence content
- **Briefing Mode**: Metrics visible for comprehensive source reporting
- **Emergency Mode**: Metrics hidden for maximum content visibility

## 🏗 Technical Implementation

### React State Management
```typescript
const [showMetrics, setShowMetrics] = useState<boolean>(true);

const toggleMetrics = () => {
  setShowMetrics(prev => !prev);
};

// Metrics calculation
const metricsData = useMemo(() => {
  if (!showMetrics) return null;
  
  return {
    totalSources: sources.length,
    activeSources: sources.filter(s => s.isOnline).length,
    errorSources: sources.filter(s => s.status === 'error').length,
    avgUpdateFreq: calculateAverageUpdateFrequency(sources),
    dataFreshness: calculateDataFreshness(sources)
  };
}, [sources, showMetrics]);
```

### Visual Component
```tsx
<div className="metrics-control">
  <button 
    className={`metrics-btn ${showMetrics ? 'visible' : 'hidden'}`}
    onClick={toggleMetrics}
    title={`Metrics: ${showMetrics ? 'Visible' : 'Hidden'}`}
  >
    <span className="metrics-icon">
      {showMetrics ? '📊' : '📋'}
    </span>
  </button>
</div>

{showMetrics && (
  <div className="metrics-panel slide-in">
    <div className="metric-item">
      <span className="metric-label">Total:</span>
      <span className="metric-value">{metricsData?.totalSources}</span>
    </div>
    <div className="metric-item">
      <span className="metric-label">Active:</span>
      <span className="metric-value active">{metricsData?.activeSources}</span>
    </div>
    <div className="metric-item">
      <span className="metric-label">Errors:</span>
      <span className="metric-value error">{metricsData?.errorSources}</span>
    </div>
  </div>
)}
```

### CSS Animation System
```css
.metrics-btn {
  width: 12px;
  height: 10px;
  border: 1px solid var(--text-muted);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.metrics-btn.visible {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: rgba(0, 212, 255, 0.1);
}

.metrics-panel {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: var(--tertiary-bg);
  border: 1px solid var(--text-muted);
  border-radius: var(--radius-sm);
}

.slide-in {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 100px;
  }
}

.metric-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  margin-bottom: 1px;
}

.metric-label {
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.metric-value {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: bold;
}

.metric-value.active {
  color: var(--accent-green);
}

.metric-value.error {
  color: var(--accent-red);
}
```

## 📐 Architectural Integration

### Left Sidebar Position
- **Location**: Control cluster, below auto-refresh control
- **Panel Location**: Expandable section below controls
- **Dimensions**: 12px button, 60px panel width when visible
- **Context**: Part of information management cluster

### Metrics Calculation System
```typescript
interface SourceMetrics {
  totalSources: number;
  activeSources: number;
  errorSources: number;
  averageUpdateFrequency: number;
  dataFreshness: number;
  healthScore: number;
}

const calculateMetrics = (sources: IntelligenceSource[]): SourceMetrics => {
  const total = sources.length;
  const active = sources.filter(s => s.isOnline && s.status === 'active').length;
  const errors = sources.filter(s => s.status === 'error').length;
  
  const updateFrequencies = sources.map(s => {
    const lastUpdate = new Date(s.lastUpdate);
    const now = new Date();
    return (now.getTime() - lastUpdate.getTime()) / (1000 * 60); // minutes
  });
  
  const avgUpdateFreq = updateFrequencies.reduce((a, b) => a + b, 0) / total;
  const dataFreshness = Math.max(0, 100 - (avgUpdateFreq / 60) * 100); // 0-100%
  const healthScore = (active / total) * 100;
  
  return {
    totalSources: total,
    activeSources: active,
    errorSources: errors,
    averageUpdateFrequency: avgUpdateFreq,
    dataFreshness: dataFreshness,
    healthScore: healthScore
  };
};
```

## 🚀 Usage Guidelines

### When to Show Metrics

#### Metrics Visible (📊)
- **Source Analysis**: Evaluating intelligence source performance
- **System Health Checks**: Assessing overall source ecosystem
- **Briefing Preparation**: Gathering comprehensive source statistics
- **Troubleshooting**: Identifying source issues and patterns

#### Metrics Hidden (📋)
- **Active Operations**: Focus on intelligence content, not statistics
- **Screen Space Critical**: Maximum space needed for other components
- **Simplified Interface**: Reducing cognitive load during high-stress operations
- **Mobile/Small Screens**: Optimizing for limited display space

### Best Practices
1. **Context-Aware Toggle**: Show/hide based on current operational phase
2. **Regular Monitoring**: Periodic metrics review for source health
3. **Team Standards**: Establish when metrics should be visible
4. **Performance Awareness**: Monitor metrics impact on system performance

## 🔧 Performance Considerations

### Calculation Optimization
```typescript
// Memoized metrics calculation with dependency tracking
const metrics = useMemo(() => {
  if (!showMetrics) return null;
  
  // Only recalculate when sources actually change
  return calculateMetrics(sources);
}, [sources, showMetrics]);

// Debounced metrics updates to prevent excessive calculations
const debouncedMetricsUpdate = useMemo(
  () => debounce(() => {
    setMetrics(calculateMetrics(sources));
  }, 1000),
  [sources]
);
```

### Rendering Optimization
- **Conditional Rendering**: Metrics panel only renders when visible
- **Smooth Animations**: CSS transitions for show/hide
- **Minimal DOM Updates**: Efficient React reconciliation
- **Memory Management**: Cleanup of unused metric calculations

## 🔮 Future Enhancement Opportunities

### Advanced Metrics
- **Historical Trends**: Metrics over time visualization
- **Predictive Analytics**: Forecasting source performance
- **Alert Thresholds**: Automatic warnings for metric anomalies
- **Custom Metrics**: User-defined metrics calculations

### Enhanced Visualization
```typescript
interface AdvancedMetrics {
  charts: MetricChart[];
  trends: TrendAnalysis[];
  alerts: MetricAlert[];
  customMetrics: UserDefinedMetric[];
  historicalData: MetricHistory[];
}
```

### Integration Features
- **Export Metrics**: Generate metric reports
- **Alert Integration**: Metric-based notifications
- **API Integration**: External metric data sources
- **Real-Time Updates**: Live metric streaming

## 📊 Metrics & Analytics

### Panel Usage Analytics
- **Toggle Frequency**: How often metrics are shown/hidden
- **Visibility Duration**: Average time metrics remain visible
- **Context Patterns**: When users prefer metrics visible
- **Performance Impact**: System load when metrics are active

### Metric Accuracy
- **Calculation Performance**: Time to compute all metrics
- **Data Freshness**: Accuracy of real-time metric updates
- **Error Detection**: Effectiveness of error source identification
- **Health Score Accuracy**: Correlation with actual source performance

## 🛡 Data Quality & Reliability

### Metric Validation
- **Data Sanitization**: Clean source data before calculations
- **Error Handling**: Graceful handling of malformed data
- **Consistency Checks**: Validate metric calculations
- **Threshold Validation**: Ensure metrics stay within expected ranges

### Real-Time Accuracy
- **Update Synchronization**: Metrics stay current with source changes
- **Calculation Integrity**: Prevent race conditions in metric updates
- **Cache Consistency**: Ensure cached metrics match current state
- **Performance Monitoring**: Track metric calculation performance
