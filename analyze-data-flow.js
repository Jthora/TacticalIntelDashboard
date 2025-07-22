#!/usr/bin/env node

/**
 * Data Flow Analysis Script
 * Analyzes the expected data flow and identifies potential breaking points
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 TDD Data Flow Analysis');
console.log('==========================');

// Read key source files to analyze the data flow
const filesToAnalyze = [
    'src/constants/ModernIntelligenceSources.ts',
    'src/services/ModernAPIService.ts',
    'src/services/ModernFeedService.ts',
    'src/components/FeedVisualizer.tsx',
    'src/components/IntelSources.tsx'
];

console.log('\n📊 ANALYZING DATA FLOW CHAIN:');
console.log('1. ModernIntelligenceSources.ts → Source definitions');
console.log('2. ModernAPIService.ts → API data fetching');
console.log('3. ModernFeedService.ts → Feed processing');
console.log('4. IntelSources.tsx → Source display & selection');
console.log('5. FeedVisualizer.tsx → Feed visualization');

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        console.log(`\n📄 ${fileName}:`);
        
        // Look for TDD error tracking
        const tddMatches = content.match(/TDD_ERROR_\d+|TDD_SUCCESS_\d+|TDD_WARNING_\d+/g) || [];
        console.log(`   TDD Tracking Points: ${tddMatches.length}`);
        
        // Look for key functions/methods
        if (fileName.includes('ModernIntelligenceSources')) {
            const sources = content.match(/export const PRIMARY_INTELLIGENCE_SOURCES/);
            console.log(`   ✓ Primary sources defined: ${!!sources}`);
        }
        
        if (fileName.includes('ModernAPIService')) {
            const fetchMethods = content.match(/async fetch\w+/g) || [];
            console.log(`   ✓ Fetch methods: ${fetchMethods.length}`);
            const errorHandling = content.match(/catch\s*\(/g) || [];
            console.log(`   ✓ Error handlers: ${errorHandling.length}`);
        }
        
        if (fileName.includes('ModernFeedService')) {
            const feedLists = content.match(/getFeedList\w+/g) || [];
            console.log(`   ✓ Feed list methods: ${feedLists.length}`);
            const fetchAllData = content.match(/fetchAllIntelligenceData/);
            console.log(`   ✓ Main data fetch method: ${!!fetchAllData}`);
        }
        
        if (fileName.includes('IntelSources')) {
            const useEffect = content.match(/useEffect/g) || [];
            console.log(`   ✓ Effect hooks: ${useEffect.length}`);
            const selectedFeed = content.match(/selectedFeedList/g) || [];
            console.log(`   ✓ Feed list selection: ${selectedFeed.length} references`);
        }
        
        if (fileName.includes('FeedVisualizer')) {
            const useEffect = content.match(/useEffect/g) || [];
            console.log(`   ✓ Effect hooks: ${useEffect.length}`);
            const loadFeeds = content.match(/loadFeeds/g) || [];
            console.log(`   ✓ Load feeds calls: ${loadFeeds.length} references`);
        }
        
    } catch (error) {
        console.log(`   ❌ Error reading ${filePath}: ${error.message}`);
    }
}

// Analyze each file
filesToAnalyze.forEach(analyzeFile);

console.log('\n🎯 CRITICAL DATA FLOW POINTS TO TEST:');
console.log('1. PRIMARY_INTELLIGENCE_SOURCES array population');
console.log('2. ModernAPIService.fetchNewsData() execution');
console.log('3. ModernFeedService.fetchAllIntelligenceData() flow');
console.log('4. IntelSources feed list auto-selection logic');
console.log('5. FeedVisualizer.loadFeeds() trigger and execution');
console.log('6. Data transformation from API → UI components');

console.log('\n📝 NEXT STEPS:');
console.log('1. Create unit tests for each service method');
console.log('2. Create integration tests for data flow chain');
console.log('3. Create UI tests for component interactions');
console.log('4. Run tests to identify specific failure points');

console.log('\n✅ Analysis complete. Ready for TDD test creation.');
