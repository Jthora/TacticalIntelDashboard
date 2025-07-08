// Cloudflare Worker RSS Proxy
// Deploy this to Cloudflare Workers for reliable CORS-free RSS fetching

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      const url = new URL(request.url);
      const targetUrl = url.searchParams.get('url');

      if (!targetUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing url parameter' }),
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Validate URL
      let parsedUrl;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid URL format' }),
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Security: Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return new Response(
          JSON.stringify({ error: 'Only HTTP and HTTPS protocols are allowed' }),
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            }
          }
        );
      }

      console.log(`Proxying request to: ${targetUrl}`);

      // Fetch the RSS feed with proper headers
      const feedResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Proxy/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
          'Cache-Control': 'no-cache',
        },
        // Cloudflare Workers have built-in timeout protection
      });

      if (!feedResponse.ok) {
        console.error(`Feed fetch failed: ${feedResponse.status} ${feedResponse.statusText}`);
        return new Response(
          JSON.stringify({ 
            error: `Failed to fetch feed: ${feedResponse.status} ${feedResponse.statusText}`,
            url: targetUrl
          }),
          { 
            status: feedResponse.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            }
          }
        );
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
      return new Response(feedContent, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'X-Proxy-URL': targetUrl,
          'X-Proxy-Status': 'success',
          'X-Powered-By': 'Cloudflare-Workers',
        },
      });

    } catch (error) {
      console.error('Proxy error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal proxy error',
          message: error.message
        }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      );
    }
  },
};
