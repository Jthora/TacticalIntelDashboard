#!/bin/bash

# Quick Cloudflare Workers Deployment Script
# This will deploy your own RSS proxy in under 5 minutes

echo "🚀 Quick Cloudflare Workers RSS Proxy Deployment"
echo "================================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please login to Cloudflare..."
    wrangler login
fi

echo "🔧 Creating wrangler.toml configuration..."
cat > wrangler.toml << EOF
name = "rss-proxy"
main = "cloudflare-worker.js"
compatibility_date = "2023-12-01"

[env.production]
name = "rss-proxy"
EOF

echo "✅ Configuration created!"

echo "🚀 Deploying RSS proxy to Cloudflare Workers..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your RSS proxy is now deployed!"
    echo ""
    echo "🔗 Your proxy URL: https://rss-proxy.YOUR-SUBDOMAIN.workers.dev"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy your proxy URL from the deployment output above"
    echo "2. Update your React app to use this URL as the primary proxy"
    echo "3. Test with: curl 'https://your-proxy-url?url=https://feeds.bbci.co.uk/news/rss.xml'"
    echo ""
    echo "🔧 To update your app, modify PROXY_CONFIG.vercel in fetchFeed.ts:"
    echo "   vercel: 'https://your-proxy-url?url=',"
else
    echo "❌ Deployment failed. Please check the error messages above."
    echo "💡 Common issues:"
    echo "   - Make sure you're logged in: wrangler login"
    echo "   - Check your Cloudflare account has Workers enabled"
    echo "   - Verify cloudflare-worker.js exists in the current directory"
fi
