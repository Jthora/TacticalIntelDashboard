import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedService from '../services/FeedService';
import { FeedList } from '../types/FeedTypes';

interface SidebarProps {
  setSelectedFeedList: (feedListId: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setSelectedFeedList }) => {
  const [feedLists, setFeedLists] = useState<FeedList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedLists = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading feed lists');
        const lists = await FeedService.getFeedLists();
        setFeedLists(lists);
        console.log('Feed lists loaded:', lists);
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
    <div className="sidebar">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
        <ul>
          {feedLists.length === 0 ? (
            <div>No feed lists available</div>
          ) : (
            feedLists.map((list) => (
              <li key={list.id} onClick={() => setSelectedFeedList(list.id)}>
                {list.name}
              </li>
            ))
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;