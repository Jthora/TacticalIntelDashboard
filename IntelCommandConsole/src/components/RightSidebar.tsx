import React, { useState, useEffect } from 'react';
import FeedService from '../features/feeds/services/FeedService';
import { Feed } from '../models/Feed';
import SystemPerformance from './SystemPerformance';

const RightSidebar: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
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

      {/* System Performance Module - Real Data */}
      <SystemPerformance />

      {/* Enhanced Tactical Filters Module */}
      <div className="tactical-module module-filters">
        <div className="tactical-header-enhanced">
          <div className="header-primary">
            <span className="module-icon">🎛</span>
            <h3>TACTICAL FILTERS</h3>
          </div>
          <div className="header-status">
            <span className={`status-dot ${activeFilters.size > 0 ? 'active' : 'idle'}`}></span>
            <span className="status-text">{activeFilters.size > 0 ? 'FILTERING' : 'STANDBY'}</span>
          </div>
        </div>
        <div className="tactical-content">
          {/* Filter Control Panel */}
          <div className="filter-controls-section">
            <div className="filter-quick-actions">
              <button 
                className="filter-action-btn clear"
                onClick={() => setActiveFilters(new Set())}
                title="Clear All Filters"
              >
                <span className="btn-icon">✕</span>
                <span className="btn-text">CLEAR ALL</span>
              </button>
              <button 
                className="filter-action-btn preset"
                onClick={() => setActiveFilters(new Set(filterPresets))}
                title="Load Preset Filters"
              >
                <span className="btn-icon">⚡</span>
                <span className="btn-text">PRESET</span>
              </button>
              <button 
                className="filter-action-btn save"
                title="Save Current Configuration"
              >
                <span className="btn-icon">💾</span>
                <span className="btn-text">SAVE</span>
              </button>
            </div>
          </div>

          {/* Filter Categories Matrix */}
          <div className="filter-categories-section">
            <div className="filter-category-card">
              <div className="category-header">
                <span className="category-icon">🚨</span>
                <span className="category-title">PRIORITY LEVELS</span>
              </div>
              <div className="filter-grid">
                {[
                  { key: 'CRITICAL', label: 'CRITICAL', color: '#ff0040' },
                  { key: 'HIGH', label: 'HIGH', color: '#ff9500' },
                  { key: 'MEDIUM', label: 'MEDIUM', color: '#ffd700' },
                  { key: 'LOW', label: 'LOW', color: '#00ff41' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`filter-tag ${activeFilters.has(filter.key) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter.key)}
                    style={{ '--filter-color': filter.color } as React.CSSProperties}
                  >
                    <span className="filter-indicator"></span>
                    <span className="filter-label">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-category-card">
              <div className="category-header">
                <span className="category-icon">📡</span>
                <span className="category-title">CONTENT TYPE</span>
              </div>
              <div className="filter-grid">
                {[
                  { key: 'INTEL', label: 'INTELLIGENCE', color: '#00ffaa' },
                  { key: 'NEWS', label: 'NEWS', color: '#0099ff' },
                  { key: 'ALERT', label: 'ALERT', color: '#ff6600' },
                  { key: 'THREAT', label: 'THREAT', color: '#ff0040' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`filter-tag ${activeFilters.has(filter.key) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter.key)}
                    style={{ '--filter-color': filter.color } as React.CSSProperties}
                  >
                    <span className="filter-indicator"></span>
                    <span className="filter-label">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-category-card">
              <div className="category-header">
                <span className="category-icon">🌍</span>
                <span className="category-title">GEOGRAPHIC REGION</span>
              </div>
              <div className="filter-grid">
                {[
                  { key: 'GLOBAL', label: 'GLOBAL', color: '#ffffff' },
                  { key: 'AMERICAS', label: 'AMERICAS', color: '#00ffaa' },
                  { key: 'EUROPE', label: 'EUROPE', color: '#0099ff' },
                  { key: 'ASIA_PACIFIC', label: 'ASIA-PAC', color: '#ff9500' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`filter-tag ${activeFilters.has(filter.key) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter.key)}
                    style={{ '--filter-color': filter.color } as React.CSSProperties}
                  >
                    <span className="filter-indicator"></span>
                    <span className="filter-label">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Range & Advanced Filters */}
          <div className="filter-advanced-section">
            <div className="time-range-panel">
              <div className="panel-header">
                <span className="panel-icon">⏰</span>
                <span className="panel-title">TIME RANGE</span>
              </div>
              <div className="time-range-grid">
                {[
                  { value: '1H', label: '1 HOUR', active: false },
                  { value: '6H', label: '6 HOURS', active: false },
                  { value: '24H', label: '24 HOURS', active: true },
                  { value: '7D', label: '7 DAYS', active: false },
                  { value: '30D', label: '30 DAYS', active: false }
                ].map((range) => (
                  <button
                    key={range.value}
                    className={`time-range-btn ${range.active ? 'active' : ''}`}
                  >
                    <span className="range-value">{range.value}</span>
                    <span className="range-label">{range.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Summary & Actions */}
          <div className="filter-summary-section">
            <div className="active-filters-display">
              <div className="summary-header">
                <span className="summary-icon">🎯</span>
                <span className="summary-title">ACTIVE FILTERS</span>
                <span className="filter-count">{activeFilters.size}</span>
              </div>
              {activeFilters.size > 0 ? (
                <div className="active-filters-list">
                  {Array.from(activeFilters).map(filter => (
                    <span key={filter} className="active-filter-tag">
                      {filter}
                      <button 
                        className="remove-filter-btn"
                        onClick={() => toggleFilter(filter)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="no-filters-message">
                  No filters active - showing all content
                </div>
              )}
            </div>
            
            <div className="filter-execution-panel">
              <button className="apply-filters-btn">
                <span className="btn-icon">▶</span>
                <span className="btn-text">APPLY FILTERS</span>
              </button>
              <button className="save-preset-btn">
                <span className="btn-icon">📌</span>
                <span className="btn-text">SAVE PRESET</span>
              </button>
            </div>
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