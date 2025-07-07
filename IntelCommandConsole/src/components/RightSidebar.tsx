import React, { useState, useEffect } from 'react';
import FeedService from '../features/feeds/services/FeedService';
import { Feed } from '../models/Feed';

const RightSidebar: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'turbo' | 'eco'>('normal');
  const [healthAlerts, setHealthAlerts] = useState<boolean>(true);
  const [autoExport, setAutoExport] = useState<boolean>(false);
  const [filterPresets] = useState<string[]>(['CRITICAL', 'INTEL', 'THREAT']);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [systemTheme, setSystemTheme] = useState<'dark' | 'night' | 'combat'>('dark');
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const feedData = await FeedService.getFeeds();
        setFeeds(feedData);
      } catch (error) {
        console.error('Failed to load feeds for export:', error);
      }
    };
    loadFeeds();
  }, []);

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const getPerformanceModeColor = () => {
    switch (performanceMode) {
      case 'turbo': return '#ff9500';
      case 'eco': return '#00ff41';
      default: return '#00d4ff';
    }
  };

  const getSystemMetrics = () => {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 100),
      uptime: '2h 34m',
      threats: Math.floor(Math.random() * 5),
      alerts: Math.floor(Math.random() * 10)
    };
  };

  const metrics = getSystemMetrics();

  return (
    <div className="tactical-sidebar-container animate-slide-in-right">
      {/* System Control Module */}
      <div className="tactical-module module-system-control">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">⚙</span>
            <h3>SYSTEM CONTROL</h3>
          </div>
          <div className="header-controls-micro">
            <select 
              value={systemTheme} 
              onChange={(e) => setSystemTheme(e.target.value as any)}
              className="micro-select"
              title="Theme"
            >
              <option value="dark">DARK</option>
              <option value="night">NIGHT</option>
              <option value="combat">COMBAT</option>
            </select>
            <button 
              className={`micro-btn ${compactMode ? 'active' : ''}`}
              onClick={() => setCompactMode(!compactMode)}
              title="Compact Mode"
            >
              ▣
            </button>
            <button 
              className={`micro-btn ${realTimeUpdates ? 'active' : ''}`}
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              title="Real-time Updates"
            >
              ⟲
            </button>
          </div>
        </div>
        <div className="tactical-content">
          <div className="system-controls-grid">
            <div className="control-group">
              <label className="control-label">PERFORMANCE</label>
              <select 
                value={performanceMode} 
                onChange={(e) => setPerformanceMode(e.target.value as any)}
                className="control-select"
                style={{ borderColor: getPerformanceModeColor() }}
              >
                <option value="eco">ECO</option>
                <option value="normal">NORMAL</option>
                <option value="turbo">TURBO</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label">ALERTS</label>
              <button 
                className={`control-toggle ${healthAlerts ? 'active' : ''}`}
                onClick={() => setHealthAlerts(!healthAlerts)}
              >
                {healthAlerts ? '◉' : '○'}
              </button>
            </div>
            <div className="control-group">
              <label className="control-label">AUTO-EXPORT</label>
              <button 
                className={`control-toggle ${autoExport ? 'active' : ''}`}
                onClick={() => setAutoExport(!autoExport)}
              >
                {autoExport ? '◉' : '○'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Monitor Module */}
      <div className="tactical-module module-performance">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">⚡</span>
            <h3>PERFORMANCE</h3>
          </div>
          <div className="header-status">
            <span 
              className="status-dot"
              style={{ background: getPerformanceModeColor() }}
            ></span>
            <span className="status-text">{performanceMode.toUpperCase()}</span>
          </div>
        </div>
        <div className="tactical-content">
          <div className="performance-grid-micro">
            <div className="metric-card-micro">
              <div className="metric-header">
                <span className="metric-icon">🖥</span>
                <span className="metric-name">CPU</span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ 
                    width: `${metrics.cpu}%`,
                    background: metrics.cpu > 80 ? '#ff0040' : metrics.cpu > 60 ? '#ff9500' : '#00ff41'
                  }}
                ></div>
              </div>
              <span className="metric-value">{metrics.cpu}%</span>
            </div>
            
            <div className="metric-card-micro">
              <div className="metric-header">
                <span className="metric-icon">💾</span>
                <span className="metric-name">RAM</span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ 
                    width: `${metrics.memory}%`,
                    background: metrics.memory > 80 ? '#ff0040' : metrics.memory > 60 ? '#ff9500' : '#00ff41'
                  }}
                ></div>
              </div>
              <span className="metric-value">{metrics.memory}%</span>
            </div>
            
            <div className="metric-card-micro">
              <div className="metric-header">
                <span className="metric-icon">📡</span>
                <span className="metric-name">NET</span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill" 
                  style={{ 
                    width: `${metrics.network}%`,
                    background: '#00d4ff'
                  }}
                ></div>
              </div>
              <span className="metric-value">{metrics.network}%</span>
            </div>
          </div>
          
          <div className="system-status-micro">
            <div className="status-item">
              <span className="status-label">UPTIME</span>
              <span className="status-value">{metrics.uptime}</span>
            </div>
            <div className="status-item">
              <span className="status-label">THREATS</span>
              <span className="status-value threat-count">{metrics.threats}</span>
            </div>
            <div className="status-item">
              <span className="status-label">ALERTS</span>
              <span className="status-value alert-count">{metrics.alerts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Filters Module */}
      <div className="tactical-module module-filters">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">🎛</span>
            <h3>FILTERS</h3>
          </div>
          <div className="header-controls-micro">
            <button 
              className="micro-btn"
              onClick={() => setActiveFilters(new Set())}
              title="Clear All"
            >
              ✕
            </button>
            <button 
              className="micro-btn"
              onClick={() => setActiveFilters(new Set(filterPresets))}
              title="Preset"
            >
              ⚡
            </button>
            <button 
              className="micro-btn"
              title="Save Preset"
            >
              💾
            </button>
          </div>
        </div>
        <div className="tactical-content">
          <div className="filter-matrix">
            <div className="filter-category">
              <div className="category-header">PRIORITY</div>
              <div className="filter-buttons-micro">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(filter => (
                  <button
                    key={filter}
                    className={`filter-btn-micro ${activeFilters.has(filter) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter)}
                  >
                    {filter.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-category">
              <div className="category-header">TYPE</div>
              <div className="filter-buttons-micro">
                {['INTEL', 'NEWS', 'ALERT', 'THREAT'].map(filter => (
                  <button
                    key={filter}
                    className={`filter-btn-micro ${activeFilters.has(filter) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter)}
                  >
                    {filter.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-category">
              <div className="category-header">REGION</div>
              <div className="filter-buttons-micro">
                {['GLOBAL', 'US', 'EU', 'ASIA'].map(filter => (
                  <button
                    key={filter}
                    className={`filter-btn-micro ${activeFilters.has(filter) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter)}
                  >
                    {filter.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="filter-quick-actions">
            <select className="time-range-select">
              <option>1H</option>
              <option>6H</option>
              <option>24H</option>
              <option>7D</option>
              <option>30D</option>
            </select>
            <button className="action-btn-micro" title="Apply Filters">
              ▶
            </button>
            <button className="action-btn-micro" title="Save Search">
              📌
            </button>
          </div>
        </div>
      </div>

      {/* Data Export Module */}
      <div className="tactical-module module-export">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">📦</span>
            <h3>EXPORT</h3>
          </div>
          <div className="header-controls-micro">
            <button 
              className={`micro-btn ${autoExport ? 'active' : ''}`}
              onClick={() => setAutoExport(!autoExport)}
              title="Auto Export"
            >
              ⏰
            </button>
            <button className="micro-btn" title="Export Settings">
              ⚙
            </button>
          </div>
        </div>
        <div className="tactical-content">
          <div className="export-quick-grid">
            <button className="export-btn-micro json">JSON</button>
            <button className="export-btn-micro csv">CSV</button>
            <button className="export-btn-micro xml">XML</button>
            <button className="export-btn-micro pdf">PDF</button>
          </div>
          
          <div className="export-options-micro">
            <div className="option-row">
              <span className="option-label">INCLUDE METADATA</span>
              <button className="option-toggle active">◉</button>
            </div>
            <div className="option-row">
              <span className="option-label">COMPRESS</span>
              <button className="option-toggle">○</button>
            </div>
            <div className="option-row">
              <span className="option-label">ENCRYPT</span>
              <button className="option-toggle active">◉</button>
            </div>
          </div>
          
          <button className="export-execute-btn">
            ↓ EXECUTE EXPORT
          </button>
        </div>
      </div>

      {/* System Health Module */}
      <div className="tactical-module module-health">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">💚</span>
            <h3>HEALTH</h3>
          </div>
          <div className="header-status">
            <span className="status-dot" style={{ background: '#00ff41' }}></span>
            <span className="status-text">OPTIMAL</span>
          </div>
        </div>
        <div className="tactical-content">
          <div className="health-indicators-micro">
            <div className="health-item">
              <span className="health-icon">🔗</span>
              <span className="health-label">CONNECTIONS</span>
              <span className="health-status online">ONLINE</span>
            </div>
            <div className="health-item">
              <span className="health-icon">🛡</span>
              <span className="health-label">SECURITY</span>
              <span className="health-status secure">SECURE</span>
            </div>
            <div className="health-item">
              <span className="health-icon">📊</span>
              <span className="health-label">FEEDS</span>
              <span className="health-status active">{feeds.length} ACTIVE</span>
            </div>
          </div>
          
          <div className="diagnostic-actions">
            <button className="diagnostic-btn">🔍 SCAN</button>
            <button className="diagnostic-btn">🧹 CLEAN</button>
            <button className="diagnostic-btn">🔧 REPAIR</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;