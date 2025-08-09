/**
 * EXPORTED COPY
 * Source: src/models/Intel/Sources.ts
 * Date: 2025-08-09
 */
// Intelligence Source Types and Definitions
// Implementation of Improvement #1: Domain Terminology Refinement

/**
 * Primary Intelligence Disciplines
 * Based on U.S. Intelligence Community standards
 */
export type PrimaryIntelSource = 
  | 'SIGINT'    // Signals Intelligence
  | 'HUMINT'    // Human Intelligence  
  | 'GEOINT'    // Geospatial Intelligence
  | 'OSINT'     // Open Source Intelligence
  | 'COMINT'    // Communications Intelligence
  | 'ELINT'     // Electronic Intelligence
  | 'MASINT'    // Measurement and Signature Intelligence
  | 'TECHINT'   // Technical Intelligence
  | 'FININT'    // Financial Intelligence
  | 'CYBINT';   // Cyber Intelligence

/**
 * SIGINT Sub-disciplines
 */
export type SigintSource = 
  | 'COMINT'    // Communications Intelligence
  | 'ELINT'     // Electronic Intelligence
  | 'FISINT';   // Foreign Instrumentation Signals Intelligence

/**
 * OSINT Sub-categories
 */
export type OsintSource = 
  | 'SOCMINT'   // Social Media Intelligence
  | 'WEBINT'    // Web Intelligence
  | 'MEDINT'    // Media Intelligence
  | 'ACADINT'   // Academic Intelligence
  | 'BUSINT';   // Business Intelligence

/**
 * Collection Methods
 */
export type CollectionMethod = 
  | 'AUTOMATED'    // Automated collection systems
  | 'MANUAL'       // Manual collection by humans
  | 'SENSOR'       // Sensor-based collection
  | 'INTERCEPT'    // Signal interception
  | 'SURVEILLANCE' // Physical or electronic surveillance
  | 'INTERVIEW'    // Human source interviews
  | 'DOCUMENT'     // Document exploitation
  | 'TECHNICAL';   // Technical analysis

/**
 * Source Platform Types
 */
export type SourcePlatform = 
  | 'SATELLITE'    // Satellite platforms
  | 'AIRCRAFT'     // Aircraft platforms
  | 'GROUND'       // Ground-based platforms
  | 'MARITIME'     // Maritime platforms
  | 'CYBER'        // Cyber platforms
  | 'HUMAN'        // Human sources
  | 'MOBILE'       // Mobile platforms
  | 'FIXED';       // Fixed installations

/**
 * Data Quality Indicators
 */
export type DataQuality = 
  | 'RAW'          // Unprocessed raw data
  | 'FILTERED'     // Basic filtering applied
  | 'CORRELATED'   // Correlated with other sources
  | 'ANALYZED'     // Analyzed and contextualized
  | 'VERIFIED'     // Independently verified
  | 'ACTIONABLE';  // Ready for operational use

/**
 * Source Metadata
 * Detailed information about intelligence sources
 */
export interface SourceMetadata {
  primary: PrimaryIntelSource;
  secondary?: SigintSource | OsintSource;
  method: CollectionMethod;
  platform: SourcePlatform;
  quality: DataQuality;
  
  // Source identification
  sourceId: string;
  sensorId?: string;
  operatorId?: string;
  
  // Collection context
  collectionDate: number;
  collectionLocation?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  
  // Technical details
  frequency?: number; // For SIGINT
  resolution?: number; // For imagery
  bandwidth?: number; // For communications
  
  // Chain of custody
  custodyChain: string[];
  lastHandler: string;
  
  // Quality metrics
  confidence: number; // 0-100
  completeness: number; // 0-100 (how complete is the data)
  timeliness: number; // 0-100 (how current is the data)
}

/**
 * Source Capabilities
 * What types of intelligence a source can provide
 */
export interface SourceCapabilities {
  sourceId: string;
  name: string;
  description: string;
  
  // Capabilities
  disciplines: PrimaryIntelSource[];
  methods: CollectionMethod[];
  platforms: SourcePlatform[];
  
  // Coverage
  geographicCoverage: {
    regions: string[];
    globalCoverage: boolean;
  };
  
  // Performance
  responseTime: number; // Average response time in minutes
  reliability: number; // 0-100 reliability score
  availability: number; // 0-100 availability percentage
  
  // Limitations
  limitations: string[];
  restrictions: string[];
  
  // Contact information
  poc: string; // Point of contact
  requestProcedure: string;
}

/**
 * Source Management Utilities
 */
export class SourceUtils {
  /**
   * Determine if source can collect specific type of intel
   */
  static canCollect(
    source: SourceCapabilities,
    requiredDiscipline: PrimaryIntelSource,
    requiredMethod?: CollectionMethod
  ): boolean {
    const hasdiscipline = source.disciplines.includes(requiredDiscipline);
    const hasMethod = !requiredMethod || source.methods.includes(requiredMethod);
    return hasdiscipline && hasMethod;
  }

  /**
   * Calculate overall source quality score
   */
  static calculateQualityScore(metadata: SourceMetadata): number {
    const weights = {
      confidence: 0.4,
      completeness: 0.3,
      timeliness: 0.3
    };
    
    return (
      metadata.confidence * weights.confidence +
      metadata.completeness * weights.completeness +
      metadata.timeliness * weights.timeliness
    );
  }

  /**
   * Generate source citation
   */
  static generateCitation(metadata: SourceMetadata): string {
    const date = new Date(metadata.collectionDate).toISOString().split('T')[0];
    return `${metadata.primary}/${metadata.sourceId} (${date})`;
  }

  /**
   * Validate source metadata
   */
  static validateMetadata(metadata: SourceMetadata): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!metadata.sourceId?.trim()) {
      errors.push('Source ID is required');
    }

    if (metadata.confidence < 0 || metadata.confidence > 100) {
      errors.push('Confidence must be between 0 and 100');
    }

    if (metadata.completeness < 0 || metadata.completeness > 100) {
      errors.push('Completeness must be between 0 and 100');
    }

    if (metadata.timeliness < 0 || metadata.timeliness > 100) {
      errors.push('Timeliness must be between 0 and 100');
    }

    if (!metadata.custodyChain?.length) {
      errors.push('Custody chain is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
