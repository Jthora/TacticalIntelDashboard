import React, { useEffect, useState } from 'react';
import FeedService from '../services/FeedService';
import { Feed } from '../models/Feed';
import FeedItem from './FeedItem';
import { FeedListSkeleton } from '../shared/components/LoadingStates';
import { useLoading } from '../hooks/useLoading';

const FeedList: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const { isLoading, error, withLoading, setError } = useLoading({
    initialMessage: 'Loading feeds...',
    minLoadingTime: 300 // Prevent flashing for fast loads
  });

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const rssFeeds = await withLoading(
          async () => await FeedService.getFeeds(),
          'Fetching latest feeds...'
        );
        setFeeds(rssFeeds as Feed[]);
      } catch (err) {
        console.error('Failed to load feeds:', err);
        setError('Failed to load feeds. Please try again.');
      }
    };
    loadFeeds();
  }, [withLoading, setError]);

  if (isLoading) {
    return (
      <div className="feed-list">
        <FeedListSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-list-error">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button 
          className="retry-button" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className="feed-list-empty">
        <div className="empty-icon">📡</div>
        <div className="empty-message">No feeds available</div>
        <div className="empty-suggestion">Add some RSS feeds to get started</div>
      </div>
    );
  }

  return (
    <div className="feed-list">
      {feeds.map((feed) => (
        <FeedItem key={feed.id} feed={feed} />
      ))}
    </div>
  );
};

export default FeedList;