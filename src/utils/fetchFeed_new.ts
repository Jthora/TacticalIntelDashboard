import { FetchService } from '../services/FetchService';
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { FeedResults } from '../types/FeedTypes';
import { log } from '../utils/LoggerService';
import { LocalStorageUtil } from './LocalStorageUtil';

/**
 * Fetches feed data from a URL, using the FetchService which respects user settings.
 * This is the main entry point for all feed fetching in the application.
 */
export const fetchFeed = async (url: string): Promise<FeedResults | null> => {
  log.debug("Component", `Starting to fetch feed from URL: ${url}`);
  
  try {
    // Check if we have protocol settings for cache duration
    const protocolSettings = SettingsIntegrationService.getGeneralSettings();
    const cacheDuration = protocolSettings.cacheDuration * 1000; // Convert to milliseconds
    
    // Check cache first
    const cachedResult = LocalStorageUtil.getItem(`feed_${url}`);
    if (cachedResult) {
      const parsedCache = JSON.parse(cachedResult as string);
      const cacheTime = new Date(parsedCache.fetchedAt).getTime();
      const now = new Date().getTime();
      
      // Check if cache is still valid based on settings
      if (now - cacheTime < cacheDuration) {
        log.debug("Component", `Using cached feed data for ${url}`);
        return parsedCache;
      }
    }
    
    // Try to detect the protocol from the URL if auto-detection is enabled
    let protocol: string | undefined;
    if (SettingsIntegrationService.loadSettings().protocols?.autoDetect !== false) {
      protocol = SettingsIntegrationService.detectProtocolFromUrl(url);
      log.debug("Component", `Auto-detected protocol: ${protocol || 'unknown'}`);
    }
    
    // Use the FetchService which respects user settings
    let feedResults = await FetchService.fetchFeed(url, protocol);
    
    // If fetching failed and protocol fallback is enabled, try other protocols
    if (!feedResults && SettingsIntegrationService.loadSettings().protocols?.fallbackEnabled !== false) {
      log.debug("Component", `Initial fetch failed, trying protocol fallbacks for ${url}`);
      
      // Get protocol priority from settings
      const protocolPriority = SettingsIntegrationService.getProtocolPriority();
      
      // Skip the already tried protocol
      for (const fallbackProtocol of protocolPriority) {
        if (fallbackProtocol !== protocol) {
          log.debug("Component", `Trying fallback protocol: ${fallbackProtocol}`);
          feedResults = await FetchService.fetchFeed(url, fallbackProtocol);
          
          if (feedResults) {
            log.debug("Component", `Fallback protocol ${fallbackProtocol} succeeded`);
            break;
          }
        }
      }
    }
    
    // Cache the successful result
    if (feedResults) {
      LocalStorageUtil.setItem(`feed_${url}`, JSON.stringify(feedResults));
    }
    
    return feedResults;
    
  } catch (error) {
    log.error("Component", `Failed to fetch feed: ${error}`);
    // Try to get cached data even if it's expired in case of fetch failure
    try {
      const cachedResult = LocalStorageUtil.getItem(`feed_${url}`);
      if (cachedResult) {
        log.debug("Component", `Using expired cached feed data for ${url} due to fetch error`);
        return JSON.parse(cachedResult as string);
      }
    } catch (cacheError) {
      log.error("Component", `Failed to retrieve cached data: ${cacheError}`);
    }
    
    // If everything fails, rethrow the original error
    throw error;
  }
};
