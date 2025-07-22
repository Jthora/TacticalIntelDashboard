// AWS Lambda@Edge RSS Proxy
// Deploy this to AWS Lambda@Edge for enterprise-grade global RSS proxying

exports.handler = async (event) => {
  const { request } = event.Records[0].cf;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
        'access-control-allow-methods': [{ key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' }],
        'access-control-allow-headers': [{ key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }],
      },
    };
  }

  try {
    const querystring = request.querystring;
    const params = new URLSearchParams(querystring);
    const targetUrl = params.get('url');

    if (!targetUrl) {
      return {
        status: '400',
        statusDescription: 'Bad Request',
        headers: {
          'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
          'content-type': [{ key: 'Content-Type', value: 'application/json' }],
        },
        body: JSON.stringify({ error: 'Missing url parameter' }),
      };
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return {
        status: '400',
        statusDescription: 'Bad Request',
        headers: {
          'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
          'content-type': [{ key: 'Content-Type', value: 'application/json' }],
        },
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    // Security: Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        status: '400',
        statusDescription: 'Bad Request',
        headers: {
          'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
          'content-type': [{ key: 'Content-Type', value: 'application/json' }],
        },
        body: JSON.stringify({ error: 'Only HTTP and HTTPS protocols are allowed' }),
      };
    }

    console.log(`Proxying request to: ${targetUrl}`);

    // Use AWS SDK's fetch or import node-fetch for Lambda@Edge
    const fetch = require('node-fetch');

    // Fetch the RSS feed with proper headers
    const feedResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Proxy/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!feedResponse.ok) {
      console.error(`Feed fetch failed: ${feedResponse.status} ${feedResponse.statusText}`);
      return {
        status: feedResponse.status.toString(),
        statusDescription: feedResponse.statusText,
        headers: {
          'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
          'content-type': [{ key: 'Content-Type', value: 'application/json' }],
        },
        body: JSON.stringify({ 
          error: `Failed to fetch feed: ${feedResponse.status} ${feedResponse.statusText}`,
          url: targetUrl
        }),
      };
    }

    // Get the response body
    const feedContent = await feedResponse.text();
    let contentType = feedResponse.headers.get('content-type') || 'application/xml';

    // Enhanced content type detection
    if (feedContent.includes('<?xml') || feedContent.includes('<rss') || feedContent.includes('<feed')) {
      contentType = 'application/xml; charset=utf-8';
    }

    console.log(`Successfully fetched ${feedContent.length} bytes from ${targetUrl}`);

    // Return the feed content with CORS headers
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
        'access-control-allow-methods': [{ key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' }],
        'access-control-allow-headers': [{ key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }],
        'content-type': [{ key: 'Content-Type', value: contentType }],
        'cache-control': [{ key: 'Cache-Control', value: 'public, max-age=300' }],
        'x-proxy-url': [{ key: 'X-Proxy-URL', value: targetUrl }],
        'x-proxy-status': [{ key: 'X-Proxy-Status', value: 'success' }],
        'x-powered-by': [{ key: 'X-Powered-By', value: 'AWS-Lambda@Edge' }],
      },
      body: feedContent,
    };

  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      status: '500',
      statusDescription: 'Internal Server Error',
      headers: {
        'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
        'content-type': [{ key: 'Content-Type', value: 'application/json' }],
      },
      body: JSON.stringify({ 
        error: 'Internal proxy error',
        message: error.message
      }),
    };
  }
};
