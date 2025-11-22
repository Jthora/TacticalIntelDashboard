/**
 * EXPORTED COPY
 * Source: src/models/Intel/Intel.ts
 * Date: 2025-08-09
 */
// Raw Intelligence Data Types
// Base types for raw, unprocessed intelligence data points

import { PrimaryIntelSource } from './Sources';
import { QualityAssessment } from './Classification';

// Re-export quality types for convenience
export type { SourceQuality, InformationVisibility, ContentSensitivity, QualityAssessment } from './Classification';

export type ReliabilityRating = 
  | 'A' // Completely reliable
  | 'B' // Usually reliable  
  | 'C' // Fairly reliable
  | 'D' // Not usually reliable
  | 'E' // Unreliable
  | 'F' // Reliability cannot be judged
  | 'X'; // Deliberate deception suspected

/**
 * Raw Intel Data Point
 * Represents unprocessed intelligence data from various sources
 */
export interface Intel {
  id: string;
  source: PrimaryIntelSource;
  classification?: string;
  qualityAssessment: QualityAssessment;
  reliability: ReliabilityRating;
  timestamp: number;
  collectedBy: string; // Collector/sensor ID
  
  // Geographic context
  latitude?: number;
  longitude?: number;
  location?: string; // Human-readable location
  
  // Raw data payload
  data: unknown;
  
  // Metadata
  tags: string[];
  hash?: string; // Data integrity hash
  verified?: boolean;
  
  // Bridge integration support
  bridgeMetadata?: {
    entityId?: string; // Associated IntelEntity ID
    processingStage?: 'raw' | 'processed' | 'analyzed' | 'visualized';
    transformedAt?: number; // When this was transformed to IntelEntity
    transformedBy?: string; // System/user that performed transformation
    transformationId?: string; // Unique ID for this transformation
    transformationVersion?: string; // Version of transformation process
    qualityScore?: number; // Quality assessment score (0-100)
    preservedFields?: string[]; // Fields preserved during transformation
    enhancedFields?: string[]; // Fields enhanced during processing
  };
}

export type { IntelRequirement } from './Requirements';
