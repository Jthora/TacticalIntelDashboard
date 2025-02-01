import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FeedVisualizer from '../components/FeedVisualizer';

const HomePage: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetSelectedFeedList = (feedListId: string | null) => {
    try {
      setSelectedFeedList(feedListId);
      setError(null);
    } catch (err) {
      console.error('Failed to set selected feed list:', err);
      setError('Failed to set selected feed list');
    }
  };

  return (
    <div className="home-page">
      <Sidebar setSelectedFeedList={handleSetSelectedFeedList} />
      {error ? <div>{error}</div> : <FeedVisualizer selectedFeedList={selectedFeedList} />}
    </div>
  );
};

export default HomePage;