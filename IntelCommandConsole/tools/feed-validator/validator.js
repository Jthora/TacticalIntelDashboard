const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const { XMLParser } = require('fast-xml-parser');
const ProgressBar = require('progress');
const { program } = require('commander');
const ora = require('ora');

// Configure command line options
program
  .option('-f, --file <path>', 'Path to EARTH_ALLIANCE_SOURCE_ROSTER.md', '../../docs/EARTH_ALLIANCE_SOURCE_ROSTER.md')
  .option('-t, --timeout <ms>', 'Timeout for feed requests in milliseconds', 10000)
  .option('-c, --concurrency <num>', 'Number of concurrent requests', 5)
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .option('-v, --verbose', 'Verbose output mode')
  .option('--json', 'Output results in JSON format')
  .option('--markdown', 'Output results in Markdown format', true)
  .parse(process.argv);

const options = program.opts();

// Constants
const ROSTER_PATH = path.resolve(process.cwd(), options.file);
const OUTPUT_DIR = path.resolve(process.cwd(), options.output);
const TIMEOUT = parseInt(options.timeout);
const CONCURRENCY = parseInt(options.concurrency);
const VERBOSE = options.verbose;

// Validation results
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

// XML Parser options
const parserOptions = {
  ignoreAttributes: false,
  parseAttributeValue: true
};
const parser = new XMLParser(parserOptions);

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

/**
 * Extract all RSS feeds from the roster markdown file
 */
async function extractFeeds() {
  console.log(chalk.blue('🔍 Extracting feeds from Earth Alliance Source Roster...'));
  
  const fileContent = await fs.readFile(ROSTER_PATH, 'utf8');
  const lines = fileContent.split('\n');
  
  let currentCategory = '';
  let inJsonBlock = false;
  let jsonContent = '';
  const feeds = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect category headers
    if (line.startsWith('### ')) {
      currentCategory = line.replace(/### [0-9️⃣]* /, '').trim();
      if (VERBOSE) console.log(chalk.cyan(`Found category: ${currentCategory}`));
      
      // Initialize category in results
      if (!results.categories[currentCategory]) {
        results.categories[currentCategory] = {
          totalFeeds: 0,
          workingFeeds: 0,
          problemFeeds: 0
        };
      }
      
      continue;
    }
    
    // Track JSON blocks
    if (line.trim() === '```json' || line.trim() === '```') {
      inJsonBlock = !inJsonBlock;
      
      // If we just closed a JSON block, try to parse it
      if (!inJsonBlock && jsonContent.trim()) {
        try {
          // Clean up the JSON content by removing trailing commas
          const cleanJson = jsonContent.replace(/,(\s*[\]}])/g, '$1');
          const jsonData = JSON.parse(`[${cleanJson}]`);
          
          // Extract feed information
          jsonData.forEach(item => {
            if (item.rssFeed) {
              feeds.push({
                name: item.name,
                url: item.rssFeed,
                category: currentCategory,
                trustRating: item.trustRating || 0,
                originalData: item
              });
              
              // Update category stats
              if (results.categories[currentCategory]) {
                results.categories[currentCategory].totalFeeds++;
              }
            }
          });
          
          jsonContent = '';
        } catch (error) {
          if (VERBOSE) {
            console.error(chalk.red(`Error parsing JSON block near line ${i}:`));
            console.error(error);
          }
        }
      }
      
      continue;
    }
    
    // Collect JSON content
    if (inJsonBlock) {
      jsonContent += line + '\n';
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
    // Request the feed with timeout
    const response = await axios.get(feed.url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (EarthAlliance-RSSValidator/1.0)'
      }
    });
    
    // Check if it's XML content
    const contentType = response.headers['content-type'] || '';
    const isXml = contentType.includes('xml') || 
                  contentType.includes('rss') || 
                  contentType.includes('atom') ||
                  response.data.toString().trim().startsWith('<?xml');
    
    if (isXml) {
      // Try to parse as XML
      try {
        const parsed = parser.parse(response.data);
        
        // Check for RSS/Atom structure
        const isRss = parsed.rss || parsed.feed || parsed.rdf;
        
        if (isRss) {
          // Determine feed type and count items
          let feedType = 'unknown';
          let itemCount = 0;
          
          if (parsed.rss && parsed.rss.channel) {
            feedType = 'RSS';
            itemCount = Array.isArray(parsed.rss.channel.item) 
                        ? parsed.rss.channel.item.length 
                        : (parsed.rss.channel.item ? 1 : 0);
          } else if (parsed.feed) {
            feedType = 'Atom';
            itemCount = Array.isArray(parsed.feed.entry)
                        ? parsed.feed.entry.length
                        : (parsed.feed.entry ? 1 : 0);
          } else if (parsed.rdf) {
            feedType = 'RDF';
            itemCount = Array.isArray(parsed.rdf.item)
                        ? parsed.rdf.item.length
                        : (parsed.rdf.item ? 1 : 0);
          }
          
          // Success - Valid RSS feed
          return {
            ...feed,
            status: 'working',
            httpStatus: response.status,
            feedType,
            itemCount,
            lastUpdated: new Date().toISOString()
          };
        } else {
          // XML but not a valid feed
          return {
            ...feed,
            status: 'invalid_format',
            httpStatus: response.status,
            error: 'XML found but not a valid RSS/Atom feed format',
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (error) {
        // XML parsing error
        return {
          ...feed,
          status: 'invalid_format',
          httpStatus: response.status,
          error: `XML parsing error: ${error.message}`,
          lastUpdated: new Date().toISOString()
        };
      }
    } else {
      // Not XML content
      return {
        ...feed,
        status: 'invalid_format',
        httpStatus: response.status,
        error: `Content-Type is not XML: ${contentType}`,
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (error) {
    // Request failed
    return {
      ...feed,
      status: 'failed',
      httpStatus: error.response ? error.response.status : 0,
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Validate feeds in batches with a progress bar
 */
async function validateFeeds(feeds) {
  console.log(chalk.blue(`🔄 Validating ${feeds.length} feeds (with concurrency ${CONCURRENCY})...`));
  
  // Create progress bar
  const bar = new ProgressBar('[:bar] :current/:total feeds (:percent) :etas remaining', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total: feeds.length
  });
  
  const validatedFeeds = [];
  
  // Process in batches for concurrency control
  for (let i = 0; i < feeds.length; i += CONCURRENCY) {
    const batch = feeds.slice(i, i + CONCURRENCY);
    const promises = batch.map(feed => validateFeed(feed));
    
    const results = await Promise.all(promises);
    validatedFeeds.push(...results);
    
    // Update progress bar
    bar.tick(batch.length);
  }
  
  console.log(chalk.green(`✅ Completed validation of ${feeds.length} feeds`));
  return validatedFeeds;
}

/**
 * Generate summary statistics
 */
function generateSummary(validatedFeeds) {
  // Overall stats
  results.summary.totalFeeds = validatedFeeds.length;
  results.summary.workingFeeds = validatedFeeds.filter(f => f.status === 'working').length;
  results.summary.problemFeeds = validatedFeeds.filter(f => f.status !== 'working').length;
  results.summary.successRate = Math.round((results.summary.workingFeeds / results.summary.totalFeeds) * 100);
  
  // Per-category stats
  validatedFeeds.forEach(feed => {
    const category = feed.category;
    if (results.categories[category]) {
      if (feed.status === 'working') {
        results.categories[category].workingFeeds++;
      } else {
        results.categories[category].problemFeeds++;
      }
    }
  });
  
  // Add to results
  results.feeds = validatedFeeds;
  
  return results;
}

/**
 * Generate detailed reports
 */
async function generateReports(validationResults) {
  console.log(chalk.blue('📊 Generating reports...'));
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Generate JSON report
  if (options.json) {
    const jsonPath = path.join(OUTPUT_DIR, `validation-results-${timestamp}.json`);
    await fs.writeJson(jsonPath, validationResults, { spaces: 2 });
    console.log(chalk.green(`✅ JSON report saved to: ${jsonPath}`));
  }
  
  // Generate Markdown report
  if (options.markdown) {
    let markdown = `# 🌐 Earth Alliance Feed Validation Results\n\n`;
    markdown += `## Generated on ${new Date().toLocaleString()}\n\n`;
    
    // Overall summary
    markdown += `## Summary\n\n`;
    markdown += `- **Total Feeds Checked:** ${validationResults.summary.totalFeeds}\n`;
    markdown += `- **Working Feeds:** ${validationResults.summary.workingFeeds}\n`;
    markdown += `- **Problem Feeds:** ${validationResults.summary.problemFeeds}\n`;
    markdown += `- **Success Rate:** ${validationResults.summary.successRate}%\n\n`;
    
    // Per-category summaries
    markdown += `## Results by Category\n\n`;
    
    for (const [category, stats] of Object.entries(validationResults.categories)) {
      const categorySuccessRate = Math.round((stats.workingFeeds / stats.totalFeeds) * 100);
      markdown += `### ${category}\n\n`;
      markdown += `- **Total Feeds:** ${stats.totalFeeds}\n`;
      markdown += `- **Working Feeds:** ${stats.workingFeeds}\n`;
      markdown += `- **Problem Feeds:** ${stats.problemFeeds}\n`;
      markdown += `- **Success Rate:** ${categorySuccessRate}%\n\n`;
      
      // List of feeds in this category
      markdown += `| Name | Status | Feed Type | Items | Trust Rating |\n`;
      markdown += `|------|--------|-----------|-------|-------------|\n`;
      
      const categoryFeeds = validationResults.feeds.filter(f => f.category === category);
      for (const feed of categoryFeeds) {
        const statusEmoji = feed.status === 'working' ? '✅' : '❌';
        const feedType = feed.feedType || 'N/A';
        const itemCount = feed.itemCount || 'N/A';
        
        markdown += `| ${feed.name} | ${statusEmoji} ${feed.status} | ${feedType} | ${itemCount} | ${feed.trustRating} |\n`;
      }
      
      markdown += '\n';
    }
    
    // Generate working endpoints list
    markdown += `## Working Endpoints\n\n`;
    markdown += `The following endpoints are verified working and can be integrated into the dashboard:\n\n`;
    
    for (const [category, _] of Object.entries(validationResults.categories)) {
      markdown += `### ${category}\n\n`;
      
      const workingFeeds = validationResults.feeds.filter(
        f => f.category === category && f.status === 'working'
      );
      
      if (workingFeeds.length > 0) {
        markdown += `\`\`\`json\n[\n`;
        workingFeeds.forEach((feed, index) => {
          markdown += `  {\n`;
          markdown += `    "name": "${feed.name}",\n`;
          markdown += `    "url": "${feed.originalData.url}",\n`;
          markdown += `    "format": "${feed.originalData.format}",\n`;
          markdown += `    "rssFeed": "${feed.url}",\n`;
          markdown += `    "trustRating": ${feed.trustRating},\n`;
          markdown += `    "categories": ${JSON.stringify(feed.originalData.categories || [])},\n`;
          markdown += `    "accessMethod": "${feed.originalData.accessMethod}",\n`;
          markdown += `    "verification": "${feed.originalData.verification}"\n`;
          markdown += `  }${index < workingFeeds.length - 1 ? ',' : ''}\n`;
        });
        markdown += `]\n\`\`\`\n\n`;
      } else {
        markdown += `No working feeds found in this category.\n\n`;
      }
    }
    
    // Save markdown report
    const mdPath = path.join(OUTPUT_DIR, `validation-results-${timestamp}.md`);
    await fs.writeFile(mdPath, markdown);
    console.log(chalk.green(`✅ Markdown report saved to: ${mdPath}`));
    
    // Generate working endpoints markdown
    let workingEndpoints = `# 🌐 Earth Alliance Working Endpoints\n\n`;
    workingEndpoints += `## Generated on ${new Date().toLocaleString()}\n\n`;
    workingEndpoints += `The following endpoints were successfully validated and can be integrated into the dashboard:\n\n`;
    
    for (const [category, _] of Object.entries(validationResults.categories)) {
      workingEndpoints += `### ${category}\n\n`;
      
      const workingFeeds = validationResults.feeds.filter(
        f => f.category === category && f.status === 'working'
      );
      
      if (workingFeeds.length > 0) {
        for (const feed of workingFeeds) {
          workingEndpoints += `- **${feed.name}** - \`${feed.url}\`\n`;
        }
      } else {
        workingEndpoints += `No working feeds found in this category.\n`;
      }
      
      workingEndpoints += '\n';
    }
    
    const workingPath = path.join(OUTPUT_DIR, `working-endpoints-${timestamp}.md`);
    await fs.writeFile(workingPath, workingEndpoints);
    console.log(chalk.green(`✅ Working endpoints list saved to: ${workingPath}`));
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log(chalk.bold.blue('🌐 EARTH ALLIANCE FEED VALIDATOR'));
  console.log(chalk.blue('=================================='));
  
  try {
    // Extract feeds from roster
    const feeds = await extractFeeds();
    
    // Validate feeds
    const validatedFeeds = await validateFeeds(feeds);
    
    // Generate summary
    const validationResults = generateSummary(validatedFeeds);
    
    // Generate reports
    await generateReports(validationResults);
    
    // Display summary
    console.log(chalk.bold.blue('\n=================================='));
    console.log(chalk.bold.green('✅ VALIDATION COMPLETE'));
    console.log(chalk.white(`Total Feeds: ${validationResults.summary.totalFeeds}`));
    console.log(chalk.green(`Working: ${validationResults.summary.workingFeeds}`));
    console.log(chalk.red(`Problems: ${validationResults.summary.problemFeeds}`));
    console.log(chalk.yellow(`Success Rate: ${validationResults.summary.successRate}%`));
    console.log(chalk.blue('==================================\n'));
    
  } catch (error) {
    console.error(chalk.bold.red('❌ ERROR:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Run the validator
main();
