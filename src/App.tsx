import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import RouteValidator from './components/RouteValidator';
import SearchResults from './components/SearchResults';
import WTTPStatus from './components/WTTPStatus/WTTPStatus';
import { featureFlags } from './config/featureFlags';
import { FilterProvider } from './contexts/FilterContext';
import { FeedDataProvider } from './contexts/FeedDataContext';
import { IntelligenceProvider } from './contexts/IntelligenceContext';
import { IPFSProvider } from './contexts/IPFSContext';
import { MissionModeProvider } from './contexts/MissionModeContext';
import { SearchProvider } from './contexts/SearchContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Web3Provider } from './contexts/Web3Context';
import AppRoutes from './routes/AppRoutes';
import PerformanceManager from './services/PerformanceManager';
import { StatusMessageProvider } from './contexts/StatusMessageContext';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    
    // Cleanup performance manager on unmount
    return () => {
      PerformanceManager.cleanup();
    };
  }, []);

  const coreProviders = (
    <IPFSProvider>
      <SearchProvider>
        <FilterProvider>
          <FeedDataProvider>
            <MissionModeProvider>
              <div className="App">
                <RouteValidator />
                <AppRoutes />
                <SearchResults />
                <WTTPStatus />
              </div>
            </MissionModeProvider>
          </FeedDataProvider>
        </FilterProvider>
      </SearchProvider>
    </IPFSProvider>
  );

  return (
    <Router>
      <StatusMessageProvider>
        <SettingsProvider>
          <ThemeProvider>
            <IntelligenceProvider>
              {featureFlags.web3Login ? (
                <Web3Provider>
                  {coreProviders}
                </Web3Provider>
              ) : (
                coreProviders
              )}
            </IntelligenceProvider>
          </ThemeProvider>
        </SettingsProvider>
      </StatusMessageProvider>
    </Router>
  );
};

export default App;