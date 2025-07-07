import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Feed } from '../models/Feed';
import { FilterService, FilterState, TimeRange, SortOption } from '../services/FilterService';

export interface FilterContextType {
  filterState: FilterState;
  updateFilters: (filters: Set<string>) => void;
  updateTimeRange: (range: TimeRange | null) => void;
  updateSort: (sort: SortOption) => void;
  updateSearch: (query: string) => void;
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  clearAllFilters: () => void;
  getFilteredFeeds: (feeds: Feed[]) => Feed[];
  getFilterCounts: (feeds: Feed[]) => Record<string, number>;
  isFilterActive: (filter: string) => boolean;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filterState, setFilterState] = useState<FilterState>(() => {
    // Try to load saved filter state from localStorage
    try {
      const saved = localStorage.getItem('tactical-filter-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return FilterService.validateFilterState(parsed);
      }
    } catch (error) {
      console.warn('Failed to load saved filter state:', error);
    }
    return FilterService.getDefaultFilterState();
  });

  // Save filter state to localStorage whenever it changes
  const saveFilterState = useCallback((newState: FilterState) => {
    try {
      const serializable = {
        ...newState,
        activeFilters: Array.from(newState.activeFilters)
      };
      localStorage.setItem('tactical-filter-state', JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save filter state:', error);
    }
  }, []);

  const updateFilters = useCallback((filters: Set<string>) => {
    const newState = { ...filterState, activeFilters: filters };
    setFilterState(newState);
    saveFilterState(newState);
  }, [filterState, saveFilterState]);

  const updateTimeRange = useCallback((range: TimeRange | null) => {
    const newState = { ...filterState, timeRange: range };
    setFilterState(newState);
    saveFilterState(newState);
  }, [filterState, saveFilterState]);

  const updateSort = useCallback((sort: SortOption) => {
    const newState = { ...filterState, sortBy: sort };
    setFilterState(newState);
    saveFilterState(newState);
  }, [filterState, saveFilterState]);

  const updateSearch = useCallback((query: string) => {
    const newState = { ...filterState, searchQuery: query };
    setFilterState(newState);
    saveFilterState(newState);
  }, [filterState, saveFilterState]);

  const addFilter = useCallback((filter: string) => {
    const newFilters = new Set(filterState.activeFilters);
    newFilters.add(filter);
    updateFilters(newFilters);
  }, [filterState.activeFilters, updateFilters]);

  const removeFilter = useCallback((filter: string) => {
    const newFilters = new Set(filterState.activeFilters);
    newFilters.delete(filter);
    updateFilters(newFilters);
  }, [filterState.activeFilters, updateFilters]);

  const clearAllFilters = useCallback(() => {
    const newState = {
      ...filterState,
      activeFilters: new Set<string>(),
      timeRange: null,
      searchQuery: ''
    };
    setFilterState(newState);
    saveFilterState(newState);
  }, [filterState, saveFilterState]);

  const resetFilters = useCallback(() => {
    const defaultState = FilterService.getDefaultFilterState();
    setFilterState(defaultState);
    saveFilterState(defaultState);
  }, [saveFilterState]);

  const getFilteredFeeds = useCallback((feeds: Feed[]) => {
    return FilterService.applyFilters(feeds, filterState);
  }, [filterState]);

  const getFilterCounts = useCallback((feeds: Feed[]) => {
    return FilterService.getFilterCounts(feeds);
  }, []);

  const isFilterActive = useCallback((filter: string) => {
    return filterState.activeFilters.has(filter);
  }, [filterState.activeFilters]);

  const hasActiveFilters = useMemo(() => {
    return filterState.activeFilters.size > 0 || 
           filterState.timeRange !== null || 
           filterState.searchQuery.trim() !== '';
  }, [filterState]);

  const value: FilterContextType = {
    filterState,
    updateFilters,
    updateTimeRange,
    updateSort,
    updateSearch,
    addFilter,
    removeFilter,
    clearAllFilters,
    getFilteredFeeds,
    getFilterCounts,
    isFilterActive,
    hasActiveFilters,
    resetFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Custom hook for filter statistics
export const useFilterStats = (feeds: Feed[]) => {
  const { filterState, getFilterCounts } = useFilters();
  
  const stats = useMemo(() => {
    const counts = getFilterCounts(feeds);
    const totalFeeds = feeds.length;
    const filteredFeeds = FilterService.applyFilters(feeds, filterState);
    const filteredCount = filteredFeeds.length;
    
    return {
      totalFeeds,
      filteredCount,
      filterCounts: counts,
      reductionPercentage: totalFeeds > 0 ? Math.round((1 - filteredCount / totalFeeds) * 100) : 0
    };
  }, [feeds, filterState, getFilterCounts]);

  return stats;
};

// Custom hook for time range presets
export const useTimeRangePresets = () => {
  const { updateTimeRange } = useFilters();

  const applyPreset = useCallback((preset: string) => {
    try {
      const range = FilterService.createTimeRangeFromPreset(preset);
      updateTimeRange(range);
    } catch (error) {
      console.error('Failed to apply time range preset:', error);
    }
  }, [updateTimeRange]);

  const applyCustomRange = useCallback((start: Date, end: Date, label: string = 'Custom') => {
    updateTimeRange({ start, end, label });
  }, [updateTimeRange]);

  return {
    applyPreset,
    applyCustomRange
  };
};
