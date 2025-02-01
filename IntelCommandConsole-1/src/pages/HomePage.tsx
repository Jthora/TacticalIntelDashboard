import React from 'react';
import FeedVisualizer from '../components/FeedVisualizer';
import Sidebar from '../components/Sidebar';

const HomePage: React.FC = () => (
  <div className="HomePage">
    <Sidebar />
    <FeedVisualizer />
  </div>
);

export default HomePage;