#!/bin/bash

# Complete RSS CORS Solution - One Command Deployment
# This script will deploy your proxy and update your app configuration

echo "🚀 Complete RSS CORS Solution Deployment"
echo "========================================"
echo ""
echo "The public proxies are failing with:"
echo "❌ Empty responses"
echo "❌ Rate limiting" 
echo "❌ 'Too Many Requests' errors"
echo ""
echo "💡 Solution: Deploy your own dedicated RSS proxy"
echo ""

# Function to deploy Cloudflare Workers
deploy_cloudflare() {
    echo "🔧 Deploying to Cloudflare Workers..."
    
    # Check/install wrangler
    if ! command -v wrangler &> /dev/null; then
        echo "📦 Installing Wrangler CLI..."
        npm install -g wrangler
    fi
    
    # Login check
    if ! wrangler whoami &> /dev/null; then
        echo "🔑 Please login to Cloudflare..."
        wrangler login
    fi
    
    # Create wrangler.toml
    cat > wrangler.toml << EOF
name = "rss-proxy"
main = "cloudflare-worker.js"
compatibility_date = "2023-12-01"
EOF
    
    # Deploy
    echo "🚀 Deploying..."
    wrangler deploy
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Cloudflare Workers proxy deployed!"
        echo ""
        echo "📝 NEXT STEPS:"
        echo "1. Note your proxy URL from the output above"
        echo "2. Run: ./update-app-config.sh https://rss-proxy.YOUR-SUBDOMAIN.workers.dev"
        echo ""
        return 0
    else
        echo "❌ Cloudflare deployment failed"
        return 1
    fi
}

# Function to deploy Railway
deploy_railway() {
    echo "🔧 Deploying to Railway..."
    
    # Check/install railway CLI
    if ! command -v railway &> /dev/null; then
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login check
    if ! railway status &> /dev/null; then
        echo "🔑 Please login to Railway..."
        railway login
    fi
    
    # Create package.json
    cp package-proxy.json package.json
    
    # Deploy
    echo "🚀 Deploying..."
    railway new
    railway up
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Railway proxy deployed!"
        echo ""
        echo "📝 NEXT STEPS:"
        echo "1. Check your Railway dashboard for the app URL"
        echo "2. Run: ./update-app-config.sh https://your-app.railway.app/proxy"
        echo ""
        return 0
    else
        echo "❌ Railway deployment failed"
        return 1
    fi
}

# Main menu
echo "Choose your deployment option:"
echo "1) Cloudflare Workers (Recommended - fastest, global)"
echo "2) Railway (Node.js hosting - easier setup)"
echo "3) Show manual instructions"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        deploy_cloudflare
        ;;
    2)
        deploy_railway
        ;;
    3)
        echo ""
        echo "📖 Manual Deployment Options:"
        echo ""
        echo "🌩️  Cloudflare Workers:"
        echo "   ./quick-deploy-cloudflare.sh"
        echo ""
        echo "🚂 Railway:"
        echo "   ./quick-deploy-railway.sh"
        echo ""
        echo "🐳 Docker (any cloud):"
        echo "   ./docker-deploy.sh"
        echo ""
        echo "📚 Full documentation: DEPLOYMENT_GUIDE.md"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🔗 Useful Links:"
echo "   📊 Test your deployment: ./validate-deployment.sh <your-url>"
echo "   🧪 Browser testing: browser-test-utility.js"
echo "   📖 Full guide: DEPLOYMENT_GUIDE.md"
echo ""
echo "💡 After deployment, your RSS feeds will work reliably without CORS issues!"
