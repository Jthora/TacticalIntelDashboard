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
            <span className="module-icon">📡</span>
            <h3>INTEL SOURCES</h3>
          </div>
          <div className="header-status">
            <span className="status-dot scanning"></span>
            <span className="status-text">SCANNING</span>
          </div>
        </div>
        <div className="tactical-content">
          <div className="intel-loading-state">
            <LoadingSpinner size="medium" color="#00ffaa" />
            <span className="loading-message">ESTABLISHING CONNECTIONS...</span>
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
            <span className="module-icon">📡</span>
            <h3>INTEL SOURCES</h3>
          </div>
          <div className="header-status">
            <span className="status-dot error"></span>
            <span className="status-text">ERROR</span>
          </div>
        </div>
        <div className="tactical-content">
          <div className="intel-error-state">
            <div className="error-content">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
              <button className="error-retry-btn" onClick={() => window.location.reload()}>
                <span className="btn-icon">↻</span>
                <span className="btn-text">RETRY CONNECTION</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tactical-module module-intelligence animate-slide-in-left">
      {/* Enhanced Header Section */}
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">📡</span>
          <h3>INTEL SOURCES</h3>
        </div>
        <div className="header-status">
          <span className={`status-dot ${autoRefresh ? 'active' : 'idle'}`}></span>
          <span className="status-text">{autoRefresh ? 'LIVE' : 'STANDBY'}</span>
        </div>
      </div>
      
      <div className="tactical-content">
        {/* Control Panel Section */}
        <div className="intel-controls-section">
          <div className="controls-row">
            <div className="view-controls">
              <span className="control-label">VIEW:</span>
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as any)}
                className="intel-select"
                title="View Mode"
              >
                <option value="list">LIST</option>
                <option value="grid">GRID</option>
                <option value="compact">COMPACT</option>
              </select>
            </div>
            <div className="sort-controls">
              <span className="control-label">SORT:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="intel-select"
                title="Sort By"
              >
                <option value="name">NAME</option>
                <option value="activity">ACTIVITY</option>
                <option value="priority">PRIORITY</option>
              </select>
            </div>
          </div>
          <div className="toggle-controls">
            <button 
              className={`intel-toggle ${filterActive ? 'active' : ''}`}
              onClick={() => setFilterActive(!filterActive)}
              title="Filter Active Only"
            >
              <span className="toggle-icon">⚡</span>
              <span className="toggle-label">ACTIVE</span>
            </button>
            <button 
              className={`intel-toggle ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title="Auto Refresh"
            >
              <span className="toggle-icon">⟲</span>
              <span className="toggle-label">REFRESH</span>
            </button>
            <button 
              className={`intel-toggle ${showMetrics ? 'active' : ''}`}
              onClick={() => setShowMetrics(!showMetrics)}
              title="Show Metrics"
            >
              <span className="toggle-icon">📊</span>
              <span className="toggle-label">METRICS</span>
            </button>
          </div>
        </div>

        {/* Metrics Panel Section */}
        {showMetrics && (
          <div className="intel-metrics-panel">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-info">
                  <div className="metric-value">{feedLists.length}</div>
                  <div className="metric-label">TOTAL SOURCES</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-info">
                  <div className="metric-value">{feedLists.filter(f => getActivityStatus(f) === 'active').length}</div>
                  <div className="metric-label">ACTIVE</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⟲</div>
                <div className="metric-info">
                  <div className="metric-value">{autoRefresh ? 'ON' : 'OFF'}</div>
                  <div className="metric-label">AUTO-REFRESH</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sources List Section */}
        <div className="intel-sources-section">
          {feedLists.length === 0 ? (
            <div className="intel-empty-state">
              <div className="empty-content">
                <div className="empty-icon">📭</div>
                <div className="empty-title">NO INTEL SOURCES</div>
                <div className="empty-description">
                  Configure intelligence feeds to begin monitoring
                </div>
                <button className="empty-action-btn">
                  <span className="btn-icon">+</span>
                  <span className="btn-text">ADD SOURCE</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`intel-sources-list view-mode-${viewMode}`}>
              {getSortedFeedLists().map((list, index) => {
                const activityStatus = getActivityStatus(list);
                const activityColor = getActivityColor(activityStatus);
                
                return (
                  <button
                    key={list.id}
                    onClick={() => handleFeedListSelect(list.id)}
                    className={`intel-source-item ${selectedId === list.id ? 'selected' : ''} status-${activityStatus}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="source-item-header">
                      <div className="source-status">
                        <span 
                          className="status-indicator"
                          style={{ backgroundColor: activityColor }}
                          title={`Status: ${activityStatus.toUpperCase()}`}
                        ></span>
                      </div>
                      <div className="source-info">
                        <div className="source-name">{list.name}</div>
                        <div className="source-meta">
                          <span className="feed-count">{(list as any).feedCount || 0} feeds</span>
                          <span className="priority-badge">P{(list as any).priority || 1}</span>
                        </div>
                      </div>
                      <div className="source-controls">
                        {selectedId === list.id && (
                          <span className="selected-arrow">▶</span>
                        )}
                      </div>
                    </div>
                    
                    {viewMode !== 'compact' && (
                      <div className="source-details">
                        <div className="status-text">
                          {activityStatus === 'active' ? 'LIVE FEED' : 
                           activityStatus === 'idle' ? 'IDLE' : 'STALE'}
                        </div>
                        {viewMode === 'grid' && (
                          <div className="source-stats">
                            <span className="stat-item">
                              <span className="stat-icon">↑</span>
                              <span className="stat-value">{(list as any).uptime || '99%'}</span>
                            </span>
                            <span className="stat-item">
                              <span className="stat-icon">⚡</span>
                              <span className="stat-value">{(list as any).bandwidth || 'LOW'}</span>
                            </span>
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
    </div>
  );
};

export default LeftSidebar;
