/**
 * Debug Modern Feed Service - Test Script
 * This script tests if the Modern Feed Service is working correctly
 */

import { modernFeedService } from '../services/ModernFeedService.js';

console.log('🔍 Testing Modern Feed Service...');

// Test the service
modernFeedService.fetchAllIntelligenceData()
  .then(result => {
    console.log('✅ Modern Feed Service Result:');
    console.log('- Feeds count:', result.feeds.length);
    console.log('- Fetched at:', result.fetchedAt);
    
    if (result.feeds.length > 0) {
      console.log('📄 Sample feed:');
      const sample = result.feeds[0];
      console.log('  - Title:', sample.title);
      console.log('  - Description:', sample.description?.substring(0, 100) + '...');
      console.log('  - Source:', sample.author);
      console.log('  - Link:', sample.link);
      console.log('  - Priority:', sample.priority);
      console.log('  - Tags:', sample.tags);
    }
  })
  .catch(error => {
    console.error('❌ Modern Feed Service Error:', error);
  });
