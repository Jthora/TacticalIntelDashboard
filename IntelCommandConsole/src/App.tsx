import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { FilterProvider } from './contexts/FilterContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
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
        <SearchProvider>
          <FilterProvider>
            <HealthProvider>
              <div className="App">
                <DevelopmentNotice />
                <AppRoutes />
                <SearchResults />
              </div>
            </HealthProvider>
          </FilterProvider>
        </SearchProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;