import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedService from '../services/FeedService';
import { Feed } from '../models/Feed';

/**
 * FeedPage displays the content of a specific feed.
 * The feed ID is taken from the route parameters.
 */
const FeedPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="feed-page loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="feed-page error">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={handleBack}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="feed-page not-found">
        <div className="not-found-message">Feed not found</div>
        <button className="back-button" onClick={handleBack}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <h1>{feed.title}</h1>
        <p className="feed-date">{feed.pubDate}</p>
      </div>
      
      {feed.description && <p className="feed-description">{feed.description}</p>}
      
      <div className="feed-content">
        {feed.content && <div dangerouslySetInnerHTML={{ __html: feed.content }} />}
      </div>
    </div>
  );
};

export default FeedPage;