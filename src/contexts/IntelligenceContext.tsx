/**
 * Intelligence Context - Tactical Intelligence State Management
 * Classification: UNCLASSIFIED
 * Handles tactical intelligence data flow and processing
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  IntelligenceItem,
  TacticalIntelSource,
  IntelligenceAlert,
  ThreatAssessment,
  IntelligenceStatistics,
  PriorityLevel,
  ClassificationLevel,
  IntelligenceCategory,
  ProcessingStatus
} from '../types/TacticalIntelligence';

// Intelligence state interface
export interface IntelligenceState {
  items: IntelligenceItem[];
  sources: TacticalIntelSource[];
  alerts: IntelligenceAlert[];
  threats: ThreatAssessment[];
  statistics: IntelligenceStatistics;
  isProcessing: boolean;
  lastUpdate: Date;
  errors: string[];
  filters: IntelligenceFilters;
}

// Filter configuration
export interface IntelligenceFilters {
  categories: IntelligenceCategory[];
  classifications: ClassificationLevel[];
  priorities: PriorityLevel[];
  timeRange: 'last-hour' | 'last-24h' | 'last-week' | 'last-month' | 'all';
  sources: string[];
  searchTerm: string;
  showAlertsOnly: boolean;
}

// Action types for intelligence state management
type IntelligenceAction =
  | { type: 'ADD_INTELLIGENCE'; payload: IntelligenceItem }
  | { type: 'ADD_INTELLIGENCE_BATCH'; payload: IntelligenceItem[] }
  | { type: 'UPDATE_INTELLIGENCE'; payload: { id: string; updates: Partial<IntelligenceItem> } }
  | { type: 'REMOVE_INTELLIGENCE'; payload: string }
  | { type: 'ADD_SOURCE'; payload: TacticalIntelSource }
  | { type: 'UPDATE_SOURCE'; payload: { id: string; updates: Partial<TacticalIntelSource> } }
  | { type: 'REMOVE_SOURCE'; payload: string }
  | { type: 'ADD_ALERT'; payload: IntelligenceAlert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { id: string; userId: string } }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'UPDATE_STATISTICS'; payload: Partial<IntelligenceStatistics> }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'UPDATE_FILTERS'; payload: Partial<IntelligenceFilters> }
  | { type: 'RESET_STATE' };

// Context interface
export interface IntelligenceContextType {
  state: IntelligenceState;
  actions: {
    addIntelligence: (item: IntelligenceItem) => void;
    addIntelligenceBatch: (items: IntelligenceItem[]) => void;
    updateIntelligence: (id: string, updates: Partial<IntelligenceItem>) => void;
    removeIntelligence: (id: string) => void;
    addSource: (source: TacticalIntelSource) => void;
    updateSource: (id: string, updates: Partial<TacticalIntelSource>) => void;
    removeSource: (id: string) => void;
    createAlert: (intelligence: IntelligenceItem) => void;
    acknowledgeAlert: (id: string, userId: string) => void;
    dismissAlert: (id: string) => void;
    updateFilters: (filters: Partial<IntelligenceFilters>) => void;
    clearErrors: () => void;
    resetState: () => void;
  };
}

// Initial state
const initialState: IntelligenceState = {
  items: [],
  sources: [],
  alerts: [],
  threats: [],
  statistics: {
    totalItems: 0,
    byCategory: {
      'OSINT': 0, 'HUMINT': 0, 'SIGINT': 0, 'GEOINT': 0,
      'TECHINT': 0, 'CYBINT': 0, 'MILINT': 0, 'MASINT': 0
    },
    byClassification: {
      'UNCLASSIFIED': 0, 'CONFIDENTIAL': 0, 'SECRET': 0, 'TOP_SECRET': 0
    },
    byPriority: {
      'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0
    },
    processingRate: 0,
    errorRate: 0,
    averageProcessingTime: 0,
    sourceHealthSummary: {
      'operational': 0, 'degraded': 0, 'down': 0, 'maintenance': 0
    }
  },
  isProcessing: false,
  lastUpdate: new Date(),
  errors: [],
  filters: {
    categories: [],
    classifications: [],
    priorities: [],
    timeRange: 'last-24h',
    sources: [],
    searchTerm: '',
    showAlertsOnly: false
  }
};

// Reducer function
function intelligenceReducer(state: IntelligenceState, action: IntelligenceAction): IntelligenceState {
  switch (action.type) {
    case 'ADD_INTELLIGENCE':
      const newItem = action.payload;
      const updatedItems = [newItem, ...state.items];
      return {
        ...state,
        items: updatedItems,
        statistics: updateStatistics(state.statistics, newItem, 'add'),
        lastUpdate: new Date()
      };

    case 'ADD_INTELLIGENCE_BATCH':
      const batchItems = action.payload;
      const allItems = [...batchItems, ...state.items];
      let updatedStats = state.statistics;
      batchItems.forEach(item => {
        updatedStats = updateStatistics(updatedStats, item, 'add');
      });
      return {
        ...state,
        items: allItems,
        statistics: updatedStats,
        lastUpdate: new Date()
      };

    case 'UPDATE_INTELLIGENCE':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
        lastUpdate: new Date()
      };

    case 'REMOVE_INTELLIGENCE':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        statistics: itemToRemove 
          ? updateStatistics(state.statistics, itemToRemove, 'remove')
          : state.statistics,
        lastUpdate: new Date()
      };

    case 'ADD_SOURCE':
      return {
        ...state,
        sources: [...state.sources, action.payload],
        lastUpdate: new Date()
      };

    case 'UPDATE_SOURCE':
      return {
        ...state,
        sources: state.sources.map(source =>
          source.id === action.payload.id
            ? { ...source, ...action.payload.updates }
            : source
        ),
        lastUpdate: new Date()
      };

    case 'REMOVE_SOURCE':
      return {
        ...state,
        sources: state.sources.filter(source => source.id !== action.payload),
        lastUpdate: new Date()
      };

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
        lastUpdate: new Date()
      };

    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload.id
            ? {
                ...alert,
                status: 'acknowledged' as const,
                acknowledgedBy: action.payload.userId,
                acknowledgedAt: new Date()
              }
            : alert
        ),
        lastUpdate: new Date()
      };

    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload
            ? { ...alert, status: 'dismissed' as const }
            : alert
        ),
        lastUpdate: new Date()
      };

    case 'UPDATE_STATISTICS':
      return {
        ...state,
        statistics: { ...state.statistics, ...action.payload }
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };

    case 'ADD_ERROR':
      return {
        ...state,
        errors: [action.payload, ...state.errors.slice(0, 9)] // Keep last 10 errors
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Helper function to update statistics
function updateStatistics(
  stats: IntelligenceStatistics,
  item: IntelligenceItem,
  operation: 'add' | 'remove'
): IntelligenceStatistics {
  const modifier = operation === 'add' ? 1 : -1;
  
  return {
    ...stats,
    totalItems: stats.totalItems + modifier,
    byCategory: {
      ...stats.byCategory,
      [item.category]: stats.byCategory[item.category] + modifier
    },
    byClassification: {
      ...stats.byClassification,
      [item.classification.level]: stats.byClassification[item.classification.level] + modifier
    },
    byPriority: {
      ...stats.byPriority,
      [item.priority]: stats.byPriority[item.priority] + modifier
    }
  };
}

// Helper function to generate alerts
function generateAlert(item: IntelligenceItem): IntelligenceAlert | null {
  // Generate alerts for critical or high priority intelligence
  if (item.priority === 'CRITICAL' || item.priority === 'HIGH') {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      intelligenceId: item.id,
      type: 'CRITICAL_INTELLIGENCE',
      priority: item.priority,
      title: `${item.priority} Priority Intelligence Alert`,
      message: `New ${item.priority.toLowerCase()} priority intelligence: ${item.title}`,
      timestamp: new Date(),
      status: 'active',
      escalationLevel: item.priority === 'CRITICAL' ? 2 : 1,
      metadata: {
        sourceId: item.sourceId,
        classification: item.classification.level,
        location: item.location
      }
    };
  }
  return null;
}

// Create context
const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

// Provider component
export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(intelligenceReducer, initialState);

  // Load initial data from localStorage
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedSources = localStorage.getItem('tactical-intel-sources');
        if (storedSources) {
          const sources = JSON.parse(storedSources);
          sources.forEach((source: TacticalIntelSource) => {
            dispatch({ type: 'ADD_SOURCE', payload: source });
          });
        }

        const storedItems = localStorage.getItem('tactical-intel-items');
        if (storedItems) {
          const items = JSON.parse(storedItems);
          // Only load recent items (last 24 hours)
          const recentItems = items.filter((item: IntelligenceItem) => {
            const itemDate = new Date(item.timestamp);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return itemDate > oneDayAgo;
          });
          if (recentItems.length > 0) {
            dispatch({ type: 'ADD_INTELLIGENCE_BATCH', payload: recentItems });
          }
        }
      } catch (error) {
        console.error('Failed to load stored intelligence data:', error);
        dispatch({ type: 'ADD_ERROR', payload: 'Failed to load stored data' });
      }
    };

    loadStoredData();
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('tactical-intel-sources', JSON.stringify(state.sources));
    } catch (error) {
      console.error('Failed to save sources to localStorage:', error);
    }
  }, [state.sources]);

  useEffect(() => {
    try {
      // Only store recent items to avoid localStorage bloat
      const recentItems = state.items.slice(0, 100); // Keep last 100 items
      localStorage.setItem('tactical-intel-items', JSON.stringify(recentItems));
    } catch (error) {
      console.error('Failed to save intelligence items to localStorage:', error);
    }
  }, [state.items]);

  // Action handlers
  const actions = {
    addIntelligence: useCallback((item: IntelligenceItem) => {
      dispatch({ type: 'ADD_INTELLIGENCE', payload: item });
      
      // Generate alert if necessary
      const alert = generateAlert(item);
      if (alert) {
        dispatch({ type: 'ADD_ALERT', payload: alert });
      }
    }, []),

    addIntelligenceBatch: useCallback((items: IntelligenceItem[]) => {
      dispatch({ type: 'ADD_INTELLIGENCE_BATCH', payload: items });
      
      // Generate alerts for high-priority items
      items.forEach(item => {
        const alert = generateAlert(item);
        if (alert) {
          dispatch({ type: 'ADD_ALERT', payload: alert });
        }
      });
    }, []),

    updateIntelligence: useCallback((id: string, updates: Partial<IntelligenceItem>) => {
      dispatch({ type: 'UPDATE_INTELLIGENCE', payload: { id, updates } });
    }, []),

    removeIntelligence: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_INTELLIGENCE', payload: id });
    }, []),

    addSource: useCallback((source: TacticalIntelSource) => {
      dispatch({ type: 'ADD_SOURCE', payload: source });
    }, []),

    updateSource: useCallback((id: string, updates: Partial<TacticalIntelSource>) => {
      dispatch({ type: 'UPDATE_SOURCE', payload: { id, updates } });
    }, []),

    removeSource: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_SOURCE', payload: id });
    }, []),

    createAlert: useCallback((intelligence: IntelligenceItem) => {
      const alert = generateAlert(intelligence);
      if (alert) {
        dispatch({ type: 'ADD_ALERT', payload: alert });
      }
    }, []),

    acknowledgeAlert: useCallback((id: string, userId: string) => {
      dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: { id, userId } });
    }, []),

    dismissAlert: useCallback((id: string) => {
      dispatch({ type: 'DISMISS_ALERT', payload: id });
    }, []),

    updateFilters: useCallback((filters: Partial<IntelligenceFilters>) => {
      dispatch({ type: 'UPDATE_FILTERS', payload: filters });
    }, []),

    clearErrors: useCallback(() => {
      dispatch({ type: 'CLEAR_ERRORS' });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, [])
  };

  const value: IntelligenceContextType = {
    state,
    actions
  };

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
};

// Custom hook to use intelligence context
export const useIntelligence = (): IntelligenceContextType => {
  const context = useContext(IntelligenceContext);
  if (context === undefined) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
};

// Custom hook for filtered intelligence data
export const useFilteredIntelligence = () => {
  const { state } = useIntelligence();
  
  const filteredItems = React.useMemo(() => {
    let items = state.items;
    
    // Apply category filter
    if (state.filters.categories.length > 0) {
      items = items.filter(item => state.filters.categories.includes(item.category));
    }
    
    // Apply classification filter
    if (state.filters.classifications.length > 0) {
      items = items.filter(item => 
        state.filters.classifications.includes(item.classification.level)
      );
    }
    
    // Apply priority filter
    if (state.filters.priorities.length > 0) {
      items = items.filter(item => state.filters.priorities.includes(item.priority));
    }
    
    // Apply time range filter
    if (state.filters.timeRange !== 'all') {
      const now = new Date();
      let cutoffTime: Date;
      
      switch (state.filters.timeRange) {
        case 'last-hour':
          cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'last-24h':
          cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'last-week':
          cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last-month':
          cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffTime = new Date(0);
      }
      
      items = items.filter(item => new Date(item.timestamp) > cutoffTime);
    }
    
    // Apply source filter
    if (state.filters.sources.length > 0) {
      items = items.filter(item => state.filters.sources.includes(item.sourceId));
    }
    
    // Apply search term filter
    if (state.filters.searchTerm.trim() !== '') {
      const searchTerm = state.filters.searchTerm.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Show alerts only if requested
    if (state.filters.showAlertsOnly) {
      const alertIntelligenceIds = state.alerts
        .filter(alert => alert.status === 'active')
        .map(alert => alert.intelligenceId)
        .filter(Boolean);
      items = items.filter(item => alertIntelligenceIds.includes(item.id));
    }
    
    return items;
  }, [state.items, state.filters, state.alerts]);
  
  return { items: filteredItems, totalCount: state.items.length };
};
