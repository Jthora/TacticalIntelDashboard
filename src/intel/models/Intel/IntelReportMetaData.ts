// Intel Report Metadata
// Centralized metadata structure for intelligence reports
// Implements missing core type from Intel Architecture Cleanup Plan Phase 2

import { ClassificationLevel } from './Classification';
import { PrimaryIntelSource } from './Sources';
import { IntelCategory, IntelPriority, IntelThreatLevel } from './IntelEnums';

// =============================================================================
// INTEL REPORT METADATA INTERFACE
// =============================================================================

/**
 * Intel Report Metadata Interface
 * Centralized metadata structure for intelligence reports
 * Provides consistent metadata handling across all Intel components
 */
export interface IntelReportMetaData {
  // =============================================================================
  // CORE IDENTIFICATION
  // =============================================================================
  
  /** Metadata schema version */
  version: string;
  
  /** Report metadata ID */
  metadataId: string;
  
  /** Associated report ID */
  reportId: string;
  
  // =============================================================================
  // SOURCE & COLLECTION METADATA
  // =============================================================================
  
  /** Primary intelligence sources */
  sources: PrimaryIntelSource[];
  
  /** Source reliability ratings */
  sourceReliability: {
    [source: string]: {
      rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'X';
      confidence: number;
      trackRecord: number;
      lastVerified?: Date;
    };
  };
  
  /** Collection method details */
  collection: {
    method: string;
    platform?: string;
    sensor?: string;
    collectedBy: string;
    collectedAt: Date;
    collectionDuration?: number; // milliseconds
  };
  
  // =============================================================================
  // CLASSIFICATION & SECURITY
  // =============================================================================
  
  /** Security classification */
  classification: ClassificationLevel;
  
  /** Classification authority */
  classificationAuthority?: string;
  
  /** Classification reason */
  classificationReason?: string;
  
  /** Declassification date */
  declassificationDate?: Date;
  
  /** Handling restrictions */
  handlingRestrictions?: string[];
  
  // =============================================================================
  // INTELLIGENCE CATEGORIZATION
  // =============================================================================
  
  /** Primary intelligence category */
  category: IntelCategory;
  
  /** Secondary categories */
  secondaryCategories?: IntelCategory[];
  
  /** Priority level */
  priority: IntelPriority;
  
  /** Threat level assessment */
  threatLevel?: IntelThreatLevel;
  
  /** Intelligence type */
  intelType?: 'strategic' | 'tactical' | 'operational' | 'technical';
  
  // =============================================================================
  // QUALITY & CONFIDENCE METRICS
  // =============================================================================
  
  /** Overall confidence score (0-100) */
  confidence: number;
  
  /** Quality assessment metrics */
  quality: {
    accuracy: number;      // 0-100
    completeness: number;  // 0-100
    timeliness: number;    // 0-100
    relevance: number;     // 0-100
    reliability: number;   // 0-100
  };
  
  /** Quality assessment details */
  qualityAssessment?: {
    assessedBy: string;
    assessedAt: Date;
    assessmentMethod: string;
    qualityScore: number;
    qualityNotes?: string;
  };
  
  // =============================================================================
  // TEMPORAL METADATA
  // =============================================================================
  
  /** Event timestamp (when the intelligence event occurred) */
  eventTimestamp?: Date;
  
  /** Processing timestamps */
  processing: {
    receivedAt: Date;
    processedAt?: Date;
    analyzedAt?: Date;
    publishedAt?: Date;
    lastUpdated: Date;
  };
  
  /** Validity period */
  validity?: {
    validFrom: Date;
    validUntil: Date;
    timeDecayFactor?: number; // How quickly intel loses value over time
  };
  
  // =============================================================================
  // GEOGRAPHIC METADATA
  // =============================================================================
  
  /** Geographic metadata */
  geographic?: {
    accuracy: number; // meters
    source: string; // GPS, manual, derived, etc.
    datum?: string; // WGS84, etc.
    elevation?: number;
    bearing?: number;
    coordinateSystem?: string;
  };
  
  /** Area of interest */
  areaOfInterest?: {
    type: 'point' | 'circle' | 'polygon' | 'region';
    radius?: number; // for circle type
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    description?: string;
  };
  
  // =============================================================================
  // RELATIONSHIP METADATA
  // =============================================================================
  
  /** Related intelligence reports */
  relationships: {
    parent?: string; // Parent report ID
    children?: string[]; // Child report IDs
    siblings?: string[]; // Related report IDs
    supersedes?: string[]; // Reports this supersedes
    supersededBy?: string; // Report that supersedes this
    correlations?: Array<{
      reportId: string;
      correlationType: 'confirms' | 'contradicts' | 'supplements' | 'updates';
      confidence: number;
    }>;
  };
  
  /** Entity relationships */
  entities?: Array<{
    entityId: string;
    entityType: 'person' | 'organization' | 'location' | 'asset' | 'event';
    relationship: string;
    confidence: number;
  }>;
  
  // =============================================================================
  // PROCESSING METADATA
  // =============================================================================
  
  /** Processing workflow */
  workflow: {
    currentStage: 'collection' | 'processing' | 'analysis' | 'review' | 'publication' | 'distribution';
    completedStages: string[];
    nextStage?: string;
    assignedTo?: string;
    reviewers?: string[];
    approvals?: Array<{
      reviewer: string;
      approved: boolean;
      timestamp: Date;
      comments?: string;
    }>;
  };
  
  /** Processing flags */
  flags: {
    requiresHumanReview: boolean;
    sensitiveContent: boolean;
    urgentProcessing: boolean;
    anomalyDetected: boolean;
    correlationCandidate: boolean;
    qualityIssues: boolean;
    incompleteData: boolean;
  };
  
  // =============================================================================
  // DISTRIBUTION METADATA
  // =============================================================================
  
  /** Distribution information */
  distribution?: {
    distributionList: string[];
    distributedAt?: Date;
    distributedBy?: string;
    distributionMethod?: string;
    acknowledgments?: Array<{
      recipient: string;
      acknowledgedAt: Date;
      method: string;
    }>;
  };
  
  /** Access control */
  accessControl?: {
    readPermissions: string[];
    writePermissions: string[];
    sharePermissions: string[];
    restrictedUsers?: string[];
    accessLog?: Array<{
      user: string;
      action: 'read' | 'write' | 'share' | 'export';
      timestamp: Date;
      ipAddress?: string;
    }>;
  };
  
  // =============================================================================
  // TECHNICAL METADATA
  // =============================================================================
  
  /** Technical details */
  technical?: {
    format: string;
    encoding?: string;
    compression?: string;
    size: number; // bytes
    checksum?: string;
    mediaType?: string;
    originalFileName?: string;
  };
  
  /** Processing details */
  processingDetails?: {
    processedBy: string;
    processingMethod: string;
    processingVersion: string;
    processingTime: number; // milliseconds
    algorithmUsed?: string;
    confidence?: number;
    errors?: string[];
    warnings?: string[];
  };
  
  // =============================================================================
  // SEARCH & INDEXING METADATA
  // =============================================================================
  
  /** Search metadata */
  search: {
    keywords: string[];
    concepts: string[];
    entities: string[];
    fullTextHash?: string;
    searchableContent?: string;
    indexedAt?: Date;
  };
  
  /** Tags and categorization */
  tags: string[];
  
  /** Custom fields for extensibility */
  customFields?: Record<string, unknown>;
  
  // =============================================================================
  // AUDIT TRAIL
  // =============================================================================
  
  /** Change history */
  auditTrail: Array<{
    timestamp: Date;
    user: string;
    action: 'created' | 'updated' | 'classified' | 'shared' | 'deleted';
    details: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  }>;
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

/**
 * Basic Intel Metadata (simplified version for compatibility)
 */
export interface IntelMetadata {
  source: PrimaryIntelSource;
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'X';
  timestamp: number;
  category: string;
  tags: string[];
  classification?: ClassificationLevel;
  confidence?: number;
  quality?: {
    accuracy: number;
    completeness: number;
    timeliness: number;
  };
}

// =============================================================================
// METADATA UTILITIES
// =============================================================================

/**
 * Intel Report Metadata Builder
 * Fluent interface for building metadata
 */
export class IntelReportMetaDataBuilder {
  private metadata: Partial<IntelReportMetaData>;

  constructor(reportId: string) {
    this.metadata = {
      version: '1.0.0',
      metadataId: crypto.randomUUID(),
      reportId,
      sources: [],
      sourceReliability: {},
      collection: {
        method: 'unknown',
        collectedBy: 'system',
        collectedAt: new Date()
      },
      classification: 'UNCLASS' as ClassificationLevel,
      category: 'GENERAL' as IntelCategory,
      priority: 'ROUTINE' as IntelPriority,
      confidence: 50,
      quality: {
        accuracy: 50,
        completeness: 50,
        timeliness: 50,
        relevance: 50,
        reliability: 50
      },
      processing: {
        receivedAt: new Date(),
        lastUpdated: new Date()
      },
      relationships: {},
      workflow: {
        currentStage: 'collection',
        completedStages: []
      },
      flags: {
        requiresHumanReview: false,
        sensitiveContent: false,
        urgentProcessing: false,
        anomalyDetected: false,
        correlationCandidate: false,
        qualityIssues: false,
        incompleteData: false
      },
      search: {
        keywords: [],
        concepts: [],
        entities: []
      },
      tags: [],
      auditTrail: []
    };
  }

  addSource(source: PrimaryIntelSource, reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'X', confidence: number): this {
    this.metadata.sources!.push(source);
    this.metadata.sourceReliability![source] = {
      rating: reliability,
      confidence,
      trackRecord: 75 // Default track record
    };
    return this;
  }

  setClassification(classification: ClassificationLevel, authority?: string, reason?: string): this {
    this.metadata.classification = classification;
    if (authority) this.metadata.classificationAuthority = authority;
    if (reason) this.metadata.classificationReason = reason;
    return this;
  }

  setCategory(category: IntelCategory, priority: IntelPriority): this {
    this.metadata.category = category;
    this.metadata.priority = priority;
    return this;
  }

  setConfidence(confidence: number): this {
    this.metadata.confidence = Math.max(0, Math.min(100, confidence));
    return this;
  }

  setQuality(quality: Partial<IntelReportMetaData['quality']>): this {
    this.metadata.quality = { ...this.metadata.quality!, ...quality };
    return this;
  }

  addTag(tag: string): this {
    if (!this.metadata.tags!.includes(tag)) {
      this.metadata.tags!.push(tag);
    }
    return this;
  }

  addKeyword(keyword: string): this {
    if (!this.metadata.search!.keywords.includes(keyword)) {
      this.metadata.search!.keywords.push(keyword);
    }
    return this;
  }

  setWorkflowStage(stage: IntelReportMetaData['workflow']['currentStage']): this {
    this.metadata.workflow!.currentStage = stage;
    return this;
  }

  addAuditEntry(action: string, user: string, details: string): this {
    this.metadata.auditTrail!.push({
      timestamp: new Date(),
      user,
      action: action as 'created' | 'updated' | 'classified' | 'shared' | 'deleted',
      details
    });
    return this;
  }

  build(): IntelReportMetaData {
    return this.metadata as IntelReportMetaData;
  }
}

/**
 * Metadata Utilities
 */
export class IntelMetadataUtils {
  /**
   * Convert simple IntelMetadata to full IntelReportMetaData
   */
  static expandMetadata(simple: IntelMetadata, reportId: string): IntelReportMetaData {
    return new IntelReportMetaDataBuilder(reportId)
      .addSource(simple.source, simple.reliability, simple.confidence || 50)
      .setClassification(simple.classification || 'UNCLASS' as ClassificationLevel)
      .setCategory(simple.category as IntelCategory, 'ROUTINE' as IntelPriority)
      .setConfidence(simple.confidence || 50)
      .setQuality(simple.quality || {})
      .build();
  }

  /**
   * Calculate overall metadata quality score
   */
  static calculateQualityScore(metadata: IntelReportMetaData): number {
    const weights = {
      accuracy: 0.25,
      completeness: 0.25,
      timeliness: 0.2,
      relevance: 0.15,
      reliability: 0.15
    };

    return Math.round(
      metadata.quality.accuracy * weights.accuracy +
      metadata.quality.completeness * weights.completeness +
      metadata.quality.timeliness * weights.timeliness +
      metadata.quality.relevance * weights.relevance +
      metadata.quality.reliability * weights.reliability
    );
  }

  /**
   * Check if metadata is complete
   */
  static isComplete(metadata: IntelReportMetaData): boolean {
    return !!(
      metadata.reportId &&
      metadata.sources.length > 0 &&
      metadata.collection.collectedBy &&
      metadata.classification &&
      metadata.category &&
      metadata.confidence >= 0
    );
  }
}

// End of IntelReportMetaData.ts
