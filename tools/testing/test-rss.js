// Quick test to verify RSS feed parsing works
const testRSSFeed = async () => {
  console.log('Testing RSS feed parsing...');
  
  // Test with a simple RSS feed
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test RSS Feed</title>
    <link>https://example.com</link>
    <description>Test RSS Feed Description</description>
    <item>
      <title>Test Article 1</title>
      <link>https://example.com/article1</link>
      <description>This is a test article</description>
      <pubDate>Mon, 07 Jan 2025 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Test Article 2</title>
      <link>https://example.com/article2</link>
      <description>This is another test article</description>
      <pubDate>Sun, 06 Jan 2025 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

  // Test XML parsing
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rssXml, "application/xml");
  
  console.log('XML Document:', xmlDoc);
  console.log('RSS Items:', xmlDoc.getElementsByTagName("item"));
  console.log('Number of items:', xmlDoc.getElementsByTagName("item").length);
  
  // Test if the XML is valid
  const hasErrors = xmlDoc.getElementsByTagName("parsererror").length > 0;
  console.log('Has parsing errors:', hasErrors);
  
  if (!hasErrors) {
    console.log('RSS feed parsing test: PASSED');
  } else {
    console.log('RSS feed parsing test: FAILED');
  }
};

// Run the test
testRSSFeed();
