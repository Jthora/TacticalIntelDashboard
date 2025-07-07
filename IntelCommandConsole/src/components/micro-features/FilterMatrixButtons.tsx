import React, { useState, useCallback } from 'react';

interface FilterMatrix {
  priority: string[];
  type: string[];
  region: string[];
}

interface FilterMatrixButtonsProps {
  initialFilters?: FilterMatrix;
  onFiltersChange?: (filters: FilterMatrix) => void;
}

export const FilterMatrixButtons: React.FC<FilterMatrixButtonsProps> = ({
  initialFilters = { priority: [], type: [], region: [] },
  onFiltersChange
}) => {
  const [activeFilters, setActiveFilters] = useState<FilterMatrix>(initialFilters);

  const toggleMatrixFilter = useCallback((category: keyof FilterMatrix, value: string) => {
    const currentValues = activeFilters[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    const newFilters = {
      ...activeFilters,
      [category]: newValues
    };
    
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [activeFilters, onFiltersChange]);

  const handleKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLButtonElement>,
    category: keyof FilterMatrix,
    value: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMatrixFilter(category, value);
    }
  }, [toggleMatrixFilter]);

  return (
    <div 
      className="filter-matrix" 
      role="group" 
      aria-label="Filter Matrix Controls"
    >
      {/* Priority Row */}
      <div 
        className="matrix-row priority-row" 
        role="group" 
        aria-label="Priority Filters"
      >
        <button
          type="button"
          className={`matrix-btn pri-high ${activeFilters.priority.includes('high') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('priority', 'high')}
          onKeyDown={(e) => handleKeyDown(e, 'priority', 'high')}
          aria-label="High Priority Filter"
          aria-pressed={activeFilters.priority.includes('high')}
          tabIndex={0}
        >
          H
        </button>
        <button
          type="button"
          className={`matrix-btn pri-med ${activeFilters.priority.includes('medium') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('priority', 'medium')}
          onKeyDown={(e) => handleKeyDown(e, 'priority', 'medium')}
          aria-label="Medium Priority Filter"
          aria-pressed={activeFilters.priority.includes('medium')}
          tabIndex={0}
        >
          M
        </button>
        <button
          type="button"
          className={`matrix-btn pri-low ${activeFilters.priority.includes('low') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('priority', 'low')}
          onKeyDown={(e) => handleKeyDown(e, 'priority', 'low')}
          aria-label="Low Priority Filter"
          aria-pressed={activeFilters.priority.includes('low')}
          tabIndex={0}
        >
          L
        </button>
      </div>

      {/* Type Row */}
      <div 
        className="matrix-row type-row" 
        role="group" 
        aria-label="Type Filters"
      >
        <button
          type="button"
          className={`matrix-btn type-news ${activeFilters.type.includes('news') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('type', 'news')}
          onKeyDown={(e) => handleKeyDown(e, 'type', 'news')}
          aria-label="News Sources Filter"
          aria-pressed={activeFilters.type.includes('news')}
          tabIndex={0}
        >
          N
        </button>
        <button
          type="button"
          className={`matrix-btn type-social ${activeFilters.type.includes('social') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('type', 'social')}
          onKeyDown={(e) => handleKeyDown(e, 'type', 'social')}
          aria-label="Social Media Filter"
          aria-pressed={activeFilters.type.includes('social')}
          tabIndex={0}
        >
          S
        </button>
        <button
          type="button"
          className={`matrix-btn type-official ${activeFilters.type.includes('official') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('type', 'official')}
          onKeyDown={(e) => handleKeyDown(e, 'type', 'official')}
          aria-label="Official Sources Filter"
          aria-pressed={activeFilters.type.includes('official')}
          tabIndex={0}
        >
          O
        </button>
      </div>

      {/* Region Row */}
      <div 
        className="matrix-row region-row" 
        role="group" 
        aria-label="Region Filters"
      >
        <button
          type="button"
          className={`matrix-btn region-domestic ${activeFilters.region.includes('domestic') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('region', 'domestic')}
          onKeyDown={(e) => handleKeyDown(e, 'region', 'domestic')}
          aria-label="Domestic Sources Filter"
          aria-pressed={activeFilters.region.includes('domestic')}
          tabIndex={0}
        >
          D
        </button>
        <button
          type="button"
          className={`matrix-btn region-international ${activeFilters.region.includes('international') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('region', 'international')}
          onKeyDown={(e) => handleKeyDown(e, 'region', 'international')}
          aria-label="International Sources Filter"
          aria-pressed={activeFilters.region.includes('international')}
          tabIndex={0}
        >
          I
        </button>
        <button
          type="button"
          className={`matrix-btn region-classified ${activeFilters.region.includes('classified') ? 'active' : ''}`}
          onClick={() => toggleMatrixFilter('region', 'classified')}
          onKeyDown={(e) => handleKeyDown(e, 'region', 'classified')}
          aria-label="Classified Sources Filter"
          aria-pressed={activeFilters.region.includes('classified')}
          tabIndex={0}
        >
          C
        </button>
      </div>
    </div>
  );
};
