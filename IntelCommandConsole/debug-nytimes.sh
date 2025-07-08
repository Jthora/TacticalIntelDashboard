#!/bin/bash

# Test the problematic NYC Times feed directly

echo "🔍 Testing NYC Times RSS Feed"
echo "=============================="

# Test feed directly
echo "Testing direct feed access..."
curl -s --max-time 10 "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" | head -50

echo ""
echo "=============================="
echo "Testing with allorigins proxy..."
curl -s --max-time 10 "https://api.allorigins.win/get?url=https%3A//rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" | head -50

echo ""
echo "=============================="
echo "Testing with codetabs proxy..."
curl -s --max-time 10 "https://api.codetabs.com/v1/proxy?quest=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" | head -50

echo ""
echo "=============================="
echo "Testing content-type headers..."
curl -I --max-time 10 "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
