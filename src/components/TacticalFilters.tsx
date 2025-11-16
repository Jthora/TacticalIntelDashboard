import './TacticalFilters.css';

import React, { useState } from 'react';

import { useFilters, useTimeRangePresets } from '../contexts/FilterContext';
import { TimeRange } from '../services/FilterService';

interface TacticalFiltersProps {
  // Optional props for backwards compatibility
  onFiltersChange?: (activeFilters: Set<string>) => void;
  onApplyFilters?: (activeFilters: Set<string>) => void;
  onSavePreset?: (activeFilters: Set<string>) => void;
  onTimeRangeChange?: (range: TimeRange) => void;
  initialFilters?: string[];
  filterPresets?: string[];
}

const TacticalFilters: React.FC<TacticalFiltersProps> = ({
  onFiltersChange,
  onApplyFilters,
  onSavePreset,
  onTimeRangeChange,
  filterPresets = ['CRITICAL', 'INTEL', 'THREAT'],
}) => {
  const { 
    filterState, 
    addFilter, 
    removeFilter, 
    isFilterActive, 
    clearAllFilters, 
    hasActiveFilters
  } = useFilters();

  const { applyPreset, applyCustomRange } = useTimeRangePresets();

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Time range presets
  const timeRanges = [
    { key: '1H', label: '1H', hours: 1 },
    { key: '6H', label: '6H', hours: 6 },
    { key: '24H', label: '24H', hours: 24 },
    { key: '7D', label: '7D', hours: 168 },
    { key: '30D', label: '30D', hours: 720 },
    { key: 'CUSTOM', label: 'CUSTOM', hours: 0 }
  ];

  const toggleFilter = (filter: string) => {
    if (isFilterActive(filter)) {
      removeFilter(filter);
    } else {
      addFilter(filter);
    }
    
    // Call legacy callback for backwards compatibility
    onFiltersChange?.(filterState.activeFilters);
  };

  const selectTimeRange = (rangeKey: string) => {
    if (rangeKey === 'CUSTOM') {
      setShowCustomRange(true);
      return;
    }
    
    setShowCustomRange(false);
    applyPreset(rangeKey);
    
    // Call legacy callback for backwards compatibility
    if (onTimeRangeChange) {
      const range = { 
        start: new Date(Date.now() - (timeRanges.find(r => r.key === rangeKey)?.hours || 24) * 60 * 60 * 1000),
        end: new Date(),
        label: rangeKey
      };
      onTimeRangeChange(range);
    }
  };

  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      applyCustomRange(start, end, 'CUSTOM');
      setShowCustomRange(false);
      
      // Call legacy callback for backwards compatibility
      onTimeRangeChange?.({ start, end, label: 'CUSTOM' });
    }
  };

  const loadPresetFilters = () => {
    clearAllFilters();
    filterPresets.forEach(preset => addFilter(preset));
  };

  const handleApplyFilters = () => {
    onApplyFilters?.(filterState.activeFilters);
  };

  const handleSavePreset = () => {
    onSavePreset?.(filterState.activeFilters);
  };

  const getCurrentTimeRangeLabel = () => {
    if (!filterState.timeRange) return 'ALL';
    return filterState.timeRange.label;
  };

  return (
    <div className="tactical-module module-filters">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">🎛</span>
          <h3>TACTICAL FILTERS</h3>
        </div>
        <div className="header-status">
          <span className={`status-dot ${hasActiveFilters ? 'active' : 'idle'}`}></span>
          <span className="status-text">{hasActiveFilters ? 'FILTERING' : 'STANDBY'}</span>
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
                { key: 'CRITICAL', label: 'CRITICAL', color: 'var(--accent-red)' },
                { key: 'HIGH', label: 'HIGH', color: 'var(--accent-orange)' },
                { key: 'MEDIUM', label: 'MEDIUM', color: 'var(--accent-yellow)' },
                { key: 'LOW', label: 'LOW', color: 'var(--accent-green)' }
              ].map(filter => (
                <button
                  key={filter.key}
                  className={`filter-tag ${isFilterActive(filter.key) ? 'active' : ''}`}
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
                { key: 'INTEL', label: 'INTELLIGENCE', color: 'var(--accent-cyan)' },
                { key: 'NEWS', label: 'NEWS', color: 'var(--accent-blue)' },
                { key: 'ALERT', label: 'ALERT', color: 'var(--accent-orange)' },
                { key: 'THREAT', label: 'THREAT', color: 'var(--accent-red)' }
              ].map(filter => (
                <button
                  key={filter.key}
                  className={`filter-tag ${isFilterActive(filter.key) ? 'active' : ''}`}
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
                { key: 'AMERICAS', label: 'AMERICAS', color: 'var(--accent-cyan)' },
                { key: 'EUROPE', label: 'EUROPE', color: 'var(--accent-blue)' },
                { key: 'ASIA_PACIFIC', label: 'ASIA-PAC', color: 'var(--accent-orange)' }
              ].map(filter => (
                <button
                  key={filter.key}
                  className={`filter-tag ${isFilterActive(filter.key) ? 'active' : ''}`}
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
              <span className="active-range-indicator">{getCurrentTimeRangeLabel()}</span>
            </div>
            <div className="time-range-grid">
              {timeRanges.map(range => (
                <button
                  key={range.key}
                  className={`time-range-btn ${getCurrentTimeRangeLabel() === range.key ? 'active' : ''}`}
                  onClick={() => selectTimeRange(range.key)}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {/* Custom Time Range Panel */}
            {showCustomRange && (
              <div className="custom-time-range">
                <div className="custom-range-inputs">
                  <div className="input-group">
                    <label className="input-label">START</label>
                    <input
                      type="datetime-local"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="time-input"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">END</label>
                    <input
                      type="datetime-local"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="time-input"
                    />
                  </div>
                </div>
                <div className="custom-range-actions">
                  <button 
                    className="custom-range-btn apply"
                    onClick={handleApplyCustomRange}
                    disabled={!customStartDate || !customEndDate}
                  >
                    APPLY
                  </button>
                  <button 
                    className="custom-range-btn cancel"
                    onClick={() => setShowCustomRange(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Filter Summary & Actions */}
        <div className="filter-summary-section">
          <div className="active-filters-display">
            <div className="summary-header">
              <span className="summary-icon">🎯</span>
              <span className="summary-title">ACTIVE FILTERS</span>
              <span className="filter-count">{filterState.activeFilters.size}</span>
            </div>
            {filterState.activeFilters.size > 0 ? (
              <div className="active-filters-list">
                {Array.from(filterState.activeFilters).map(filter => (
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
