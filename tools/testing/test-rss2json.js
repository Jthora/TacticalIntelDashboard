#!/usr/bin/env node

/**
 * Test RSS2JSON API functionality
 */

const testFeeds = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://www.npr.org/rss/rss.php?id=1001',
  'https://rss.cnn.com/rss/edition.rss',
  'https://www.reddit.com/r/news/.rss',
  'https://www.aljazeera.com/xml/rss/all.xml'
];

const RSS2JSON_APIS = [
  'https://api.rss2json.com/v1/api.json',
  'https://api.rss.app/v1/feed/json',
  'https://feed2json.org/convert',
];

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

async function testRSS2JSONService() {
  console.log('🧪 Testing RSS2JSON Service');
  console.log('============================\n');

  for (const feedUrl of testFeeds) {
    console.log(`📡 Testing feed: ${feedUrl}`);
    
    for (let i = 0; i < RSS2JSON_APIS.length; i++) {
      const apiBase = RSS2JSON_APIS[i];
      const apiUrl = buildApiUrl(apiBase, feedUrl);
      
      try {
        console.log(`  API ${i + 1}: ${apiBase}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validate response
        if (!data || (data.status && data.status !== 'ok')) {
          throw new Error(data.message || 'Invalid response from RSS API');
        }

        // Check for items
        const itemCount = data.items ? data.items.length : 0;
        console.log(`    ✅ Success: ${itemCount} items`);
        
        if (itemCount > 0) {
          console.log(`    📄 Sample title: "${data.items[0].title}"`);
          break; // Success, no need to try other APIs for this feed
        }

      } catch (error) {
        console.log(`    ❌ Failed: ${error.message}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
}

// Run the test
testRSS2JSONService().catch(console.error);
