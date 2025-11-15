/**
 * Modern Intel Sources Adapter
 * Converts modern API intelligence sources to legacy TacticalIntelSource format
 * for backward compatibility with existing UI components
 */

import { MissionMode } from '../constants/MissionMode';
import { getSourcesWithRuntimeState } from '../constants/MissionSourceRegistry';
import { IntelligenceSource } from '../types/ModernAPITypes';
import { AuthType,ClassificationLevel, HealthStatus, IntelligenceCategory, SourceCost, TacticalIntelSource } from '../types/TacticalIntelligence';

/**
 * Convert modern API intelligence sources to legacy format
 */
export function convertToLegacyFormat(modernSource: IntelligenceSource): TacticalIntelSource {
  return {
    id: modernSource.id,
    name: modernSource.name,
  url: modernSource.homepage ?? modernSource.endpoint.baseUrl,
    category: mapModernCategoryToLegacy(modernSource.endpoint.category),
    reliability: Math.round(modernSource.healthScore / 10), // Convert 0-100 to 0-10 scale
    classification: 'UNCLASSIFIED' as ClassificationLevel,
    updateFrequency: Math.round(modernSource.refreshInterval / 60000), // Convert ms to minutes
    requiresAuth: modernSource.endpoint.requiresAuth,
    authType: modernSource.endpoint.requiresAuth ? 'API_KEY' as AuthType : 'NONE' as AuthType,
    cost: 'free' as SourceCost, // All modern APIs are free (removing cost indicators)
    region: ['GLOBAL'],
    tags: modernSource.tags,
    healthStatus: convertHealthScore(modernSource.healthScore),
    verificationRequired: false,
    minimumClearance: 'UNCLASSIFIED' as ClassificationLevel,
    needToKnow: [],
  endpoint: modernSource.endpoint.baseUrl,
    protocol: 'API' as const, // Modern APIs use HTTPS JSON
    format: 'json' // Modern APIs return JSON
  };
}

/**
 * Map modern API categories to legacy intelligence categories
 */
function mapModernCategoryToLegacy(category: string): IntelligenceCategory {
  switch (category) {
    case 'government':
      return 'OSINT'; // Government sources are open source intelligence
    case 'weather':
      return 'OSINT';
    case 'space':
      return 'TECHINT'; // Space/NASA is technical intelligence
    case 'security':
      return 'CYBINT'; // Security advisories are cyber intelligence
    case 'technology':
      return 'TECHINT';
    case 'financial':
      return 'OSINT'; // Financial data is open source
    case 'social':
      return 'OSINT'; // Social media is open source
    case 'investigative':
      return 'OSINT';
    default:
      return 'OSINT';
  }
}

/**
 * Convert health score to health status
 */
function convertHealthScore(healthScore: number): HealthStatus {
  if (healthScore >= 95) return 'operational';
  if (healthScore >= 80) return 'degraded';
  if (healthScore >= 50) return 'maintenance';
  return 'down';
}

/**
 * Get all modern intelligence sources in legacy format
 */
export function getModernIntelligenceSourcesAsLegacy(mode: MissionMode = MissionMode.MILTECH): TacticalIntelSource[] {
  const allModernSources = getSourcesWithRuntimeState(mode);
  return allModernSources.map(convertToLegacyFormat);
}

/**
 * Enhanced intelligence categories with modern API context
 */
export const MODERN_INTELLIGENCE_CATEGORIES = {
  OSINT: {
    color: '#00ffaa',
    icon: '📡',
    name: 'Open Source Intelligence',
    description: 'Government APIs, social media, and public data sources',
    sources: ['noaa-weather-alerts', 'usgs-earthquakes', 'reddit-worldnews', 'coingecko-crypto', 'intercept-investigations', 'propublica-investigations', 'icij-investigations', 'bellingcat-investigations', 'ddosecrets-investigations', 'occrp-investigations', 'grayzone-geopolitics', 'mintpress-geopolitics', 'geopolitical-economy-report', 'eff-updates', 'privacy-international', 'inside-climate-news', 'guardian-environment', 'transparency-international', 'opensecrets-transparency', 'future-of-life-institute']
  },
  TECHINT: {
    color: '#ff6600',
    icon: '🔧',
    name: 'Technical Intelligence',
    description: 'Technology platforms, security advisories, and innovation tracking',
    sources: ['github-security', 'hackernews-tech', 'nasa-space-data', 'wired-security']
  },
  CYBINT: {
    color: '#ffff00',
    icon: '🛡️',
    name: 'Cyber Intelligence',
    description: 'Security vulnerabilities, threat intelligence, and cyber monitoring',
    sources: ['github-security', 'reddit-security', 'earth-alliance-news', 'krebs-security', 'threatpost-security']
  },
  HUMINT: {
    color: '#ff3333',
    icon: '👤',
    name: 'Human Intelligence',
    description: 'Social discussions, community intelligence, and crowd-sourced data',
    sources: ['reddit-worldnews', 'hackernews-tech']
  },
  SIGINT: {
    color: '#0099ff',
    icon: '📻',
    name: 'Signals Intelligence',
    description: 'Communications monitoring and signal analysis (future capability)',
    sources: []
  },
  GEOINT: {
    color: '#9933ff',
    icon: '🌍',
    name: 'Geospatial Intelligence',
    description: 'Geographic data, earthquake monitoring, and location intelligence',
    sources: ['usgs-earthquakes', 'noaa-weather-alerts']
  },
  MILINT: {
    color: '#00ff00',
    icon: '⚔️',
    name: 'Military Intelligence',
    description: 'Defense and military intelligence (future capability)',
    sources: ['earth-alliance-news']
  },
  INVESTIGATIVE: {
    color: '#1de9b6',
    icon: '🕵️',
    name: 'Investigative Intelligence',
    description: 'Leak-centric outlets and collaborative investigative journalism',
    sources: ['intercept-investigations', 'propublica-investigations', 'icij-investigations', 'bellingcat-investigations', 'ddosecrets-investigations', 'occrp-investigations', 'grayzone-geopolitics', 'mintpress-geopolitics', 'geopolitical-economy-report']
  },
  MASINT: {
    color: '#ff9900',
    icon: '🔬',
    name: 'Measurement & Signature Intelligence',
    description: 'Scientific measurement and signature analysis',
    sources: ['nasa-space-data', 'usgs-earthquakes']
  },
  PRIVINT: {
    color: '#6c6cff',
    icon: '🕶️',
    name: 'Privacy & Civil Liberties',
    description: 'Legal advocacy and surveillance countermeasures',
    sources: ['eff-updates', 'privacy-international']
  },
  CLIMINT: {
    color: '#2ecc71',
    icon: '🌿',
    name: 'Climate Intelligence',
    description: 'Environmental resilience and climate justice monitoring',
    sources: ['inside-climate-news', 'guardian-environment']
  },
  AIGOV: {
    color: '#9b59b6',
    icon: '🤖',
    name: 'AI Governance',
    description: 'AI safety, regulation, and existential risk reporting',
    sources: ['future-of-life-institute', 'wired-security']
  }
};

/**
 * Get category statistics for modern sources
 */
export function getCategoryStats() {
  const modernSources = getModernIntelligenceSourcesAsLegacy();
  const stats: Record<string, { count: number; operational: number; avgHealth: number }> = {};

  Object.keys(MODERN_INTELLIGENCE_CATEGORIES).forEach(category => {
    const categorySources = modernSources.filter(s => s.category === category);
    const operational = categorySources.filter(s => s.healthStatus === 'operational').length;
    const avgHealth = categorySources.length > 0 
      ? categorySources.reduce((sum, s) => sum + s.reliability * 10, 0) / categorySources.length 
      : 0;

    stats[category] = {
      count: categorySources.length,
      operational,
      avgHealth: Math.round(avgHealth)
    };
  });

  return stats;
}
