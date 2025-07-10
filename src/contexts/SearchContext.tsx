import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SearchService, SearchOptions, SearchResponse } from '../services/SearchService';

interface SearchContextType {
  searchResults: SearchResponse | null;
  isSearching: boolean;
  searchQuery: string;
  searchHistory: string[];
  performSearch: (options: SearchOptions) => Promise<void>;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem('tactical_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const performSearch = useCallback(async (options: SearchOptions) => {
    if (!options.query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await SearchService.search(options);
      setSearchResults(results);
      setSearchQuery(options.query);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        results: [],
        totalCount: 0,
        searchTime: 0,
        suggestions: []
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchQuery('');
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      localStorage.setItem('tactical_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('tactical_search_history');
  }, []);

  const value: SearchContextType = {
    searchResults,
    isSearching,
    searchQuery,
    searchHistory,
    performSearch,
    clearSearch,
    setSearchQuery,
    addToHistory,
    clearHistory
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
