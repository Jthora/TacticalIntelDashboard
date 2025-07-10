import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FeedMode } from '../constants/EarthAllianceDefaultFeeds';

// Define the context interface
interface FeedModeContextProps {
  feedMode: FeedMode;
  setFeedMode: (mode: FeedMode) => void;
}

// Create the context with default values
const FeedModeContext = createContext<FeedModeContextProps>({
  feedMode: FeedMode.EARTH_ALLIANCE,
  setFeedMode: () => {},
});

// Props for the provider component
interface FeedModeProviderProps {
  children: ReactNode;
}

// Provider component
export const FeedModeProvider: React.FC<FeedModeProviderProps> = ({ children }) => {
  const [feedMode, setFeedMode] = useState<FeedMode>(FeedMode.EARTH_ALLIANCE);

  return (
    <FeedModeContext.Provider value={{ feedMode, setFeedMode }}>
      {children}
    </FeedModeContext.Provider>
  );
};

// Custom hook to use the feed mode context
export const useFeedMode = () => useContext(FeedModeContext);
