import React, { useState, useEffect } from 'react';
import { log } from '../utils/LoggerService';
import { Feed } from '../models/Feed';

interface FeedItemProps {
  feed: Feed;
}

const FeedItem: React.FC<FeedItemProps> = ({ feed }) => {
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

  const getRedditCommentInfo = () => {
    // Check if this is a Reddit feed with comment metadata
    if (feed.source?.includes('Reddit') && feed.metadata?.numComments !== undefined) {
      const commentCount = feed.metadata.numComments;
      const commentText = commentCount === 1 ? 'comment' : 'comments';
      
      return {
        text: `${commentCount} ${commentText}`,
        count: commentCount,
        // Use the enhanced comments URL from metadata if available, otherwise create one
        commentsUrl: feed.metadata.commentsUrl || createRedditCommentsUrl(feed.link)
      };
    }
    return null;
  };

  const createRedditCommentsUrl = (postUrl: string): string => {
    // Handle various Reddit URL formats and convert to comments view
    if (postUrl.includes('reddit.com')) {
      // If it's already a reddit.com URL, ensure it points to comments
      if (postUrl.includes('/comments/')) {
        // Already a comments URL, return as-is
        return postUrl;
      } else if (postUrl.includes('/r/')) {
        // Convert subreddit post URL to comments URL
        // Pattern: /r/subreddit/comments/postid/title/
        const redditPostMatch = postUrl.match(/\/r\/([^\/]+)\/comments\/([^\/]+)/);
        if (redditPostMatch) {
          return postUrl; // Already has comments in path
        }
        
        // Try to extract post ID and construct comments URL
        const postIdMatch = postUrl.match(/\/([a-z0-9]+)\/?$/);
        if (postIdMatch) {
          const baseUrl = postUrl.substring(0, postUrl.lastIndexOf('/'));
          return `${baseUrl}/comments/${postIdMatch[1]}/`;
        }
      }
      
      // Fallback: if URL ends with post ID, add comments path
      if (!postUrl.includes('/comments/') && !postUrl.endsWith('/')) {
        return postUrl + '/';
      }
    }
    
    // If not a reddit.com URL or can't parse, return original
    return postUrl;
  };

  const handleCommentsClick = (commentsUrl: string) => {
    log.debug("Component", 'Opening Reddit comments:', { 
      commentsUrl, 
      feedId: feed.id, 
      feedTitle: feed.title,
      metadata: feed.metadata 
    });
    window.open(commentsUrl, '_blank', 'noopener,noreferrer');
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

  const getSourceFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0].toUpperCase();
    } catch {
      return 'UNKNOWN';
    }
  };

  return (
    <div className={`feed-item ${isVisible ? 'visible' : 'mounting'}`}>
      <div className="feed-item-header">
        <div className="feed-header-left">
          <div className="feed-source-badge">
            {getSourceFromUrl(feed.link)}
          </div>
          {getPriorityBadge()}
          {getContentTypeBadge()}
          {getRedditCommentInfo() && (
            <button 
              className="reddit-comments-badge clickable"
              onClick={() => handleCommentsClick(getRedditCommentInfo()!.commentsUrl)}
              title={`View ${getRedditCommentInfo()!.text} on Reddit`}
            >
              💬 {getRedditCommentInfo()!.text}
            </button>
          )}
        </div>
        <div className="feed-header-right">
          <div className="feed-timestamp">
            {formatDate(feed.pubDate)}
          </div>
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

      {/* Bottom row with actions and tags */}
      <div className="feed-bottom-row">
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

        {/* Tags/categories moved to the right side */}
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
      </div>
    </div>
  );
};

export default FeedItem;
