# IMPL-001: Filter Integration System

## Overview

**Priority**: High (Critical)  
**Component**: TacticalFilters, MainDashboard, FeedVisualizer  
**Estimated Effort**: 3-5 days  
**Dependencies**: None

## Problem Statement

The TacticalFilters component generates filter state but no components consume it. Users can select filters but they don't actually filter displayed content, making the entire filtering system non-functional.

## Implementation Goals

1. **Primary**: Make filters actually filter displayed feed content
2. **Secondary**: Integrate filters with export functionality
3. **Tertiary**: Add filter state persistence
4. **Bonus**: Add filter performance optimization

## Technical Architecture

### State Management Strategy
```typescript
// New centralized filter state
interface FilterState {
  activeFilters: Set<string>;
  timeRange: TimeRange;
  sortBy: SortOption;
  searchQuery: string;
}

// Context provider for filter state
interface FilterContextType {
  filterState: FilterState;
  updateFilters: (filters: Set<string>) => void;
  updateTimeRange: (range: TimeRange) => void;
  updateSort: (sort: SortOption) => void;
  updateSearch: (query: string) => void;
  clearAllFilters: () => void;
  getFilteredFeeds: (feeds: Feed[]) => Feed[];
}
```

### Component Integration Pattern
```typescript
// Parent component manages filter state
const Dashboard = () => {
  const [filterState, setFilterState] = useState<FilterState>(defaultState);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  
  // Apply filters to feeds
  const filteredFeeds = useMemo(() => 
    FilterService.applyFilters(feeds, filterState), 
    [feeds, filterState]
  );
  
  return (
    <FilterContext.Provider value={{ filterState, actions }}>
      <TacticalFilters />
      <FeedVisualizer feeds={filteredFeeds} />
    </FilterContext.Provider>
  );
};
```

## Implementation Steps

### Step 1: Create Filter Service
**File**: `src/services/FilterService.ts`

```typescript
export class FilterService {
  static applyFilters(feeds: Feed[], filterState: FilterState): Feed[] {
    let filteredFeeds = [...feeds];
    
    // Apply category filters (priority, content type, region)
    if (filterState.activeFilters.size > 0) {
      filteredFeeds = filteredFeeds.filter(feed => 
        this.matchesFilters(feed, filterState.activeFilters)
      );
    }
    
    // Apply time range filter
    if (filterState.timeRange) {
      filteredFeeds = filteredFeeds.filter(feed =>
        this.isWithinTimeRange(feed, filterState.timeRange)
      );
    }
    
    // Apply sort
    filteredFeeds = this.sortFeeds(filteredFeeds, filterState.sortBy);
    
    return filteredFeeds;
  }
  
  private static matchesFilters(feed: Feed, filters: Set<string>): boolean {
    // Implementation for category matching
  }
  
  private static isWithinTimeRange(feed: Feed, timeRange: TimeRange): boolean {
    // Implementation for time range filtering
  }
  
  private static sortFeeds(feeds: Feed[], sortBy: SortOption): Feed[] {
    // Implementation for sorting
  }
}
```

### Step 2: Create Filter Context
**File**: `src/contexts/FilterContext.tsx`

```typescript
export const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filterState, setFilterState] = useState<FilterState>(getDefaultFilterState());
  
  const updateFilters = useCallback((filters: Set<string>) => {
    setFilterState(prev => ({ ...prev, activeFilters: filters }));
  }, []);
  
  const getFilteredFeeds = useCallback((feeds: Feed[]) => {
    return FilterService.applyFilters(feeds, filterState);
  }, [filterState]);
  
  const value = {
    filterState,
    updateFilters,
    updateTimeRange,
    updateSort,
    updateSearch,
    clearAllFilters,
    getFilteredFeeds
  };
  
  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};
```

### Step 3: Update TacticalFilters Component
**File**: `src/components/TacticalFilters.tsx`

```typescript
// Replace existing state management with context
const TacticalFilters: React.FC<TacticalFiltersProps> = () => {
  const { filterState, updateFilters, updateTimeRange, clearAllFilters } = useFilters();
  
  // Remove local state, use context state
  // Update all handlers to use context methods
  
  const toggleFilter = (filter: string) => {
    const newFilters = new Set(filterState.activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    updateFilters(newFilters);
  };
  
  // Implement time range handling
  const handleTimeRangeClick = (range: TimeRange) => {
    updateTimeRange(range);
  };
  
  // Rest of component remains the same but uses context state
};
```

### Step 4: Update Feed Display Components
**File**: `src/components/FeedVisualizer.tsx`

```typescript
const FeedVisualizer: React.FC<{ feeds?: Feed[] }> = ({ feeds: propFeeds }) => {
  const { getFilteredFeeds } = useFilters();
  const [allFeeds, setAllFeeds] = useState<Feed[]>([]);
  
  // Use filtered feeds if no feeds passed as props
  const displayFeeds = useMemo(() => {
    const feedsToFilter = propFeeds || allFeeds;
    return getFilteredFeeds(feedsToFilter);
  }, [propFeeds, allFeeds, getFilteredFeeds]);
  
  // Rest of component uses displayFeeds instead of raw feeds
};
```

### Step 5: Update Main Dashboard
**File**: `src/components/Dashboard.tsx` or main app component

```typescript
const Dashboard: React.FC = () => {
  return (
    <FilterProvider>
      <div className="dashboard-layout">
        <LeftSidebar />
        <MainContent />
        <RightSidebar />
      </div>
    </FilterProvider>
  );
};
```

### Step 6: Add Feed Metadata for Filtering
**File**: `src/models/Feed.ts`

```typescript
export interface Feed {
  // ...existing fields...
  
  // Add filter-related metadata
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  contentType?: 'INTEL' | 'NEWS' | 'ALERT' | 'THREAT';
  region?: 'GLOBAL' | 'AMERICAS' | 'EUROPE' | 'ASIA_PACIFIC';
  tags?: string[];
  classification?: string;
}
```

### Step 7: Update FeedService to Include Metadata
**File**: `src/services/FeedService.ts`

```typescript
// Add method to enrich feeds with filter metadata
public enrichFeedWithMetadata(feed: Feed): Feed {
  return {
    ...feed,
    priority: this.determinePriority(feed),
    contentType: this.determineContentType(feed),
    region: this.determineRegion(feed),
    tags: this.extractTags(feed)
  };
}

private determinePriority(feed: Feed): string {
  // Logic to determine priority based on content analysis
  const keywords = feed.title.toLowerCase() + ' ' + feed.description?.toLowerCase();
  
  if (keywords.includes('urgent') || keywords.includes('breaking') || keywords.includes('critical')) {
    return 'CRITICAL';
  }
  if (keywords.includes('important') || keywords.includes('alert')) {
    return 'HIGH';
  }
  if (keywords.includes('update') || keywords.includes('warning')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

private determineContentType(feed: Feed): string {
  // Logic to determine content type
  const keywords = feed.title.toLowerCase() + ' ' + feed.description?.toLowerCase();
  
  if (keywords.includes('threat') || keywords.includes('attack') || keywords.includes('cyber')) {
    return 'THREAT';
  }
  if (keywords.includes('intelligence') || keywords.includes('intel') || keywords.includes('classified')) {
    return 'INTEL';
  }
  if (keywords.includes('alert') || keywords.includes('warning') || keywords.includes('emergency')) {
    return 'ALERT';
  }
  return 'NEWS';
}
```

## Testing Strategy

### Unit Tests
**File**: `src/services/__tests__/FilterService.test.ts`

```typescript
describe('FilterService', () => {
  describe('applyFilters', () => {
    it('should filter feeds by priority', () => {
      const feeds = [
        createMockFeed({ priority: 'CRITICAL' }),
        createMockFeed({ priority: 'LOW' })
      ];
      const filterState = { activeFilters: new Set(['CRITICAL']) };
      
      const result = FilterService.applyFilters(feeds, filterState);
      
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('CRITICAL');
    });
    
    it('should filter feeds by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      
      const feeds = [
        createMockFeed({ pubDate: oneHourAgo.toISOString() }),
        createMockFeed({ pubDate: twoDaysAgo.toISOString() })
      ];
      
      const filterState = { 
        timeRange: { value: '24H', start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now }
      };
      
      const result = FilterService.applyFilters(feeds, filterState);
      
      expect(result).toHaveLength(1);
    });
  });
});
```

### Integration Tests
**File**: `src/components/__tests__/FilterIntegration.test.tsx`

```typescript
describe('Filter Integration', () => {
  it('should filter feeds when filter is applied', async () => {
    render(
      <FilterProvider>
        <TacticalFilters />
        <FeedVisualizer />
      </FilterProvider>
    );
    
    // Mock feeds with different priorities
    const mockFeeds = [
      createMockFeed({ priority: 'CRITICAL', title: 'Critical Alert' }),
      createMockFeed({ priority: 'LOW', title: 'Regular Update' })
    ];
    
    // Mock FeedService
    jest.spyOn(FeedService, 'getFeeds').mockReturnValue(mockFeeds);
    
    // Click CRITICAL filter
    fireEvent.click(screen.getByText('CRITICAL'));
    
    // Apply filters
    fireEvent.click(screen.getByText('APPLY FILTERS'));
    
    // Should only show critical feed
    await waitFor(() => {
      expect(screen.getByText('Critical Alert')).toBeInTheDocument();
      expect(screen.queryByText('Regular Update')).not.toBeInTheDocument();
    });
  });
});
```

### Manual Testing Checklist
**File**: `src/docs/testing/IMPL-001-manual-tests.md`

- [ ] **Basic Filter Test**: Apply single filter, verify content changes
- [ ] **Multiple Filter Test**: Apply multiple filters, verify AND logic
- [ ] **Time Range Test**: Select time range, verify content filtering
- [ ] **Clear Filter Test**: Clear all filters, verify all content shows
- [ ] **Preset Filter Test**: Load preset, verify correct filters applied
- [ ] **Performance Test**: Apply filters to large dataset (1000+ feeds)
- [ ] **Persistence Test**: Apply filters, refresh page, verify state
- [ ] **Cross-component Test**: Verify filters affect export functionality

## Acceptance Criteria

### Must Have
- [ ] Filters actually filter displayed feed content
- [ ] All filter categories work (priority, content type, region)
- [ ] Time range filtering is functional
- [ ] Filter state is managed centrally
- [ ] Performance is acceptable (< 500ms for 1000 feeds)

### Should Have
- [ ] Filters integrate with export functionality
- [ ] Filter state persists across page refreshes
- [ ] Multiple filters work with AND logic
- [ ] Filter presets work correctly

### Could Have
- [ ] Filter state is shareable via URL
- [ ] Advanced filter combinations (OR logic)
- [ ] Filter suggestions based on content

## Performance Considerations

1. **Debouncing**: Debounce filter applications by 300ms
2. **Memoization**: Use React.memo and useMemo for expensive operations
3. **Virtualization**: Consider react-window for large feed lists
4. **Indexing**: Pre-index feeds by common filter criteria

## Rollback Plan

If implementation fails:
1. Revert to current TacticalFilters component
2. Remove FilterContext and FilterService
3. Document lessons learned
4. Plan alternative approach

## Success Metrics

- [ ] Unit test coverage > 90%
- [ ] Integration tests pass
- [ ] Manual testing checklist complete
- [ ] Performance benchmarks met
- [ ] User acceptance testing passed

## Dependencies for Future Phases

This implementation enables:
- **IMPL-005**: Filter Preset Persistence
- **IMPL-008**: Time Range Filtering
- **Export Integration**: Filtered exports

## Related Documents

- [Component Functionality Audit](../COMPONENT_FUNCTIONALITY_AUDIT.md)
- [IMPL-002: SystemControl Settings](./IMPL-002-implementation.md)
- [Testing Strategy](./IMPL-001-testing.md)
