/**
 * Vercel Edge Function to proxy RSS feeds and bypass CORS
 * Replaces the need for a persistent CORS proxy server
 */
export default async function handler(request: Request) {
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
    // Extract the target URL from query parameters
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

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

    // Validate URL format
    let parsedUrl: URL;
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

    // Fetch the RSS feed
    const feedResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'TacticalIntelBot/1.0 (+https://tactical-intel-dashboard.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
        'Cache-Control': 'no-cache',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 seconds
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
    const contentType = feedResponse.headers.get('content-type') || 'application/xml';

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
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal proxy error',
        message: error instanceof Error ? error.message : 'Unknown error'
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
}
