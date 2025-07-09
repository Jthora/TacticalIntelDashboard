import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { FilterProvider } from './contexts/FilterContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
import { FeedModeProvider } from './contexts/FeedModeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Web3Provider } from './contexts/Web3Context';
import AppRoutes from './routes/AppRoutes';
import SearchResults from './components/SearchResults';
import DevelopmentNotice from './components/DevelopmentNotice';
import PerformanceManager from './services/PerformanceManager';
import './assets/styles/main.css';

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
      <ThemeProvider>
        <SettingsProvider>
          <Web3Provider>
            <SearchProvider>
              <FilterProvider>
                <HealthProvider>
                  <FeedModeProvider>
                    <div className="App">
                      <DevelopmentNotice />
                      <AppRoutes />
                      <SearchResults />
                    </div>
                  </FeedModeProvider>
                </HealthProvider>
              </FilterProvider>
            </SearchProvider>
          </Web3Provider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;