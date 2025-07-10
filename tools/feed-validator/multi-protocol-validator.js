#!/usr/bin/env node

/**
 * Multi-Protocol Feed Integrator for Earth Alliance Intelligence Dashboard
 * This script extends the existing validator to support additional protocols beyond RSS
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const { program } = require('commander');
const ora = require('ora');
const { XMLParser } = require('fast-xml-parser');

// Configuration
const ROSTER_PATH = path.resolve(process.cwd(), 'docs/EARTH_ALLIANCE_SOURCE_ROSTER.md');
const OUTPUT_DIR = path.resolve(process.cwd(), 'tools/feed-validator/reports');
const TIMEOUT = 15000; // 15 seconds
const CONCURRENCY = 5;

// Multi-protocol support
const SUPPORTED_PROTOCOLS = {
  RSS: 'rss',
  ATOM: 'atom',
  JSON: 'json',
  API: 'api',
  IPFS: 'ipfs',
  MASTODON: 'mastodon',
  SSB: 'ssb' // Secure Scuttlebutt
};

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

// Parse command line arguments
program
  .option('-p, --protocol <protocol>', 'Specific protocol to validate (rss, atom, json, api, ipfs, mastodon, ssb)')
  .option('-f, --file <file>', 'Custom roster file to validate')
  .option('-o, --output <dir>', 'Custom output directory')
  .parse(process.argv);

const options = program.opts();
const rosterPath = options.file || ROSTER_PATH;
const outputDir = options.output || OUTPUT_DIR;
const specificProtocol = options.protocol;

// Results tracking
const results = {
  validationDate: new Date().toISOString(),
  summary: {
    totalSources: 0,
    workingSources: 0,
    problemSources: 0,
    successRate: 0
  },
  protocols: {},
  categories: {},
  sources: []
};

/**
 * Extract all sources from the roster markdown file
 */
async function extractSources() {
  console.log(chalk.blue('🔍 Extracting sources from Earth Alliance Source Roster...'));
  
  const fileContent = await fs.readFile(rosterPath, 'utf8');
  
  // Extract JSON blocks
  const jsonBlocks = fileContent.match(/```json\s*\[\s*([\s\S]*?)\s*\]\s*```/g);
  
  if (!jsonBlocks || jsonBlocks.length === 0) {
    console.log(chalk.yellow('⚠️ No JSON blocks found in the roster file.'));
    return [];
  }
  
  let allSources = [];
  
  // Process each JSON block (category)
  for (const block of jsonBlocks) {
    try {
      // Extract category name from preceding heading
      const categoryMatch = fileContent.match(new RegExp(`(###\\s+[^\\n]+)\\s*\\n+\\s*${block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').substring(0, 30).replace(/\s+/g, '\\s+')}`));
      const category = categoryMatch ? categoryMatch[1].trim() : 'Unknown Category';
      
      // Clean the JSON string and parse it
      const jsonStr = block.replace(/```json\s*\[/g, '[').replace(/\]\s*```/g, ']');
      const sources = JSON.parse(jsonStr);
      
      // Add category info
      sources.forEach(source => {
        source.category = category;
        
        // Determine protocol
        if (source.rssFeed) {
          source.protocol = 'rss';
        } else if (source.atomFeed) {
          source.protocol = 'atom';
        } else if (source.jsonFeed) {
          source.protocol = 'json';
        } else if (source.apiEndpoint) {
          source.protocol = 'api';
        } else if (source.ipfsAddress) {
          source.protocol = 'ipfs';
        } else if (source.mastodonFeed) {
          source.protocol = 'mastodon';
        } else if (source.ssbIdentifier) {
          source.protocol = 'ssb';
        } else {
          source.protocol = 'unknown';
        }
        
        // Skip if we're validating a specific protocol and this doesn't match
        if (specificProtocol && source.protocol !== specificProtocol) {
          return;
        }
        
        allSources.push(source);
      });
    } catch (error) {
      console.error(chalk.red(`Error parsing JSON block: ${error.message}`));
      console.error(chalk.gray(block.substring(0, 200) + '...'));
    }
  }
  
  console.log(chalk.green(`Found ${allSources.length} sources to validate`));
  return allSources;
}

/**
 * Validate a list of sources
 */
async function validateSources(sources) {
  console.log(chalk.blue(`🔄 Validating ${sources.length} sources...`));
  
  results.summary.totalSources = sources.length;
  
  // Initialize protocol and category counters
  for (const protocol of Object.values(SUPPORTED_PROTOCOLS)) {
    results.protocols[protocol] = { total: 0, working: 0 };
  }
  
  // Process sources in batches to control concurrency
  const batchSize = CONCURRENCY;
  const batches = [];
  
  for (let i = 0; i < sources.length; i += batchSize) {
    batches.push(sources.slice(i, i + batchSize));
  }
  
  const spinner = ora('Validating sources...').start();
  let processed = 0;
  
  // Process each batch
  for (const [batchIndex, batch] of batches.entries()) {
    spinner.text = `Validating batch ${batchIndex + 1}/${batches.length} (${processed}/${sources.length})`;
    
    await Promise.all(batch.map(source => validateSource(source)));
    
    processed += batch.length;
    spinner.text = `Validated ${processed}/${sources.length} sources`;
  }
  
  spinner.succeed(`Validated ${sources.length} sources`);
  
  // Calculate success rates
  results.summary.successRate = (results.summary.workingSources / results.summary.totalSources * 100).toFixed(1);
  
  for (const protocol in results.protocols) {
    if (results.protocols[protocol].total > 0) {
      results.protocols[protocol].successRate = 
        (results.protocols[protocol].working / results.protocols[protocol].total * 100).toFixed(1);
    } else {
      results.protocols[protocol].successRate = '0';
    }
  }
  
  for (const category in results.categories) {
    if (results.categories[category].total > 0) {
      results.categories[category].successRate = 
        (results.categories[category].working / results.categories[category].total * 100).toFixed(1);
    } else {
      results.categories[category].successRate = '0';
    }
  }
  
  return results;
}

/**
 * Validate a single source
 */
async function validateSource(source) {
  const sourceResult = {
    name: source.name,
    url: source.url,
    protocol: source.protocol,
    endpoint: source[`${source.protocol}Feed`] || source[`${source.protocol}Endpoint`] || 
              source[`${source.protocol}Address`] || source[`${source.protocol}Identifier`],
    category: source.category,
    status: 'unknown',
    statusCode: null,
    error: null,
    validationTime: null
  };
  
  // Initialize category if not exists
  if (!results.categories[source.category]) {
    results.categories[source.category] = { total: 0, working: 0 };
  }
  
  // Initialize protocol if not exists
  if (!results.protocols[source.protocol]) {
    results.protocols[source.protocol] = { total: 0, working: 0 };
  }
  
  results.categories[source.category].total++;
  results.protocols[source.protocol].total++;
  
  const startTime = Date.now();
  
  try {
    switch (source.protocol) {
      case 'rss':
      case 'atom':
        await validateRssAtomFeed(source, sourceResult);
        break;
      case 'json':
        await validateJsonFeed(source, sourceResult);
        break;
      case 'api':
        await validateApiEndpoint(source, sourceResult);
        break;
      case 'ipfs':
        await validateIpfsResource(source, sourceResult);
        break;
      case 'mastodon':
        await validateMastodonFeed(source, sourceResult);
        break;
      case 'ssb':
        await validateSsbContent(source, sourceResult);
        break;
      default:
        sourceResult.status = 'error';
        sourceResult.error = `Unsupported protocol: ${source.protocol}`;
    }
  } catch (error) {
    sourceResult.status = 'error';
    sourceResult.error = error.message;
  }
  
  sourceResult.validationTime = Date.now() - startTime;
  results.sources.push(sourceResult);
  
  if (sourceResult.status === 'valid') {
    results.summary.workingSources++;
    results.categories[source.category].working++;
    results.protocols[source.protocol].working++;
  } else {
    results.summary.problemSources++;
  }
  
  return sourceResult;
}

/**
 * Validate RSS or Atom feed
 */
async function validateRssAtomFeed(source, result) {
  const feedUrl = source.rssFeed || source.atomFeed;
  
  if (!feedUrl) {
    result.status = 'error';
    result.error = 'No feed URL provided';
    return;
  }
  
  try {
    const response = await axios.get(feedUrl, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Earth Alliance Intelligence Dashboard/1.0'
      }
    });
    
    result.statusCode = response.status;
    
    if (response.status !== 200) {
      result.status = 'error';
      result.error = `HTTP error: ${response.status}`;
      return;
    }
    
    // Check if it's valid XML
    const parser = new XMLParser();
    const parsedContent = parser.parse(response.data);
    
    // Basic validation for RSS/Atom structure
    if (parsedContent.rss || parsedContent.feed) {
      result.status = 'valid';
    } else {
      result.status = 'invalid';
      result.error = 'Not a valid RSS or Atom feed format';
    }
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }
}

/**
 * Validate JSON feed
 */
async function validateJsonFeed(source, result) {
  const feedUrl = source.jsonFeed;
  
  if (!feedUrl) {
    result.status = 'error';
    result.error = 'No JSON feed URL provided';
    return;
  }
  
  try {
    const response = await axios.get(feedUrl, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Earth Alliance Intelligence Dashboard/1.0',
        'Accept': 'application/json'
      }
    });
    
    result.statusCode = response.status;
    
    if (response.status !== 200) {
      result.status = 'error';
      result.error = `HTTP error: ${response.status}`;
      return;
    }
    
    // Validate JSON structure
    if (typeof response.data === 'object' && 
        (response.data.items || response.data.entries || response.data.feed)) {
      result.status = 'valid';
    } else {
      result.status = 'invalid';
      result.error = 'Not a valid JSON feed format';
    }
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }
}

/**
 * Validate API endpoint
 */
async function validateApiEndpoint(source, result) {
  const apiUrl = source.apiEndpoint;
  const apiKey = source.apiKey;
  
  if (!apiUrl) {
    result.status = 'error';
    result.error = 'No API endpoint provided';
    return;
  }
  
  try {
    const headers = {
      'User-Agent': 'Earth Alliance Intelligence Dashboard/1.0',
      'Accept': 'application/json'
    };
    
    // Add API key if available
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await axios.get(apiUrl, {
      timeout: TIMEOUT,
      headers
    });
    
    result.statusCode = response.status;
    
    if (response.status >= 200 && response.status < 300) {
      result.status = 'valid';
    } else {
      result.status = 'error';
      result.error = `HTTP error: ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }
}

// Note: The following functions are placeholders and would need specialized libraries
// or external tools to actually validate these protocols properly

/**
 * Validate IPFS resource (placeholder)
 */
async function validateIpfsResource(source, result) {
  const ipfsAddress = source.ipfsAddress;
  
  if (!ipfsAddress) {
    result.status = 'error';
    result.error = 'No IPFS address provided';
    return;
  }
  
  // For now, we'll use a gateway to check if content exists
  try {
    const gatewayUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsAddress.replace('ipfs://', '')}`;
    
    const response = await axios.get(gatewayUrl, {
      timeout: TIMEOUT * 2, // IPFS can be slower
      headers: {
        'User-Agent': 'Earth Alliance Intelligence Dashboard/1.0'
      }
    });
    
    result.statusCode = response.status;
    
    if (response.status === 200) {
      result.status = 'valid';
    } else {
      result.status = 'error';
      result.error = `HTTP error: ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }
}

/**
 * Validate Mastodon feed (placeholder)
 */
async function validateMastodonFeed(source, result) {
  const mastodonUrl = source.mastodonFeed;
  
  if (!mastodonUrl) {
    result.status = 'error';
    result.error = 'No Mastodon feed URL provided';
    return;
  }
  
  // Try to use the RSS feed equivalent that Mastodon instances provide
  try {
    const response = await axios.get(mastodonUrl, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Earth Alliance Intelligence Dashboard/1.0'
      }
    });
    
    result.statusCode = response.status;
    
    if (response.status === 200) {
      result.status = 'valid';
    } else {
      result.status = 'error';
      result.error = `HTTP error: ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
  }
}

/**
 * Validate SSB content (placeholder)
 */
async function validateSsbContent(source, result) {
  // This is a placeholder - proper SSB validation would require running an SSB client
  result.status = 'unknown';
  result.error = 'SSB validation requires specialized client';
}

/**
 * Generate a report from validation results
 */
function generateReport(results) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportPath = path.join(outputDir, `multi-protocol-validation-${timestamp}.md`);
  const workingEndpointsPath = path.join(outputDir, `working-multi-protocol-endpoints-${timestamp}.md`);
  
  // Format date for display
  const dateOptions = { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric' 
  };
  const formattedDate = new Date(results.validationDate)
    .toLocaleString('en-US', dateOptions);
  
  // Generate markdown report
  let report = `# 🌐 Earth Alliance Multi-Protocol Validation Report\n\n`;
  report += `## Summary\n\n`;
  report += `- **Date**: ${formattedDate}\n`;
  report += `- **Total Sources**: ${results.summary.totalSources}\n`;
  report += `- **Working Sources**: ${results.summary.workingSources}\n`;
  report += `- **Problem Sources**: ${results.summary.problemSources}\n`;
  report += `- **Success Rate**: ${results.summary.successRate}%\n\n`;
  
  // Protocol summary
  report += `## Protocols\n\n`;
  report += `| Protocol | Total | Working | Success Rate |\n`;
  report += `|----------|-------|---------|-------------|\n`;
  
  for (const protocol in results.protocols) {
    if (results.protocols[protocol].total > 0) {
      report += `| ${protocol.toUpperCase()} | ${results.protocols[protocol].total} | ${results.protocols[protocol].working} | ${results.protocols[protocol].successRate}% |\n`;
    }
  }
  
  report += `\n`;
  
  // Category summary
  report += `## Categories\n\n`;
  report += `| Category | Total | Working | Success Rate |\n`;
  report += `|----------|-------|---------|-------------|\n`;
  
  for (const category in results.categories) {
    const shortCategory = category.length > 40 ? category.substring(0, 40) + '...' : category;
    report += `| ${shortCategory} | ${results.categories[category].total} | ${results.categories[category].working} | ${results.categories[category].successRate}% |\n`;
  }
  
  report += `\n`;
  
  // Detailed results
  report += `## Detailed Results\n\n`;
  report += `| Source | Protocol | Status | Error |\n`;
  report += `|--------|----------|--------|-------|\n`;
  
  for (const source of results.sources) {
    const status = source.status === 'valid' 
      ? '✅ Working' 
      : source.status === 'invalid' 
        ? '❌ Invalid' 
        : '⚠️ Error';
    
    const error = source.error ? source.error.substring(0, 50) : '';
    report += `| ${source.name} | ${source.protocol.toUpperCase()} | ${status} | ${error} |\n`;
  }
  
  // Write report file
  fs.writeFileSync(reportPath, report);
  console.log(chalk.green(`Report saved to: ${reportPath}`));
  
  // Generate working endpoints list
  let workingEndpoints = '';
  for (const source of results.sources) {
    if (source.status === 'valid') {
      workingEndpoints += `${source.endpoint}\n`;
    }
  }
  
  fs.writeFileSync(workingEndpointsPath, workingEndpoints);
  console.log(chalk.green(`Working endpoints saved to: ${workingEndpointsPath}`));
}

/**
 * Main function
 */
async function main() {
  try {
    const sources = await extractSources();
    if (sources.length === 0) {
      console.log(chalk.yellow('No sources found to validate. Exiting.'));
      return;
    }
    
    const validationResults = await validateSources(sources);
    generateReport(validationResults);
    
    console.log(chalk.blue('\n🌐 VALIDATION SUMMARY'));
    console.log(chalk.blue('==================='));
    console.log(chalk.green(`Total Sources: ${validationResults.summary.totalSources}`));
    console.log(chalk.green(`Working Sources: ${validationResults.summary.workingSources}`));
    console.log(chalk.yellow(`Problem Sources: ${validationResults.summary.problemSources}`));
    console.log(chalk.blue(`Success Rate: ${validationResults.summary.successRate}%`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Run the script
main();
