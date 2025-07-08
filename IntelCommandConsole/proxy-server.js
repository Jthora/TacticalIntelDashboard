const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 8081;

// Enable CORS for all origins
app.use(cors());

// Proxy endpoint
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    console.log(`Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TacticalIntelBot/1.0 (+http://localhost:5173)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
      },
    });

    if (!response.ok) {
      console.error(`Feed fetch failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `Failed to fetch feed: ${response.status} ${response.statusText}`,
        url: url
      });
    }

    const feedContent = await response.text();
    const contentType = response.headers.get('content-type') || 'application/xml';

    console.log(`Successfully fetched ${feedContent.length} bytes from ${url}`);

    // Return the feed content with proper headers
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300',
      'X-Proxy-URL': url,
      'X-Proxy-Status': 'success',
    });
    
    res.send(feedContent);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RSS Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Use: http://localhost:${PORT}/proxy?url=<RSS_URL>`);
});
