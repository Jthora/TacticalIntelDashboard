import React, { useState, useEffect } from 'react';
import { log } from '../utils/LoggerService';
import { Feed } from '../models/Feed';

interface FeedItemProps {
  feed: Feed;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animate item in when it mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const createSummary = () => {
    // Always prioritize the feed description/summary if available
    if (feed.description && feed.description.length > 10) {
      return feed.description;
    }
    
    // Create a meaningful summary from available metadata
    let summary = `${feed.title}`;
    
    // Add source information
    if (feed.source && feed.source !== 'Unknown') {
      summary += ` | Source: ${feed.source}`;
    }
    
    // Add content type context
    if (feed.contentType) {
      summary += ` | Type: ${feed.contentType}`;
    }
    
    // Add key categories/tags for context
    if (feed.categories && feed.categories.length > 0) {
      summary += ` | Categories: ${feed.categories.slice(0, 2).join(', ')}`;
    } else if (feed.tags && feed.tags.length > 0) {
      summary += ` | Tags: ${feed.tags.slice(0, 3).join(', ')}`;
    }
    
    return summary;
  };

  const getPriorityBadge = () => {
    if (!feed.priority) return null;
    
    const priorityConfig = {
      'CRITICAL': { color: '#ff4444', icon: '🔴' },
      'HIGH': { color: '#ff8800', icon: '🟠' }, 
      'MEDIUM': { color: '#00bfff', icon: '🔵' },
      'LOW': { color: '#888888', icon: '⚪' }
    };
    
    const config = priorityConfig[feed.priority] || priorityConfig['MEDIUM'];
    
    return (
      <span 
        className="priority-badge"
        style={{ 
          backgroundColor: config.color,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontWeight: 'bold',
          marginLeft: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        {config.icon} {feed.priority}
      </span>
    );
  };

  const getContentTypeBadge = () => {
    if (!feed.contentType) return null;
    
    const typeConfig = {
      'INTEL': { color: '#00ff7f', icon: '🔍' },
      'NEWS': { color: '#00bfff', icon: '📰' },
      'ALERT': { color: '#ff6600', icon: '⚠️' },
      'THREAT': { color: '#ff4444', icon: '⚡' }
    };
    
    const config = typeConfig[feed.contentType] || typeConfig['NEWS'];
    
    return (
      <span 
        className="content-type-badge"
        style={{ 
          backgroundColor: config.color + '20',
          color: config.color,
          border: `1px solid ${config.color}40`,
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontWeight: 'bold',
          marginLeft: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        {config.icon} {feed.contentType}
      </span>
    );
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
    <div className={`feed-item ${expanded ? 'expanded' : ''} ${isVisible ? 'visible' : 'mounting'}`}>
      <div className="feed-item-header">
        <div className="feed-source-badge">
          {getSourceFromUrl(feed.link)}
        </div>
        {getPriorityBadge()}
        {getContentTypeBadge()}
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

      {/* Always show summary information */}
      <div className="feed-summary">
        <p>
          {expanded ? createSummary() : truncateText(createSummary())}
        </p>
        {createSummary().length > 200 && (
          <button 
            onClick={toggleExpanded}
            className="expand-button"
          >
            {expanded ? '📜 Show Less' : '📋 Read More'}
          </button>
        )}
      </div>

      {/* Show tags if available */}
      {feed.tags && feed.tags.length > 0 && (
        <div className="feed-tags">
          {feed.tags.slice(0, 4).map((tag, index) => (
            <span key={index} className="tag-badge">
              {tag}
            </span>
          ))}
          {feed.tags.length > 4 && (
            <span className="tag-badge more-tags">
              +{feed.tags.length - 4} more
            </span>
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
