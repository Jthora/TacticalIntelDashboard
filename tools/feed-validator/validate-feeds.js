#!/usr/bin/env node

/**
 * Earth Alliance Feed Validator
 * This script validates all RSS feeds in the Earth Alliance Source Roster
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');

// Configuration
const ROSTER_PATH = path.resolve(process.cwd(), 'docs/EARTH_ALLIANCE_SOURCE_ROSTER.md');
const OUTPUT_DIR = path.resolve(process.cwd(), 'tools/feed-validator/reports');
const TIMEOUT = 10000; // 10 seconds
const CONCURRENCY = 5;

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

// Results tracking
const results = {
  validationDate: new Date().toISOString(),
  summary: {
    totalFeeds: 0,
    workingFeeds: 0,
    problemFeeds: 0,
    successRate: 0
  },
  categories: {},
  feeds: []
};

/**
 * Extract all RSS feeds from the roster markdown file
 */
async function extractFeeds() {
  console.log(chalk.blue('🔍 Extracting feeds from Earth Alliance Source Roster...'));
  
  const fileContent = await fs.readFile(ROSTER_PATH, 'utf8');
  const matches = fileContent.match(/\"rssFeed\"\s*:\s*\"([^\"]+)\"/g);
  
  if (!matches) {
    console.log(chalk.yellow('⚠️ No RSS feeds found in the roster file.'));
    return [];
  }
  
  // Extract the feeds and their metadata
  const feeds = [];
  const nameMatches = fileContent.match(/\"name\"\s*:\s*\"([^\"]+)\"/g);
  const categoryMatches = fileContent.match(/### ([^\\n]+)/g);
  
  let currentCategory = '';
  
  // Find categories and initialize in results
  if (categoryMatches) {
    categoryMatches.forEach(cat => {
      const category = cat.replace(/### [0-9️⃣]* /, '').trim();
      results.categories[category] = {
        totalFeeds: 0,
        workingFeeds: 0,
        problemFeeds: 0
      };
    });
  }
  
  // Process each feed
  const lines = fileContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect category changes
    if (line.startsWith('### ')) {
      currentCategory = line.replace(/### [0-9️⃣]* /, '').trim();
      continue;
    }
    
    // Find rssFeed entries
    if (line.includes('"rssFeed"')) {
      const rssFeedMatch = line.match(/\"rssFeed\"\s*:\s*\"([^\"]+)\"/);
      if (rssFeedMatch) {
        const feedUrl = rssFeedMatch[1];
        
        // Look back a few lines to find the name
        let name = 'Unknown Source';
        for (let j = Math.max(0, i - 5); j < i; j++) {
          const nameMatch = lines[j].match(/\"name\"\s*:\s*\"([^\"]+)\"/);
          if (nameMatch) {
            name = nameMatch[1];
            break;
          }
        }
        
        // Look for trust rating
        let trustRating = 0;
        for (let j = Math.max(0, i - 10); j < i + 10; j++) {
          if (j >= lines.length) break;
          const trustMatch = lines[j].match(/\"trustRating\"\s*:\s*([0-9]+)/);
          if (trustMatch) {
            trustRating = parseInt(trustMatch[1]);
            break;
          }
        }
        
        // Add to feeds array
        feeds.push({
          name,
          url: feedUrl,
          category: currentCategory,
          trustRating
        });
        
        // Update category stats
        if (results.categories[currentCategory]) {
          results.categories[currentCategory].totalFeeds++;
        }
      }
    }
  }
  
  console.log(chalk.green(`✅ Extracted ${feeds.length} feeds across ${Object.keys(results.categories).length} categories`));
  return feeds;
}

/**
 * Validate a single RSS feed
 */
async function validateFeed(feed) {
  try {
    console.log(chalk.cyan(`Checking: ${feed.name} (${feed.url})`));
    
    // Request the feed with timeout
    const response = await axios.get(feed.url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (EarthAlliance-RSSValidator/1.0)'
      }
    });
    
    // Check if it's valid content
    const contentType = response.headers['content-type'] || '';
    const isXml = contentType.includes('xml') || response.data.includes('<?xml');
    const isJson = contentType.includes('json') || (typeof response.data === 'object');
    
    if (!isXml && !isJson) {
      return {
        status: 'problem',
        error: 'Invalid content type',
        details: `Content type: ${contentType}`
      };
    }
    
    // Check if it has content
    const hasContent = response.data && (
      (typeof response.data === 'string' && response.data.length > 100) || 
      (typeof response.data === 'object' && Object.keys(response.data).length > 0)
    );
    
    if (!hasContent) {
      return {
        status: 'problem',
        error: 'Empty feed',
        details: 'The feed returned empty content'
      };
    }
    
    return {
      status: 'working',
      contentType,
      contentSize: typeof response.data === 'string' ? response.data.length : JSON.stringify(response.data).length
    };
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Domain not found';
    }
    
    return {
      status: 'problem',
      error: errorMessage,
      details: error.stack
    };
  }
}

/**
 * Validate all feeds with concurrency limits
 */
async function validateFeeds(feeds) {
  console.log(chalk.blue(`🔄 Validating ${feeds.length} feeds (with concurrency ${CONCURRENCY})...`));
  
  results.summary.totalFeeds = feeds.length;
  
  // Process feeds in batches to respect concurrency
  for (let i = 0; i < feeds.length; i += CONCURRENCY) {
    const batch = feeds.slice(i, i + CONCURRENCY);
    const promises = batch.map(feed => validateFeed(feed));
    const validationResults = await Promise.all(promises);
    
    // Process batch results
    for (let j = 0; j < batch.length; j++) {
      const feed = batch[j];
      const validation = validationResults[j];
      
      results.feeds.push({
        name: feed.name,
        url: feed.url,
        category: feed.category,
        trustRating: feed.trustRating,
        result: validation
      });
      
      // Update category and summary stats
      if (validation.status === 'working') {
        results.summary.workingFeeds++;
        if (results.categories[feed.category]) {
          results.categories[feed.category].workingFeeds++;
        }
      } else {
        results.summary.problemFeeds++;
        if (results.categories[feed.category]) {
          results.categories[feed.category].problemFeeds++;
        }
      }
    }
  }
  
  // Calculate success rate
  if (results.summary.totalFeeds > 0) {
    results.summary.successRate = Math.round((results.summary.workingFeeds / results.summary.totalFeeds) * 100);
  }
  
  console.log(chalk.green(`✅ Completed validation of ${feeds.length} feeds`));
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportFile = path.join(OUTPUT_DIR, `validation-results-${timestamp}.md`);
  const workingEndpointsFile = path.join(OUTPUT_DIR, `working-endpoints-${timestamp}.md`);
  
  // Build the main report
  let markdown = `# 🌐 Earth Alliance Feed Validation Report\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Date**: ${new Date(results.validationDate).toLocaleString()}\n`;
  markdown += `- **Total Feeds**: ${results.summary.totalFeeds}\n`;
  markdown += `- **Working Feeds**: ${results.summary.workingFeeds}\n`;
  markdown += `- **Problem Feeds**: ${results.summary.problemFeeds}\n`;
  markdown += `- **Success Rate**: ${results.summary.successRate}%\n\n`;
  
  // Add category stats
  markdown += `## Categories\n\n`;
  markdown += `| Category | Total | Working | Success Rate |\n`;
  markdown += `|----------|-------|---------|-------------|\n`;
  
  Object.entries(results.categories).forEach(([category, stats]) => {
    const successRate = stats.totalFeeds > 0 ? Math.round((stats.workingFeeds / stats.totalFeeds) * 100) : 0;
    markdown += `| ${category} | ${stats.totalFeeds} | ${stats.workingFeeds} | ${successRate}% |\n`;
  });
  
  markdown += `\n## Working Feeds\n\n`;
  markdown += `| Category | Name | Trust Rating | URL |\n`;
  markdown += `|----------|------|--------------|-----|\n`;
  
  // Add working feeds
  results.feeds
    .filter(feed => feed.result.status === 'working')
    .sort((a, b) => b.trustRating - a.trustRating)
    .forEach(feed => {
      markdown += `| ${feed.category} | ${feed.name} | ${feed.trustRating} | ${feed.url} |\n`;
    });
  
  markdown += `\n## Problem Feeds\n\n`;
  markdown += `| Category | Name | Trust Rating | URL | Error |\n`;
  markdown += `|----------|------|--------------|-----|-------|\n`;
  
  // Add problem feeds
  results.feeds
    .filter(feed => feed.result.status === 'problem')
    .sort((a, b) => a.category.localeCompare(b.category))
    .forEach(feed => {
      markdown += `| ${feed.category} | ${feed.name} | ${feed.trustRating} | ${feed.url} | ${feed.result.error} |\n`;
    });
  
  // Save the report
  fs.writeFileSync(reportFile, markdown);
  console.log(chalk.green(`✅ Markdown report saved to: ${reportFile}`));
  
  // Create working endpoints list (just the URLs)
  const workingEndpoints = results.feeds
    .filter(feed => feed.result.status === 'working')
    .map(feed => feed.url)
    .join('\n');
  
  fs.writeFileSync(workingEndpointsFile, workingEndpoints);
  console.log(chalk.green(`✅ Working endpoints list saved to: ${workingEndpointsFile}`));
  
  return reportFile;
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('🌐 EARTH ALLIANCE FEED VALIDATOR'));
  console.log(chalk.blue('=================================='));
  
  try {
    // Extract feeds from the roster
    const feeds = await extractFeeds();
    
    // Validate all feeds
    await validateFeeds(feeds);
    
    // Generate reports
    console.log(chalk.blue('📊 Generating reports...'));
    const reportFile = generateMarkdownReport();
    
    console.log(chalk.blue('\n=================================='));
    console.log(chalk.green('✅ VALIDATION COMPLETE'));
    console.log(`Total Feeds: ${results.summary.totalFeeds}`);
    console.log(`Working: ${results.summary.workingFeeds}`);
    console.log(`Problems: ${results.summary.problemFeeds}`);
    console.log(`Success Rate: ${results.summary.successRate}%`);
    console.log(chalk.blue('==================================\n'));
    
  } catch (error) {
    console.log(chalk.red('❌ ERROR:'));
    console.log(error);
    process.exit(1);
  }
}

// Run the main function
main();
