import './TacticalFilters.css';

import React, { useMemo, useState } from 'react';

import { useFilters, useTimeRangePresets } from '../contexts/FilterContext';
import { useStatusMessages } from '../contexts/StatusMessageContext';
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

type FilterPresetDefinition = {
  id: string;
  label: string;
  description: string;
  filters: string[];
  timeRangeLabel?: string;
  isCustom?: boolean;
};

const PRESET_STORAGE_KEY = 'tactical-filter-presets-v1';

const BUILT_IN_PRESETS: FilterPresetDefinition[] = [
  {
    id: 'critical-watch',
    label: 'Critical Watch',
    description: 'CRITICAL · ALERT · 1H',
    filters: ['CRITICAL', 'ALERT'],
    timeRangeLabel: '1H'
  },
  {
    id: 'intel-scan',
    label: 'Intel Scan',
    description: 'INTEL · NEWS · 6H',
    filters: ['INTEL', 'NEWS'],
    timeRangeLabel: '6H'
  },
  {
    id: 'regional-sweep',
    label: 'Regional Sweep',
    description: 'AMERICAS · EUROPE · 24H',
    filters: ['AMERICAS', 'EUROPE'],
    timeRangeLabel: '24H'
  }
];

const readCustomPresets = (): FilterPresetDefinition[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse custom filter presets', error);
  }
  return [];
};

const persistCustomPresets = (presets: FilterPresetDefinition[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn('Failed to persist custom filter presets', error);
  }
};

const TAG_DISPLAY_LIMIT = 18;

const TacticalFilters: React.FC<TacticalFiltersProps> = ({
  onFiltersChange,
  onApplyFilters,
  onSavePreset,
  onTimeRangeChange,
  filterPresets = [],
}) => {
  const { 
    filterState, 
    addFilter, 
    removeFilter, 
    updateFilters,
    updateTimeRange,
    isFilterActive, 
    hasActiveFilters,
    availableTagCounts
  } = useFilters();

  const { applyPreset: applyTimeRangePreset, applyCustomRange } = useTimeRangePresets();
  const { pushMessage } = useStatusMessages();

  const [customPresets, setCustomPresets] = useState<FilterPresetDefinition[]>(() => readCustomPresets());

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

  const derivedBuiltInPresets = useMemo(() => {
    if (filterPresets.length === 0) {
      return BUILT_IN_PRESETS;
    }
    const legacyPreset: FilterPresetDefinition = {
      id: 'legacy-preset',
      label: 'Legacy Stack',
      description: `${filterPresets.join(' · ')}`,
      filters: filterPresets
    };
    return [...BUILT_IN_PRESETS, legacyPreset];
  }, [filterPresets]);

  const presetLibrary = useMemo(
    () => [...derivedBuiltInPresets, ...customPresets],
    [derivedBuiltInPresets, customPresets]
  );

  const operationalTags = useMemo(() => {
    const entries = Object.entries(availableTagCounts || {});
    return entries
      .filter(([key, count]) => Boolean(key) && typeof count === 'number' && count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TAG_DISPLAY_LIMIT);
  }, [availableTagCounts]);

  const activePresetId = useMemo(() => {
    return (
      presetLibrary.find(preset => {
        if (preset.filters.length !== filterState.activeFilters.size) {
          return false;
        }
        const filtersMatch = preset.filters.every(filter => filterState.activeFilters.has(filter));
        if (!filtersMatch) {
          return false;
        }
        const presetRange = preset.timeRangeLabel ?? 'ALL';
        const activeRange = filterState.timeRange?.label ?? 'ALL';
        return presetRange === activeRange;
      })?.id ?? null
    );
  }, [presetLibrary, filterState]);

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
  applyTimeRangePreset(rangeKey);
    
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

  const applyFilterPreset = (preset: FilterPresetDefinition) => {
    const nextFilters = new Set(preset.filters);
    updateFilters(nextFilters);

    if (preset.timeRangeLabel) {
      applyTimeRangePreset(preset.timeRangeLabel);
    } else if (filterState.timeRange) {
      updateTimeRange(null);
    }

    pushMessage(`Preset “${preset.label}” deployed`, 'success', {
      priority: 'medium',
      source: 'TacticalFilters'
    });

    onFiltersChange?.(new Set(nextFilters));
    onApplyFilters?.(new Set(nextFilters));
  };

  const handleSavePreset = () => {
    if (filterState.activeFilters.size === 0) {
      pushMessage('Activate at least one filter before saving', 'warning', {
        priority: 'medium',
        source: 'TacticalFilters'
      });
      return;
    }

    const name = window.prompt('Name this filter preset:', 'Custom Mission');
    const trimmed = name?.trim();
    if (!trimmed) {
      return;
    }

    const newPreset: FilterPresetDefinition = {
      id: `custom-${Date.now()}`,
      label: trimmed,
      description: `${filterState.activeFilters.size} filters${filterState.timeRange ? ` · ${filterState.timeRange.label}` : ''}`,
      filters: Array.from(filterState.activeFilters),
      ...(filterState.timeRange?.label ? { timeRangeLabel: filterState.timeRange.label } : {}),
      isCustom: true
    };

    setCustomPresets(prev => {
      const next = [...prev, newPreset];
      persistCustomPresets(next);
      return next;
    });

    pushMessage(`Preset “${trimmed}” saved`, 'success', {
      priority: 'medium',
      source: 'TacticalFilters'
    });

    onSavePreset?.(filterState.activeFilters);
  };

  const handleRemovePreset = (presetId: string) => {
    setCustomPresets(prev => {
      const next = prev.filter(preset => preset.id !== presetId);
      persistCustomPresets(next);
      return next;
    });
    pushMessage('Preset removed', 'info', {
      priority: 'low',
      source: 'TacticalFilters'
    });
  };

  const handleClearCustomPresets = () => {
    if (customPresets.length === 0) {
      return;
    }
    const confirmed = window.confirm('Remove all custom presets?');
    if (!confirmed) {
      return;
    }
    setCustomPresets([]);
    persistCustomPresets([]);
    pushMessage('Custom presets cleared', 'info', {
      priority: 'low',
      source: 'TacticalFilters'
    });
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
        {/* Filter Status & Active Summary */}
        <div className="filter-summary-section compact">
          <div className="active-filters-display">
            <div className="summary-header">
              <div className="summary-heading">
                <span className="summary-icon">🎯</span>
                <span className="summary-title">ACTIVE FILTERS</span>
              </div>
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

          <div className="filter-category-card operational-tags-card">
            <div className="category-header">
              <span className="category-icon">🏷️</span>
              <span className="category-title">OPERATIONAL TAGS</span>
            </div>
            {operationalTags.length > 0 ? (
              <div className="tag-chip-grid">
                {operationalTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    className={`filter-tag tag-chip ${isFilterActive(tag) ? 'active' : ''}`}
                    onClick={() => toggleFilter(tag)}
                  >
                    <span className="filter-indicator"></span>
                    <span className="filter-label">{tag}</span>
                    <span className="tag-count">{count}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-tags-message">Tags will appear as new intel arrives.</div>
            )}
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
        
        {/* Mission Presets Footer */}
        <div className="filter-controls-section preset-library-section">
          <div className="control-block preset-block">
            <div className="block-header">
              <span className="block-title">MISSION PRESETS</span>
              <span className="block-subtitle">Deploy curated default + custom stacks</span>
            </div>
            <div className="preset-chip-row">
              {presetLibrary.map(preset => {
                const isActive = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`preset-chip ${isActive ? 'active' : ''} ${preset.isCustom ? 'custom' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => applyFilterPreset(preset)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        applyFilterPreset(preset);
                      }
                    }}
                  >
                    <div className="chip-body">
                      <span className="chip-label">{preset.label}</span>
                      <span className="chip-description">{preset.description}</span>
                    </div>
                    {preset.isCustom && (
                      <button
                        type="button"
                        className="preset-chip-delete"
                        aria-label={`Remove preset ${preset.label}`}
                        onClick={event => {
                          event.stopPropagation();
                          handleRemovePreset(preset.id);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="filter-execution-panel">
              <button className="save-preset-btn" onClick={handleSavePreset}>
                <span className="btn-icon">📌</span>
                <span className="btn-text">SAVE CUSTOM PRESET</span>
              </button>
              <button 
                className="ghost-button"
                onClick={handleClearCustomPresets}
                disabled={customPresets.length === 0}
              >
                <span className="btn-icon">🧹</span>
                <span className="btn-text">CLEAR CUSTOM PRESETS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalFilters;
