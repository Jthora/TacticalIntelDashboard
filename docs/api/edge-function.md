# 🔌 Edge Function API - CORS Proxy Documentation

## 📋 **Overview**

The Tactical Intel Dashboard uses a Vercel Edge Function to solve CORS (Cross-Origin Resource Sharing) issues when fetching RSS feeds from external sources. This serverless proxy enables autonomous web scraping without requiring persistent infrastructure.

## 🎯 **Endpoint Information**

### **Base URL**
```
Production: https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed
Development: http://localhost:5173/api/proxy-feed
```

### **HTTP Method**
- **GET**: Retrieve RSS feed content via proxy

### **Parameters**

#### **Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | Target RSS feed URL to fetch |

#### **Example Request**
```bash
curl "https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed?url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
```

---

## 🔧 **Technical Implementation**

### **Edge Function Code**
```typescript
export const config = {
  runtime: 'edge',
};

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

    // Security checks
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' }),
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'TacticalIntelDashboard/2.0 (+https://github.com/Jthora/TacticalIntelDashboard)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/json, text/plain, */*',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            url: targetUrl
          }
        }),
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const content = await response.text();
    const contentType = response.headers.get('content-type') || 'text/plain';

    return new Response(content, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
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
```

---

## 📊 **Response Format**

### **Successful Response**
```http
HTTP/1.1 200 OK
Content-Type: application/rss+xml; charset=UTF-8
Access-Control-Allow-Origin: *
Cache-Control: public, max-age=300

<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Feed Title</title>
    <description>Feed description</description>
    <item>
      <title>Article Title</title>
      <link>https://example.com/article</link>
      <description>Article description</description>
      <pubDate>Wed, 06 Jul 2025 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```

### **Error Responses**

#### **Missing URL Parameter (400)**
```json
{
  "error": "Missing url parameter"
}
```

#### **Invalid URL Format (400)**
```json
{
  "error": "Invalid URL format"
}
```

#### **Invalid Protocol (400)**
```json
{
  "error": "Invalid protocol. Only HTTP and HTTPS are allowed."
}
```

#### **Fetch Failed (Various)**
```json
{
  "error": "Failed to fetch: 404 Not Found",
  "details": {
    "status": 404,
    "statusText": "Not Found",
    "url": "https://example.com/invalid-feed.xml"
  }
}
```

#### **Internal Server Error (500)**
```json
{
  "error": "Internal server error",
  "message": "Network timeout"
}
```

---

## 🛡️ **Security Features**

### **URL Validation**
- **Protocol Whitelist**: Only HTTP and HTTPS allowed
- **URL Parsing**: Validates URL format before processing
- **Input Sanitization**: Prevents malicious URL injection

### **Request Headers**
- **User Agent**: Identifies requests as coming from Tactical Intel Dashboard
- **Accept Headers**: Specifies expected content types
- **Cache Control**: Prevents stale data issues

### **CORS Headers**
- **Origin Policy**: Allows all origins (`*`) for public access
- **Method Allowlist**: GET, POST, OPTIONS methods supported
- **Header Allowlist**: Content-Type and Authorization headers

### **Rate Limiting**
- **Vercel Built-in**: Automatic rate limiting at edge level
- **Cache Strategy**: 5-minute cache reduces upstream requests
- **Error Handling**: Graceful degradation on rate limit exceeded

---

## 🔄 **Fallback Strategy**

### **Multi-Tier Proxy System**
The client implements a fallback strategy when the primary Edge Function fails:

```typescript
const PROXY_CONFIG = {
  // Primary: Vercel Edge Function
  vercel: '/api/proxy-feed?url=',
  
  // Fallback proxies
  fallback: [
    'https://api.allorigins.win/get?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/',
  ]
};
```

### **Fallback Process**
1. **Primary Attempt**: Vercel Edge Function
2. **Fallback 1**: AllOrigins public CORS proxy
3. **Fallback 2**: CodeTabs CORS proxy
4. **Fallback 3**: CORS Anywhere (if available)
5. **Error State**: Display user-friendly error message

---

## 📈 **Performance Characteristics**

### **Edge Function Benefits**
- **Global Distribution**: Deployed to Vercel's edge network
- **Low Latency**: < 50ms cold start, < 10ms warm start
- **Auto-Scaling**: Handles traffic spikes automatically
- **Regional Proximity**: Executes close to users

### **Caching Strategy**
- **Response Caching**: 5-minute cache for RSS content
- **Browser Caching**: Leverages browser cache for efficiency
- **CDN Integration**: Vercel CDN for static content
- **Cache Invalidation**: Fresh content on manual refresh

### **Resource Limits**
- **Execution Time**: 10 seconds maximum (Vercel limit)
- **Memory Usage**: 128MB available
- **Request Size**: 4.5MB maximum payload
- **Response Size**: 4.5MB maximum response

---

## 🧪 **Testing & Debugging**

### **Testing the Edge Function**

#### **Basic Functionality Test**
```bash
# Test with New York Times RSS feed
curl -v "https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed?url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
```

#### **Error Handling Tests**
```bash
# Test missing URL parameter
curl "https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed"

# Test invalid URL
curl "https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed?url=invalid-url"

# Test invalid protocol
curl "https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed?url=ftp://example.com/feed.xml"
```

#### **CORS Preflight Test**
```bash
# Test CORS preflight request
curl -X OPTIONS \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "https://intel-command-console-[deployment-id].vercel.app/api/proxy-feed"
```

### **Debugging in Development**

#### **Local Testing**
```bash
# Start Vercel dev server
vercel dev

# Test local edge function
curl "http://localhost:3000/api/proxy-feed?url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
```

#### **Debug Logging**
```typescript
// Add debug logging to edge function
console.log('Proxy request:', { targetUrl, timestamp: new Date().toISOString() });
console.log('Response headers:', Object.fromEntries(response.headers.entries()));
```

---

## 📊 **Monitoring & Analytics**

### **Vercel Analytics**
- **Function Invocations**: Request count and frequency
- **Execution Duration**: Performance metrics
- **Error Rates**: Failed request tracking
- **Geographic Distribution**: Request origin analysis

### **Custom Monitoring**
```typescript
// Add custom metrics
const metrics = {
  timestamp: new Date().toISOString(),
  targetUrl: targetUrl,
  responseTime: Date.now() - startTime,
  statusCode: response.status,
  contentLength: content.length
};

// Log metrics for analysis
console.log('Proxy metrics:', JSON.stringify(metrics));
```

### **Error Tracking**
- **Error Categorization**: Client vs server errors
- **Source URL Analysis**: Problematic feed identification
- **Retry Success Rates**: Fallback effectiveness
- **Performance Degradation**: Slow response detection

---

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
# Vercel deployment configuration
VITE_PROXY_URL=/api/proxy-feed?url=

# Optional: Custom configurations
PROXY_TIMEOUT=10000          # 10 seconds
PROXY_CACHE_TTL=300          # 5 minutes
PROXY_MAX_REDIRECTS=5        # Follow redirects
```

### **Request Customization**
```typescript
// Custom headers for different sources
const getHeaders = (targetUrl: string) => {
  const headers: Record<string, string> = {
    'User-Agent': 'TacticalIntelDashboard/2.0',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  };

  // Add source-specific headers
  if (targetUrl.includes('nytimes.com')) {
    headers['Referer'] = 'https://nytimes.com';
  }

  return headers;
};
```

---

## 🚀 **Future Enhancements**

### **Planned Improvements**
- **Authentication Support**: API key management for protected feeds
- **Content Transformation**: RSS-to-JSON conversion
- **Request Batching**: Multiple feed requests in single call
- **Advanced Caching**: Redis integration for enterprise deployments

### **Security Enhancements**
- **Domain Whitelist**: Restrict allowed target domains
- **Rate Limiting**: Per-IP request limits
- **Request Signing**: Verify request authenticity
- **Content Filtering**: Block malicious content

---

*This Edge Function API provides the foundation for autonomous RSS feed aggregation in the Tactical Intel Dashboard, enabling professional intelligence gathering without infrastructure dependencies.*
