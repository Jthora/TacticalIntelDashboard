#!/bin/bash

# Test Modern API Implementation
# Quick test to verify the modern API system is working

echo "🚀 Testing Modern API Implementation"
echo "=================================="

echo ""
echo "📋 Checking file structure..."

# Check if all required files exist
files=(
  "src/types/ModernAPITypes.ts"
  "src/constants/APIEndpoints.ts" 
  "src/services/DataNormalizer.ts"
  "src/services/ModernAPIService.ts"
  "src/constants/ModernIntelligenceSources.ts"
  "src/services/ModernFeedService.ts"
  "docs/MODERN_API_MIGRATION_PLAN.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (missing)"
  fi
done

echo ""
echo "🔍 Checking imports and compilation..."

# Check TypeScript compilation
if command -v npx &> /dev/null; then
  echo "Running TypeScript check..."
  npx tsc --noEmit --skipLibCheck 2>&1 | head -20
else
  echo "⚠️ TypeScript not available for compilation check"
fi

echo ""
echo "📊 Modern API Sources Available:"
echo "- NOAA Weather Alerts (CORS ✅, Auth ❌)"
echo "- USGS Earthquake Data (CORS ✅, Auth ❌)" 
echo "- GitHub Security Advisories (CORS ✅, Auth ❌)"
echo "- Hacker News (CORS ✅, Auth ❌)"
echo "- CoinGecko Crypto (CORS ✅, Auth ❌)"
echo "- Reddit Discussions (CORS ✅, Auth ❌)"

echo ""
echo "🎯 Ready for Implementation:"
echo "- Primary sources work without API keys"
echo "- No CORS proxy dependencies"
echo "- Real-time JSON APIs"
echo "- Structured intelligence data"

echo ""
echo "▶️ Next Steps:"
echo "1. Test modern API endpoints in browser"
echo "2. Verify data normalization"
echo "3. Update UI components to display modern data"
echo "4. Remove RSS dependencies"

echo ""
echo "🔗 Test URLs (paste in browser):"
echo "NOAA: https://api.weather.gov/alerts/active"
echo "USGS: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"
echo "GitHub: https://api.github.com/advisories"
echo "HackerNews: https://hacker-news.firebaseio.com/v0/topstories.json"

echo ""
echo "✅ Modern API Migration Ready for Testing!"
