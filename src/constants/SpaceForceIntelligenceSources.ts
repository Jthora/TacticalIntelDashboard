import { IntelligenceSource } from '../types/ModernAPITypes';
import { isSourceEnabled } from '../utils/FeatureFlagUtil';
import {
  INVESTIGATIVE_RSS_API,
  NASA_API,
  NOAA_WEATHER_API,
  REDDIT_API
} from './APIEndpoints';
import { IntelligenceModeConfig } from './ModernIntelligenceSources';

export const SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'spaceforce-launch-watch',
    name: 'Launch Watch Network',
    description: 'Aggregated launch manifests, active countdowns, and anomaly alerts.',
    endpoint: NASA_API,
    normalizer: 'normalizeNASAAPOD',
    refreshInterval: 900000,
    enabled: isSourceEnabled('spaceforce-launch-watch', true),
  tags: ['space', 'launch', 'orbital', 'missions'],
  healthScore: 94
  },
  {
    id: 'spaceforce-space-weather',
    name: 'Space Weather Alerts',
    description: 'Solar storms, geomagnetic disturbances, and CME trajectories from SWPC.',
    endpoint: NOAA_WEATHER_API,
    normalizer: 'normalizeNOAAAlert',
    refreshInterval: 600000,
    enabled: isSourceEnabled('spaceforce-space-weather', true),
    tags: ['space', 'solar', 'swpc', 'alerts'],
    healthScore: 92
  },
  {
    id: 'spaceforce-orbital-debris',
    name: 'Orbital Debris Bulletins',
    description: 'Crowdsourced conjunction warnings and debris tracking notes.',
    endpoint: INVESTIGATIVE_RSS_API,
    normalizer: 'normalizeGeopoliticalRSS',
    refreshInterval: 1200000,
    enabled: isSourceEnabled('spaceforce-orbital-debris', true),
    tags: ['space', 'debris', 'conjunction', 'alerts'],
    healthScore: 88
  },
  {
    id: 'spaceforce-sda-ops',
    name: 'Space Domain Awareness Ops Center',
    description: 'Situation reports from USSF/SpaceOps public channels.',
    endpoint: INVESTIGATIVE_RSS_API,
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 900000,
    enabled: isSourceEnabled('spaceforce-sda-ops', true),
    tags: ['space', 'ussf', 'operations', 'situational-awareness'],
    healthScore: 90
  }
];

export const SPACEFORCE_SECONDARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'spaceforce-deep-space-network',
    name: 'Deep Space Network Telemetry',
    description: 'Mission telemetry digests from the Deep Space Network.',
    endpoint: NASA_API,
  normalizer: 'normalizeNASAAPOD',
    refreshInterval: 1800000,
    enabled: isSourceEnabled('spaceforce-deep-space-network', false),
  tags: ['space', 'telemetry', 'deep-space', 'signals'],
  healthScore: 85
  }
];

export const SPACEFORCE_SOCIAL_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'spaceforce-reddit-space',
    name: 'Reddit Space Intel',
    description: 'High-signal posts from r/space and r/SpaceXLounge.',
    endpoint: REDDIT_API,
    normalizer: 'normalizeRedditPosts',
    refreshInterval: 600000,
    enabled: isSourceEnabled('spaceforce-reddit-space', true),
    tags: ['space', 'community', 'social', 'alerts'],
    healthScore: 75
  }
];

export const SPACEFORCE_INTELLIGENCE_CONFIG: IntelligenceModeConfig = {
  primarySources: SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES.filter(source => source.enabled),
  refreshIntervals: {
    critical: 300000,
    high: 900000,
    medium: 1800000,
    low: 3600000
  },
  maxConcurrentRequests: 5,
  cacheEnabled: true,
  defaultCacheAge: 300000,
  retryAttempts: 3,
  timeout: 15000
};
