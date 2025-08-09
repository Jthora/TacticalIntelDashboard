import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import DevelopmentNotice from './components/DevelopmentNotice';
import RouteValidator from './components/RouteValidator';
import SearchResults from './components/SearchResults';
import WTTPStatus from './components/WTTPStatus/WTTPStatus';
import { FeedModeProvider } from './contexts/FeedModeContext';
import { FilterProvider } from './contexts/FilterContext';
import { HealthProvider } from './contexts/HealthContext';
import { IntelligenceProvider } from './contexts/IntelligenceContext';
import { IPFSProvider } from './contexts/IPFSContext';
import { SearchProvider } from './contexts/SearchContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Web3Provider } from './contexts/Web3Context';
import AppRoutes from './routes/AppRoutes';
import PerformanceManager from './services/PerformanceManager';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    
    // Cleanup performance manager on unmount
    return () => {
      PerformanceManager.cleanup();
    };
  }, []);

  return (
    <Router>
      <SettingsProvider>
        <ThemeProvider>
          <IntelligenceProvider>
            <Web3Provider>
              <IPFSProvider>
                <SearchProvider>
                  <FilterProvider>
                    <HealthProvider>
                      <FeedModeProvider>
                        <div className="App">
                          <DevelopmentNotice />
                          <RouteValidator />
                          <AppRoutes />
                          <SearchResults />
                          <WTTPStatus />
                        </div>
                      </FeedModeProvider>
                    </HealthProvider>
                  </FilterProvider>
                </SearchProvider>
              </IPFSProvider>
            </Web3Provider>
          </IntelligenceProvider>
        </ThemeProvider>
      </SettingsProvider>
    </Router>
  );
};

export default App;