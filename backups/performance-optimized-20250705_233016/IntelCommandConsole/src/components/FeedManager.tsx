import React, { useState, useEffect } from 'react';
import { Feed } from '../models/Feed';
import FeedService from '../features/feeds/services/FeedService';
import FeedHealthIndicator from './FeedHealthIndicator';

interface FeedCategory {
  id: string;
  name: string;
  color: string;
  feeds: string[]; // Feed IDs
}

const FeedManager: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
  const [draggedFeed, setDraggedFeed] = useState<string | null>(null);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const defaultCategories: FeedCategory[] = [
    { id: 'news', name: 'News & Current Events', color: '#22c55e', feeds: [] },
    { id: 'tech', name: 'Technology', color: '#3b82f6', feeds: [] },
    { id: 'security', name: 'Security Intelligence', color: '#ef4444', feeds: [] },
    { id: 'uncategorized', name: 'Uncategorized', color: '#6b7280', feeds: [] }
  ];

  useEffect(() => {
    loadFeeds();
    loadCategories();
  }, []);

  const loadFeeds = async () => {
    try {
      const feedData = await FeedService.getFeeds();
      setFeeds(feedData);
    } catch (error) {
      console.error('Failed to load feeds:', error);
    }
  };

  const loadCategories = () => {
    const saved = localStorage.getItem('feed_categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      setCategories(defaultCategories);
      saveCategories(defaultCategories);
    }
  };

  const saveCategories = (categories: FeedCategory[]) => {
    localStorage.setItem('feed_categories', JSON.stringify(categories));
  };

  const addFeed = async () => {
    if (!newFeedUrl.trim()) return;

    setIsAddingFeed(true);
    try {
      // Validate URL format
      new URL(newFeedUrl);
      
      // Check if feed already exists
      const existingFeed = feeds.find(f => f.url === newFeedUrl);
      if (existingFeed) {
        alert('This feed is already added');
        return;
      }

      // Add feed to service
      await FeedService.addFeed({
        id: Date.now().toString(),
        name: 'New Feed',
        title: 'Loading...',
        description: 'Fetching feed details...',
        link: newFeedUrl,
        url: newFeedUrl,
        pubDate: new Date().toISOString(),
        author: '',
        feedListId: 'default'
      });

      // Reload feeds
      await loadFeeds();
      setNewFeedUrl('');
    } catch (error) {
      console.error('Failed to add feed:', error);
      alert('Invalid URL or failed to add feed');
    } finally {
      setIsAddingFeed(false);
    }
  };

  const removeFeed = async (feedId: string) => {
    if (confirm('Are you sure you want to remove this feed?')) {
      try {
        await FeedService.removeFeed(feedId);
        await loadFeeds();
        
        // Remove from categories
        const updatedCategories = categories.map(cat => ({
          ...cat,
          feeds: cat.feeds.filter(id => id !== feedId)
        }));
        setCategories(updatedCategories);
        saveCategories(updatedCategories);
      } catch (error) {
        console.error('Failed to remove feed:', error);
      }
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: FeedCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      feeds: []
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const removeCategory = (categoryId: string) => {
    if (confirm('Remove this category? Feeds will be moved to Uncategorized.')) {
      const categoryToRemove = categories.find(c => c.id === categoryId);
      const uncategorized = categories.find(c => c.id === 'uncategorized');
      
      if (categoryToRemove && uncategorized) {
        uncategorized.feeds.push(...categoryToRemove.feeds);
      }

      const updatedCategories = categories.filter(c => c.id !== categoryId);
      setCategories(updatedCategories);
      saveCategories(updatedCategories);
    }
  };

  const handleFeedDragStart = (feedId: string) => {
    setDraggedFeed(feedId);
  };

  const handleCategoryDrop = (categoryId: string) => {
    if (!draggedFeed) return;

    const updatedCategories = categories.map(cat => {
      // Remove from all categories
      const filtered = cat.feeds.filter(id => id !== draggedFeed);
      
      // Add to target category
      if (cat.id === categoryId) {
        return { ...cat, feeds: [...filtered, draggedFeed] };
      }
      
      return { ...cat, feeds: filtered };
    });

    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setDraggedFeed(null);
  };

  const getFeedsByCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];
    
    return feeds.filter(feed => category.feeds.includes(feed.id));
  };

  const getUncategorizedFeeds = () => {
    const categorizedFeedIds = new Set(
      categories.flatMap(cat => cat.feeds)
    );
    return feeds.filter(feed => !categorizedFeedIds.has(feed.id));
  };

  const toggleFeedSelection = (feedId: string) => {
    const newSelection = new Set(selectedFeeds);
    if (newSelection.has(feedId)) {
      newSelection.delete(feedId);
    } else {
      newSelection.add(feedId);
    }
    setSelectedFeeds(newSelection);
  };

  const bulkRemoveFeeds = () => {
    if (selectedFeeds.size === 0) return;
    
    if (confirm(`Remove ${selectedFeeds.size} selected feeds?`)) {
      Promise.all(
        Array.from(selectedFeeds).map(feedId => FeedService.removeFeed(feedId))
      ).then(() => {
        loadFeeds();
        setSelectedFeeds(new Set());
      }).catch(error => {
        console.error('Bulk remove failed:', error);
      });
    }
  };

  return (
    <div className="feed-manager">
      <div className="feed-manager-header">
        <h2 className="manager-title">🗂️ Feed Manager</h2>
        <div className="manager-stats">
          {feeds.length} feeds in {categories.length} categories
        </div>
      </div>

      {/* Add Feed Section */}
      <div className="add-feed-section">
        <div className="add-feed-form">
          <input
            type="url"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="Enter RSS/Atom feed URL..."
            className="feed-url-input"
            onKeyPress={(e) => e.key === 'Enter' && addFeed()}
          />
          <button
            onClick={addFeed}
            disabled={isAddingFeed || !newFeedUrl.trim()}
            className="add-feed-button"
          >
            {isAddingFeed ? '⏳' : '➕'} Add Feed
          </button>
        </div>

        {selectedFeeds.size > 0 && (
          <div className="bulk-actions">
            <span className="selection-count">{selectedFeeds.size} selected</span>
            <button onClick={bulkRemoveFeeds} className="bulk-remove-button">
              🗑️ Remove Selected
            </button>
            <button onClick={() => setSelectedFeeds(new Set())} className="clear-selection-button">
              ✖️ Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="categories-container">
        {categories.map(category => {
          const categoryFeeds = category.id === 'uncategorized' 
            ? getUncategorizedFeeds() 
            : getFeedsByCategory(category.id);
          
          const isExpanded = expandedCategory === category.id;

          return (
            <div
              key={category.id}
              className="category-section"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleCategoryDrop(category.id)}
            >
              <div className="category-header">
                <button
                  className="category-toggle"
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                >
                  {isExpanded ? '📂' : '📁'}
                </button>
                
                <div 
                  className="category-indicator"
                  style={{ backgroundColor: category.color }}
                />
                
                <span className="category-name">{category.name}</span>
                
                <span className="category-count">({categoryFeeds.length})</span>
                
                {category.id !== 'uncategorized' && (
                  <button
                    className="remove-category-button"
                    onClick={() => removeCategory(category.id)}
                  >
                    ✖️
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="category-feeds">
                  {categoryFeeds.map(feed => (
                    <div
                      key={feed.id}
                      className="feed-item-manager"
                      draggable
                      onDragStart={() => handleFeedDragStart(feed.id)}
                    >
                      <label className="feed-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFeeds.has(feed.id)}
                          onChange={() => toggleFeedSelection(feed.id)}
                        />
                      </label>
                      
                      <FeedHealthIndicator feedId={feed.id} />
                      
                      <div className="feed-info">
                        <div className="feed-title-manager">{feed.title}</div>
                        <div className="feed-url">{feed.url}</div>
                      </div>
                      
                      <button
                        className="remove-feed-button"
                        onClick={() => removeFeed(feed.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  {categoryFeeds.length === 0 && (
                    <div className="empty-category">
                      Drag feeds here or they'll appear automatically
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Category */}
        <div className="add-category-section">
          {isAddingCategory ? (
            <div className="add-category-form">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="category-name-input"
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                autoFocus
              />
              <button onClick={addCategory} className="save-category-button">
                ✅ Save
              </button>
              <button onClick={() => setIsAddingCategory(false)} className="cancel-category-button">
                ❌ Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="add-category-button"
            >
              ➕ Add Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedManager;
