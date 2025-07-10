// 🧪 COMPREHENSIVE RSS FEED TEST SCRIPT
// Copy and paste this entire script into your browser console

console.clear();
console.log('🚀 Starting comprehensive RSS feed test...');

// Test the updated proxy functionality
const testUpdatedProxy = async (url) => {
  console.log(`\n🔍 Testing updated proxy for: ${url}`);
  
  try {
    // Use the allorigins.win proxy (what our code now uses in development)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    console.log(`📡 Proxy URL: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.contents) {
        console.log(`📄 Content length: ${data.contents.length} chars`);
        console.log(`📝 Content preview: ${data.contents.substring(0, 200)}...`);
        
        // Test XML parsing
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "application/xml");
        const hasErrors = xmlDoc.getElementsByTagName("parsererror").length > 0;
        
        console.log(`✅ XML Valid: ${!hasErrors}`);
        
        if (!hasErrors) {
          const items = xmlDoc.getElementsByTagName("item");
          const entries = xmlDoc.getElementsByTagName("entry");
          console.log(`📰 RSS Items: ${items.length}, Atom Entries: ${entries.length}`);
          
          if (items.length > 0) {
            const title = items[0].getElementsByTagName("title")[0]?.textContent;
            console.log(`📃 First RSS item: ${title}`);
            return { success: true, items: items.length, format: 'RSS' };
          } else if (entries.length > 0) {
            const title = entries[0].getElementsByTagName("title")[0]?.textContent;
            console.log(`📃 First Atom entry: ${title}`);
            return { success: true, items: entries.length, format: 'Atom' };
          }
        } else {
          console.log('❌ XML parsing failed');
          return { success: false, error: 'XML parsing failed' };
        }
      } else {
        console.log('❌ No contents in response');
        return { success: false, error: 'No contents' };
      }
    } else {
      console.log(`❌ HTTP ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Test the app's feed fetching (if available)
const testAppFeedFetching = async (url) => {
  console.log(`\n🏠 Testing app's feed fetching for: ${url}`);
  
  try {
    // This assumes the fetchFeed function is available globally
    // You might need to access it differently depending on your app structure
    if (typeof window.fetchFeed === 'function') {
      const result = await window.fetchFeed(url);
      if (result && result.feeds && result.feeds.length > 0) {
        console.log(`✅ App fetch success: ${result.feeds.length} feeds`);
        console.log(`📃 First feed: ${result.feeds[0].title}`);
        return { success: true, feeds: result.feeds.length };
      } else {
        console.log('❌ App fetch returned no feeds');
        return { success: false, error: 'No feeds returned' };
      }
    } else {
      console.log('ℹ️ App fetchFeed function not available globally');
      return { success: false, error: 'Function not available' };
    }
  } catch (error) {
    console.log(`❌ App fetch error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// List of RSS feeds to test
const testFeeds = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://rss.cnn.com/rss/edition.rss'
];

// Run all tests
const runAllTests = async () => {
  console.log('🎯 Starting proxy tests...');
  
  const results = [];
  
  for (const url of testFeeds) {
    const proxyResult = await testUpdatedProxy(url);
    const appResult = await testAppFeedFetching(url);
    
    results.push({
      url,
      proxy: proxyResult,
      app: appResult
    });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.url}`);
    console.log(`   Proxy: ${result.proxy.success ? '✅ SUCCESS' : '❌ FAILED'} ${result.proxy.success ? `(${result.proxy.items} items, ${result.proxy.format})` : `(${result.proxy.error})`}`);
    console.log(`   App:   ${result.app.success ? '✅ SUCCESS' : '❌ FAILED'} ${result.app.success ? `(${result.app.feeds} feeds)` : `(${result.app.error})`}`);
  });
  
  const proxySuccesses = results.filter(r => r.proxy.success).length;
  const appSuccesses = results.filter(r => r.app.success).length;
  
  console.log(`\n🎯 OVERALL RESULTS:`);
  console.log(`   Proxy Success Rate: ${proxySuccesses}/${results.length} (${Math.round(proxySuccesses/results.length*100)}%)`);
  console.log(`   App Success Rate: ${appSuccesses}/${results.length} (${Math.round(appSuccesses/results.length*100)}%)`);
  
  if (proxySuccesses === results.length) {
    console.log('\n🎉 ALL PROXY TESTS PASSED! The RSS feed issue should be resolved.');
  } else {
    console.log('\n⚠️ Some proxy tests failed. The RSS feeds may still have issues.');
  }
};

// Start the tests
runAllTests();
