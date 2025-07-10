import { fetchFeed } from './src/utils/fetchFeed.js';

// Test the actual RSS feeds that are failing
const testRSSFeeds = async () => {
  console.log('Testing actual RSS feeds...');
  
  const testUrls = [
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.npr.org/rss/rss.php?id=1001'
  ];
  
  for (const url of testUrls) {
    console.log(`\n--- Testing ${url} ---`);
    try {
      const result = await fetchFeed(url);
      if (result && result.feeds && result.feeds.length > 0) {
        console.log(`✅ SUCCESS: Got ${result.feeds.length} feeds from ${url}`);
        console.log('First feed:', result.feeds[0]);
      } else {
        console.log(`❌ FAILED: No feeds returned from ${url}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: Failed to fetch ${url}:`, error.message);
    }
  }
};

// Test individual URL
const testSingleFeed = async (url) => {
  console.log(`\n--- Testing individual feed: ${url} ---`);
  try {
    const response = await fetch(`/api/proxy-feed?url=${encodeURIComponent(url)}`);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Content-Type:', contentType);
    console.log('Content preview:', text.substring(0, 500));
    
    if (response.ok) {
      console.log('✅ Proxy response OK');
    } else {
      console.log('❌ Proxy response failed');
    }
  } catch (error) {
    console.log('❌ Proxy test error:', error.message);
  }
};

// Run tests
testRSSFeeds();
testSingleFeed('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
