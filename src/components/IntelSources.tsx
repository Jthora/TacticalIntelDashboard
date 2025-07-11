import React, { useState, useEffect } from 'react';
import FeedService from '../services/FeedService';
import { FeedList } from '../types/FeedTypes';
import { LoadingSpinner } from '../shared/components/LoadingStates';
import SourceManager from './SourceManager';
import { useIntelligence } from '../contexts/IntelligenceContext';
import { TACTICAL_INTEL_SOURCES, INTELLIGENCE_CATEGORIES } from '../constants/TacticalIntelSources';
import { TacticalIntelSource, IntelligenceCategory } from '../types/TacticalIntelligence';

interface IntelSourcesProps {
  setSelectedFeedList: (feedListId: string | null) => void;
  displayMode?: 'operational' | 'analysis' | 'overview';
  showClassificationLevels?: boolean;
  enableRealTimeAlerts?: boolean;
}

const IntelSources: React.FC<IntelSourcesProps> = ({ 
  setSelectedFeedList,
  displayMode = 'operational',
  showClassificationLevels = true,
  enableRealTimeAlerts = true
}) => {
  const { state: intelState, actions: intelActions } = useIntelligence();
  const [feedLists, setFeedLists] = useState<FeedList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'reliability' | 'category' | 'priority'>('category');
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<IntelligenceCategory[]>([]);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [showSourceManager, setShowSourceManager] = useState<boolean>(false);
  const [tacticalSources, setTacticalSources] = useState<TacticalIntelSource[]>([]);

  // Load tactical intelligence sources
  useEffect(() => {
    const loadTacticalSources = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load from intelligence context first
        let sources = intelState.sources;
        
        // If no sources in context, load defaults
        if (sources.length === 0) {
          const defaultSources = TACTICAL_INTEL_SOURCES.filter(source => 
            source.cost === 'free' || source.classification === 'UNCLASSIFIED'
          );
          sources = defaultSources;
          // Add to intelligence context
          defaultSources.forEach(source => intelActions.addSource(source));
        }
        
        setTacticalSources(sources);
        
        // Also load legacy feed lists for compatibility
        const lists = await FeedService.getFeedLists();
        setFeedLists(lists);
      } catch (err) {
        console.error('Failed to load tactical sources:', err);
        setError('Failed to load intelligence sources');
      } finally {
        setLoading(false);
      }
    };
    loadTacticalSources();
  }, [intelState.sources, intelActions]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Refresh source health status
        tacticalSources.forEach(source => {
          // Simulate health check - in real implementation this would be actual API calls
          const healthStatus = Math.random() > 0.1 ? 'operational' : 'degraded';
          if (source.healthStatus !== healthStatus) {
            intelActions.updateSource(source.id, { 
              healthStatus,
              lastUpdated: new Date()
            });
          }
        });
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, tacticalSources, intelActions]);

  const handleFeedListSelect = (listId: string) => {
    setSelectedId(listId);
    setSelectedFeedList(listId);
  };

  const getSortedTacticalSources = () => {
    const filtered = categoryFilter.length > 0 
      ? tacticalSources.filter(source => categoryFilter.includes(source.category))
      : tacticalSources;
      
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'reliability':
          return b.reliability - a.reliability;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'priority':
          // Priority based on health status and reliability
          const getPriority = (source: TacticalIntelSource) => {
            let priority = source.reliability;
            if (source.healthStatus === 'operational') priority += 2;
            if (source.healthStatus === 'down') priority -= 5;
            if (source.cost === 'free') priority += 1;
            return priority;
          };
          return getPriority(b) - getPriority(a);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const getSortedFeedLists = () => {
    const sorted = [...feedLists].sort((a, b) => {
      switch (sortBy) {
        case 'reliability':
          return (b as any).reliability || 5 - (a as any).reliability || 5;
        case 'category':
          return (a as any).category?.localeCompare((b as any).category) || 0;
        case 'priority':
          return (b as any).priority || 0 - (a as any).priority || 0;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    if (filterActive) {
      return sorted.filter(list => (list as any).isActive !== false);
    }
    
    return sorted;
  };

  const getHealthStatus = (source: TacticalIntelSource) => {
    return source.healthStatus || 'operational';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'operational': return '#00ff41';
      case 'degraded': return '#ff9500';
      case 'down': return '#ff0040';
      case 'maintenance': return '#00aaff';
      default: return '#666666';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 9) return '#00ff41';
    if (reliability >= 7) return '#ff9500';
    if (reliability >= 5) return '#ffc107';
    return '#ff0040';
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'UNCLASSIFIED': return '#28a745';
      case 'CONFIDENTIAL': return '#ffc107';
      case 'SECRET': return '#fd7e14';
      case 'TOP_SECRET': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getClassificationTooltip = (classification: string) => {
    switch (classification) {
      case 'UNCLASSIFIED': return 'UNCLASSIFIED - Information that can be released to the public';
      case 'CONFIDENTIAL': return 'CONFIDENTIAL - Information that could damage national security if disclosed';
      case 'SECRET': return 'SECRET - Information that could cause serious damage to national security';
      case 'TOP_SECRET': return 'TOP SECRET - Information that could cause exceptionally grave damage to national security';
      default: return 'Classification level unknown';
    }
  };

  const getReliabilityTooltip = (reliability: number) => {
    const grade = reliability >= 9 ? 'A' : 
                  reliability >= 8 ? 'B' : 
                  reliability >= 7 ? 'C' : 
                  reliability >= 6 ? 'D' : 
                  reliability >= 3 ? 'E' : 'F';
    const description = reliability >= 9 ? 'Completely reliable' :
                       reliability >= 8 ? 'Usually reliable' :
                       reliability >= 7 ? 'Fairly reliable' :
                       reliability >= 6 ? 'Not usually reliable' :
                       reliability >= 3 ? 'Unreliable' : 'Cannot be judged';
    return `Grade ${grade} - ${description} (${reliability}/10)`;
  };

  const getCategoryTooltip = (category: string) => {
    const categoryData = INTELLIGENCE_CATEGORIES[category as keyof typeof INTELLIGENCE_CATEGORIES];
    return categoryData ? `${categoryData.name} - ${categoryData.description || 'Intelligence category'}` : 'Unknown category';
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

  const handleAddSource = () => {
    setShowSourceManager(true);
  };

  const handleSourceAdded = async () => {
    try {
      const lists = await FeedService.getFeedLists();
      setFeedLists(lists);
    } catch (err) {
      console.error('Failed to refresh feed lists:', err);
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
                <option value="category">CATEGORY</option>
                <option value="reliability">RELIABILITY</option>
                <option value="priority">PRIORITY</option>
              </select>
            </div>
            {showClassificationLevels && (
              <div className="category-controls">
                <span className="control-label">FILTER:</span>
                <select 
                  value={categoryFilter.length === 1 ? categoryFilter[0] : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCategoryFilter(value ? [value as IntelligenceCategory] : []);
                  }}
                  className="intel-select"
                  title="Filter by Category"
                >
                  <option value="">ALL CATEGORIES</option>
                  {Object.entries(INTELLIGENCE_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
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

        {/* Add Source Button */}
        <div className="add-source-section">
          <button className="add-source-btn" onClick={handleAddSource}>
            <span className="btn-icon">+</span>
            <span className="btn-text">ADD INTELLIGENCE SOURCE</span>
          </button>
        </div>

        {/* Metrics Panel Section */}
        {showMetrics && (
          <div className="intel-metrics-panel">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-info">
                  <div className="metric-value">{tacticalSources.length + feedLists.length}</div>
                  <div className="metric-label">TOTAL SOURCES</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-info">
                  <div className="metric-value">
                    {tacticalSources.filter(s => s.healthStatus === 'operational').length + 
                     feedLists.filter(f => getActivityStatus(f) === 'active').length}
                  </div>
                  <div className="metric-label">OPERATIONAL</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🛡️</div>
                <div className="metric-info">
                  <div className="metric-value">
                    {tacticalSources.filter(s => s.classification !== 'UNCLASSIFIED').length}
                  </div>
                  <div className="metric-label">CLASSIFIED</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⟲</div>
                <div className="metric-info">
                  <div className="metric-value">{autoRefresh ? 'LIVE' : 'STANDBY'}</div>
                  <div className="metric-label">STATUS</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sources List Section */}
        <div className="intel-sources-section">
          {tacticalSources.length === 0 && feedLists.length === 0 ? (
            <div className="intel-empty-state">
              <div className="empty-content">
                <div className="empty-icon">📭</div>
                <div className="empty-title">NO INTELLIGENCE SOURCES</div>
                <div className="empty-description">
                  Configure tactical intelligence feeds to begin monitoring
                </div>
                <button className="empty-action-btn" onClick={handleAddSource}>
                  <span className="btn-icon">+</span>
                  <span className="btn-text">ADD SOURCE</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`intel-sources-list view-mode-${viewMode}`}>
              {/* Tactical Intelligence Sources */}
              {getSortedTacticalSources().map((source, index) => {
                const healthStatus = getHealthStatus(source);
                const healthColor = getHealthColor(healthStatus);
                const reliabilityColor = getReliabilityColor(source.reliability);
                const classificationColor = getClassificationColor(source.classification);
                
                return (
                  <div
                    key={source.id}
                    className={`intel-source-item tactical-source status-${healthStatus}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="source-item-header">
                      <div className="source-info">
                        <div className="source-name">{source.name}</div>
                        <div className="source-meta">
                          <span 
                            className="category-badge" 
                            style={{ 
                              '--category-color': INTELLIGENCE_CATEGORIES[source.category]?.color,
                              borderColor: INTELLIGENCE_CATEGORIES[source.category]?.color
                            } as React.CSSProperties}
                            title={getCategoryTooltip(source.category)}
                          >
                            {source.category}
                          </span>
                          {showClassificationLevels && (
                            <span 
                              className="classification-badge" 
                              style={{ 
                                '--classification-color': classificationColor,
                                borderColor: classificationColor
                              } as React.CSSProperties}
                              title={getClassificationTooltip(source.classification)}
                            >
                              {source.classification}
                            </span>
                          )}
                          <span 
                            className="reliability-badge" 
                            style={{ 
                              '--reliability-color': reliabilityColor,
                              borderColor: reliabilityColor
                            } as React.CSSProperties}
                            title={getReliabilityTooltip(source.reliability)}
                          >
                            {source.reliability >= 9 ? 'A' : 
                             source.reliability >= 8 ? 'B' : 
                             source.reliability >= 7 ? 'C' : 
                             source.reliability >= 6 ? 'D' : 
                             source.reliability >= 3 ? 'E' : 'F'}
                          </span>
                        </div>
                      </div>
                      <div className="source-controls">
                        <span className="source-type">TACTICAL</span>
                      </div>
                    </div>
                    
                    {viewMode !== 'compact' && (
                      <div className="source-details">
                        <div className="status-text">
                          <span 
                            className="status-dot"
                            style={{ backgroundColor: healthColor }}
                            title={`Health: ${healthStatus.toUpperCase()}`}
                          ></span>
                          {healthStatus === 'operational' ? 'OPERATIONAL' : 
                           healthStatus === 'degraded' ? 'DEGRADED' : 
                           healthStatus === 'maintenance' ? 'MAINTENANCE' : 'DOWN'}
                        </div>
                        {viewMode === 'grid' && (
                          <div className="source-stats">
                            <span className="stat-item">
                              <span className="stat-icon">🔄</span>
                              <span className="stat-value">{source.updateFrequency}m</span>
                            </span>
                            <span className="stat-item">
                              <span className="stat-icon">💰</span>
                              <span className="stat-value">{source.cost.toUpperCase()}</span>
                            </span>
                            {source.requiresAuth && (
                              <span className="stat-item">
                                <span className="stat-icon">🔐</span>
                                <span className="stat-value">AUTH</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Legacy Feed Lists */}
              {getSortedFeedLists().map((list, index) => {
                const activityStatus = getActivityStatus(list);
                const activityColor = getActivityColor(activityStatus);
                const adjustedIndex = index + tacticalSources.length;
                
                return (
                  <button
                    key={list.id}
                    onClick={() => handleFeedListSelect(list.id)}
                    className={`intel-source-item legacy-source ${selectedId === list.id ? 'selected' : ''} status-${activityStatus}`}
                    style={{ animationDelay: `${adjustedIndex * 0.05}s` }}
                  >
                    <div className="source-item-header">
                      <div className="source-info">
                        <div className="source-name">{list.name}</div>
                        <div className="source-meta">
                          <span className="feed-count">{(list as any).feedCount || 0} feeds</span>
                          <span className="priority-badge">P{(list as any).priority || 1}</span>
                          <span className="source-type-badge legacy">LEGACY</span>
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
                          <span 
                            className="status-dot"
                            style={{ backgroundColor: activityColor }}
                            title={`Status: ${activityStatus.toUpperCase()}`}
                          ></span>
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
      
      {/* Source Manager Modal */}
      {showSourceManager && (
        <SourceManager
          onClose={() => setShowSourceManager(false)}
          onSourceAdded={handleSourceAdded}
        />
      )}
    </div>
  );
};

export default IntelSources;
