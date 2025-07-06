import React, { useEffect, useState } from 'react';
import FeedService from '../services/FeedService';
import { Feed } from '../models/Feed';

const FeedPage: React.FC = () => {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const feedItem = await FeedService.getFeedById(id);
          if (feedItem) {
            setFeed(feedItem);
          } else {
            setError('Feed not found');
          }
        } else {
          setError('Invalid feed ID');
        }
      } catch (err) {
        console.error('Failed to load feed:', err);
        setError('Failed to load feed');
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!feed) {
    return <div>Feed not found</div>;
  }

  return (
    <div className="feed-page">
      <input
        type="text"
        value={id || ''}
        onChange={(e) => setId(e.target.value)}
        placeholder="Enter feed ID"
      />
      <h1>{feed.title}</h1>
      <p>{feed.pubDate}</p>
      {feed.description && <p>{feed.description}</p>}
      {feed.content && <div dangerouslySetInnerHTML={{ __html: feed.content }} />}
    </div>
  );
};

export default FeedPage;