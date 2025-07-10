# Search Suggestions

## 🔍 Feature Overview

Search Suggestions provide intelligent, contextual search assistance through real-time query completion and historical search recommendations, enhancing search efficiency and intelligence discovery capabilities.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Search Efficiency**: Reduce query formulation time through intelligent suggestions
- **Intelligence Discovery**: Surface relevant search terms and patterns
- **Historical Context**: Leverage previous searches for improved targeting
- **Operational Speed**: Accelerate intelligence gathering through predictive search

## 🏗 Technical Implementation

### React State Management
```typescript
interface SearchSuggestion {
  type: 'history' | 'keyword' | 'entity' | 'operator';
  text: string;
  description?: string;
  relevanceScore: number;
  category?: string;
}

const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);

const generateSuggestions = useMemo(
  () => debounce((query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const historySuggestions = getHistorySuggestions(query);
    const keywordSuggestions = getKeywordSuggestions(query);
    const entitySuggestions = getEntitySuggestions(query);
    
    const allSuggestions = [
      ...historySuggestions,
      ...keywordSuggestions,
      ...entitySuggestions
    ].sort((a, b) => b.relevanceScore - a.relevanceScore)
     .slice(0, 8); // Limit to 8 suggestions

    setSuggestions(allSuggestions);
    setShowSuggestions(allSuggestions.length > 0);
    setSelectedSuggestion(-1);
  }, 300),
  []
);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (!showSuggestions) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      break;
    case 'ArrowUp':
      e.preventDefault();
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
      break;
    case 'Enter':
      if (selectedSuggestion >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      }
      break;
    case 'Escape':
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
      break;
  }
};
```

### Visual Component
```tsx
<div className="search-suggestions-container">
  <input
    ref={searchInputRef}
    type="text"
    className="search-input"
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      generateSuggestions(e.target.value);
    }}
    onKeyDown={handleKeyDown}
    onFocus={() => setShowSuggestions(suggestions.length > 0)}
    placeholder="Search intelligence..."
  />
  
  {showSuggestions && (
    <div className="suggestions-dropdown">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`suggestion-item ${index === selectedSuggestion ? 'selected' : ''} ${suggestion.type}`}
          onClick={() => applySuggestion(suggestion)}
          onMouseEnter={() => setSelectedSuggestion(index)}
        >
          <span className="suggestion-icon">
            {suggestion.type === 'history' && '🕒'}
            {suggestion.type === 'keyword' && '🔑'}
            {suggestion.type === 'entity' && '👤'}
            {suggestion.type === 'operator' && '⚙️'}
          </span>
          <span className="suggestion-text">{suggestion.text}</span>
          {suggestion.description && (
            <span className="suggestion-desc">{suggestion.description}</span>
          )}
        </div>
      ))}
    </div>
  )}
</div>
```

## 📊 Metrics & Analytics

### Suggestion Effectiveness
- **Acceptance Rate**: Percentage of suggestions actually used
- **Search Time Reduction**: Time saved through suggestion usage
- **Query Improvement**: Quality of searches using suggestions vs manual
- **Discovery Rate**: New intelligence found through suggested searches
