#!/usr/bin/env node

/**
 * 🚀 PROXY-FREE RSS TEST
 * Test the RSS2JSON service without any proxy deployment
 */

const testFeeds = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://rss.cnn.com/rss/edition.rss',
  'https://feeds.reuters.com/reuters/topNews',
  'https://feeds.npr.org/1001/rss.xml',
];

// Simple fetch function to test RSS2JSON APIs
async function testRSS2JSON(rssUrl) {
  const apis = [
    'https://api.rss2json.com/v1/api.json',
    'https://api.rss.app/v1/feed/json',
    'https://feed2json.org/convert',
  ];

  console.log(`\n🔄 Testing RSS2JSON for: ${rssUrl}`);
  
  for (let i = 0; i < apis.length; i++) {
    const apiUrl = buildApiUrl(apis[i], rssUrl);
    console.log(`📡 Trying API ${i + 1}: ${apis[i]}`);
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || (data.status && data.status !== 'ok')) {
        throw new Error(data.message || 'Invalid response from RSS API');
      }

      const items = data.items || data.entries || [];
      
      if (items.length === 0) {
        throw new Error('No feed items found in response');
      }

      console.log(`✅ Success! Found ${items.length} items from ${apis[i]}`);
      console.log(`📋 First item: ${items[0].title || 'No title'}`);
      return { success: true, items: items.length, api: apis[i] };

    } catch (error) {
      console.warn(`❌ API ${i + 1} failed:`, error.message);
    }
  }

  return { success: false, error: 'All APIs failed' };
}

function buildApiUrl(apiBase, rssUrl) {
  const encodedUrl = encodeURIComponent(rssUrl);
  
  switch (apiBase) {
    case 'https://api.rss2json.com/v1/api.json':
      return `${apiBase}?rss_url=${encodedUrl}&count=20`;
    case 'https://api.rss.app/v1/feed/json':
      return `${apiBase}?url=${encodedUrl}`;
    case 'https://feed2json.org/convert':
      return `${apiBase}?url=${encodedUrl}`;
    default:
      return `${apiBase}?url=${encodedUrl}`;
  }
}

// Run tests
async function runTests() {
  console.log('🎯 PROXY-FREE RSS SOLUTION TEST');
  console.log('================================');
  console.log('Testing RSS2JSON APIs (No proxy deployment required!)');
  
  const results = [];
  
  for (const feedUrl of testFeeds) {
    const result = await testRSS2JSON(feedUrl);
    results.push({ url: feedUrl, ...result });
    
    // Add delay between requests to be polite
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 SUMMARY');
  console.log('===========');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 SUCCESS! Proxy-free RSS solution works!');
    console.log('Your app can now fetch RSS feeds without any proxy deployment.');
    console.log('\nWorking feeds:');
    successful.forEach(r => {
      console.log(`  • ${r.url} (${r.items} items via ${r.api})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️  Some feeds failed:');
    failed.forEach(r => {
      console.log(`  • ${r.url} - ${r.error}`);
    });
  }
  
  if (successful.length === 0) {
    console.log('\n❌ All feeds failed. You may need to use a proxy solution.');
  }
}

// Handle Node.js vs browser environment
if (typeof fetch === 'undefined') {
  // Node.js environment - need to install node-fetch
  console.log('Installing node-fetch for testing...');
  const { exec } = require('child_process');
  exec('npm install node-fetch', (error) => {
    if (error) {
      console.error('Please install node-fetch: npm install node-fetch');
      process.exit(1);
    }
    
    // Import fetch and run tests
    import('node-fetch').then(({ default: fetch }) => {
      global.fetch = fetch;
      runTests();
    });
  });
} else {
  // Browser environment
  runTests();
}
