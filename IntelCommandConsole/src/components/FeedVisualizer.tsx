import React, { useEffect, useState } from 'react';
import FeedItem from './FeedItem';
import FeedService from '../services/FeedService';
import { Feed } from '../models/Feed';

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = ({ selectedFeedList }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeeds = async () => {
      if (selectedFeedList) {
        setLoading(true);
        setError(null);
        try {
          const feedsByList = await FeedService.getFeedsByList(selectedFeedList);
          setFeeds(feedsByList);
        } catch (err) {
          console.error('Failed to load feeds:', err);
          setError('Failed to load feeds');
        } finally {
          setLoading(false);
        }
      } else {
        setFeeds([]);
        setLoading(false);
      }
    };
    loadFeeds();
  }, [selectedFeedList]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="feed-visualizer">
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

export default FeedVisualizer;