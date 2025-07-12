/**
 * Cache Clear Utility - Remove Fake Intelligence Sources
 * This utility clears localStorage to remove any cached fake sources
 * and shows what real sources should be displayed
 */

export class CacheClearUtility {
  
  /**
   * Clear all cached intelligence data to remove fake sources
   */
  static clearIntelligenceCache(): boolean {
    try {
      // Clear the problematic cached sources
      localStorage.removeItem('tactical-intel-sources');
      localStorage.removeItem('tactical-intel-items');
      localStorage.removeItem('feeds');
      localStorage.removeItem('feedLists');
      
      console.log('✅ Cleared intelligence cache - fake sources removed');
      
      // Log what should be displayed
      console.log('📋 Valid sources that should appear:');
      console.log('- NOAA Weather Alerts (weather.gov API)');
      console.log('- USGS Earthquake Data (earthquake.usgs.gov API)');
      console.log('- GitHub Security Advisories (api.github.com)');
      console.log('- Hacker News Technology (hacker-news.firebaseio.com)');
      console.log('- Cryptocurrency Intelligence (api.coingecko.com)');
      console.log('- Reddit discussions (reddit.com APIs)');
      
      console.log('❌ Fake sources that should NOT appear:');
      console.log('- FBI IC3 Cyber Alerts (fake - no RSS feed)');
      console.log('- DHS Cybersecurity Advisories (fake - no working RSS)');
      console.log('- Any military/classified sources (fake)');
      
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
  
  /**
   * Check if fake sources are still cached
   */
  static checkForFakeSources(): boolean {
    try {
      const cachedSources = localStorage.getItem('tactical-intel-sources');
      if (cachedSources) {
        const sources = JSON.parse(cachedSources);
        const fakeSourceNames = ['FBI IC3', 'DHS Cybersecurity', 'IC3 Cyber Alerts'];
        
        const foundFake = sources.some((source: any) => 
          fakeSourceNames.some(fake => source.name?.includes(fake))
        );
        
        if (foundFake) {
          console.warn('⚠️ Fake sources detected in cache!');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking for fake sources:', error);
      return false;
    }
  }
  
  /**
   * Get list of real sources that should be displayed
   */
  static getRealSourcesList(): string[] {
    return [
      'NOAA Weather Alerts',
      'USGS Earthquake Data', 
      'GitHub Security Advisories',
      'Hacker News Technology',
      'Cryptocurrency Intelligence',
      'Reddit World News',
      'Reddit Technology',
      'Reddit Security',
      'Reddit Cryptocurrency'
    ];
  }
}

// Auto-check for fake sources on import
if (typeof window !== 'undefined') {
  CacheClearUtility.checkForFakeSources();
}
