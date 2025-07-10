#!/bin/bash

# Test the improved RSS feed parsing with real feeds

echo "🧪 Testing Improved RSS Feed Parsing"
echo "===================================="

# Test feeds that were causing issues
TEST_FEEDS=(
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
  "https://www.npr.org/rss/rss.php?id=1001"
  "https://rss.cnn.com/rss/edition.rss"
  "https://www.reddit.com/r/news/.rss"
  "https://www.aljazeera.com/xml/rss/all.xml"
)

echo "Testing proxy responses for base64 encoding issues..."

for feed in "${TEST_FEEDS[@]}"; do
  echo ""
  echo "Testing: $(basename "$feed")"
  echo "Direct URL: $feed"
  
  # Test with codetabs proxy
  echo -n "  Codetabs proxy: "
  codetabs_url="https://api.codetabs.com/v1/proxy?quest=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$feed'))")"
  response=$(curl -s --max-time 8 "$codetabs_url" | head -c 100)
  
  if [[ "$response" =~ ^data: ]]; then
    echo "⚠️  Base64 encoded (needs decoding)"
  elif [[ "$response" =~ ^[\<\?xml] ]] || [[ "$response" =~ ^\<rss ]] || [[ "$response" =~ ^\<feed ]]; then
    echo "✅ Valid XML"
  elif [[ "$response" =~ "Moved Permanently" ]]; then
    echo "❌ Redirect error"
  else
    echo "❓ Unknown format: ${response:0:50}..."
  fi
  
  # Test with allorigins proxy
  echo -n "  Allorigins proxy: "
  allorigins_url="https://api.allorigins.win/get?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$feed'))")"
  response=$(timeout 8 curl -s "$allorigins_url" 2>/dev/null || echo "TIMEOUT")
  
  if [[ "$response" == "TIMEOUT" ]]; then
    echo "⏱️  Timeout"
  elif echo "$response" | jq -e '.contents' > /dev/null 2>&1; then
    echo "✅ Valid JSON wrapper"
  else
    echo "❌ Invalid response"
  fi
done

echo ""
echo "🎯 Summary:"
echo "- Base64 encoded responses need special handling"
echo "- Timeouts are common with allorigins"
echo "- Codetabs is more reliable but may have redirects"
echo "- Direct XML responses work best when available"
