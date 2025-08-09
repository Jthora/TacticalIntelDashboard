// Unified Intelligence Report Model
// This is the single source of truth for all IntelReport interfaces across the application
// Consolidates fragmented implementations from various components and services

import { IntelCategory, IntelPriority, IntelThreatLevel, IntelClassification } from './IntelEnums';
import { ClassificationLevel } from './Classification';
import { PrimaryIntelSource } from './Sources';
import { IntelVisualization3D } from './IntelVisualization3D';
import { IntelLocation } from './IntelLocation';

// =============================================================================
// CORE UNIFIED INTEL REPORT INTERFACE
// =============================================================================

/**
 * Unified Intelligence Report Interface
 * This interface consolidates all fragmented IntelReport patterns found across:
 * - /src/services/IntelReportVisualizationService.ts
 * - /src/components/IntelAnalyzer/IntelReportsViewer.tsx
 * - /src/applications/netrunner/models/IntelReport.ts
 * - /src/services/data-management/providers/IntelDataProvider.ts
 * - And many other locations with duplicate interfaces
 */
export interface IntelReport {
  // =============================================================================
  // CORE IDENTIFICATION
  // =============================================================================
  
  /** Unique identifier */
  id: string;
  
  /** Primary title of the intelligence report */
  title: string;
  
  /** Optional subtitle for additional context */
  subtitle?: string;
  
  /** Primary content/description of the report */
  content: string;
  
  /** Brief summary for quick reference */
  summary?: string;
  
  /** Descriptive text for the report */
  description?: string;
  
  // =============================================================================
  // AUTHORSHIP & METADATA
  // =============================================================================
  
  /** Report author (wallet address, agent ID, or name) */
  author: string;
  
  /** Creation timestamp */
  created: Date;
  
  /** Last update timestamp */
  updated: Date;
  
  /** Report version for tracking changes */
  version?: string;
  
  // =============================================================================
  // GEOGRAPHIC DATA
  // =============================================================================
  
  /** Primary latitude coordinate */
  latitude: number;
  
  /** Primary longitude coordinate */
  longitude: number;
  
  /** Human-readable location description */
  location?: string;
  
  /** Advanced 3D location data (optional) */
  location3D?: IntelLocation;
  
  // =============================================================================
  // CLASSIFICATION & SECURITY
  // =============================================================================
  
  /** Security classification level */
  classification: ClassificationLevel | IntelClassification;
  
  /** Report priority level */
  priority?: IntelPriority | 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
  
  /** Threat level assessment */
  threatLevel?: IntelThreatLevel;
  
  /** Confidence score (0-100) */
  confidence: number;
  
  // =============================================================================
  // CATEGORIZATION & TAGGING
  // =============================================================================
  
  /** Report category */
  category?: IntelCategory;
  
  /** Additional categories */
  categories?: string[];
  
  /** Searchable tags */
  tags: string[];
  
  /** Report type classification */
  type?: 'report' | 'analysis' | 'entity' | 'connection' | 'hypothesis' | 'intelligence' | 'assessment';
  
  // =============================================================================
  // INTELLIGENCE STRUCTURE
  // =============================================================================
  
  /** Key findings from the analysis */
  keyFindings?: string[];
  
  /** Intelligence source types that contributed */
  sources?: PrimaryIntelSource[] | string[];
  
  /** Source summary description */
  sourceSummary?: string;
  
  /** Related report connections */
  connections?: string[]; // IDs of connected reports
  
  /** Related reports */
  relatedReports?: string[];
  
  // =============================================================================
  // WORKFLOW & STATUS
  // =============================================================================
  
  /** Current report status */
  status?: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  
  /** Workflow information */
  workflow?: {
    stage: string;
    assignee?: string;
    reviewers: string[];
    approvals?: Array<{
      reviewer: string;
      approved: boolean;
      timestamp: Date;
      comments?: string;
    }>;
  };
  
  // =============================================================================
  // BLOCKCHAIN INTEGRATION
  // =============================================================================
  
  /** Solana account public key (base58) */
  pubkey?: string;
  
  /** Transaction signature */
  signature?: string;
  
  /** Blockchain timestamp */
  timestamp?: number;
  
  /** Verification status */
  verified?: boolean;
  
  // =============================================================================
  // 3D VISUALIZATION (FROM PHASE 1.5)
  // =============================================================================
  
  /** 3D visualization properties (optional) */
  visualization3D?: IntelVisualization3D;
  
  // =============================================================================
  // TECHNICAL METADATA
  // =============================================================================
  
  /** Extended technical metadata */
  metadata?: {
    scanId?: string;
    targetUrl?: string;
    scanType?: string;
    processingTime?: number;
    dataSize?: number;
    qualityScore?: number;
    source?: string;
    [key: string]: unknown;
  };
  
  // =============================================================================
  // UI DISPLAY FIELDS
  // =============================================================================
  
  /** ISO date string for display */
  date?: string;
  
  /** Meta description for UI components */
  metaDescription?: string;
  
  // =============================================================================
  // LEGACY COMPATIBILITY
  // =============================================================================
  
  /** @deprecated Use latitude instead */
  lat?: number;
  
  /** @deprecated Use longitude instead */
  long?: number;
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

/**
 * Intel Entity (from NetRunner model)
 */
export interface IntelEntity {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'location' | 'asset' | 'event' | 'technology';
  confidence: number;
  attributes: Record<string, unknown>;
}

/**
 * Intel Relationship (from NetRunner model)
 */
export interface IntelRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'connected_to' | 'owns' | 'controls' | 'located_at' | 'works_for' | 'related_to';
  confidence: number;
  metadata: Record<string, unknown>;
}

/**
 * Evidence supporting the intel report
 */
export interface Evidence {
  id: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'data' | 'testimony';
  source: string;
  description: string;
  reliability: number;
  metadata: Record<string, unknown>;
}

// =============================================================================
// TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Intel Report Builder
 * Provides a fluent interface for creating Intel Reports
 */
export class IntelReportBuilder {
  private report: Partial<IntelReport>;

  constructor(title: string, author: string) {
    this.report = {
      id: crypto.randomUUID(),
      title,
      author,
      created: new Date(),
      updated: new Date(),
      version: '1.0.0',
      confidence: 0,
      tags: [],
      latitude: 0,
      longitude: 0,
      content: '',
      classification: 'UNCLASSIFIED' as ClassificationLevel
    };
  }

  setId(id: string): this {
    this.report.id = id;
    return this;
  }

  setSubtitle(subtitle: string): this {
    this.report.subtitle = subtitle;
    return this;
  }

  setContent(content: string): this {
    this.report.content = content;
    return this;
  }

  setSummary(summary: string): this {
    this.report.summary = summary;
    return this;
  }

  setDescription(description: string): this {
    this.report.description = description;
    return this;
  }

  setLocation(latitude: number, longitude: number, location?: string): this {
    this.report.latitude = latitude;
    this.report.longitude = longitude;
    if (location) this.report.location = location;
    return this;
  }

  setClassification(level: ClassificationLevel | IntelClassification): this {
    this.report.classification = level;
    return this;
  }

  setPriority(priority: IntelPriority | 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE'): this {
    this.report.priority = priority;
    return this;
  }

  setThreatLevel(threatLevel: IntelThreatLevel): this {
    this.report.threatLevel = threatLevel;
    return this;
  }

  setConfidence(confidence: number): this {
    this.report.confidence = Math.max(0, Math.min(100, confidence));
    return this;
  }

  setCategory(category: IntelCategory): this {
    this.report.category = category;
    return this;
  }

  addCategory(category: string): this {
    if (!this.report.categories) this.report.categories = [];
    if (!this.report.categories.includes(category)) {
      this.report.categories.push(category);
    }
    return this;
  }

  addTag(tag: string): this {
    if (!this.report.tags!.includes(tag)) {
      this.report.tags!.push(tag);
    }
    return this;
  }

  setType(type: IntelReport['type']): this {
    this.report.type = type;
    return this;
  }

  addKeyFinding(finding: string): this {
    if (!this.report.keyFindings) this.report.keyFindings = [];
    this.report.keyFindings.push(finding);
    return this;
  }

  addSource(source: PrimaryIntelSource | string): this {
    if (!this.report.sources) this.report.sources = [];
    if (!this.report.sources.includes(source)) {
      this.report.sources.push(source);
    }
    return this;
  }

  addConnection(reportId: string): this {
    if (!this.report.connections) this.report.connections = [];
    if (!this.report.connections.includes(reportId)) {
      this.report.connections.push(reportId);
    }
    return this;
  }

  setStatus(status: IntelReport['status']): this {
    this.report.status = status;
    return this;
  }

  setBlockchainData(pubkey: string, signature?: string, timestamp?: number): this {
    this.report.pubkey = pubkey;
    if (signature) this.report.signature = signature;
    if (timestamp) this.report.timestamp = timestamp;
    return this;
  }

  setVisualization3D(visualization: IntelVisualization3D): this {
    this.report.visualization3D = visualization;
    return this;
  }

  setLocation3D(location: IntelLocation): this {
    this.report.location3D = location;
    return this;
  }

  setMetadata(metadata: IntelReport['metadata']): this {
    this.report.metadata = { ...this.report.metadata, ...metadata };
    return this;
  }

  setDate(date: string): this {
    this.report.date = date;
    return this;
  }

  setMetaDescription(metaDescription: string): this {
    this.report.metaDescription = metaDescription;
    return this;
  }

  build(): IntelReport {
    // Validate required fields
    if (!this.report.id || !this.report.title || !this.report.author || !this.report.content) {
      throw new Error('IntelReport missing required fields: id, title, author, content');
    }

    // Set updated timestamp
    this.report.updated = new Date();

    return this.report as IntelReport;
  }
}

// =============================================================================
// COMPATIBILITY ADAPTERS
// =============================================================================

/**
 * IntelReport Compatibility Adapter
 * Converts between different IntelReport interface patterns
 */
export class IntelReportAdapter {
  /**
   * Convert IntelReportData to unified IntelReport
   */
  static fromIntelReportData(data: any): IntelReport {
    return new IntelReportBuilder(data.title, data.author)
      .setId(data.id || data.pubkey || crypto.randomUUID())
      .setContent(data.content)
      .setSubtitle(data.subtitle)
      .setSummary(data.summary)
      .setLocation(data.latitude, data.longitude)
      .setClassification(data.classification || 'UNCLASSIFIED')
      .setPriority(data.priority)
      .setConfidence(data.confidence || 50)
      .setCategory(data.category)
      .setType('report')
      .setBlockchainData(data.pubkey, data.signature, data.timestamp)
      .setVisualization3D(data.visualization3D)
      .setLocation3D(data.location3D)
      .setDate(data.date)
      .setMetaDescription(data.metaDescription)
      .build();
  }

  /**
   * Convert NetRunner IntelReport to unified IntelReport
   */
  static fromNetRunnerIntelReport(netrunner: any): IntelReport {
    return new IntelReportBuilder(netrunner.title, netrunner.author)
      .setId(netrunner.id)
      .setSubtitle(netrunner.subtitle)
      .setContent(netrunner.content)
      .setSummary(netrunner.summary)
      .setDescription(netrunner.description)
      .setLocation(netrunner.latitude || 0, netrunner.longitude || 0, netrunner.location)
      .setClassification(netrunner.classification)
      .setConfidence(netrunner.confidence)
      .setMetadata(netrunner.metadata)
      .setStatus(netrunner.status)
      .build();
  }

  /**
   * Convert Service Provider IntelReport to unified IntelReport
   */
  static fromServiceProviderIntelReport(provider: any): IntelReport {
    return new IntelReportBuilder(provider.title, provider.author)
      .setId(provider.pubkey || crypto.randomUUID())
      .setContent(provider.content)
      .setLocation(provider.latitude, provider.longitude)
      .setClassification(provider.classification || 'UNCLASSIFIED')
      .setConfidence(provider.verified ? 90 : 50)
      .setBlockchainData(provider.pubkey, provider.signature, provider.timestamp)
      .build();
  }

  /**
   * Convert Analyzer IntelReport to unified IntelReport
   */
  static fromAnalyzerIntelReport(analyzer: any): IntelReport {
    const builder = new IntelReportBuilder(analyzer.title, analyzer.metadata.author)
      .setId(analyzer.id)
      .setContent(analyzer.content)
      .setType(analyzer.type)
      .setClassification(analyzer.metadata.classification)
      .setConfidence(analyzer.metadata.confidence);

    // Add tags
    analyzer.tags?.forEach((tag: string) => builder.addTag(tag));

    // Add connections
    analyzer.connections?.forEach((conn: string) => builder.addConnection(conn));

    return builder.build();
  }

  /**
   * Convert unified IntelReport back to IntelReportData format
   */
  static toIntelReportData(report: IntelReport): any {
    return {
      id: report.id,
      title: report.title,
      content: report.content,
      tags: report.tags,
      latitude: report.latitude,
      longitude: report.longitude,
      timestamp: report.timestamp || Date.now(),
      author: report.author,
      classification: report.classification,
      sources: report.sources,
      confidence: report.confidence,
      priority: report.priority,
      pubkey: report.pubkey,
      signature: report.signature,
      subtitle: report.subtitle,
      date: report.date,
      categories: report.categories,
      metaDescription: report.metaDescription,
      visualization3D: report.visualization3D,
      location3D: report.location3D,
      lat: report.lat,
      long: report.long
    };
  }
}

// =============================================================================
// EXPORT TYPES FOR COMPATIBILITY
// =============================================================================

// Re-export for backward compatibility
export { IntelEntity, IntelRelationship, Evidence };

// Type alias for the most common usage pattern
export type { IntelReport as UnifiedIntelReport };
