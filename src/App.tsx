import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { FilterProvider } from './contexts/FilterContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
import { FeedModeProvider } from './contexts/FeedModeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Web3Provider } from './contexts/Web3Context';
import { IPFSProvider } from './contexts/IPFSContext';
import { IntelligenceProvider } from './contexts/IntelligenceContext';
import AppRoutes from './routes/AppRoutes';
import SearchResults from './components/SearchResults';
import DevelopmentNotice from './components/DevelopmentNotice';
import WTTPStatus from './components/WTTPStatus/WTTPStatus';
import PerformanceManager from './services/PerformanceManager';
import RouteValidator from './components/RouteValidator';

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