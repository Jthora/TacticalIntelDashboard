# Sort Preference Selector

## 🔄 Feature Overview

The Sort Preference Selector provides instant reorganization of intelligence sources through multiple sorting algorithms optimized for tactical operations. This micro-feature enables rapid data organization with single-click sorting changes to match current operational priorities.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Information Organization**: Instant data prioritization for current mission context
- **Operational Efficiency**: Quick access to most relevant intelligence sources
- **Cognitive Load Reduction**: Logical organization reduces mental processing overhead
- **Tactical Prioritization**: Mission-specific source ordering for maximum effectiveness

### Intelligence Operations Context
Different operations require different source prioritization:
- **Alphabetical**: Standard reference ordering for source management
- **Activity**: Most active sources first for real-time monitoring
- **Priority**: Mission-critical sources at top for immediate access

## 🏗 Technical Implementation

### React State Management
```typescript
type SortOption = 'alphabetical' | 'activity' | 'priority';
const [sortBy, setSortBy] = useState<SortOption>('alphabetical');

const cycleSortOption = () => {
  const options: SortOption[] = ['alphabetical', 'activity', 'priority'];
  const currentIndex = options.indexOf(sortBy);
  setSortBy(options[(currentIndex + 1) % options.length]);
};
```

### Sorting Logic Implementation
```typescript
const sortedSources = useMemo(() => {
  const sorted = [...filteredSources];
  
  switch (sortBy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'activity':
      return sorted.sort((a, b) => {
        const activityScore = (source: IntelligenceSource) => {
          const lastUpdate = new Date(source.lastUpdate).getTime();
          const now = Date.now();
          const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
          return 1 / (hoursSinceUpdate + 1); // More recent = higher score
        };
        return activityScore(b) - activityScore(a);
      });
    
    case 'priority':
      return sorted.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    
    default:
      return sorted;
  }
}, [filteredSources, sortBy]);
```

### Visual Component
```tsx
<div className="sort-selector">
  <button 
    className={`sort-btn ${sortBy}`}
    onClick={cycleSortOption}
    title={`Sort: ${sortBy.toUpperCase()}`}
  >
    <span className="sort-icon">
      {sortBy === 'alphabetical' && 'AZ'}
      {sortBy === 'activity' && '⚡'}
      {sortBy === 'priority' && '⭐'}
    </span>
  </button>
</div>
```

## 🎨 Visual Design Specifications

### Sort Indicators

#### Alphabetical (AZ)
- **Icon**: Text "AZ" in micro font
- **Color**: Standard text secondary
- **Logic**: Standard lexicographic ordering
- **Use Case**: Reference lookups, source management

#### Activity (⚡)
- **Icon**: Lightning bolt symbol
- **Color**: Animated cyan for active sorting
- **Logic**: Most recently updated sources first
- **Use Case**: Real-time monitoring, live operations

#### Priority (⭐)
- **Icon**: Star symbol
- **Color**: Golden yellow for priority mode
- **Logic**: High > Medium > Low priority ordering
- **Use Case**: Mission-critical operations, tactical focus

### CSS Styling System
```css
.sort-btn {
  width: 14px;
  height: 10px;
  border: 1px solid var(--text-muted);
  background: var(--secondary-bg);
  color: var(--text-secondary);
  font-size: 6px;
  transition: all 0.2s ease;
}

.sort-btn.alphabetical {
  color: var(--text-secondary);
}

.sort-btn.activity {
  color: var(--accent-cyan);
  animation: subtle-pulse 3s infinite;
}

.sort-btn.priority {
  color: var(--accent-yellow);
  text-shadow: 0 0 2px var(--accent-yellow);
}

@keyframes subtle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 📐 Architectural Integration

### Left Sidebar Position
- **Location**: Control cluster, adjacent to view mode switcher
- **Dimensions**: 14px width, 10px height
- **Spacing**: 1px margin from adjacent controls
- **Context**: Part of source management control group

### Data Flow Architecture
```typescript
interface SourceManagementState {
  sources: IntelligenceSource[];
  filteredSources: IntelligenceSource[];
  sortedSources: IntelligenceSource[];
  sortBy: SortOption;
  viewMode: ViewMode;
  activeFilter: boolean;
}

// Sorting affects the final rendered source list
const displaySources = useMemo(() => {
  let sources = allSources;
  
  // Apply filters first
  if (activeFilter) {
    sources = sources.filter(source => source.isActive);
  }
  
  // Apply sorting second
  sources = applySorting(sources, sortBy);
  
  return sources;
}, [allSources, activeFilter, sortBy]);
```

### Performance Integration
- **Memoized Sorting**: Prevents unnecessary re-sorts
- **Efficient Algorithms**: O(n log n) sorting complexity
- **Incremental Updates**: Smart re-sorting when sources change

## 🔧 Performance Considerations

### Sorting Algorithm Optimization
```typescript
// Optimized activity scoring with caching
const activityScoreCache = new Map<string, number>();

const getActivityScore = (source: IntelligenceSource): number => {
  const cacheKey = `${source.id}-${source.lastUpdate}`;
  
  if (activityScoreCache.has(cacheKey)) {
    return activityScoreCache.get(cacheKey)!;
  }
  
  const lastUpdate = new Date(source.lastUpdate).getTime();
  const now = Date.now();
  const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  const score = 1 / (hoursSinceUpdate + 1);
  
  activityScoreCache.set(cacheKey, score);
  return score;
};
```

### Memory Management
- **Cache Cleanup**: Periodic cache clearing for old entries
- **Efficient Comparisons**: Optimized comparison functions
- **Stable Sorting**: Maintains relative order for equal elements

## 🚀 Usage Guidelines

### Operational Scenarios

#### Alphabetical Sorting
- **Source Management**: Adding, removing, or configuring sources
- **Reference Operations**: Looking up specific known sources
- **Team Communication**: Standardized ordering for discussions
- **Documentation**: Consistent ordering for reports

#### Activity Sorting
- **Live Monitoring**: Real-time intelligence gathering
- **Breaking News**: Identifying most current information sources
- **Operational Tempo**: High-activity operational periods
- **Trend Analysis**: Identifying patterns in source activity

#### Priority Sorting
- **Mission Planning**: Focusing on mission-critical sources
- **Crisis Response**: Immediate access to high-priority intelligence
- **Resource Allocation**: Prioritizing attention and resources
- **Executive Briefings**: Presenting most important sources first

### Best Practices
1. **Context Switching**: Change sort based on current operational phase
2. **Team Coordination**: Establish team standards for sort preferences
3. **Mission Adaptation**: Adjust sorting to match mission requirements
4. **Efficiency Training**: Learn optimal sort for different tasks

## 🔮 Future Enhancement Opportunities

### Advanced Sorting Features
- **Multi-Criteria Sorting**: Combined priority + activity sorting
- **Custom Sort Orders**: User-defined sorting algorithms
- **Smart Sorting**: AI-suggested optimal sort for current context
- **Temporal Sorting**: Time-based intelligent reorganization

### Integration Enhancements
```typescript
interface AdvancedSortSystem {
  multiCriteria: SortCriteria[];
  customAlgorithms: UserDefinedSort[];
  contextualSorting: boolean;
  sortingHistory: SortAction[];
  smartSuggestions: SortRecommendation[];
}
```

### User Experience Improvements
- **Sort Animations**: Smooth source reordering transitions
- **Visual Indicators**: Clear sorting direction arrows
- **Undo Functionality**: Quick revert to previous sort order
- **Keyboard Shortcuts**: Rapid sort switching via hotkeys

## 🧪 Testing & Validation

### Sorting Accuracy
- Verification of alphabetical ordering
- Activity score calculation validation
- Priority level ordering correctness
- Edge case handling (equal values)

### Performance Testing
- Large dataset sorting performance (1000+ sources)
- Memory usage during sorting operations
- Cache effectiveness monitoring
- Browser compatibility across sort algorithms

## 📊 Metrics & Analytics

### Usage Analytics
- **Sort Preference Distribution**: Most commonly used sort methods
- **Context Switching**: How often users change sort methods
- **Session Patterns**: Sort preferences by operation type
- **Efficiency Metrics**: Task completion time by sort method

### Performance Metrics
- **Sort Execution Time**: Algorithm performance measurement
- **Memory Usage**: RAM consumption during sorting
- **Cache Hit Rate**: Effectiveness of activity score caching
- **User Satisfaction**: Sort usefulness ratings

## 🛡 Data Integrity & Standards

### Sorting Stability
- **Consistent Results**: Identical inputs produce identical outputs
- **Stable Algorithm**: Equal elements maintain relative order
- **Error Handling**: Graceful handling of malformed data
- **Data Validation**: Input sanitization before sorting

### Professional Standards
- **Predictable Behavior**: Sort logic follows established conventions
- **International Support**: Locale-aware alphabetical sorting
- **Accessibility**: Sort changes announced to screen readers
- **Performance Standards**: Sub-100ms sort execution for typical datasets
