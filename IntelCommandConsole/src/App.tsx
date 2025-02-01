import React from 'react';
import FeedVisualizer from './components/FeedVisualizer';
import './assets/styles/main.css';

const App: React.FC = () => (
  <div className="App">
    <h1>Tactical Intel Dashboard</h1>
    <FeedVisualizer />
  </div>
);

export default App;