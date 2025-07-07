import React, { useState, useEffect } from 'react';
import FeedService from '../services/FeedService';
import { FeedList } from '../types/FeedTypes';
import { LoadingSpinner } from './LoadingStates';

interface LeftSidebarProps {
  setSelectedFeedList: (feedListId: string | null) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ setSelectedFeedList }) => {
  const [feedLists, setFeedLists] = useState<FeedList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'priority'>('name');
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  useEffect(() => {
    const loadFeedLists = async () => {
      setLoading(true);
      setError(null);
      try {
        const lists = await FeedService.getFeedLists();
        setFeedLists(lists);
      } catch (err) {
        console.error('Failed to load feed lists:', err);
        setError('Failed to load feed lists');
      } finally {
        setLoading(false);
      }
    };
    loadFeedLists();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        const loadFeedLists = async () => {
          try {
            const lists = await FeedService.getFeedLists();
            setFeedLists(lists);
          } catch (err) {
            console.error('Auto-refresh failed:', err);
          }
        };
        loadFeedLists();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleFeedListSelect = (listId: string) => {
    setSelectedId(listId);
    setSelectedFeedList(listId);
  };

  const getSortedFeedLists = () => {
    const sorted = [...feedLists].sort((a, b) => {
      switch (sortBy) {
        case 'activity':
          return (b as any).lastActivity - (a as any).lastActivity;
        case 'priority':
          return (b as any).priority - (a as any).priority;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    if (filterActive) {
      return sorted.filter(list => (list as any).isActive !== false);
    }
    
    return sorted;
  };

  const getActivityStatus = (list: FeedList) => {
    const lastActivity = (list as any).lastActivity || 0;
    const now = Date.now();
    const timeDiff = now - lastActivity;
    
    if (timeDiff < 300000) return 'active'; // 5 minutes
    if (timeDiff < 1800000) return 'idle'; // 30 minutes
    return 'stale';
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff41';
      case 'idle': return '#ff9500';
      case 'stale': return '#ff0040';
      default: return '#666666';
    }
  };

  if (loading) {
    return (
      <div className="tactical-module module-intelligence animate-slide-in-left">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">�</span>
            <h3>INTEL SOURCES</h3>
          </div>
          <div className="header-status">
            <span className="status-dot scanning"></span>
            <span className="status-text">SCANNING</span>
          </div>
        </div>
        <div className="tactical-content">
          <div className="loading-container-enhanced">
            <LoadingSpinner size="medium" color="#00ffaa" />
            <span className="loading-text">ESTABLISHING CONNECTIONS...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tactical-module module-intelligence animate-slide-in-left">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">�</span>
            <h3>INTEL SOURCES</h3>
          </div>
          <div className="header-status">
            <span className="status-dot error"></span>
            <span className="status-text">ERROR</span>
          </div>
        </div>
        <div className="tactical-content">
          <div className="error-container-enhanced">
            <span className="error-icon">⚠</span>
            <span className="error-text">{error}</span>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              ↻ RETRY
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tactical-module module-intelligence animate-slide-in-left">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">�</span>
          <h3>INTEL SOURCES</h3>
        </div>
        <div className="header-controls-micro">
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as any)}
            className="micro-select"
            title="View Mode"
          >
            <option value="list">█</option>
            <option value="grid">▣</option>
            <option value="compact">≡</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="micro-select"
            title="Sort By"
          >
            <option value="name">A-Z</option>
            <option value="activity">⟳</option>
            <option value="priority">★</option>
          </select>
          <button 
            className={`micro-btn ${filterActive ? 'active' : ''}`}
            onClick={() => setFilterActive(!filterActive)}
            title="Filter Active Only"
          >
            ⚡
          </button>
          <button 
            className={`micro-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Auto Refresh"
          >
            ⟲
          </button>
          <button 
            className={`micro-btn ${showMetrics ? 'active' : ''}`}
            onClick={() => setShowMetrics(!showMetrics)}
            title="Show Metrics"
          >
            📊
          </button>
        </div>
      </div>
      
      <div className="tactical-content">
        {showMetrics && (
          <div className="metrics-micro">
            <div className="metric-item">
              <span className="metric-label">TOTAL</span>
              <span className="metric-value">{feedLists.length}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">ACTIVE</span>
              <span className="metric-value">{feedLists.filter(f => getActivityStatus(f) === 'active').length}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">STATUS</span>
              <span className="metric-value status-indicator">
                {autoRefresh ? '⟲' : '⏸'}
              </span>
            </div>
          </div>
        )}

        {feedLists.length === 0 ? (
          <div className="empty-state-enhanced">
            <div className="empty-icon">📭</div>
            <div className="empty-title">NO SOURCES</div>
            <div className="empty-description">
              CONFIGURE INTEL FEEDS
            </div>
            <button className="empty-action">+ ADD SOURCE</button>
          </div>
        ) : (
          <div className={`feed-list-container view-${viewMode}`}>
            {getSortedFeedLists().map((list, index) => {
              const activityStatus = getActivityStatus(list);
              const activityColor = getActivityColor(activityStatus);
              
              return (
                <button
                  key={list.id}
                  onClick={() => handleFeedListSelect(list.id)}
                  className={`feed-list-item-enhanced ${selectedId === list.id ? 'active' : ''} view-${viewMode}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="feed-item-header">
                    <div className="feed-item-left">
                      <span 
                        className="activity-indicator"
                        style={{ color: activityColor }}
                        title={`Status: ${activityStatus.toUpperCase()}`}
                      >
                        ●
                      </span>
                      <span className="feed-list-name">{list.name}</span>
                    </div>
                    <div className="feed-item-right">
                      {selectedId === list.id && (
                        <span className="selected-indicator">▶</span>
                      )}
                      <span className="priority-indicator">
                        {(list as any).priority || 1}
                      </span>
                    </div>
                  </div>
                  
                  {viewMode !== 'compact' && (
                    <div className="feed-item-meta">
                      <span className="feed-count">
                        {(list as any).feedCount || 0} feeds
                      </span>
                      <span className="last-update">
                        {activityStatus === 'active' ? 'LIVE' : 
                         activityStatus === 'idle' ? 'IDLE' : 'STALE'}
                      </span>
                      {viewMode === 'grid' && (
                        <div className="feed-metrics">
                          <span className="metric">↑{(list as any).uptime || '99%'}</span>
                          <span className="metric">⚡{(list as any).bandwidth || 'LOW'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;