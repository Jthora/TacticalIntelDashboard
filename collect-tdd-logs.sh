#!/bin/bash

# TDD Error Collection Script
# Captures console logs from the browser to analyze data flow

echo "🔍 TDD Error Collection Starting..."
echo "📋 Instructions:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Look for logs starting with 'TDD_ERROR_', 'TDD_SUCCESS_', 'TDD_WARNING_'"
echo "5. Copy all TDD logs and save them to tdd-logs.txt"
echo ""
echo "🎯 Key Areas to Monitor:"
echo "- Sources loading (TDD_ERROR_001 through TDD_ERROR_007)"
echo "- API service initialization (TDD_ERROR_008 through TDD_ERROR_022)"
echo "- Feed service operations (TDD_ERROR_023 through TDD_ERROR_043)"
echo "- UI component rendering (TDD_ERROR_044 through TDD_ERROR_051)"
echo ""
echo "❓ Questions to Answer:"
echo "1. Are PRIMARY_INTELLIGENCE_SOURCES loading correctly?"
echo "2. Is the ModernFeedService.fetchAllIntelligenceData() being called?"
echo "3. Are API requests being made successfully?"
echo "4. Is data being returned from the APIs?"
echo "5. Is the FeedVisualizer receiving the selected feed list?"
echo "6. Is the component calling loadFeeds()?"
echo ""
echo "📝 After collecting logs, run: ./analyze-tdd-logs.sh"
