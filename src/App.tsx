import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import RouteValidator from './components/RouteValidator';
import SearchResults from './components/SearchResults';
import WTTPStatus from './components/WTTPStatus/WTTPStatus';
import { FilterProvider } from './contexts/FilterContext';
import { HealthProvider } from './contexts/HealthContext';
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

  return (
    <Router>
      <StatusMessageProvider>
        <SettingsProvider>
          <ThemeProvider>
            <IntelligenceProvider>
              <Web3Provider>
                <IPFSProvider>
                  <SearchProvider>
                    <FilterProvider>
                      <HealthProvider>
                        <MissionModeProvider>
                          <div className="App">
                            <RouteValidator />
                            <AppRoutes />
                            <SearchResults />
                            <WTTPStatus />
                          </div>
                        </MissionModeProvider>
                      </HealthProvider>
                    </FilterProvider>
                  </SearchProvider>
                </IPFSProvider>
              </Web3Provider>
            </IntelligenceProvider>
          </ThemeProvider>
        </SettingsProvider>
      </StatusMessageProvider>
    </Router>
  );
};

export default App;