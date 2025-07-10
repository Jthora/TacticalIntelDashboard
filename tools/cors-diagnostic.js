/**
 * CORS Diagnostic Tool
 * Tests RSS feeds and other endpoints with various CORS proxies and services
 * 
 * Usage: node cors-diagnostic.js https://example.com/feed.xml
 */

const fetch = require('node-fetch');

// RSS/Feed converter services
const RSS2JSON_SERVICES = [
  'https://rss2json.vercel.app/api',
  'https://api.rss2json.com/v1/api.json',
  'https://feed2json.org/convert',
  'https://rss-to-json-serverless-api.vercel.app/api/convert',
  'https://rss-converter.herokuapp.com/api/feed',
];

// CORS proxies
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/get?url=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?',
  'https://proxy.cors.sh/',
];

async function testEndpoint(url) {
  console.log(`\n🔍 Testing feed URL: ${url}\n`);
  
  // Test direct fetch first (from Node.js - no CORS issues here)
  console.log('⚡ Direct fetch:');
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`✅ Success: HTTP ${response.status}`);
      const contentType = response.headers.get('content-type');
      console.log(`📄 Content-Type: ${contentType}`);
      const text = await response.text();
      console.log(`📝 First 150 chars: ${text.substring(0, 150)}...`);
    } else {
      console.log(`❌ Failed: HTTP ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test each RSS2JSON service
  console.log('\n🔄 Testing RSS2JSON services:');
  for (const service of RSS2JSON_SERVICES) {
    let serviceUrl;
    try {
      if (service.includes('rss2json.vercel.app')) {
        serviceUrl = `${service}?url=${encodeURIComponent(url)}`;
      } else if (service.includes('api.rss2json.com')) {
        serviceUrl = `${service}?rss_url=${encodeURIComponent(url)}`;
      } else {
        serviceUrl = `${service}?url=${encodeURIComponent(url)}`;
      }
      
      console.log(`\n🌐 ${service}`);
      console.log(`📡 Testing: ${serviceUrl}`);
      
      const response = await fetch(serviceUrl);
      if (response.ok) {
        console.log(`✅ Success: HTTP ${response.status}`);
        const data = await response.json();
        
        // Check what type of response we got
        if (data.items && Array.isArray(data.items)) {
          console.log(`📊 Found ${data.items.length} feed items`);
          if (data.items.length > 0) {
            console.log(`🔤 First item title: ${data.items[0].title}`);
          }
        } else if (data.status === 'error') {
          console.log(`❌ API error: ${data.message}`);
        } else {
          console.log(`⚠️ Unknown response format`);
        }
      } else {
        console.log(`❌ Failed: HTTP ${response.status} - ${response.statusText}`);
        try {
          const errorText = await response.text();
          console.log(`🔴 Error details: ${errorText.substring(0, 150)}...`);
        } catch (e) {
          console.log(`🔴 Could not read error details`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Test each CORS proxy
  console.log('\n🛡️ Testing CORS proxies:');
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      console.log(`\n🌐 ${proxy}`);
      console.log(`📡 Testing: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl);
      if (response.ok) {
        console.log(`✅ Success: HTTP ${response.status}`);
        const contentType = response.headers.get('content-type');
        console.log(`📄 Content-Type: ${contentType}`);
        
        // Handle different proxy response formats
        if (contentType && contentType.includes('application/json')) {
          try {
            const json = await response.json();
            if (json.contents) {
              console.log(`📝 First 150 chars: ${json.contents.substring(0, 150)}...`);
            } else {
              console.log(`📝 JSON response but no 'contents' field found`);
            }
          } catch (e) {
            console.log(`❌ Error parsing JSON: ${e.message}`);
          }
        } else {
          const text = await response.text();
          console.log(`📝 First 150 chars: ${text.substring(0, 150)}...`);
        }
      } else {
        console.log(`❌ Failed: HTTP ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✨ Testing complete');
}

// Main execution
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.log('Usage: node cors-diagnostic.js <url>');
    console.log('Example: node cors-diagnostic.js https://rss.cnn.com/rss/edition.rss');
    process.exit(1);
  }
  
  await testEndpoint(url);
})();
