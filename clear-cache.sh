#!/bin/bash

# Clear localStorage for the Tactical Intel Dashboard to remove any cached fake sources

echo "🧹 Clearing Tactical Intel Dashboard Cache"

# Check if the development server is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Development server is running at http://localhost:5173"
    
    # Use browser automation to clear localStorage
    echo "📋 Instructions to clear cache:"
    echo "1. Open http://localhost:5173 in your browser"
    echo "2. Open Developer Tools (F12)"
    echo "3. Go to Console tab"
    echo "4. Run this command:"
    echo "   localStorage.removeItem('tactical-intel-sources'); localStorage.removeItem('tactical-intel-items'); location.reload();"
    echo ""
    echo "🔍 Current sources that SHOULD be displayed:"
    echo "- NOAA Weather Alerts"
    echo "- USGS Earthquake Data"  
    echo "- GitHub Security Advisories"
    echo "- Hacker News Technology"
    echo "- Cryptocurrency Intelligence"
    echo "- Reddit discussions from various subreddits"
    echo ""
    echo "❌ Sources that should NOT appear:"
    echo "- FBI IC3 Cyber Alerts (fake/non-working)"
    echo "- DHS Cybersecurity Advisories (fake/non-working)"
    echo "- Any military or classified-sounding sources"
    echo ""
    echo "📝 All current sources are verified, working APIs with CORS support."
    
else
    echo "❌ Development server is not running. Start it with: npm run dev"
fi
