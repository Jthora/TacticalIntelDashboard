#!/bin/bash

# Quick Railway Deployment Script
# Alternative to Cloudflare if you prefer managed Node.js hosting

echo "🚀 Quick Railway RSS Proxy Deployment"
echo "====================================="

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway status &> /dev/null; then
    echo "🔑 Please login to Railway..."
    railway login
fi

echo "📝 Creating package.json for deployment..."
cat > package-railway.json << EOF
{
  "name": "rss-proxy-server",
  "version": "1.0.0",
  "description": "RSS proxy server for CORS-free feed fetching",
  "main": "standalone-proxy-server.js",
  "scripts": {
    "start": "node standalone-proxy-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^2.7.0",
    "express-rate-limit": "^6.7.0"
  },
  "keywords": ["rss", "proxy", "cors", "feed"],
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Copy to package.json for Railway
cp package-railway.json package.json

echo "🚀 Creating new Railway project and deploying..."
railway new
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your RSS proxy is now deployed on Railway!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Check your Railway dashboard for the deployed URL"
    echo "2. Test your proxy: curl 'https://your-app.railway.app/proxy?url=https://feeds.bbci.co.uk/news/rss.xml'"
    echo "3. Update your React app to use this URL in fetchFeed.ts"
    echo ""
    echo "🔧 Update PROXY_CONFIG.vercel in fetchFeed.ts:"
    echo "   vercel: 'https://your-app.railway.app/proxy?url=',"
    echo ""
    echo "💡 Your Railway app will auto-deploy on git pushes!"
else
    echo "❌ Deployment failed. Please check the error messages above."
    echo "💡 Common issues:"
    echo "   - Make sure you're logged in: railway login"
    echo "   - Check your Railway account is set up"
    echo "   - Verify standalone-proxy-server.js exists"
fi
