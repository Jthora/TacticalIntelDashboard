import React, { useState } from 'react';

import FeedHealthIndicator from '../../../components/FeedHealthIndicator';
import { Feed } from '../../../models/Feed';
import { log } from '../../../utils/LoggerService';

interface FeedItemProps {
  feed: Feed;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getSourceFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0].toUpperCase();
    } catch {
      return 'UNKNOWN';
    }
  };

  return (
    <div className={`feed-item ${expanded ? 'expanded' : ''}`}>
      <div className="feed-item-header">
        <div className="feed-source-badge">
          {getSourceFromUrl(feed.link)}
        </div>
        <FeedHealthIndicator feedId={feed.id} />
        <div className="feed-timestamp">
          {formatDate(feed.pubDate)}
        </div>
      </div>

      <h3 className="feed-title">
        <a 
          href={feed.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="feed-link"
        >
          {feed.title}
        </a>
      </h3>

      {feed.description && (
        <div className="feed-description">
          <p>
            {expanded ? feed.description : truncateText(feed.description)}
          </p>
          {feed.description.length > 150 && (
            <button 
              onClick={toggleExpanded}
              className="expand-button"
            >
              {expanded ? '📜 Show Less' : '📋 Read More'}
            </button>
          )}
        </div>
      )}

      <div className="feed-actions">
        <button 
          onClick={() => window.open(feed.link, '_blank')}
          className="action-button primary"
        >
          🔗 Open
        </button>
        <button 
          onClick={() => navigator.clipboard?.writeText(feed.link)}
          className="action-button"
        >
          📋 Copy
        </button>
        <button 
          onClick={() => {
            // TODO: Implement bookmark functionality
            log.debug("Component", 'Bookmark:', feed.title);
          }}
          className="action-button"
        >
          ⭐ Bookmark
        </button>
      </div>
    </div>
  );
};

export default FeedItem;
