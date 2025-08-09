import React, { useEffect,useMemo, useState } from 'react';

import { Feed } from '../models/Feed';

interface SearchAndFilterProps {
  feeds: Feed[];
  onFilteredFeedsChange: (filteredFeeds: Feed[]) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ feeds, onFilteredFeedsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Extract unique sources from feeds
  const sources = useMemo(() => {
    const sourceSet = new Set<string>();
    feeds.forEach(feed => {
      try {
        const domain = new URL(feed.link).hostname.replace('www.', '');
        sourceSet.add(domain.split('.')[0].toUpperCase());
      } catch {
        sourceSet.add('UNKNOWN');
      }
    });
    return Array.from(sourceSet).sort();
  }, [feeds]);

  // Track active filters
  useEffect(() => {
    const hasFilters = searchTerm !== '' || selectedTimeRange !== 'all' || selectedSource !== 'all';
    setHasActiveFilters(hasFilters);
  }, [searchTerm, selectedTimeRange, selectedSource]);

  // Filter and sort feeds
  const filteredFeeds = useMemo(() => {
    setIsFiltering(true);
    
    const filtered = feeds.filter(feed => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          feed.title.toLowerCase().includes(searchLower) ||
          (feed.description && feed.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Source filter
      if (selectedSource !== 'all') {
        try {
          const feedSource = new URL(feed.link).hostname.replace('www.', '').split('.')[0].toUpperCase();
          if (feedSource !== selectedSource) return false;
        } catch {
          if (selectedSource !== 'UNKNOWN') return false;
        }
      }

      // Time range filter
      if (selectedTimeRange !== 'all') {
        const feedDate = new Date(feed.pubDate);
        const now = new Date();
        const timeDiff = now.getTime() - feedDate.getTime();
        
        switch (selectedTimeRange) {
          case '1hour':
            if (timeDiff > 60 * 60 * 1000) return false;
            break;
          case '24hours':
            if (timeDiff > 24 * 60 * 60 * 1000) return false;
            break;
          case '7days':
            if (timeDiff > 7 * 24 * 60 * 60 * 1000) return false;
            break;
          case '30days':
            if (timeDiff > 30 * 24 * 60 * 60 * 1000) return false;
            break;
        }
      }

      return true;
    });

    // Sort feeds
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'source':
          const sourceA = new URL(a.link).hostname;
          const sourceB = new URL(b.link).hostname;
          return sourceA.localeCompare(sourceB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [feeds, searchTerm, selectedTimeRange, selectedSource, sortBy]);

  // Update parent component when filtered feeds change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilteredFeedsChange(filteredFeeds);
      setIsFiltering(false);
    }, 150); // Small delay to show filtering animation

    return () => clearTimeout(timeoutId);
  }, [filteredFeeds, onFilteredFeedsChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTimeRange('all');
    setSelectedSource('all');
    setSortBy('date');
  };

  return (
    <div className={`search-and-filter ${isFiltering ? 'filtering' : ''}`}>
      <div className="filter-header">
        <h3 className={hasActiveFilters ? 'active-filters' : ''}>
          🔍 Intelligence Filter
          {hasActiveFilters && <span className="filter-indicator">●</span>}
        </h3>
        <button 
          onClick={clearFilters} 
          className={`clear-filters-btn ${hasActiveFilters ? 'visible' : ''}`}
          disabled={!hasActiveFilters}
        >
          🗑️ Clear
        </button>
      </div>

      {/* Search Input */}
      <div className="search-section">
        <div className={`search-input-container ${searchTerm ? 'has-input' : ''}`}>
          <input
            type="text"
            placeholder="🔍 Search headlines, content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-search-btn animate-in"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className={`filter-group ${selectedTimeRange !== 'all' ? 'active' : ''}`}>
          <label>📅 Time Range:</label>
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="1hour">Last Hour</option>
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        <div className={`filter-group ${selectedSource !== 'all' ? 'active' : ''}`}>
          <label>📡 Source:</label>
          <select 
            value={selectedSource} 
            onChange={(e) => setSelectedSource(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className={`filter-group ${sortBy !== 'date' ? 'active' : ''}`}>
          <label>🔄 Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date">Latest First</option>
            <option value="title">Alphabetical</option>
            <option value="source">By Source</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`filter-results ${isFiltering ? 'updating' : ''}`}>
        <span className="results-count">
          📊 {filteredFeeds.length} of {feeds.length} items
          {isFiltering && <span className="filtering-indicator">⏳</span>}
        </span>
        {hasActiveFilters && (
          <span className="active-filters-badge pulse">
            🎯 Filters Active
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
