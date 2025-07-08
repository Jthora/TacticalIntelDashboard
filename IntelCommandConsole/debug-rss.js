// Debug RSS feed fetching - paste this into browser console
const debugRSSFeed = async (url) => {
  console.log(`🔍 Debugging RSS feed: ${url}`);
  
  try {
    // Test the proxy directly
    const proxyUrl = `/api/proxy-feed?url=${encodeURIComponent(url)}`;
    console.log(`📡 Proxy URL: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📄 Content-Type: ${contentType}`);
    console.log(`📏 Content Length: ${text.length} chars`);
    console.log(`📝 Content Preview:`);
    console.log(text.substring(0, 300) + '...');
    
    // Test if it's valid XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    const hasErrors = xmlDoc.getElementsByTagName("parsererror").length > 0;
    
    console.log(`✅ XML Valid: ${!hasErrors}`);
    
    if (!hasErrors) {
      const items = xmlDoc.getElementsByTagName("item");
      const entries = xmlDoc.getElementsByTagName("entry");
      console.log(`📰 RSS Items: ${items.length}`);
      console.log(`📰 Atom Entries: ${entries.length}`);
      
      if (items.length > 0) {
        console.log('📃 First RSS item:', items[0]);
      }
      if (entries.length > 0) {
        console.log('📃 First Atom entry:', entries[0]);
      }
    } else {
      console.log('❌ XML Parsing Error:', xmlDoc.getElementsByTagName("parsererror")[0]);
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error);
  }
};

// Test the problematic feeds
const testFeeds = [
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://www.npr.org/rss/rss.php?id=1001'
];

console.log('🚀 RSS Feed Debug Helper Loaded');
console.log('Usage: debugRSSFeed("https://example.com/feed.xml")');
console.log('Or test all: testFeeds.forEach(url => debugRSSFeed(url))');

// Auto-test the first feed
debugRSSFeed(testFeeds[0]);
