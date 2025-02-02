import React, { useEffect, useState } from 'react';
import FeedService from '../services/FeedService';
import { Feed } from '../models/Feed';
import FeedItem from './FeedItem';

const FeedList: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        const rssFeeds = await FeedService.getFeeds();
        setFeeds(rssFeeds);
      } catch (err) {
        console.error('Failed to load feeds:', err);
        setError('Failed to load feeds');
      } finally {
        setLoading(false);
      }
    };
    loadFeeds();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="feed-list">
      {feeds.length === 0 ? (
        <div>No feeds available</div>
      ) : (
        feeds.map((feed) => (
          <FeedItem key={feed.id} feed={feed} />
        ))
      )}
    </div>
  );
};

export default FeedList;