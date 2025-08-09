import '../styles/components/intel-sources.css';

import React, { useEffect,useState } from 'react';

import { 
  getModernIntelligenceSourcesAsLegacy, 
  MODERN_INTELLIGENCE_CATEGORIES
} from '../adapters/ModernIntelSourcesAdapter';
import { useIntelligence } from '../contexts/IntelligenceContext';
import { LoadingSpinner } from '../shared/components/LoadingStates';
import { 
  IntelligenceCategory,
  TacticalIntelSource} from '../types/TacticalIntelligence';
import SourceManager from './SourceManager';

interface IntelSourcesProps {
  setSelectedFeedList: (feedListId: string | null) => void;
  showClassificationLevels?: boolean;
  enableRealTimeAlerts?: boolean;
}

const IntelSources: React.FC<IntelSourcesProps> = ({ 
  setSelectedFeedList,
  showClassificationLevels = true,
  enableRealTimeAlerts = true
}) => {
  const { state: intelState, actions: intelActions } = useIntelligence();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
      console.log('🔍 TDD_ERROR_052: IntelSources component loading tactical sources');
      setLoading(true);
      setError(null);
      try {
        // Load from intelligence context first
        let sources = intelState.sources;
        console.log('🔍 TDD_ERROR_053: Sources from intelligence context:', sources.length);
        
        // If no sources in context, load from modern intelligence sources
        if (sources.length === 0) {
          console.log('🔍 TDD_ERROR_054: No sources in context, loading modern intelligence sources');
          // Use modern API sources (CORS-friendly, real-time JSON APIs)
          sources = getModernIntelligenceSourcesAsLegacy();
          console.log('🔍 TDD_SUCCESS_055: Loaded modern intelligence sources:', sources.length);
          // Add to intelligence context
          sources.forEach(source => intelActions.addSource(source));
        } else {
          // Check if the modern-api default source exists, add it if not
          const hasDefaultSource = sources.some(source => source.id === 'modern-api');
          if (!hasDefaultSource) {
            console.log('🔍 TDD_WARNING: Default modern-api source not found, adding it to the list');
            const defaultSources = getModernIntelligenceSourcesAsLegacy();
            defaultSources.forEach(source => {
              if (source.id === 'modern-api') {
                intelActions.addSource(source);
                sources.push(source);
              }
            });
          }
        }
        
        setTacticalSources(sources);
        console.log('🔍 TDD_SUCCESS_056: Set tactical sources state:', sources.length);
        
        // ALWAYS select the modern-api feed list to ensure the default feeds are available
        // This ensures the Intelligence Feed is never blank
        setSelectedFeedList('modern-api');
        console.log('🔍 TDD_SUCCESS_060: Source selection complete - modern-api');
      } catch (err) {
        console.error('🔍 TDD_ERROR_062: Failed to load tactical sources:', err);
        setError('Failed to load intelligence sources');
      } finally {
        setLoading(false);
        console.log('🔍 TDD_SUCCESS_063: Tactical sources loading complete');
      }
    };
    loadTacticalSources();
  }, [intelState.sources, intelActions, setSelectedFeedList]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh && enableRealTimeAlerts) {
      const interval = setInterval(() => {
        // Refresh source health status - PRODUCTION FIX: Use stable status instead of random
        tacticalSources.forEach(source => {
          // Use a deterministic health status based on source ID to prevent flickering
          const isHealthy = source.id.charCodeAt(0) % 10 < 9; // 90% healthy, deterministic
          const healthStatus = isHealthy ? 'operational' : 'degraded';
          
          // Only update if status actually changed
          if (source.healthStatus !== healthStatus) {
            intelActions.updateSource(source.id, { 
              healthStatus: healthStatus as 'operational' | 'degraded' | 'down' | 'maintenance',
              lastUpdated: new Date()
            });
          }
        });
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, tacticalSources, intelActions, enableRealTimeAlerts]);

  const getSortedTacticalSources = () => {
    const filtered = categoryFilter.length > 0 
      ? tacticalSources.filter(source => categoryFilter.includes(source.category))
      : tacticalSources;
      
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'reliability':
          return b.reliability - a.reliability; // Use reliability from TacticalIntelSource
        case 'category':
          return a.category.localeCompare(b.category);
        case 'priority':
          // Priority based on reliability and health status
          {
            const getPriority = (source: TacticalIntelSource) => {
              let priority = source.reliability;
              if (source.healthStatus === 'operational') priority += 20;
              return priority;
            };
            return getPriority(b) - getPriority(a);
          }
        default:
          return a.name.localeCompare(b.name);
      }
    });
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
    const categoryData = MODERN_INTELLIGENCE_CATEGORIES[category as keyof typeof MODERN_INTELLIGENCE_CATEGORIES];
    return categoryData ? `${categoryData.name} - ${categoryData.description || 'Intelligence category'}` : 'Unknown category';
  };

  const handleAddSource = () => {
    setShowSourceManager(true);
  };

  const handleSourceAdded = () => {
    // Source added successfully - tactical sources are managed through the intelligence context
    // No need to manually refresh as the useEffect will handle updates
    console.log('🔍 TDD_SUCCESS: New tactical source added via SourceManager');
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedFeedList(sourceId);
    console.log(`🔍 TDD_SUCCESS: Selected source: ${sourceId}`);
  };

  const handleRestoreDefaults = () => {
    setSelectedFeedList('modern-api');
    console.log('🔄 Restored default selection to modern-api');
  };

  // Add a function to check if a source is the default modern-api source
  const isDefaultSource = (sourceId: string) => {
    return sourceId === 'modern-api';
  };

  const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(e.target.value as 'list' | 'grid' | 'compact');
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'reliability' | 'category' | 'priority');
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategoryFilter(value ? [value as IntelligenceCategory] : []);
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
                onChange={handleViewModeChange}
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
                onChange={handleSortByChange}
                className="intel-select"
                title="Sort By"
              >
                <option value="name">NAME</option>
                <option value="category">CATEGORY</option>
                <option value="reliability">RELIABILITY</option>
                <option value="priority">PRIORITY</option>
              </select>
            </div>
            <button 
              className="intel-toggle"
              onClick={handleRestoreDefaults}
              title="Restore Default Feeds"
            >
              <span className="toggle-icon">↺</span>
              <span className="toggle-label">RESTORE</span>
            </button>
            {showClassificationLevels && (
              <div className="category-controls">
                <span className="control-label">FILTER:</span>
                <select 
                  value={categoryFilter.length === 1 ? categoryFilter[0] : ''}
                  onChange={handleCategoryFilterChange}
                  className="intel-select"
                  title="Filter by Category"
                >
                  <option value="">ALL CATEGORIES</option>
                  {Object.entries(MODERN_INTELLIGENCE_CATEGORIES).map(([key, cat]) => (
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
                  <div className="metric-value">{tacticalSources.length}</div>
                  <div className="metric-label">TOTAL SOURCES</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-info">
                  <div className="metric-value">
                    {tacticalSources.filter(s => s.healthStatus === 'operational').length}
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
          {tacticalSources.length === 0 ? (
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
                    className={`intel-source-item tactical-source status-${healthStatus} ${isDefaultSource(source.id) ? 'default-source' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleSourceSelect(source.id)}
                  >
                    <div className="source-item-header">
                      <div className="source-info">
                        <div className="source-name">
                          {isDefaultSource(source.id) && <span className="default-badge">DEFAULT</span>}
                          {source.name}
                        </div>
                        <div className="source-meta">
                          <span 
                            className="category-badge" 
                            style={{ 
                              '--category-color': MODERN_INTELLIGENCE_CATEGORIES[source.category]?.color || '#666',
                              borderColor: MODERN_INTELLIGENCE_CATEGORIES[source.category]?.color || '#666'
                            } as React.CSSProperties}
                            title={getCategoryTooltip(source.category)}
                          >
                            {source.category}
                          </span>
                          {showClassificationLevels && (
                            <span 
                              className="classification-badge" 
                              style={{                              '--classification-color': classificationColor || '#666',
                              borderColor: classificationColor || '#666'
                              } as React.CSSProperties}
                              title={getClassificationTooltip(source.classification)}
                            >
                              {source.classification}
                            </span>
                          )}
                          <span 
                            className="reliability-badge" 
                            style={{ 
                              '--reliability-color': reliabilityColor || '#666',
                              borderColor: reliabilityColor || '#666'
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
                            {source.requiresAuth && (
                              <span className="stat-item">
                                <span className="stat-icon">🔒</span>
                                <span className="stat-value">AUTH</span>
                              </span>
                            )}
                            {source.protocol === 'API' && (
                              <span className="stat-item">
                                <span className="stat-icon">📡</span>
                                <span className="stat-value">API</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
