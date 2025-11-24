import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { Feed } from '../models/Feed';

interface FeedSnapshot {
  feeds: Feed[];
  filteredFeeds: Feed[];
  lastUpdated: Date | null;
}

interface FeedDataContextType extends FeedSnapshot {
  updateFeedSnapshot: (snapshot: Partial<FeedSnapshot>) => void;
  clearFeedSnapshot: () => void;
}

const defaultSnapshot: FeedSnapshot = {
  feeds: [],
  filteredFeeds: [],
  lastUpdated: null
};

const FeedDataContext = createContext<FeedDataContextType | undefined>(undefined);

export const FeedDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<FeedSnapshot>(defaultSnapshot);

  const updateFeedSnapshot = useCallback((next: Partial<FeedSnapshot>) => {
    setSnapshot(prev => ({
      feeds: next.feeds ?? prev.feeds,
      filteredFeeds: next.filteredFeeds ?? prev.filteredFeeds,
      lastUpdated: next.lastUpdated ?? prev.lastUpdated
    }));
  }, []);

  const clearFeedSnapshot = useCallback(() => {
    setSnapshot(defaultSnapshot);
  }, []);

  const value = useMemo<FeedDataContextType>(() => ({
    ...snapshot,
    updateFeedSnapshot,
    clearFeedSnapshot
  }), [snapshot, updateFeedSnapshot, clearFeedSnapshot]);

  return (
    <FeedDataContext.Provider value={value}>
      {children}
    </FeedDataContext.Provider>
  );
};

export const useFeedData = (): FeedDataContextType => {
  const context = useContext(FeedDataContext);
  if (!context) {
    throw new Error('useFeedData must be used within a FeedDataProvider');
  }
  return context;
};
