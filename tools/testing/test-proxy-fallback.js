#!/usr/bin/env node

/**
 * Test RSS feed parsing with simpler, more reliable feeds
 */

const testFeeds = [
  // Simpler feeds that are more likely to work
  'https://feeds.feedburner.com/TechCrunch',
  'https://rss.cnn.com/rss/edition.rss',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.theguardian.com/world/rss',
  'https://feeds.reuters.com/reuters/topNews',
];

const PROXY_URLS = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/get?url=',
  'https://thingproxy.freeboard.io/fetch/',
];

async function testProxyFeed(feedUrl, proxyUrl) {
  try {
    const fullUrl = `${proxyUrl}${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/xml,application/rss+xml,application/atom+xml,text/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    
    // Check if it's a JSON wrapper (like allorigins)
    if (data.startsWith('{') && data.includes('"contents"')) {
      const jsonData = JSON.parse(data);
      const xmlContent = jsonData.contents;
      
      if (xmlContent && xmlContent.includes('<rss') || xmlContent.includes('<feed')) {
        return { success: true, itemCount: (xmlContent.match(/<item>/g) || []).length };
      }
    }
    
    // Check if it's direct XML
    if (data.includes('<rss') || data.includes('<feed')) {
      return { success: true, itemCount: (data.match(/<item>/g) || []).length };
    }
    
    throw new Error('No valid RSS content found');
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testFeedProxies() {
  console.log('🧪 Testing RSS Feed Proxies');
  console.log('===========================\n');

  for (const feedUrl of testFeeds) {
    console.log(`📡 Testing feed: ${feedUrl}`);
    
    let successCount = 0;
    
    for (let i = 0; i < PROXY_URLS.length; i++) {
      const proxyUrl = PROXY_URLS[i];
      const proxyName = proxyUrl.split('//')[1].split('/')[0];
      
      const result = await testProxyFeed(feedUrl, proxyUrl);
      
      if (result.success) {
        console.log(`  ✅ ${proxyName}: ${result.itemCount} items`);
        successCount++;
      } else {
        console.log(`  ❌ ${proxyName}: ${result.error}`);
      }
    }
    
    if (successCount === 0) {
      console.log('  ⚠️  No proxy worked for this feed');
    }
    
    console.log(''); // Empty line
  }
}

// Run the test
testFeedProxies().catch(console.error);
