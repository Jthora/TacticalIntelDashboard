import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import AppRoutes from './routes/AppRoutes';
import SearchResults from './components/SearchResults';
import PerformanceManager from './services/PerformanceManager';
import './assets/styles/main.css';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    console.log('🚀 Tactical Intel Dashboard - Performance Optimized');
    
    // Cleanup performance manager on unmount
    return () => {
      PerformanceManager.cleanup();
    };
  }, []);

  return (
    <Router>
      <SearchProvider>
        <div className="App">
          <AppRoutes />
          <SearchResults />
        </div>
      </SearchProvider>
    </Router>
  );
};

export default App;