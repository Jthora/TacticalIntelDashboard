#!/bin/bash

# Quick RSS Proxy Deployment Validation
# Run this after deploying to any platform

if [ $# -eq 0 ]; then
    echo "Usage: $0 <proxy-url>"
    echo "Example: $0 https://your-proxy.railway.app"
    echo "Example: $0 https://rss-proxy.your-subdomain.workers.dev"
    exit 1
fi

PROXY_URL=$1
echo "🔍 Validating RSS Proxy: $PROXY_URL"

# Test 1: Health Check
echo -n "Health check: "
if curl -s --max-time 5 "$PROXY_URL/health" | grep -q "healthy"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 2: CORS Headers
echo -n "CORS headers: "
if curl -s -I --max-time 5 -H "Origin: http://localhost:3000" "$PROXY_URL" | grep -q "access-control-allow-origin"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 3: RSS Proxy Functionality
echo -n "RSS proxy: "
TEST_URL="https://feeds.bbci.co.uk/news/rss.xml"
ENCODED_URL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TEST_URL'))")
if curl -s --max-time 10 "$PROXY_URL?url=$ENCODED_URL" | grep -q "<?xml\|<rss\|<feed"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

echo "🎉 All tests passed! Your RSS proxy is ready to use."
echo ""
echo "Usage in your React app:"
echo "const response = await fetch('$PROXY_URL?url=' + encodeURIComponent(feedUrl));"
