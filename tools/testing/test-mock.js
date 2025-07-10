// 🧪 TEST MOCK DATA - Paste this in browser console
console.clear();
console.log('🧪 Testing mock data fallback...');

// Test if the mock data is accessible
try {
  // This should work if the import system supports it
  import('./src/utils/mockData.js').then(({ createMockFeedResults }) => {
    console.log('✅ Mock data module loaded successfully');
    
    const testUrl = 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
    const mockResult = createMockFeedResults(testUrl);
    
    console.log('📦 Mock feed result:', mockResult);
    console.log(`📰 Mock feeds count: ${mockResult.feeds.length}`);
    
    if (mockResult.feeds.length > 0) {
      console.log(`📃 First mock article: ${mockResult.feeds[0].title}`);
      console.log('🎉 Mock data system working correctly!');
    }
  }).catch(error => {
    console.log('❌ Could not load mock data module:', error);
    
    // Manual test with inline data
    const mockFeeds = [
      {
        id: 'manual-mock-1',
        title: 'Manual Test Article',
        link: 'https://example.com/test',
        pubDate: new Date().toISOString(),
        description: 'This is a manually created mock article for testing.',
        content: 'Test content',
        feedListId: '1',
        author: 'Test Author',
        categories: ['Test'],
        media: [],
      }
    ];
    
    console.log('📦 Manual mock data:', mockFeeds);
    console.log('✅ Manual mock data created successfully');
  });
} catch (error) {
  console.log('❌ Error testing mock data:', error);
}

// Test current environment
console.log('🔍 Environment info:');
console.log(`- Development mode: ${import.meta?.env?.DEV || 'unknown'}`);
console.log(`- Production mode: ${import.meta?.env?.PROD || 'unknown'}`);
console.log(`- Current URL: ${window.location.href}`);

// Test if RSS feeds are working
console.log('\n🌐 Testing RSS feed access...');
setTimeout(() => {
  // Check if any feeds loaded
  const feedElements = document.querySelectorAll('[data-testid="feed-item"], .feed-item, .news-item');
  console.log(`📊 Found ${feedElements.length} feed elements on page`);
  
  if (feedElements.length === 0) {
    console.log('ℹ️ No feed elements found. This might indicate RSS feeds are not loading.');
    console.log('🔄 The mock data fallback should provide content for development.');
  } else {
    console.log('✅ Feed elements found on page!');
  }
}, 2000);
