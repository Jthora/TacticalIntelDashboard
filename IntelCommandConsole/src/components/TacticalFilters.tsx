import React, { useState } from 'react';

interface TacticalFiltersProps {
  // Optional props for parent components to control or observe filter state
  onFiltersChange?: (activeFilters: Set<string>) => void;
  onApplyFilters?: (activeFilters: Set<string>) => void;
  onSavePreset?: (activeFilters: Set<string>) => void;
  initialFilters?: string[];
  filterPresets?: string[];
}

const TacticalFilters: React.FC<TacticalFiltersProps> = ({
  onFiltersChange,
  onApplyFilters,
  onSavePreset,
  initialFilters = [],
  filterPresets = ['CRITICAL', 'INTEL', 'THREAT'],
}) => {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(initialFilters));

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = new Set<string>();
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const loadPresetFilters = () => {
    const newFilters = new Set(filterPresets);
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleApplyFilters = () => {
    onApplyFilters?.(activeFilters);
  };

  const handleSavePreset = () => {
    onSavePreset?.(activeFilters);
  };

  return (
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
              onClick={clearAllFilters}
              title="Clear All Filters"
            >
              <span className="btn-icon">✕</span>
              <span className="btn-text">CLEAR ALL</span>
            </button>
            <button 
              className="filter-action-btn preset"
              onClick={loadPresetFilters}
              title="Load Preset Filters"
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-text">PRESET</span>
            </button>
            <button 
              className="filter-action-btn save"
              onClick={handleSavePreset}
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
            <button className="apply-filters-btn" onClick={handleApplyFilters}>
              <span className="btn-icon">▶</span>
              <span className="btn-text">APPLY FILTERS</span>
            </button>
            <button className="save-preset-btn" onClick={handleSavePreset}>
              <span className="btn-icon">📌</span>
              <span className="btn-text">SAVE PRESET</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalFilters;
