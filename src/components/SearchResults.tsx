import React from 'react';
import { useSearch } from '../contexts/SearchContext';

const SearchResults: React.FC = () => {
  const { searchResults, isSearching, searchQuery, clearSearch } = useSearch();

  if (!searchResults && !isSearching) {
    return null;
  }

  return (
    <div className="search-results-overlay">
      <div className="search-results-container">
        <div className="search-results-header">
          <div className="search-results-title">
            {isSearching ? (
              <>
                <span className="search-loading">⏳</span>
                Searching for "{searchQuery}"...
              </>
            ) : (
              <>
                Search Results for "{searchQuery}"
                {searchResults && (
                  <span className="search-stats">
                    {searchResults.totalCount} results in {searchResults.searchTime}ms
                  </span>
                )}
              </>
            )}
          </div>
          <button 
            className="search-close-button"
            onClick={clearSearch}
            aria-label="Close search results"
          >
            ✕
          </button>
        </div>

        <div className="search-results-content">
          {isSearching ? (
            <div className="search-loading-state">
              <div className="loading-spinner"></div>
              <p>Searching across all feeds...</p>
            </div>
          ) : searchResults?.results.length === 0 ? (
            <div className="search-no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try different keywords or check your spelling</p>
              {searchResults.suggestions.length > 0 && (
                <div className="search-suggestions">
                  <p>Suggestions:</p>
                  <div className="suggestion-tags">
                    {searchResults.suggestions.map((suggestion, index) => (
                      <span key={index} className="suggestion-tag">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="search-results-list">
              {searchResults?.results.map((result, index) => (
                <div key={`${result.feed.id}-${index}`} className="search-result-item">
                  <div className="result-header">
                    <h3 className="result-title">
                      <a 
                        href={result.feed.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="result-link"
                      >
                        {result.feed.title}
                      </a>
                    </h3>
                    <div className="result-meta">
                      <span className="result-source">{result.feed.name}</span>
                      <span className="result-date">
                        {new Date(result.feed.pubDate).toLocaleDateString()}
                      </span>
                      <span className="result-score">
                        Relevance: {Math.round(result.relevanceScore * 10) / 10}
                      </span>
                    </div>
                  </div>
                  
                  <div className="result-snippet">
                    {result.snippet}
                  </div>
                  
                  <div className="result-matched-fields">
                    <span className="matched-label">Found in:</span>
                    {result.matchedFields.map((field, fieldIndex) => (
                      <span key={fieldIndex} className="matched-field">
                        {field}
                      </span>
                    ))}
                  </div>
                  
                  {result.feed.author && (
                    <div className="result-author">
                      By: {result.feed.author}
                    </div>
                  )}
                  
                  {result.feed.categories && result.feed.categories.length > 0 && (
                    <div className="result-categories">
                      {result.feed.categories.map((category, catIndex) => (
                        <span key={catIndex} className="result-category">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {searchResults && searchResults.results.length > 0 && (
          <div className="search-results-footer">
            <div className="search-actions">
              <button className="search-action-button" onClick={() => window.print()}>
                📄 Print Results
              </button>
              <button 
                className="search-action-button"
                onClick={() => {
                  const data = JSON.stringify(searchResults, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `search-results-${searchQuery}-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                💾 Export Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
