import React from 'react';

interface IntelSourceControlsProps {
  viewMode: 'list' | 'grid' | 'compact';
  sortBy: 'name' | 'reliability' | 'category' | 'priority';
  categoryValue: string;
  showClassificationLevels: boolean;
  filterActive: boolean;
  autoRefresh: boolean;
  showMetrics: boolean;
  onViewModeChange: React.ChangeEventHandler<HTMLSelectElement>;
  onSortByChange: React.ChangeEventHandler<HTMLSelectElement>;
  onCategoryFilterChange: React.ChangeEventHandler<HTMLSelectElement>;
  onRestoreDefaults: () => void;
  onManualRefresh: () => void;
  onFilterToggle: () => void;
  onAutoRefreshToggle: () => void;
  onMetricsToggle: () => void;
  categoryOptions: Array<{ value: string; label: string }>;
}

interface ControlClusterProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const ControlCluster: React.FC<ControlClusterProps> = ({ label, children, className }) => (
  <div className={`intel-control-cluster ${className ?? ''}`.trim()}>
    <span className="control-label">{label}</span>
    {children}
  </div>
);

const IntelSourceControls: React.FC<IntelSourceControlsProps> = ({
  viewMode,
  sortBy,
  categoryValue,
  showClassificationLevels,
  filterActive,
  autoRefresh,
  showMetrics,
  onViewModeChange,
  onSortByChange,
  onCategoryFilterChange,
  onRestoreDefaults,
  onManualRefresh,
  onFilterToggle,
  onAutoRefreshToggle,
  onMetricsToggle,
  categoryOptions,
}) => {
  return (
    <section className="intel-controls-section">
      <div className="intel-control-grid">
        <ControlCluster label="View Mode">
          <select
            value={viewMode}
            onChange={onViewModeChange}
            className="intel-select"
            title="View Mode"
          >
            <option value="list">LIST</option>
            <option value="grid">GRID</option>
            <option value="compact">COMPACT</option>
          </select>
        </ControlCluster>

        <ControlCluster label="Sort Order">
          <select
            value={sortBy}
            onChange={onSortByChange}
            className="intel-select"
            title="Sort By"
          >
            <option value="name">NAME</option>
            <option value="category">CATEGORY</option>
            <option value="reliability">RELIABILITY</option>
            <option value="priority">PRIORITY</option>
          </select>
        </ControlCluster>

        {showClassificationLevels && (
          <ControlCluster label="Category Filter">
            <select
              value={categoryValue}
              onChange={onCategoryFilterChange}
              className="intel-select"
              title="Filter by Category"
            >
              <option value="">ALL CATEGORIES</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </ControlCluster>
        )}

        <ControlCluster label="Mission Default">
          <button
            className="intel-toggle wide"
            onClick={onRestoreDefaults}
            title="Restore Default Feeds"
            aria-label="Restore default mission source"
            type="button"
          >
            <span className="toggle-icon">↺</span>
            <span className="toggle-label">RESTORE</span>
          </button>
        </ControlCluster>
      </div>

      <div className="intel-control-grid secondary">
        <ControlCluster label="Operational Controls" className="cluster-span">
          <div className="intel-control-actions">
            <button
              className="intel-toggle"
              onClick={onManualRefresh}
              title="Refresh intelligence feeds"
              aria-label="Refresh intelligence feeds"
              type="button"
            >
              <span className="toggle-icon">🔄</span>
              <span className="toggle-label">REFRESH</span>
            </button>
            <button
              className={`intel-toggle ${filterActive ? 'active' : ''}`}
              onClick={onFilterToggle}
              title="Filter Active Only"
              aria-pressed={filterActive}
              aria-label="Toggle active sources filter"
              type="button"
            >
              <span className="toggle-icon">⚡</span>
              <span className="toggle-label">ACTIVE</span>
            </button>
            <button
              className={`intel-toggle ${autoRefresh ? 'active' : ''}`}
              onClick={onAutoRefreshToggle}
              title="Toggle auto-refresh"
              aria-pressed={autoRefresh}
              aria-label="Toggle auto refresh"
              type="button"
            >
              <span className="toggle-icon">⟲</span>
              <span className="toggle-label">AUTO</span>
            </button>
            <button
              className={`intel-toggle ${showMetrics ? 'active' : ''}`}
              onClick={onMetricsToggle}
              title="Show Metrics"
              aria-pressed={showMetrics}
              aria-label="Toggle metrics panel"
              type="button"
            >
              <span className="toggle-icon">📊</span>
              <span className="toggle-label">METRICS</span>
            </button>
          </div>
        </ControlCluster>
      </div>
    </section>
  );
};

export default IntelSourceControls;
