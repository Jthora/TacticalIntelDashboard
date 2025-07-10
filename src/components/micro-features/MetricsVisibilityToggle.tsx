import React, { useState, useMemo, useCallback, useEffect } from 'react';

interface IntelligenceSource {
  id: string;
  name: string;
  isOnline?: boolean;
  status?: string;
  lastUpdate?: string;
}

interface SourceMetrics {
  totalSources: number;
  activeSources: number;
  errorSources: number;
  averageUpdateFrequency: number;
  dataFreshness: number;
  healthScore: number;
}

interface MetricsVisibilityToggleProps {
  sources?: IntelligenceSource[];
  onMetricsToggle?: (visible: boolean) => void;
  initialVisible?: boolean;
}

const MetricsVisibilityToggle: React.FC<MetricsVisibilityToggleProps> = ({
  sources = [],
  onMetricsToggle,
  initialVisible = true
}) => {
  const [showMetrics, setShowMetrics] = useState<boolean>(initialVisible);

  // Update state when initialVisible prop changes (for re-renders)
  useEffect(() => {
    setShowMetrics(initialVisible);
  }, [initialVisible]);

  // Calculate metrics only when visible and sources change
  const metrics = useMemo((): SourceMetrics | null => {
    if (!showMetrics) return null;
    
    // Handle malformed data gracefully
    const validSources = sources.filter(source => 
      source && typeof source === 'object' && source.id
    );
    
    const total = validSources.length;
    const active = validSources.filter(s => 
      s.isOnline === true && s.status === 'active'
    ).length;
    const errors = validSources.filter(s => s.status === 'error').length;
    
    // Calculate update frequencies (handling invalid dates)
    const updateFrequencies = validSources.map(s => {
      if (!s.lastUpdate) return 0;
      
      try {
        const lastUpdate = new Date(s.lastUpdate);
        const now = new Date();
        if (isNaN(lastUpdate.getTime())) return 0;
        return (now.getTime() - lastUpdate.getTime()) / (1000 * 60); // minutes
      } catch {
        return 0;
      }
    });
    
    const avgUpdateFreq = total > 0 
      ? updateFrequencies.reduce((a, b) => a + b, 0) / total 
      : 0;
    const dataFreshness = Math.max(0, 100 - (avgUpdateFreq / 60) * 100); // 0-100%
    const healthScore = total > 0 ? (active / total) * 100 : 0;
    
    return {
      totalSources: total,
      activeSources: active,
      errorSources: errors,
      averageUpdateFrequency: avgUpdateFreq,
      dataFreshness: dataFreshness,
      healthScore: healthScore
    };
  }, [sources, showMetrics]);

  // Handle toggle with callback
  const handleToggle = useCallback(() => {
    const newVisibility = !showMetrics;
    setShowMetrics(newVisibility);
    
    if (onMetricsToggle) {
      try {
        onMetricsToggle(newVisibility);
      } catch (error) {
        console.error('MetricsVisibilityToggle: onMetricsToggle callback error:', error);
      }
    } else {
      console.error('MetricsVisibilityToggle: onMetricsToggle callback is required');
    }
  }, [showMetrics, onMetricsToggle]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const buttonClass = `metrics-btn ${showMetrics ? 'visible' : 'hidden'}`;
  const title = `Metrics: ${showMetrics ? 'Visible' : 'Hidden'}`;
  const icon = showMetrics ? '📊' : '📋';

  return (
    <div className="metrics-control">
      <button 
        className={buttonClass}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        title={title}
        type="button"
        aria-label={title}
        aria-pressed={showMetrics}
      >
        <span className="metrics-icon">
          {icon}
        </span>
      </button>

      {showMetrics && metrics && (
        <div className="metrics-panel slide-in">
          <div className="metric-item">
            <span className="metric-label">Total:</span>
            <span className="metric-value" data-testid="total-sources">
              {metrics.totalSources}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Active:</span>
            <span className="metric-value active" data-testid="active-sources">
              {metrics.activeSources}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Errors:</span>
            <span className="metric-value error" data-testid="error-sources">
              {metrics.errorSources}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsVisibilityToggle;
