import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './styles/index.css';

const App: React.FC = () => (
  <Router>
    <div className="App">
      <AppRoutes />
    </div>
  </Router>
);

export default App;