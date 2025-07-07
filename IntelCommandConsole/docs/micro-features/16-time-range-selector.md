# Time Range Selector

## ⏰ Feature Overview

The Time Range Selector provides rapid temporal filtering of intelligence data through quick-access time period buttons, enabling instant focus on relevant time-sensitive intelligence without complex date picker interfaces.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Temporal Context**: Quick filtering by relevant time periods for current operations
- **Historical Analysis**: Rapid access to historical intelligence for pattern analysis
- **Real-Time Focus**: Instant filtering to most recent intelligence for breaking situations
- **Operational Efficiency**: Eliminate time-consuming date selection interfaces

## 🏗 Technical Implementation

### React State Management
```typescript
type TimeRange = 'live' | '1h' | '6h' | '24h' | '7d' | '30d' | 'all';

const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');

const timeRangeConfigs = {
  live: { label: 'LIVE', minutes: 0, description: 'Real-time updates only' },
  '1h': { label: '1H', minutes: 60, description: 'Last 1 hour' },
  '6h': { label: '6H', minutes: 360, description: 'Last 6 hours' },
  '24h': { label: '24H', minutes: 1440, description: 'Last 24 hours' },
  '7d': { label: '7D', minutes: 10080, description: 'Last 7 days' },
  '30d': { label: '30D', minutes: 43200, description: 'Last 30 days' },
  all: { label: 'ALL', minutes: -1, description: 'All available data' }
};

const selectTimeRange = (range: TimeRange) => {
  setSelectedTimeRange(range);
  const config = timeRangeConfigs[range];
  
  if (config.minutes === 0) {
    // Live mode - only show real-time updates
    applyLiveFilter();
  } else if (config.minutes === -1) {
    // All data
    clearTimeFilter();
  } else {
    // Specific time range
    const cutoffTime = new Date(Date.now() - config.minutes * 60 * 1000);
    applyTimeFilter(cutoffTime);
  }
};
```

### Visual Component
```tsx
<div className="time-range-selector">
  <div className="time-buttons">
    {Object.entries(timeRangeConfigs).map(([range, config]) => (
      <button
        key={range}
        className={`time-btn ${selectedTimeRange === range ? 'active' : ''}`}
        onClick={() => selectTimeRange(range as TimeRange)}
        title={config.description}
      >
        {config.label}
      </button>
    ))}
  </div>
</div>
```

### CSS Styling System
```css
.time-range-selector {
  margin: var(--spacing-sm) 0;
}

.time-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
}

.time-btn {
  width: 18px;
  height: 10px;
  font-size: 5px;
  font-family: var(--font-mono);
  background: var(--secondary-bg);
  border: 1px solid var(--text-muted);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.time-btn.active {
  background: var(--accent-cyan);
  color: var(--primary-bg);
  border-color: var(--accent-cyan);
  font-weight: bold;
}

.time-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

/* Special styling for LIVE mode */
.time-btn.active[title*="Real-time"] {
  background: var(--accent-green);
  border-color: var(--accent-green);
  animation: live-pulse 2s infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 📊 Metrics & Analytics

### Time Range Usage
- **Range Distribution**: Most commonly selected time ranges
- **Context Switching**: Frequency of time range changes per session
- **Operational Correlation**: Time range preferences by operation type
- **Data Volume**: Amount of data filtered by each time range selection
