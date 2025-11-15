/**
 * Feed Cleanup Utility
 * Removes invalid article URLs from stored feeds and ensures only legitimate RSS feed URLs are kept
 */

import { FEED_SYSTEM_VERSION } from '../constants/FeedVersions';
import { Feed } from '../models/Feed';
import { LocalStorageUtil } from './LocalStorageUtil';
import { isValidFeedURL } from './feedUrlValidator';

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
  LocalStorageUtil.setItem('feedsVersion', FEED_SYSTEM_VERSION);
    
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
