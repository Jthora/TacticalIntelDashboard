/**
 * Earth Alliance Sources - Types and Constants
 * Generated on: 2025-07-08T10:44:20.918Z
 * Source: Multi-Protocol Validator
 */

import { FeedSource } from '../types/FeedTypes';

// Categories aligned with Earth Alliance intelligence priorities
export enum EarthAllianceCategory {
  MILITARY_INTELLIGENCE_WHISTLEBLOWER_PLATFORMS = 'MILITARY_INTELLIGENCE_WHISTLEBLOWER_PLATFORMS',
  TECHNOLOGY_DISCLOSURE_NETWORKS = 'TECHNOLOGY_DISCLOSURE_NETWORKS',
  INDEPENDENT_INVESTIGATIVE_JOURNALISM = 'INDEPENDENT_INVESTIGATIVE_JOURNALISM',
  ALTERNATIVE_HEALTH_RESEARCH = 'ALTERNATIVE_HEALTH_RESEARCH',
  CONSCIOUSNESS_REALITY_RESEARCH = 'CONSCIOUSNESS_REALITY_RESEARCH',
  POSITIVE_MILITARY_OPERATIONS_TRACKING = 'POSITIVE_MILITARY_OPERATIONS_TRACKING'
}

// Supported protocols for Earth Alliance sources
export enum SourceProtocol {
  RSS = 'rss',
  JSON = 'json',
  API = 'api',
  IPFS = 'ipfs',
  MASTODON = 'mastodon',
  SSB = 'ssb'
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
  {
    id: 'veterans-today-1',
    name: 'Veterans Today',
    url: 'https://www.veteranstoday.com',
    category: EarthAllianceCategory.MILITARY_INTELLIGENCE_WHISTLEBLOWER_PLATFORMS,
    trustRating: 75,
    allianceAlignment: 79,
    accessMethod: 'account-required',
    verificationMethod: 'member-verification',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://www.veteranstoday.com/feed',
    format: 'news'
  },
  {
    id: 'new-energy-times-2',
    name: 'New Energy Times',
    url: 'https://newenergytimes.com',
    category: EarthAllianceCategory.TECHNOLOGY_DISCLOSURE_NETWORKS,
    trustRating: 88,
    allianceAlignment: 97,
    accessMethod: 'direct',
    verificationMethod: 'document-authentication',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://newenergytimes.com/feed',
    format: 'research'
  },
  {
    id: 'the-last-american-vagabond-3',
    name: 'The Last American Vagabond',
    url: 'https://www.thelastamericanvagabond.com',
    category: EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM,
    trustRating: 85,
    allianceAlignment: 93,
    accessMethod: 'direct',
    verificationMethod: 'source-documentation',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://www.thelastamericanvagabond.com/feed',
    format: 'news'
  },
  {
    id: 'unlimited-hangout-4',
    name: 'Unlimited Hangout',
    url: 'https://unlimitedhangout.com',
    category: EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM,
    trustRating: 85,
    allianceAlignment: 94,
    accessMethod: 'direct',
    verificationMethod: 'source-documentation',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://unlimitedhangout.com/feed',
    format: 'investigation'
  },
  {
    id: 'the-grayzone-5',
    name: 'The Grayzone',
    url: 'https://thegrayzone.com',
    category: EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM,
    trustRating: 82,
    allianceAlignment: 87,
    accessMethod: 'direct',
    verificationMethod: 'scientific-analysis',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://thegrayzone.com/feed',
    format: 'news'
  },
  {
    id: 'the-corbett-report-6',
    name: 'The Corbett Report',
    url: 'https://www.corbettreport.com',
    category: EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM,
    trustRating: 81,
    allianceAlignment: 84,
    accessMethod: 'direct',
    verificationMethod: 'on-the-ground-reporting',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://www.corbettreport.com/feed',
    format: 'multimedia'
  },
  {
    id: 'mintpress-news-7',
    name: 'MintPress News',
    url: 'https://www.mintpressnews.com',
    category: EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM,
    trustRating: 84,
    allianceAlignment: 85,
    accessMethod: 'direct',
    verificationMethod: 'source-documentation',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://www.mintpressnews.com/feed',
    format: 'news'
  },
  {
    id: 'children-s-health-defense-8',
    name: 'Children\'s Health Defense',
    url: 'https://childrenshealthdefense.org',
    category: EarthAllianceCategory.ALTERNATIVE_HEALTH_RESEARCH,
    trustRating: 83,
    allianceAlignment: 89,
    accessMethod: 'registration',
    verificationMethod: 'study-based',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://childrenshealthdefense.org/feed',
    format: 'news'
  },
  {
    id: 'natural-health-research-institute-9',
    name: 'Natural Health Research Institute',
    url: 'https://naturalhealthresearch.org',
    category: EarthAllianceCategory.ALTERNATIVE_HEALTH_RESEARCH,
    trustRating: 86,
    allianceAlignment: 93,
    accessMethod: 'direct',
    verificationMethod: 'physician-reviewed',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://naturalhealthresearch.org/feed',
    format: 'research'
  },
  {
    id: 'the-highwire-10',
    name: 'The Highwire',
    url: 'https://thehighwire.com',
    category: EarthAllianceCategory.ALTERNATIVE_HEALTH_RESEARCH,
    trustRating: 84,
    allianceAlignment: 93,
    accessMethod: 'direct',
    verificationMethod: 'peer-reviewed',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://thehighwire.com/feed',
    format: 'multimedia'
  },
  {
    id: 'alliance-for-natural-health-11',
    name: 'Alliance for Natural Health',
    url: 'https://anh-usa.org',
    category: EarthAllianceCategory.ALTERNATIVE_HEALTH_RESEARCH,
    trustRating: 79,
    allianceAlignment: 81,
    accessMethod: 'direct',
    verificationMethod: 'expert-interviews',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://anh-usa.org/feed',
    format: 'news'
  },
  {
    id: 'international-association-for-near-death-studies-12',
    name: 'International Association for Near-Death Studies',
    url: 'https://iands.org',
    category: EarthAllianceCategory.CONSCIOUSNESS_REALITY_RESEARCH,
    trustRating: 81,
    allianceAlignment: 89,
    accessMethod: 'direct',
    verificationMethod: 'peer-reviewed',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://iands.org/feed',
    format: 'research'
  },
  {
    id: 'institute-of-noetic-sciences-13',
    name: 'Institute of Noetic Sciences',
    url: 'https://noetic.org',
    category: EarthAllianceCategory.CONSCIOUSNESS_REALITY_RESEARCH,
    trustRating: 86,
    allianceAlignment: 86,
    accessMethod: 'direct',
    verificationMethod: 'academic-standards',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://noetic.org/feed',
    format: 'research'
  },
  {
    id: 'covert-action-quarterly-14',
    name: 'Covert Action Quarterly',
    url: 'https://covertactionquarterly.org',
    category: EarthAllianceCategory.POSITIVE_MILITARY_OPERATIONS_TRACKING,
    trustRating: 85,
    allianceAlignment: 86,
    accessMethod: 'restricted',
    verificationMethod: 'insider-sources',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://covertactionquarterly.org/feed',
    format: 'journal'
  },
  {
    id: 'earth-alliance-news-15',
    name: 'Earth Alliance News',
    url: 'https://earthalliance.news',
    category: EarthAllianceCategory.POSITIVE_MILITARY_OPERATIONS_TRACKING,
    trustRating: 87,
    allianceAlignment: 96,
    accessMethod: 'direct',
    verificationMethod: 'multi-source-corroboration',
    protocol: SourceProtocol.RSS,
    endpoint: 'https://earthalliance.news/feed/',
    format: 'news'
  }
];

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
export const earthAllianceDefaultUrls = EARTH_ALLIANCE_SOURCES.map(source => source.endpoint);