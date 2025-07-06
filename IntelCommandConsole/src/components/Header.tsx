import React, { useState, useRef } from 'react';
import { useSearch } from '../contexts/SearchContext';
import Modal from './Modal';
import FeedManager from './FeedManager';
import WingCommanderLogo from '../assets/images/WingCommanderLogo-288x162.gif';

const Header: React.FC = () => {
  const { performSearch, addToHistory, searchHistory, isSearching } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFeedManager, setShowFeedManager] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await performSearch({ 
        query: searchQuery.trim(),
        operators: 'AND',
        caseSensitive: false 
      });
      addToHistory(searchQuery.trim());
      setShowSuggestions(false);
      // Focus back to input for next search
      searchInputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0 && searchHistory.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch({ 
      query: suggestion,
      operators: 'AND',
      caseSensitive: false 
    });
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 0 && searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <header className="header">
      <img src={WingCommanderLogo} alt="Wing Commander Logo" className="logo" />
      <h1 className="title">Tactical Intel Dashboard</h1>

      {/* Enhanced search functionality */}
      <div className="header-search">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search across all feeds..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="search-input"
              disabled={isSearching}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? '⏳' : '🔍'}
            </button>
          </div>
          
          {/* Feed Management Button */}
          <button 
            className="manage-feeds-button"
            onClick={() => setShowFeedManager(true)}
            title="Manage Feeds"
          >
            🗂️ Manage
          </button>
          
          {/* Search suggestions dropdown */}
          {showSuggestions && searchHistory.length > 0 && (
            <div className="search-suggestions">
              <div className="search-suggestions-header">Recent searches:</div>
              {searchHistory
                .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="suggestion-icon">🕐</span>
                    {suggestion}
                  </div>
                ))
              }
            </div>
          )}
        </form>
        
        {/* Feed Manager Modal */}
        <Modal
          isOpen={showFeedManager}
          onClose={() => setShowFeedManager(false)}
          title="Feed Manager"
          size="fullscreen"
        >
          <FeedManager />
        </Modal>
      </div>
    </header>
  );
};

export default Header;