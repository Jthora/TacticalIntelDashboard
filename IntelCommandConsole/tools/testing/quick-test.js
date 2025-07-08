// 🚀 QUICK RSS TEST - Paste this in browser console
const quickTest = async () => {
  const url = 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  
  console.log('🧪 Quick RSS test starting...');
  console.log(`📡 Testing: ${url}`);
  
  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.contents) {
      console.log(`✅ SUCCESS! Got ${data.contents.length} characters`);
      console.log(`📰 Content starts with: ${data.contents.substring(0, 100)}...`);
      
      // Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, "application/xml");
      const items = xmlDoc.getElementsByTagName("item");
      
      console.log(`📃 Found ${items.length} RSS items`);
      
      if (items.length > 0) {
        const firstTitle = items[0].getElementsByTagName("title")[0]?.textContent;
        console.log(`📰 First article: ${firstTitle}`);
        return true;
      }
    }
    
    console.log('❌ No content found');
    return false;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
};

quickTest();
