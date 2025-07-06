import React, { useState, useEffect } from 'react';
import FeedService from '../services/FeedService';
import { FeedList } from '../types/FeedTypes';

interface LeftSidebarProps {
  setSelectedFeedList: (feedListId: string | null) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ setSelectedFeedList }) => {
  const [feedLists, setFeedLists] = useState<FeedList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedLists = async () => {
      setLoading(true);
      setError(null);
      try {
        const lists = await FeedService.getFeedLists();
        setFeedLists(lists);
      } catch (err) {
        console.error('Failed to load feed lists:', err);
        setError('Failed to load feed lists');
      } finally {
        setLoading(false);
      }
    };
    loadFeedLists();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="left-sidebar">
      {feedLists.length === 0 ? (
        <div>No feed lists available</div>
      ) : (
        feedLists.map((list) => (
          <button key={list.id} onClick={() => setSelectedFeedList(list.id)}>
            {list.name}
          </button>
        ))
      )}
    </div>
  );
};

export default LeftSidebar;