/**
 * Modern Intelligence Sources Configuration
 * Defines the real-time, CORS-friendly intelligence sources for the dashboard
 */

import { IntelligenceSource } from '../types/ModernAPITypes';
import { 
  NOAA_WEATHER_API,
  NASA_API,
  USGS_EARTHQUAKE_API,
  GITHUB_API,
  HACKERNEWS_API,
  COINGECKO_API,
  REDDIT_API,
  getCorsEnabledEndpoints,
  getImmediateReadyEndpoints
} from './APIEndpoints';

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
    healthScore: 100,
    lastFetched: undefined
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
    healthScore: 100,
    lastFetched: undefined
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
    healthScore: 95,
    lastFetched: undefined
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
    healthScore: 90,
    lastFetched: undefined
  },
  {
    id: 'coingecko-crypto',
    name: 'Cryptocurrency Intelligence',
    description: 'Cryptocurrency market data and trends from CoinGecko',
    endpoint: COINGECKO_API,
    normalizer: 'normalizeCoinGeckoData',
    refreshInterval: 600000, // 10 minutes
    enabled: true,
    tags: ['cryptocurrency', 'financial', 'markets', 'blockchain'],
    healthScore: 85,
    lastFetched: undefined
  }
];

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
    healthScore: 100,
    lastFetched: undefined
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
    healthScore: 70,
    lastFetched: undefined
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
    healthScore: 75,
    lastFetched: undefined
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
