/**
 * Modern Intelligence Sources Configuration
 * Defines the real-time, CORS-friendly intelligence sources for the dashboard
 */

import { IntelligenceSource } from '../types/ModernAPITypes';
import { 
  COINGECKO_API,
  GITHUB_API,
  HACKERNEWS_API,
  NASA_API,
  NOAA_WEATHER_API,
  REDDIT_API,
  USGS_EARTHQUAKE_API} from './APIEndpoints';

// TDD Error Tracking
const TDD_ERRORS = {
  logError: (id: string, location: string, issue: string, data?: any) => {
    console.error(`TDD_ERROR_${id}`, {
      location,
      issue,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Primary Intelligence Sources - Ready for immediate deployment
 * These sources require no authentication and have CORS enabled
 */
export const PRIMARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'noaa-weather-alerts',
    name: 'NOAA Weather Alerts',
    description: 'Real-time weather alerts and warnings from the National Weather Service',
    endpoint: NOAA_WEATHER_API,
    normalizer: 'normalizeNOAAAlert',
    refreshInterval: 300000, // 5 minutes
    enabled: true,
    tags: ['weather', 'alerts', 'government', 'official'],
    healthScore: 100
  },
  {
    id: 'usgs-earthquakes',
    name: 'USGS Earthquake Data',
    description: 'Recent earthquake activity from the US Geological Survey',
    endpoint: USGS_EARTHQUAKE_API,
    normalizer: 'normalizeUSGSEarthquakes',
    refreshInterval: 600000, // 10 minutes
    enabled: true,
    tags: ['seismic', 'geology', 'government', 'hazards'],
    healthScore: 100
  },
  {
    id: 'github-security',
    name: 'GitHub Security Advisories',
    description: 'Latest security vulnerabilities and advisories from GitHub',
    endpoint: GITHUB_API,
    normalizer: 'normalizeGitHubSecurityAdvisories',
    refreshInterval: 3600000, // 1 hour
    enabled: true,
    tags: ['security', 'vulnerabilities', 'github', 'technology'],
    healthScore: 95
  },
  {
    id: 'hackernews-tech',
    name: 'Hacker News Technology',
    description: 'Top technology discussions and news from Hacker News',
    endpoint: HACKERNEWS_API,
    normalizer: 'normalizeHackerNewsItem',
    refreshInterval: 900000, // 15 minutes
    enabled: true,
    tags: ['technology', 'discussion', 'innovation', 'startups'],
    healthScore: 90
  },
  {
    id: 'coingecko-crypto',
    name: 'CoinGecko Crypto',
    description: 'Cryptocurrency market data and trends from CoinGecko',
    endpoint: COINGECKO_API,
    normalizer: 'normalizeCoinGeckoData',
    refreshInterval: 600000, // 10 minutes
    enabled: true,
    tags: ['cryptocurrency', 'financial', 'markets', 'blockchain'],
    healthScore: 85
  }
];

// TDD_ERROR_001: Verify sources array is defined and populated
if (!PRIMARY_INTELLIGENCE_SOURCES) {
  TDD_ERRORS.logError('001', 'ModernIntelligenceSources.PRIMARY_INTELLIGENCE_SOURCES', 'PRIMARY_INTELLIGENCE_SOURCES is undefined');
} else if (PRIMARY_INTELLIGENCE_SOURCES.length === 0) {
  TDD_ERRORS.logError('002', 'ModernIntelligenceSources.PRIMARY_INTELLIGENCE_SOURCES', 'PRIMARY_INTELLIGENCE_SOURCES is empty array');
} else {
  console.log('TDD_LOG_001: PRIMARY_INTELLIGENCE_SOURCES loaded successfully', {
    count: PRIMARY_INTELLIGENCE_SOURCES.length,
    sources: PRIMARY_INTELLIGENCE_SOURCES.map(s => ({ id: s.id, name: s.name, enabled: s.enabled }))
  });
}

// TDD_ERROR_003-007: Validate each source configuration
PRIMARY_INTELLIGENCE_SOURCES.forEach((source, index) => {
  if (!source.id) {
    TDD_ERRORS.logError(`003_${index}`, 'ModernIntelligenceSources.source.id', `Source at index ${index} missing id`, source);
  }
  if (!source.endpoint) {
    TDD_ERRORS.logError(`004_${index}`, 'ModernIntelligenceSources.source.endpoint', `Source ${source.id} missing endpoint`, source);
  }
  if (!source.normalizer) {
    TDD_ERRORS.logError(`005_${index}`, 'ModernIntelligenceSources.source.normalizer', `Source ${source.id} missing normalizer`, source);
  }
  if (!source.enabled) {
    console.warn(`TDD_WARN_${index}: Source ${source.id} is disabled`);
  }
  if (!source.endpoint?.baseUrl) {
    TDD_ERRORS.logError(`006_${index}`, 'ModernIntelligenceSources.source.endpoint.baseUrl', `Source ${source.id} missing baseUrl`, source.endpoint);
  }
  if (!source.endpoint?.endpoints) {
    TDD_ERRORS.logError(`007_${index}`, 'ModernIntelligenceSources.source.endpoint.endpoints', `Source ${source.id} missing endpoints`, source.endpoint);
  }
});

/**
 * Secondary Intelligence Sources - Require API keys but available
 */
export const SECONDARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'nasa-space-data',
    name: 'NASA Space Intelligence',
    description: 'Space missions, astronomical events, and NASA updates',
    endpoint: NASA_API,
    normalizer: 'normalizeNASAAPOD',
    refreshInterval: 86400000, // Daily
    enabled: false, // Requires API key
    tags: ['space', 'nasa', 'astronomy', 'science'],
    healthScore: 100
  }
];

/**
 * Social Intelligence Sources - High volume, lower trust
 */
export const SOCIAL_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'reddit-worldnews',
    name: 'Reddit World News',
    description: 'Breaking news and discussions from Reddit WorldNews',
    endpoint: REDDIT_API,
    normalizer: 'normalizeRedditPosts',
    refreshInterval: 900000, // 15 minutes
    enabled: true,
    tags: ['news', 'discussion', 'social', 'breaking'],
    healthScore: 70
  },
  {
    id: 'reddit-security',
    name: 'Reddit Security',
    description: 'Security discussions and alerts from Reddit security communities',
    endpoint: REDDIT_API,
    normalizer: 'normalizeRedditPosts',
    refreshInterval: 1800000, // 30 minutes
    enabled: true,
    tags: ['security', 'discussion', 'cybersecurity', 'threats'],
    healthScore: 75
  }
];

/**
 * All Intelligence Sources Combined
 */
export const ALL_INTELLIGENCE_SOURCES = [
  ...PRIMARY_INTELLIGENCE_SOURCES,
  ...SECONDARY_INTELLIGENCE_SOURCES,
  ...SOCIAL_INTELLIGENCE_SOURCES
];

/**
 * Default Intelligence Configuration
 * Sources that are enabled by default for new installations
 */
export const DEFAULT_INTELLIGENCE_CONFIG = {
  primarySources: PRIMARY_INTELLIGENCE_SOURCES.filter(source => source.enabled),
  refreshIntervals: {
    critical: 300000,    // 5 minutes
    high: 600000,        // 10 minutes
    medium: 1800000,     // 30 minutes
    low: 3600000         // 1 hour
  },
  maxConcurrentRequests: 5,
  cacheEnabled: true,
  defaultCacheAge: 300000, // 5 minutes
  retryAttempts: 3,
  timeout: 10000 // 10 seconds
};

/**
 * Intelligence Source Categories for UI Organization
 */
export const SOURCE_CATEGORIES = {
  GOVERNMENT: {
    name: 'Government & Official',
    description: 'Official government sources and agencies',
    sources: ['noaa-weather-alerts', 'usgs-earthquakes', 'nasa-space-data'],
    trustLevel: 'high',
    icon: '🏛️'
  },
  SECURITY: {
    name: 'Security & Threats',
    description: 'Cybersecurity, vulnerabilities, and threat intelligence',
    sources: ['github-security', 'reddit-security'],
    trustLevel: 'high',
    icon: '🛡️'
  },
  TECHNOLOGY: {
    name: 'Technology & Innovation',
    description: 'Tech news, innovations, and industry updates',
    sources: ['hackernews-tech'],
    trustLevel: 'medium',
    icon: '💻'
  },
  FINANCIAL: {
    name: 'Financial & Markets',
    description: 'Market data, economic indicators, and financial news',
    sources: ['coingecko-crypto'],
    trustLevel: 'medium',
    icon: '📈'
  },
  SOCIAL: {
    name: 'Social Intelligence',
    description: 'Social media discussions and crowd-sourced intelligence',
    sources: ['reddit-worldnews', 'reddit-security'],
    trustLevel: 'low',
    icon: '👥'
  }
};

/**
 * Utility Functions
 */
export const getSourcesByCategory = (category: string): IntelligenceSource[] => {
  const categoryConfig = Object.values(SOURCE_CATEGORIES).find(cat => 
    cat.name.toLowerCase().includes(category.toLowerCase())
  );
  
  if (!categoryConfig) return [];
  
  return ALL_INTELLIGENCE_SOURCES.filter(source =>
    categoryConfig.sources.includes(source.id)
  );
};

export const getEnabledSources = (): IntelligenceSource[] => {
  return ALL_INTELLIGENCE_SOURCES.filter(source => source.enabled);
};

export const getHighPrioritySources = (): IntelligenceSource[] => {
  return ALL_INTELLIGENCE_SOURCES.filter(source => 
    source.healthScore >= 90 && source.enabled
  );
};

export const getSourceById = (id: string): IntelligenceSource | undefined => {
  return ALL_INTELLIGENCE_SOURCES.find(source => source.id === id);
};

/**
 * Configuration for different deployment environments
 */
export const ENVIRONMENT_CONFIGS = {
  development: {
    enabledSources: PRIMARY_INTELLIGENCE_SOURCES.slice(0, 3), // Limit for dev
    refreshIntervals: { ...DEFAULT_INTELLIGENCE_CONFIG.refreshIntervals },
    debugMode: true
  },
  production: {
    enabledSources: PRIMARY_INTELLIGENCE_SOURCES,
    refreshIntervals: DEFAULT_INTELLIGENCE_CONFIG.refreshIntervals,
    debugMode: false
  },
  demo: {
    enabledSources: PRIMARY_INTELLIGENCE_SOURCES.slice(0, 2), // Minimal for demo
    refreshIntervals: {
      critical: 600000,  // Slower refresh for demo
      high: 1800000,
      medium: 3600000,
      low: 7200000
    },
    debugMode: false
  }
};

/**
 * Migration mapping from RSS feeds to modern APIs
 * Used for transitioning existing feed configurations
 */
export const RSS_TO_API_MIGRATION: Record<string, string> = {
  'cnn-rss': 'reddit-worldnews',
  'bbc-rss': 'reddit-worldnews', 
  'reuters-rss': 'reddit-worldnews',
  'weather-rss': 'noaa-weather-alerts',
  'security-rss': 'github-security',
  'tech-rss': 'hackernews-tech',
  'crypto-rss': 'coingecko-crypto'
};
