/**
 * Tactical Intelligence Types
 * Classification: UNCLASSIFIED
 * Generated on: 2025-07-11
 */

// Intelligence categories based on collection discipline
export type IntelligenceCategory = 
  | 'OSINT'      // Open Source Intelligence
  | 'HUMINT'     // Human Intelligence
  | 'SIGINT'     // Signals Intelligence
  | 'GEOINT'     // Geospatial Intelligence
  | 'TECHINT'    // Technical Intelligence
  | 'CYBINT'     // Cyber Intelligence
  | 'MILINT'     // Military Intelligence
  | 'MASINT';    // Measurement and Signature Intelligence

// Priority levels for intelligence items
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Verification status for intelligence
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'DISPUTED' | 'DISPROVEN';

// Processing status
export type ProcessingStatus = 'RAW' | 'PROCESSING' | 'ANALYZED' | 'DISSEMINATED';

// Authentication types for sources
export type AuthType = 'API_KEY' | 'OAUTH' | 'CERTIFICATE' | 'BASIC' | 'NONE';

// Source cost model
export type SourceCost = 'free' | 'premium' | 'restricted';

// Health status for sources
export type HealthStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

// Geographic location for intelligence
export interface GeographicLocation {
  latitude: number;
  longitude: number;
  region: string;
  country: string;
  city?: string;
  radius?: number; // meters
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Classification metadata (optional for civilian distributions)
export interface ClassificationMetadata {
  level?: string;
  caveats?: string[]; // e.g., ['NOFORN', 'EYES ONLY']
  declassifyOn?: Date;
  originator: string;
  derivedFrom?: string[];
  releasableTo?: string[]; // Countries or organizations
}

// Access log entry for audit trail
export interface AccessLogEntry {
  userId: string;
  timestamp: Date;
  action: string;
  result: 'GRANTED' | 'DENIED';
  reason?: string;
  context?: Record<string, any>;
}

// Enhanced intelligence item extending the base FeedItem
export interface IntelligenceItem {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  category: IntelligenceCategory;
  classification: ClassificationMetadata;
  reliability: number; // 1-10 scale
  confidence: number; // 1-10 scale
  timestamp: Date;
  expirationDate?: Date;
  location?: GeographicLocation;
  tags: string[];
  priority: PriorityLevel;
  verification: VerificationStatus;
  relatedItems: string[]; // IDs of related intelligence
  actionRequired: boolean;
  assignedAnalyst?: string;
  processingStatus: ProcessingStatus;
  
  // Audit trail
  accessLog: AccessLogEntry[];
  
  // Original feed data for compatibility
  feedData?: {
    link: string;
    pubDate: string;
    description: string;
    feedListId: string;
    author?: string;
    categories?: string[];
    media?: { url: string, type: string }[];
  };
}

// Tactical intelligence source definition
export interface TacticalIntelSource {
  id: string;
  name: string;
  url: string;
  category: IntelligenceCategory;
  reliability: number; // 1-10 scale
  classification?: string;
  updateFrequency: number; // minutes
  requiresAuth: boolean;
  authType?: AuthType;
  cost: SourceCost;
  region?: string[];
  tags: string[];
  lastUpdated?: Date;
  healthStatus: HealthStatus;
  verificationRequired: boolean;
  // UI toggle flags
  marqueeEnabled?: boolean; // when true show in MarqueeBar
  feedEnabled?: boolean; // when true include in Intelligence Feed aggregation
  
  // Access control
  minimumClearance?: string;
  needToKnow?: string[];
  
  // Technical details
  endpoint?: string;
  apiVersion?: string;
  protocol: 'RSS' | 'JSON' | 'API' | 'WebSocket';
  format: string;
  
  // Performance metrics
  averageResponseTime?: number;
  successRate?: number;
  lastSuccessfulFetch?: Date;
  errorCount?: number;
}

// Alert types for intelligence
export type AlertType = 'CRITICAL_INTELLIGENCE' | 'SOURCE_DOWN' | 'SECURITY_BREACH' | 'SYSTEM_ERROR';

// Intelligence alert
export interface IntelligenceAlert {
  id: string;
  intelligenceId?: string;
  type: AlertType;
  priority: PriorityLevel;
  title: string;
  message: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'dismissed';
  assignedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  escalationLevel: number;
  expiresAt?: Date;
  
  metadata: {
    sourceId?: string;
    classification?: string;
    location?: GeographicLocation;
    relatedAlerts?: string[];
  };
}

// Threat assessment data
export interface ThreatAssessment {
  id: string;
  title: string;
  description: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number; // 0-100
  impact: number; // 0-100
  confidence: number; // 0-100
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  location?: GeographicLocation;
  sources: string[]; // Source IDs
  indicators: string[];
  mitigationSteps: string[];
  lastUpdated: Date;
  analyst: string;
  classification: ClassificationMetadata;
}

// Processing statistics
export interface IntelligenceStatistics {
  totalItems: number;
  byCategory: Record<IntelligenceCategory, number>;
  byClassification: Record<string, number>;
  byPriority: Record<PriorityLevel, number>;
  processingRate: number; // items per minute
  errorRate: number; // percentage
  averageProcessingTime: number; // milliseconds
  sourceHealthSummary: Record<HealthStatus, number>;
}

// Enhanced feed results for tactical intelligence
export interface TacticalFeedResults {
  intelligence: IntelligenceItem[];
  alerts: IntelligenceAlert[];
  statistics: IntelligenceStatistics;
  fetchedAt: string;
  processingTime: number;
  errors: string[];
}

// Backward compatibility - extend existing FeedItem
export interface EnhancedFeedItem extends IntelligenceItem {
  // Map to original FeedItem structure for compatibility
  link: string;
  pubDate: string;
  description: string;
  feedListId: string;
  author?: string;
  categories?: string[];
  media?: { url: string, type: string }[];
}
