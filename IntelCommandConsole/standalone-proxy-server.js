const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

// RSS Proxy endpoint
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Security: Only allow HTTP/HTTPS
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ 
      error: 'Only HTTP and HTTPS protocols are allowed' 
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Proxy/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Feed fetch failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `Failed to fetch feed: ${response.status} ${response.statusText}`,
        url: url
      });
    }

    const feedContent = await response.text();
    let contentType = response.headers.get('content-type') || 'application/xml';

    // Enhanced content type detection
    if (feedContent.includes('<?xml') || feedContent.includes('<rss') || feedContent.includes('<feed')) {
      contentType = 'application/xml; charset=utf-8';
    } else if (feedContent.trim().startsWith('{') || feedContent.trim().startsWith('[')) {
      contentType = 'application/json; charset=utf-8';
    }

    console.log(`[${new Date().toISOString()}] Successfully fetched ${feedContent.length} bytes from ${url}`);

    // Set response headers
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'X-Proxy-URL': url,
      'X-Proxy-Status': 'success',
      'X-Content-Length': feedContent.length.toString(),
    });
    
    res.send(feedContent);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Proxy error for ${url}:`, error.message);
    
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message,
      url: url
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Use /proxy?url=<RSS_URL> to proxy RSS feeds'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RSS Proxy Server running on port ${PORT}`);
  console.log(`📡 Use: http://localhost:${PORT}/proxy?url=<RSS_URL>`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
