# Active Filter Toggle

## 🎯 Feature Overview

The Active Filter Toggle provides instant filtering of intelligence sources to display only currently active feeds, eliminating inactive or stale sources from view. This micro-feature optimizes operational focus by hiding irrelevant sources during active intelligence gathering phases.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Operational Focus**: Immediate elimination of inactive intelligence sources
- **Real-Time Clarity**: Display only sources providing current intelligence
- **Cognitive Load Reduction**: Minimize visual clutter during active operations
- **Efficiency Enhancement**: Quick access to productive intelligence channels

### Intelligence Operations Context
Active filtering is essential for:
- **Live Operations**: Focus on sources delivering real-time intelligence
- **Crisis Response**: Immediate identification of functioning intelligence channels
- **Quality Control**: Quick assessment of source reliability and activity
- **Resource Management**: Attention focused on productive sources only

## 🏗 Technical Implementation

### React State Management
```typescript
const [activeFilter, setActiveFilter] = useState<boolean>(false);

const toggleActiveFilter = () => {
  setActiveFilter(prev => !prev);
};

// Filter integration with source list
const filteredSources = useMemo(() => {
  if (!activeFilter) return sources;
  
  return sources.filter(source => {
    const lastUpdate = new Date(source.lastUpdate);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return source.isOnline && hoursSinceUpdate < 24; // Active within 24 hours
  });
}, [sources, activeFilter]);
```

### Visual Component
```tsx
<div className="active-filter">
  <button 
    className={`filter-btn ${activeFilter ? 'active' : 'inactive'}`}
    onClick={toggleActiveFilter}
    title={`Show: ${activeFilter ? 'Active Only' : 'All Sources'}`}
  >
    <span className="filter-icon">
      {activeFilter ? '◉' : '○'}
    </span>
  </button>
  {activeFilter && (
    <span className="filter-count">
      {filteredSources.length}
    </span>
  )}
</div>
```

### CSS Styling System
```css
.filter-btn {
  width: 12px;
  height: 12px;
  border: 1px solid var(--text-muted);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.filter-btn.active {
  color: var(--accent-green);
  border-color: var(--accent-green);
  background: rgba(0, 255, 65, 0.1);
  box-shadow: 0 0 4px rgba(0, 255, 65, 0.3);
}

.filter-btn.inactive {
  color: var(--text-muted);
  border-color: var(--text-muted);
}

.filter-count {
  font-size: 6px;
  color: var(--accent-green);
  margin-left: 2px;
  font-family: var(--font-mono);
}
```

## 📐 Architectural Integration

### Left Sidebar Position
- **Location**: Control cluster, below sort selector
- **Dimensions**: 12px button + count display
- **Visual State**: Filled circle (active) / empty circle (inactive)
- **Context**: Part of source management control group

### Data Flow Integration
```typescript
interface SourceFilterState {
  sources: IntelligenceSource[];
  activeFilter: boolean;
  filteredSources: IntelligenceSource[];
  filterCriteria: {
    maxInactiveHours: number;
    requireOnlineStatus: boolean;
    includeErrorSources: boolean;
  };
}

// Activity determination logic
const isSourceActive = (source: IntelligenceSource): boolean => {
  const lastUpdate = new Date(source.lastUpdate);
  const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  return source.isOnline && 
         source.status !== 'error' && 
         hoursSinceUpdate < 24;
};
```

## 🚀 Usage Guidelines

### Operational Scenarios

#### Filter Active (◉)
- **Live Monitoring**: During active intelligence gathering
- **Crisis Response**: Focus on functioning sources only
- **Quality Assessment**: Quick identification of productive sources
- **Resource Optimization**: Attention on delivering sources

#### Filter Inactive (○)
- **Source Management**: Review all sources including inactive
- **Troubleshooting**: Identify and address inactive sources
- **Comprehensive Review**: Full source inventory assessment
- **Configuration**: Setup and maintenance operations

### Best Practices
1. **Situational Activation**: Enable during active operations
2. **Regular Monitoring**: Check inactive sources periodically
3. **Team Coordination**: Establish team standards for filter usage
4. **Quality Maintenance**: Use to identify sources needing attention

## 🔮 Future Enhancement Opportunities

### Advanced Filtering
- **Custom Time Windows**: Configurable activity thresholds
- **Multi-Criteria Filters**: Complex filtering combinations
- **Smart Filtering**: AI-suggested optimal filter settings
- **Saved Filter Presets**: Named filter configurations

### Integration Features
```typescript
interface AdvancedFilterSystem {
  customCriteria: FilterCriteria[];
  savedPresets: FilterPreset[];
  smartSuggestions: boolean;
  autoFiltering: boolean;
  filterHistory: FilterAction[];
}
```

## 📊 Metrics & Analytics

### Filter Effectiveness
- **Usage Frequency**: How often filter is activated
- **Source Reduction**: Percentage of sources filtered out
- **User Behavior**: Filter patterns during different operations
- **Quality Impact**: Correlation between filtering and operation success

### Performance Metrics
- **Filter Speed**: Time to apply filter to large source lists
- **Memory Usage**: RAM consumption during filtering
- **Update Frequency**: How often filtered list changes
- **User Satisfaction**: Usefulness ratings for active filtering
