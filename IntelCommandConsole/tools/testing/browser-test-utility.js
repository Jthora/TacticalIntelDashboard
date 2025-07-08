// Browser console test utility for RSS feed parsing
// Copy and paste this into your browser's developer console

console.log('🧪 RSS Feed Parsing Test Utility Loaded');

// Test function for base64 decoding
window.testBase64Decode = function(base64String) {
  try {
    if (base64String.startsWith('data:application/') && base64String.includes('base64,')) {
      const base64Data = base64String.split('base64,')[1];
      const decoded = atob(base64Data);
      console.log('✅ Base64 decode successful');
      console.log('Preview:', decoded.substring(0, 200) + '...');
      return decoded;
    } else {
      console.log('❌ Not a valid base64 data URL');
      return null;
    }
  } catch (error) {
    console.error('❌ Base64 decode failed:', error);
    return null;
  }
};

// Test function for XML parsing
window.testXMLParsing = function(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    
    const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
    if (parserError) {
      console.error('❌ XML parsing error:', parserError.textContent);
      return null;
    }
    
    const hasRssStructure = xmlDoc.getElementsByTagName("rss").length > 0 || 
                           xmlDoc.getElementsByTagName("channel").length > 0 || 
                           xmlDoc.getElementsByTagName("item").length > 0;
    const hasAtomStructure = xmlDoc.getElementsByTagName("feed").length > 0 || 
                            xmlDoc.getElementsByTagName("entry").length > 0;
    
    console.log('✅ XML parsing successful');
    console.log('RSS structure found:', hasRssStructure);
    console.log('Atom structure found:', hasAtomStructure);
    console.log('Items/Entries found:', xmlDoc.getElementsByTagName("item").length + xmlDoc.getElementsByTagName("entry").length);
    
    return xmlDoc;
  } catch (error) {
    console.error('❌ XML parsing failed:', error);
    return null;
  }
};

// Test function to fetch and analyze a feed
window.testFeedFetch = async function(feedUrl) {
  console.log(`🔍 Testing feed: ${feedUrl}`);
  
  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
    `https://cors-anywhere.herokuapp.com/${feedUrl}`
  ];
  
  for (let i = 0; i < proxies.length; i++) {
    console.log(`Testing proxy ${i + 1}: ${proxies[i].split('?')[0]}...`);
    
    try {
      const response = await fetch(proxies[i], {
        signal: AbortSignal.timeout(8000)
      });
      
      if (!response.ok) {
        console.log(`❌ Proxy ${i + 1} returned ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const text = await response.text();
      console.log(`✅ Proxy ${i + 1} successful. Content length: ${text.length}`);
      
      // Check if it's base64 encoded
      if (text.startsWith('data:application/') && text.includes('base64,')) {
        console.log('🔄 Decoding base64 content...');
        const decoded = window.testBase64Decode(text);
        if (decoded) {
          window.testXMLParsing(decoded);
        }
      }
      // Check if it's JSON wrapped (allorigins)
      else if (text.startsWith('{') && text.includes('"contents"')) {
        console.log('🔄 Extracting JSON wrapped content...');
        try {
          const json = JSON.parse(text);
          if (json.contents) {
            window.testXMLParsing(json.contents);
          }
        } catch (e) {
          console.error('❌ Failed to parse JSON wrapper:', e);
        }
      }
      // Check if it's direct XML
      else if (text.includes('<?xml') || text.includes('<rss') || text.includes('<feed')) {
        console.log('🔄 Testing direct XML content...');
        window.testXMLParsing(text);
      } else {
        console.log('❓ Unknown content format. Preview:', text.substring(0, 100) + '...');
      }
      
      break; // Success, no need to try other proxies
      
    } catch (error) {
      console.log(`❌ Proxy ${i + 1} failed:`, error.message);
    }
  }
};

// Quick test with a known working feed
console.log('💡 Usage examples:');
console.log('testFeedFetch("https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml")');
console.log('testBase64Decode("data:application/xml;base64,PD94bWw...")');
console.log('testXMLParsing("<rss>...</rss>")');

// Auto-test if a feed URL is in the current page
if (window.location.href.includes('localhost')) {
  console.log('🚀 Ready to test RSS feeds in development environment!');
}
