/**
 * Feed Cleanup Utility
 * Removes invalid article URLs from stored feeds and ensures only legitimate RSS feed URLs are kept
 */

import { Feed } from '../models/Feed';
import { LocalStorageUtil } from './LocalStorageUtil';

// URL validation function (same as in fetchFeed.ts)
const isValidFeedURL = (url: string): boolean => {
  // Check for common feed indicators
  const feedIndicators = [
    '/rss', '/feed', '.xml', '/atom', 
    'rss.xml', 'feeds/', '/rss.php'
  ];
  
  // Check for article-specific patterns that should NOT be processed as feeds
  const articlePatterns = [
    '/2025/', '/2024/', '/2023/', '/article/',
    '/story/', '/news/2025', '/news/2024',
    '/post/', '/item/', 'article_'
  ];
  
  const hasArticlePattern = articlePatterns.some(pattern => url.includes(pattern));
  const hasFeedIndicator = feedIndicators.some(indicator => url.includes(indicator));
  
  // URL is valid if it has feed indicators OR does not have article patterns
  // But prioritize feed indicators
  if (hasFeedIndicator) {
    return true;
  }
  
  if (hasArticlePattern) {
    console.warn(`🚫 Invalid article URL found in feeds: ${url}`);
    return false;
  }
  
  return true;
};

/**
 * Clean up stored feeds by removing invalid article URLs
 */
export const cleanupStoredFeeds = (): void => {
  console.log('🧹 Starting feed cleanup...');
  
  try {
    // Clean up main feeds
    const storedFeeds = LocalStorageUtil.getItem<Feed[]>('feeds');
    if (storedFeeds && Array.isArray(storedFeeds)) {
      const originalCount = storedFeeds.length;
      const cleanFeeds = storedFeeds.filter(feed => {
        if (!feed.url) {
          console.warn('🚫 Feed without URL found, removing:', feed);
          return false;
        }
        return isValidFeedURL(feed.url);
      });
      
      if (cleanFeeds.length !== originalCount) {
        console.log(`🧹 Cleaned ${originalCount - cleanFeeds.length} invalid feeds. Keeping ${cleanFeeds.length} valid feeds.`);
        LocalStorageUtil.setItem('feeds', cleanFeeds);
      } else {
        console.log('✅ All stored feeds are valid');
      }
    }
    
    // Force version update to trigger reload
    LocalStorageUtil.setItem('feedsVersion', '3.1-cleaned');
    
    console.log('✅ Feed cleanup completed');
  } catch (error) {
    console.error('❌ Error during feed cleanup:', error);
  }
};

/**
 * Clear all feed-related cache to force fresh data
 */
export const clearFeedCache = (): void => {
  console.log('🗑️ Clearing all feed cache...');
  
  try {
    // Clear main feed storage
    LocalStorageUtil.removeItem('feeds');
    LocalStorageUtil.removeItem('feedLists');
    LocalStorageUtil.removeItem('feedsVersion');
    
    // Clear modern feed cache
    LocalStorageUtil.removeItem('modernFeedCache');
    
    // Clear any URL-specific cache entries
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('http') || key.includes('feed') || key.includes('rss')) {
        LocalStorageUtil.removeItem(key);
      }
    });
    
    console.log('✅ Feed cache cleared');
  } catch (error) {
    console.error('❌ Error clearing feed cache:', error);
  }
};

/**
 * Perform complete feed system reset
 */
export const resetFeedSystem = (): void => {
  console.log('🔄 Performing complete feed system reset...');
  
  clearFeedCache();
  cleanupStoredFeeds();
  
  // Force reload
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};
