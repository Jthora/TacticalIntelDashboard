# 🚀 Enhanced RSS Proxy Deployment Guide

## Quick Deploy Options (Recommended)

### 1. **Cloudflare Workers** (Fastest, Global)
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy cloudflare-worker.js --name rss-proxy
```
**Result:** `https://rss-proxy.your-subdomain.workers.dev/`

### 2. **Railway** (Easiest, Managed)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway new
railway up
```
**Result:** `https://your-app.railway.app/`

### 3. **Digital Ocean App Platform** (Reliable, Managed)
1. Push code to GitHub
2. Create app in DO App Platform
3. Connect GitHub repo
4. Deploy automatically

## Traditional Deploy Options

### 4. **Docker** (Any Cloud Provider)
```bash
# Build and test locally
chmod +x docker-deploy.sh
./docker-deploy.sh

# Deploy to any cloud (AWS ECS, Google Cloud Run, etc.)
```

### 5. **Netlify Edge Functions**
```bash
# Create netlify/edge-functions/rss-proxy.js
cp netlify-edge-function.js netlify/edge-functions/rss-proxy.js

# Deploy with Netlify CLI
netlify deploy --prod
```

### 6. **AWS Lambda@Edge**
```bash
# Package and deploy to AWS Lambda@Edge
zip -r lambda-edge.zip aws-lambda-edge.js node_modules/
aws lambda create-function --function-name rss-proxy --runtime nodejs18.x --zip-file fileb://lambda-edge.zip
```

## Performance Comparison

| Platform | Global Edge | Cold Start | Free Tier | Cost |
|----------|-------------|------------|-----------|------|
| Cloudflare Workers | ✅ Fastest | ~0ms | 100K req/day | $0.50/M |
| Railway | ❌ Single region | ~1s | 512MB RAM | $5/month |
| Digital Ocean | ❌ Regional | ~2s | $5 credit | $5/month |
| Netlify Edge | ✅ Global | ~100ms | 125K req/month | $25/month |
| AWS Lambda@Edge | ✅ Global | ~500ms | 1M req/month | Pay-per-use |

## Production Configuration

### Environment Variables
```bash
# Required for all deployments
NODE_ENV=production
PORT=3001

# Optional security
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Health Monitoring
All proxies include `/health` endpoint for monitoring:
```bash
curl https://your-proxy-url/health
```

### Usage Examples
```javascript
// In your React app
const proxyUrl = 'https://your-proxy-url';
const feedUrl = 'https://example.com/feed.xml';
const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(feedUrl)}`);
```

## Testing Your Deployment

### Quick Test Script
```bash
# Test health endpoint
curl https://your-proxy-url/health

# Test RSS proxy
curl "https://your-proxy-url?url=https://feeds.bbci.co.uk/news/rss.xml"

# Test CORS headers
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://your-proxy-url
```

### Integration with Your App
Update your `fetchFeed.ts` to use your deployed proxy:

```typescript
const PROXY_ENDPOINTS = [
  'https://your-proxy-url', // Your deployed proxy (primary)
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/',
  // ... other fallbacks
];
```

## Security Best Practices

1. **Rate Limiting**: All proxies include rate limiting
2. **URL Validation**: Only HTTP/HTTPS protocols allowed
3. **CORS Headers**: Properly configured for your domain
4. **Error Handling**: Graceful fallbacks and error messages
5. **Monitoring**: Health checks and logging included

## Troubleshooting

### Common Issues
- **CORS still failing**: Check your proxy URL and CORS headers
- **Rate limiting**: Implement exponential backoff in your client
- **Timeout errors**: RSS feeds may be slow, consider increasing timeout
- **Content parsing**: Some feeds return HTML instead of XML

### Debug Commands
```bash
# Check proxy response headers
curl -I "https://your-proxy-url?url=https://example.com/feed.xml"

# Test with verbose output
curl -v "https://your-proxy-url?url=https://example.com/feed.xml"

# Check content type
curl -s "https://your-proxy-url?url=https://example.com/feed.xml" | head -20
```

## Recommended Deployment Strategy

1. **Start with Cloudflare Workers** (fastest, most reliable)
2. **Fallback to Railway** (if you need persistent storage)
3. **Use Docker** for full control or enterprise deployment
4. **Monitor with health checks** and set up alerts

Your RSS proxy will be globally available, fast, and handle CORS issues seamlessly!
