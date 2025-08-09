import React, { useState } from 'react';

import { log } from '../../utils/LoggerService';

export type SortOption = 'alphabetical' | 'activity' | 'priority';

export interface SortPreferenceSelectorProps {
  initialSort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  className?: string;
}

/**
 * Feature 05: Sort Preference Selector
 * 
 * Provides instant reorganization of intelligence sources through multiple sorting algorithms
 * optimized for tactical operations. Enables rapid data organization with single-click sorting
 * changes to match current operational priorities.
 */
export const SortPreferenceSelector: React.FC<SortPreferenceSelectorProps> = ({
  initialSort = 'alphabetical',
  onSortChange,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    // Validate initial sort and provide fallback
    const validSorts: SortOption[] = ['alphabetical', 'activity', 'priority'];
    return validSorts.includes(initialSort) ? initialSort : 'alphabetical';
  });

  const sortConfig = {
    alphabetical: {
      icon: 'AZ',
      label: 'Alphabetical',
      description: 'Standard reference ordering'
    },
    activity: {
      icon: '⚡',
      label: 'Activity',
      description: 'Most active sources first'
    },
    priority: {
      icon: '⭐',
      label: 'Priority', 
      description: 'Mission-critical sources first'
    }
  };

  const cycleSortOption = () => {
    const options: SortOption[] = ['alphabetical', 'activity', 'priority'];
    const currentIndex = options.indexOf(sortBy);
    const nextSort = options[(currentIndex + 1) % options.length];
    
    setSortBy(nextSort);
    
    // Log operational change
    const config = sortConfig[nextSort];
    log.debug("Component", `📊 Sort preference changed to: ${nextSort} - ${config.description}`);
    
    // Callback for parent component
    if (onSortChange) {
      onSortChange(nextSort);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cycleSortOption();
    }
  };

  const getTooltipText = () => {
    const config = sortConfig[sortBy];
    return `Sort: ${config.label} - ${config.description}`;
  };

  const getAriaLabel = () => {
    return `Sort intelligence sources. Currently: ${sortBy}. Click to cycle through alphabetical, activity, and priority sorting.`;
  };

  return (
    <div className="sort-selector">
      <button 
        className={`sort-btn ${sortBy} ${className}`}
        onClick={cycleSortOption}
        onKeyDown={handleKeyDown}
        title={getTooltipText()}
        role="button"
        tabIndex={0}
        aria-label={getAriaLabel()}
        data-sort={sortBy}
      >
        <span className="sort-icon">
          {sortConfig[sortBy].icon}
        </span>
      </button>
    </div>
  );
};

export default SortPreferenceSelector;
