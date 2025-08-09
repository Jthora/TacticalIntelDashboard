import { useCallback,useMemo, useState } from 'react';

interface IntelligenceSource {
  id: string;
  name: string;
  isOnline: boolean;
  status: string;
  lastUpdate: string;
}

interface ActiveFilterToggleProps {
  sources: IntelligenceSource[];
  onFilterChange: (filteredSources: IntelligenceSource[]) => void;
}

const ActiveFilterToggle: React.FC<ActiveFilterToggleProps> = ({
  sources,
  onFilterChange,
}) => {
  const [activeFilter, setActiveFilter] = useState(false);

  // Determine if a source is active based on criteria
  const isSourceActive = useCallback((source: IntelligenceSource): boolean => {
    // Check if source is online and not in error state
    if (!source.isOnline || source.status === 'error') {
      return false;
    }

    // Check if lastUpdate exists and is valid
    if (!source.lastUpdate || source.lastUpdate.trim() === '') {
      return false;
    }

    try {
      const lastUpdate = new Date(source.lastUpdate);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      // Active if updated within 24 hours
      return hoursSinceUpdate < 24;
    } catch {
      // Invalid date format
      return false;
    }
  }, []);

  // Filter sources based on active criteria
  const filteredSources = useMemo(() => {
    if (!activeFilter) return sources;
    
    return sources.filter(isSourceActive);
  }, [sources, activeFilter, isSourceActive]);

  // Toggle filter state and notify parent
  const toggleActiveFilter = useCallback(() => {
    const newActiveFilter = !activeFilter;
    setActiveFilter(newActiveFilter);
    
    // Calculate and send filtered sources
    const newFilteredSources = newActiveFilter 
      ? sources.filter(isSourceActive)
      : sources;
    
    onFilterChange(newFilteredSources);
  }, [activeFilter, sources, isSourceActive, onFilterChange]);

  return (
    <div className="active-filter">
      <button 
        className={`filter-btn ${activeFilter ? 'active' : 'inactive'}`}
        onClick={toggleActiveFilter}
        title={`Show: ${activeFilter ? 'Active Only' : 'All Sources'}`}
        type="button"
      >
        <span className="filter-icon">
          {activeFilter ? '◉' : '○'}
        </span>
      </button>
      {activeFilter && (
        <span className="filter-count">
          {filteredSources.length}
        </span>
      )}
    </div>
  );
};

export default ActiveFilterToggle;
