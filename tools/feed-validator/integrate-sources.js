#!/usr/bin/env node

/**
 * Earth Alliance Source Integration Tool
 * This script integrates validated Earth Alliance sources into the dashboard
 * Updated to support multiple protocols beyond RSS
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Configuration
const WORKING_ENDPOINTS_PATH = path.resolve(process.cwd(), 'tools/feed-validator/tools/feed-validator/reports/working-multi-protocol-endpoints-2025-07-08T10-36-57.md');
const ROSTER_PATH = path.resolve(process.cwd(), 'docs/EARTH_ALLIANCE_SOURCE_ROSTER.md');
const OUTPUT_TS_PATH = path.resolve(process.cwd(), 'src/constants/EarthAllianceSources.ts');
const EARTH_ALLIANCE_FEEDS_PATH = path.resolve(process.cwd(), 'src/constants/EarthAllianceDefaultFeeds.ts');
const PROTOCOL_ADAPTER_PATH = path.resolve(process.cwd(), 'src/constants/SourceProtocolAdapter.ts');

// Load working endpoints
const workingEndpoints = fs.readFileSync(WORKING_ENDPOINTS_PATH, 'utf8')
  .split('\n')
  .filter(line => line.trim().length > 0);

console.log(chalk.blue('🌐 EARTH ALLIANCE MULTI-PROTOCOL SOURCE INTEGRATION'));
console.log(chalk.blue('======================================'));
console.log(chalk.green(`Found ${workingEndpoints.length} working endpoints to integrate`));

// Load roster file to get source metadata
const rosterContent = fs.readFileSync(ROSTER_PATH, 'utf8');
const lines = rosterContent.split('\n');

// Extract source information for working endpoints
const validSources = [];
let currentCategory = '';

// Process the roster file
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect category headers
  if (line.startsWith('### ')) {
    currentCategory = line.replace(/### [0-9️⃣]* /, '').trim();
    continue;
  }
  
  // Find feed endpoints for all protocol types
  const feedPatterns = [
    { type: 'rssFeed', regex: /\"rssFeed\"\s*:\s*\"([^\"]+)\"/ },
    { type: 'atomFeed', regex: /\"atomFeed\"\s*:\s*\"([^\"]+)\"/ },
    { type: 'jsonFeed', regex: /\"jsonFeed\"\s*:\s*\"([^\"]+)\"/ },
    { type: 'apiEndpoint', regex: /\"apiEndpoint\"\s*:\s*\"([^\"]+)\"/ },
    { type: 'ipfsAddress', regex: /\"ipfsAddress\"\s*:\s*\"([^\"]+)\"/, prefix: 'ipfs://' },
    { type: 'mastodonFeed', regex: /\"mastodonFeed\"\s*:\s*\"([^\"]+)\"/ },
    { type: 'ssbIdentifier', regex: /\"ssbIdentifier\"\s*:\s*\"([^\"]+)\"/, prefix: 'ssb://' }
  ];
  
  for (const pattern of feedPatterns) {
    const match = line.match(pattern.regex);
    if (match) {
      const endpointValue = match[1];
      const endpoint = pattern.prefix ? pattern.prefix + endpointValue : endpointValue;
      
      // Check if this is a working endpoint
      if (workingEndpoints.includes(endpoint)) {
        // Look back to find the name
        let name = 'Unknown Source';
        for (let j = Math.max(0, i - 10); j < i; j++) {
          const nameMatch = lines[j].match(/\"name\"\s*:\s*\"([^\"]+)\"/);
          if (nameMatch) {
            name = nameMatch[1];
            break;
          }
        }
        
        // Look for URL
        let url = '';
        for (let j = Math.max(0, i - 10); j < i; j++) {
          const urlMatch = lines[j].match(/\"url\"\s*:\s*\"([^\"]+)\"/);
          if (urlMatch) {
            url = urlMatch[1];
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
        
        // Look for categories
        let categories = [];
        for (let j = Math.max(0, i - 10); j < i + 10; j++) {
          if (j >= lines.length) break;
          const catMatch = lines[j].match(/\"categories\"\s*:\s*\[(.*?)\]/);
          if (catMatch) {
            categories = catMatch[1].split(',').map(cat => 
              cat.trim().replace(/\"/g, '').replace(/\s+/g, '-').toLowerCase()
            );
            break;
          }
        }
        
        // Look for format
        let format = 'unknown';
        for (let j = Math.max(0, i - 10); j < i + 10; j++) {
          if (j >= lines.length) break;
          const formatMatch = lines[j].match(/\"format\"\s*:\s*\"([^\"]+)\"/);
          if (formatMatch) {
            format = formatMatch[1];
            break;
          }
        }
        
        // Look for access method
        let accessMethod = 'direct';
        for (let j = Math.max(0, i - 10); j < i + 10; j++) {
          if (j >= lines.length) break;
          const accessMatch = lines[j].match(/\"accessMethod\"\s*:\s*\"([^\"]+)\"/);
          if (accessMatch) {
            accessMethod = accessMatch[1];
            break;
          }
        }
        
        // Look for verification method
        let verification = 'validated-endpoint';
        for (let j = Math.max(0, i - 10); j < i + 10; j++) {
          if (j >= lines.length) break;
          const verifyMatch = lines[j].match(/\"verification\"\s*:\s*\"([^\"]+)\"/);
          if (verifyMatch) {
            verification = verifyMatch[1];
            break;
          }
        }
        
        // Add to valid sources
        validSources.push({
          name,
          url,
          endpoint,
          protocol: pattern.type.replace(/Feed|Address|Endpoint|Identifier/g, ''),
          category: currentCategory,
          trustRating,
          categories,
          format,
          accessMethod,
          verification
        });
        
        console.log(chalk.cyan(`✓ Found metadata for: ${name} (${pattern.type}: ${endpoint})`));
      }
    }
  }
}

// Create TypeScript enum for categories and protocols
const categoryEnum = new Set();
validSources.forEach(source => {
  const enumKey = source.category
    .replace(/[^A-Za-z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .toUpperCase();
  categoryEnum.add(enumKey);
});

const protocolEnum = new Set();
validSources.forEach(source => {
  protocolEnum.add(source.protocol.toUpperCase());
});

// Generate TypeScript source file
let tsContent = `/**
 * Earth Alliance Sources - Types and Constants
 * Generated on: ${new Date().toISOString()}
 * Source: Multi-Protocol Validator
 */

import { FeedSource } from '../types/FeedTypes';

// Categories aligned with Earth Alliance intelligence priorities
export enum EarthAllianceCategory {
${Array.from(categoryEnum).map(cat => `  ${cat} = '${cat}'`).join(',\n')}
}

// Supported protocols for Earth Alliance sources
export enum SourceProtocol {
${Array.from(protocolEnum).map(proto => `  ${proto} = '${proto.toLowerCase()}'`).join(',\n')}
}

// Interface extending FeedSource with Earth Alliance specific attributes
export interface EarthAllianceFeedSource extends FeedSource {
  category: EarthAllianceCategory;
  trustRating: number; // 0-100
  allianceAlignment: number; // -100 to 100 (negative = compromised)
  accessMethod: string;
  verificationMethod: string;
  protocol: SourceProtocol;
  endpoint: string;
  format: string;
}

// Earth Alliance sources - VALIDATED WORKING ENDPOINTS ONLY
export const EARTH_ALLIANCE_SOURCES: EarthAllianceFeedSource[] = [
`;

// Add validated sources
validSources.forEach((source, index) => {
  const enumKey = source.category
    .replace(/[^A-Za-z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .toUpperCase();
  
  tsContent += `  {
    id: '${source.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index + 1}',
    name: '${source.name}',
    url: '${source.url}',
    category: EarthAllianceCategory.${enumKey},
    trustRating: ${source.trustRating},
    allianceAlignment: ${Math.min(100, source.trustRating + Math.floor(Math.random() * 10))},
    accessMethod: '${source.accessMethod}',
    verificationMethod: '${source.verification}',
    protocol: SourceProtocol.${source.protocol.toUpperCase()},
    endpoint: '${source.endpoint}',
    format: '${source.format}'
  }${index < validSources.length - 1 ? ',' : ''}
`;
});

tsContent += `];

// Function to get sources by category
export const getSourcesByCategory = (category: EarthAllianceCategory): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.category === category);
};

// Function to get sources by protocol
export const getSourcesByProtocol = (protocol: SourceProtocol): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.protocol === protocol);
};

// Function to get high-trust sources (trust rating above threshold)
export const getHighTrustSources = (threshold = 80): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.trustRating >= threshold);
};

// Function to get sources with high alliance alignment
export const getHighAlignmentSources = (threshold = 80): EarthAllianceFeedSource[] => {
  return EARTH_ALLIANCE_SOURCES.filter(source => source.allianceAlignment >= threshold);
};

// Default Earth Alliance feed URLs for the dashboard
export const earthAllianceDefaultUrls = EARTH_ALLIANCE_SOURCES.map(source => source.endpoint);`;

// Save the TypeScript file
fs.writeFileSync(OUTPUT_TS_PATH, tsContent);
console.log(chalk.green(`✅ Generated TypeScript source file: ${OUTPUT_TS_PATH}`));

// Save the TypeScript file
fs.writeFileSync(OUTPUT_TS_PATH, tsContent);
console.log(chalk.green(`✅ Generated TypeScript source file: ${OUTPUT_TS_PATH}`));

// Generate EarthAllianceDefaultFeeds.ts
let feedsContent = `import { FeedItem } from '../types/FeedTypes';
import { EARTH_ALLIANCE_SOURCES } from './EarthAllianceSources';

// Earth Alliance Feeds (VALIDATED WORKING ENDPOINTS ONLY)
export const EarthAllianceFeeds: FeedItem[] = EARTH_ALLIANCE_SOURCES.map((source, index) => ({
  id: \`ea-\${index + 1}\`,
  title: source.name,
  link: source.url,
  pubDate: new Date().toISOString(),
  description: \`Earth Alliance aligned source: \${source.category}\`,
  content: \`Earth Alliance intelligence source with trust rating: \${source.trustRating}\`,
  feedListId: '2',
  categories: [source.category],
}));

// Default is now Earth Alliance sources
export const DefaultFeeds: FeedItem[] = EarthAllianceFeeds;

// Feed modes enum
export enum FeedMode {
  EARTH_ALLIANCE = 'EARTH_ALLIANCE',
  MAINSTREAM = 'MAINSTREAM',
  HYBRID = 'HYBRID'
}

// Function to get appropriate feeds based on selected mode
export const getFeedsByMode = (mode: FeedMode) => {
  switch (mode) {
    case FeedMode.EARTH_ALLIANCE:
      return EarthAllianceFeeds;
    case FeedMode.MAINSTREAM:
      // You would import MainstreamFeeds here
      return [];
    case FeedMode.HYBRID:
      // Combine high-trust Earth Alliance sources with mainstream
      return [...EarthAllianceFeeds.filter(feed => {
        const source = EARTH_ALLIANCE_SOURCES.find(s => s.url === feed.link);
        return source && source.trustRating >= 80;
      })];
    default:
      return EarthAllianceFeeds;
  }
};`;

// Save the Feeds file
fs.writeFileSync(EARTH_ALLIANCE_FEEDS_PATH, feedsContent);
console.log(chalk.green(`✅ Generated Earth Alliance Feeds file: ${EARTH_ALLIANCE_FEEDS_PATH}`));

// Generate SourceProtocolAdapter.ts from template
try {
  const adapterTemplatePath = path.resolve(process.cwd(), 'tools/feed-validator/protocol-adapter-template.js');
  const adapterTemplate = require(adapterTemplatePath);
  const adapterContent = adapterTemplate.createProtocolAdapter();
  
  fs.writeFileSync(PROTOCOL_ADAPTER_PATH, adapterContent);
  console.log(chalk.green(`✅ Generated Protocol Adapter file: ${PROTOCOL_ADAPTER_PATH}`));
} catch (error) {
  console.error(chalk.red(`Error generating protocol adapter: ${error.message}`));
}

console.log(chalk.blue('======================================'));
console.log(chalk.green('✅ INTEGRATION COMPLETE'));
console.log(`Total Working Sources: ${validSources.length}`);
console.log(`Categories: ${categoryEnum.size}`);
console.log(chalk.blue('======================================\n'));

console.log(chalk.cyan('Next steps:'));
console.log('1. Import EarthAllianceFeeds in your components');
console.log('2. Add FeedMode selector to your UI');
console.log('3. Update your UI to display source trust ratings and alignment');
