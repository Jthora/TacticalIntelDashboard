/**
 * EXPORTED COPY
 * Source: src/models/Intel/Classification.ts
 * Date: 2025-08-09
 */
// ...original file content below...
// Open Source Intelligence Quality Indicators
// For civilian use in transparent intelligence analysis

/**
 * Source Quality Rating
 * Indicates reliability and trustworthiness of information sources
 */
export type SourceQuality = 
  | 'verified'      // Independently verified by multiple sources
  | 'reliable'      // Known reliable source with good track record
  | 'unverified'    // Single source, not yet corroborated  
  | 'questionable'  // Source has accuracy issues
  | 'unreliable';   // Known unreliable or biased source

/**
 * Information Visibility
 * How openly this information can be shared
 */
export type InformationVisibility = 
  | 'public'        // Publicly available information
  | 'limited'       // Restricted distribution for operational reasons
  | 'private';      // Internal use only

/**
 * Content Sensitivity
 * Sensitivity level for operational security
 */
export type ContentSensitivity = 
  | 'open'          // Open sharing encouraged
  | 'careful'       // Share with care to protect sources/methods
  | 'protected';    // Protect to avoid compromising ongoing operations

/**
 * Quality Assessment
 * Comprehensive quality and handling assessment for intelligence
 */
export interface QualityAssessment {
  sourceQuality: SourceQuality;
  visibility: InformationVisibility;
  sensitivity: ContentSensitivity;
  verificationNotes?: string[];
  sharingGuidelines?: string;
  lastVerified?: number;
}

/**
 * Quality Utilities
 */
export class QualityUtils {
  /**
   * Generate quality summary banner
   */
  static generateSummary(assessment: QualityAssessment): string {
    return `${assessment.sourceQuality.toUpperCase()} | ${assessment.visibility.toUpperCase()} | ${assessment.sensitivity.toUpperCase()}`;
  }

  /**
   * Compare source quality levels
   * Returns: -1 if a < b, 0 if equal, 1 if a > b
   */
  static compareSourceQuality(a: SourceQuality, b: SourceQuality): number {
    const levels = ['unreliable', 'questionable', 'unverified', 'reliable', 'verified'];
    const aIndex = levels.indexOf(a);
    const bIndex = levels.indexOf(b);
    return aIndex - bIndex;
  }

  /**
   * Determine if information can be shared openly
   */
  static canShareOpenly(assessment: QualityAssessment): boolean {
    return assessment.visibility === 'public' && assessment.sensitivity === 'open';
  }

  /**
   * Validate quality assessment
   */
  static validate(assessment: QualityAssessment): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check for questionable sources being marked as public
    if (assessment.sourceQuality === 'questionable' && assessment.visibility === 'public') {
      warnings.push('Consider limiting distribution of questionable source material');
    }

    // Check for unverified sensitive information
    if (assessment.sourceQuality === 'unverified' && assessment.sensitivity === 'protected') {
      warnings.push('Protected information should ideally be from verified sources');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}
