import React, { useEffect, useState } from 'react';
import FeedService from '../services/FeedService';
import { FeedItem } from '../types/FeedTypes';

const FeedList: React.FC = () => {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading all feeds');
        const rssFeeds = await FeedService.getFeeds();
        setFeeds(rssFeeds);
        console.log(`Loaded feeds: ${JSON.stringify(rssFeeds)}`);
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
        feeds.map((feed, index) => (
          <div key={index} className="feed-item">
            <h3>{feed.title}</h3>
            <p>{feed.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedList;