/**
 * FetchService provides methods for fetching external resources with CORS handling
 * based on user settings from SettingsIntegrationService.
 */
import { CORSStrategy } from '../contexts/SettingsContext';
import { SettingsIntegrationService } from './SettingsIntegrationService';
import { log } from '../utils/LoggerService';
import { RSS2JSONService } from './RSS2JSONService';
import { FeedResults } from '../types/FeedTypes';
import { convertFeedsToFeedItems } from '../utils/feedConversion';

export class FetchService {
  /**
   * Fetch a feed URL using the user's configured CORS strategy
   * @param url The URL to fetch
   * @param protocol Optional protocol type for protocol-specific settings
   * @returns FeedResults with the fetched data
   */
  static async fetchFeed(url: string, protocol?: string): Promise<FeedResults | null> {
    log.debug("FetchService", `Starting to fetch feed from URL: ${url}`);
    
    // Get the CORS strategy from settings
    const strategy = SettingsIntegrationService.getCORSStrategy(protocol);
    log.debug("FetchService", `Using CORS strategy: ${strategy} for ${protocol || 'default'} protocol`);
    
    try {
      switch (strategy) {
        case CORSStrategy.RSS2JSON:
          return await this.fetchWithRSS2JSON(url);
          
        case CORSStrategy.DIRECT:
          return await this.fetchDirect(url);
          
        case CORSStrategy.SERVICE_WORKER:
          return await this.fetchWithServiceWorker(url);
          
        case CORSStrategy.JSONP:
          return await this.fetchWithJSONP(url);
          
        case CORSStrategy.EXTENSION:
          return await this.fetchWithExtension(url);
          
        default:
          // Fall back to proxy chain if strategy not implemented
          return await this.fetchWithProxyChain(url);
      }
    } catch (error) {
      log.error("FetchService", `Failed to fetch ${url} with strategy ${strategy}`, error);
      
      // Try the fallback chain defined in settings
      try {
        log.debug("FetchService", "Attempting fallback chain");
        return await this.fetchWithProxyChain(url);
      } catch (fallbackError) {
        log.error("FetchService", "All fallback methods failed", fallbackError);
        throw fallbackError;
      }
    }
  }
  
  /**
   * Fetch using RSS2JSON service
   */
  private static async fetchWithRSS2JSON(url: string): Promise<FeedResults | null> {
    try {
      log.debug("FetchService", `Attempting RSS2JSON fetch for: ${url}`);
      const feeds = await RSS2JSONService.fetchFeed(url);
      
      if (feeds && feeds.length > 0) {
        log.debug("FetchService", `✅ Successfully fetched ${feeds.length} items using RSS2JSON`);
        
        const feedItems = convertFeedsToFeedItems(feeds);
        const feedResults: FeedResults = {
          feeds: feedItems,
          fetchedAt: new Date().toISOString()
        };
        
        return feedResults;
      }
      
      throw new Error("No feed items found in RSS2JSON response");
    } catch (error) {
      log.error("FetchService", "RSS2JSON fetch failed", error);
      throw error;
    }
  }
  
  /**
   * Direct fetch with no proxy (will fail if CORS is not enabled on the server)
   */
  private static async fetchDirect(url: string): Promise<FeedResults | null> {
    try {
      log.debug("FetchService", `Attempting direct fetch: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml, application/atom+xml, application/json, text/html, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Process the response based on content type
      const contentType = response.headers.get('Content-Type') || '';
      const text = await response.text();
      
      // Parse the feed data
      return await this.parseFeedResponse(text, contentType, url);
    } catch (error) {
      log.error("FetchService", "Direct fetch failed", error);
      throw error;
    }
  }
  
  /**
   * Fetch using service worker proxy
   */
  private static async fetchWithServiceWorker(_url: string): Promise<FeedResults | null> {
    // This would be implemented once service worker is set up
    log.warn("FetchService", "Service Worker fetch not fully implemented");
    throw new Error("Service Worker CORS strategy not implemented");
  }
  
  /**
   * Fetch using JSONP approach
   */
  private static async fetchWithJSONP(_url: string): Promise<FeedResults | null> {
    // This would require a different approach with script injection
    log.warn("FetchService", "JSONP fetch not fully implemented");
    throw new Error("JSONP CORS strategy not implemented");
  }
  
  /**
   * Fetch assuming a browser extension is handling CORS
   */
  private static async fetchWithExtension(url: string): Promise<FeedResults | null> {
    // This assumes a browser extension is already handling CORS
    return this.fetchDirect(url);
  }
  
  /**
   * Fetch using a chain of proxies from settings
   */
  private static async fetchWithProxyChain(url: string): Promise<FeedResults | null> {
    const proxyChain = SettingsIntegrationService.getCORSProxyChain();
    log.debug("FetchService", `Attempting proxy chain with ${proxyChain.length} proxies`);
    
    for (let i = 0; i < proxyChain.length; i++) {
      try {
        const proxy = proxyChain[i];
        let proxyUrl = url;
        
        if (proxy) {
          proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        }
        
        log.debug("FetchService", `Trying proxy ${i+1}: ${proxyUrl}`);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, application/rss+xml, application/atom+xml, application/json, text/html, */*',
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
          },
          signal: AbortSignal.timeout(8000) // 8 second timeout for proxies
        });
        
        if (!response.ok) {
          log.warn("FetchService", `Proxy ${i+1} returned ${response.status}: ${response.statusText}`);
          continue;
        }
        
        // Process the response
        const text = await response.text();
        
        // Handle special proxy formats
        const { content, contentType: actualContentType } = this.extractContentFromProxyResponse(text, proxyUrl);
        
        // Parse the feed data
        return await this.parseFeedResponse(content, actualContentType, url);
      } catch (error) {
        log.warn("FetchService", `Proxy ${i+1} failed:`, error);
        continue;
      }
    }
    
    throw new Error(`All proxies in the chain failed for URL: ${url}`);
  }
  
  /**
   * Extract content from a proxy response (handles different proxy formats)
   */
  private static extractContentFromProxyResponse(textData: string, proxyUrl: string): { content: string, contentType: string } {
    // Check if this is an allorigins response
    if (proxyUrl.includes('allorigins.win')) {
      try {
        const jsonResponse = JSON.parse(textData);
        if (jsonResponse.contents) {
          return {
            content: jsonResponse.contents,
            contentType: 'application/xml' // allorigins typically returns XML feeds
          };
        }
      } catch (error) {
        log.warn("FetchService", 'Failed to parse allorigins response as JSON, treating as raw content');
      }
    }
    
    // Check if this is a codetabs response that might be redirected
    if (proxyUrl.includes('codetabs.com') && textData.includes('Moved Permanently')) {
      throw new Error('Codetabs proxy returned redirect - feed likely not accessible');
    }
    
    // Check if content is base64 encoded (common with some proxies)
    if (textData.startsWith('data:application/') && textData.includes('base64,')) {
      try {
        const base64Data = textData.split('base64,')[1];
        const decodedContent = atob(base64Data);
        const contentType = textData.split(';')[0].replace('data:', '');
        return {
          content: decodedContent,
          contentType: contentType
        };
      } catch (error) {
        log.warn("FetchService", 'Failed to decode base64 content:', error);
      }
    }
    
    // For other proxies, return the raw content
    return {
      content: textData,
      contentType: 'application/xml'
    };
  }
  
  /**
   * Parse a feed response based on content type
   */
  private static async parseFeedResponse(_content: string, _contentType: string, _originalUrl: string): Promise<FeedResults | null> {
    // This would parse the feed using the appropriate parser
    // For now, just throw an error to use the RSS2JSON fallback
    throw new Error("Direct parsing not implemented, falling back to RSS2JSON");
  }
  
  /**
   * Test a specific CORS strategy to see if it works for a given URL
   * This is used by the CORS settings test utility
   * @param url The URL to test
   * @param strategy The specific CORS strategy to test
   * @returns A response object or throws an error if the strategy fails
   */
  static async testCORSStrategy(url: string, strategy: CORSStrategy): Promise<{ success: boolean, data?: any }> {
    log.debug("FetchService", `Testing ${strategy} strategy for ${url}`);
    
    // Force a 10 second timeout for tests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      let testUrl = url;
      
      // Handle special strategies
      switch (strategy) {
        case CORSStrategy.RSS2JSON:
          // Get the first available RSS2JSON service
          const services = SettingsIntegrationService.loadSettings().cors?.services?.rss2json || [];
          if (services.length === 0) {
            throw new Error('No RSS2JSON services configured');
          }
          
          testUrl = `${services[0]}?rss_url=${encodeURIComponent(url)}`;
          break;
          
        case CORSStrategy.SERVICE_WORKER:
          testUrl = `${window.location.origin}/sw-proxy?url=${encodeURIComponent(url)}`;
          break;
          
        case CORSStrategy.JSONP:
          // JSONP requires different approach
          throw new Error('JSONP testing not implemented in test utility');
          
        case CORSStrategy.DIRECT:
          // Use the URL directly
          break;
          
        case CORSStrategy.EXTENSION:
          // Use the URL directly and assume extension is handling CORS
          break;
      }
      
      // Perform the test fetch
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml, application/atom+xml, application/json, text/html, */*',
          'User-Agent': 'Tactical Intel Dashboard Test Utility',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Just check that we can get the response text
      const text = await response.text();
      if (!text || text.length === 0) {
        throw new Error('Empty response received');
      }
      
      // If we get here, the test was successful
      return { 
        success: true,
        data: {
          contentType: response.headers.get('Content-Type'),
          contentLength: text.length
        }
      };
    } catch (error) {
      clearTimeout(timeoutId);
      log.error("FetchService", `Test failed for ${strategy}:`, error);
      throw error;
    }
  }
}
