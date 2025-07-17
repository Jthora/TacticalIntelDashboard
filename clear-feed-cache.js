/**
 * Feed System Reset Script
 * Run this to clear cached article URLs and reset the feed system
 */

// Add to browser console to run cleanup
console.log('🔧 Feed System Reset Script');

// Function to clear localStorage
function clearFeedStorage() {
  const keysToRemove = [
    'feeds',
    'feedLists', 
    'feedsVersion',
    'modernFeedCache'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed ${key}`);
  });
  
  // Clear any URL-based cache entries
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('http') || key.includes('feed') || key.includes('rss')) {
      localStorage.removeItem(key);
      console.log(`✅ Removed cached URL: ${key}`);
    }
  });
  
  console.log('🎉 Feed storage cleared! Reload the page to see changes.');
}

// Execute cleanup
clearFeedStorage();
