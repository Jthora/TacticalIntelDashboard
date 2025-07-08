// Test script to verify proxy functionality
// Paste this into browser console to test

const testProxy = async () => {
  console.log('🧪 Testing proxy functionality...');
  
  const testUrl = 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(testUrl)}`;
  
  try {
    console.log(`📡 Testing proxy: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Proxy response structure:', Object.keys(data));
      
      if (data.contents) {
        console.log(`📄 Content length: ${data.contents.length} chars`);
        console.log(`📝 Content preview: ${data.contents.substring(0, 300)}...`);
        
        // Test if it's valid XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "application/xml");
        const hasErrors = xmlDoc.getElementsByTagName("parsererror").length > 0;
        
        console.log(`✅ XML Valid: ${!hasErrors}`);
        
        if (!hasErrors) {
          const items = xmlDoc.getElementsByTagName("item");
          console.log(`📰 RSS Items found: ${items.length}`);
          
          if (items.length > 0) {
            const firstItem = items[0];
            const title = firstItem.getElementsByTagName("title")[0]?.textContent;
            console.log(`📃 First item title: ${title}`);
          }
        }
        
        return data.contents;
      } else {
        console.error('❌ No contents in proxy response');
      }
    } else {
      console.error(`❌ Proxy request failed: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testProxy();
