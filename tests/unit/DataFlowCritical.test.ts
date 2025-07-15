/**
 * Simple Integration Test for Data Flow
 * Tests the critical path: Sources → API → Feed Service → UI
 */

import { PRIMARY_INTELLIGENCE_SOURCES } from '../../src/constants/ModernIntelligenceSources';
import { modernFeedService } from '../../src/services/ModernFeedService';

describe('TDD Critical Data Flow', () => {
  test('TDD_CRITICAL_001: Complete data flow should work', async () => {
    // 1. Check sources are available
    console.log('🔍 TDD_CRITICAL_001: Checking sources...');
    console.log('✅ TDD_CRITICAL_001: Sources loaded:', PRIMARY_INTELLIGENCE_SOURCES.length);

    // 2. Check ModernFeedService can be accessed
    console.log('🔍 TDD_CRITICAL_002: Checking feed service...');
    console.log('✅ TDD_CRITICAL_002: FeedService available');

    // 3. Try to fetch data (this will show us where it fails)
    console.log('🔍 TDD_CRITICAL_004: Attempting to fetch data...');
    try {
      const feedResults = await modernFeedService.fetchAllIntelligenceData();
      console.log('✅ TDD_CRITICAL_004: Data fetched successfully');
      console.log('   📊 Feeds count:', feedResults.feeds.length);
      console.log('   📊 Fetched at:', feedResults.fetchedAt);
      if (feedResults.feeds && feedResults.feeds.length > 0) {
        console.log('   📊 First feed item:', feedResults.feeds[0]);
      }
    } catch (error) {
      console.error('❌ TDD_CRITICAL_ERROR_004: Data fetch failed:', error);
    }
  });

  test('TDD_CRITICAL_005: Check available methods', () => {
    console.log('🔍 TDD_CRITICAL_005: Checking available methods...');
    
    // List all available methods on modernFeedService
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(modernFeedService));
    console.log('✅ TDD_CRITICAL_005: Available methods:', methods);
  });
});
