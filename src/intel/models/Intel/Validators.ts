// Validation Logic for Intelligence Domain Models
// Implementation of Improvement #5: Better Service Organization

import { Intel, IntelRequirement } from './Intel';
import { Intelligence } from './Intelligence';
import { IntelReportData } from '../IntelReportData';
import { ThreatAssessment, RiskAssessment } from './Assessments';
import { ClassificationUtils } from './Classification';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 quality score
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  code: string;
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string;
}

/**
 * Intel Data Validator
 */
export class IntelValidator {
  
  /**
   * Validate raw intel data
   */
  static validateIntel(intel: Intel): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!intel.id?.trim()) {
      errors.push({
        field: 'id',
        message: 'Intel ID is required',
        severity: 'ERROR',
        code: 'INTEL_001'
      });
    }

    if (!intel.source) {
      errors.push({
        field: 'source',
        message: 'Intel source is required',
        severity: 'ERROR',
        code: 'INTEL_002'
      });
    }

    if (!intel.collectedBy?.trim()) {
      errors.push({
        field: 'collectedBy',
        message: 'Collector identification is required',
        severity: 'ERROR',
        code: 'INTEL_003'
      });
    }

    // Data validation
    if (!intel.data) {
      errors.push({
        field: 'data',
        message: 'Intel data payload is required',
        severity: 'ERROR',
        code: 'INTEL_004'
      });
    }

    // Geographic validation
    if (intel.latitude !== undefined) {
      if (intel.latitude < -90 || intel.latitude > 90) {
        errors.push({
          field: 'latitude',
          message: 'Latitude must be between -90 and 90',
          severity: 'ERROR',
          code: 'INTEL_005'
        });
      }
    }

    if (intel.longitude !== undefined) {
      if (intel.longitude < -180 || intel.longitude > 180) {
        errors.push({
          field: 'longitude',
          message: 'Longitude must be between -180 and 180',
          severity: 'ERROR',
          code: 'INTEL_006'
        });
      }
    }

    // Timestamp validation
    if (intel.timestamp > Date.now()) {
      warnings.push({
        field: 'timestamp',
        message: 'Intel timestamp is in the future',
        recommendation: 'Verify collection timestamp is correct'
      });
    }

    // Quality checks
    if (!intel.tags?.length) {
      warnings.push({
        field: 'tags',
        message: 'No tags specified',
        recommendation: 'Add descriptive tags to improve searchability'
      });
    }

    if (!intel.verified) {
      warnings.push({
        field: 'verified',
        message: 'Intel not verified',
        recommendation: 'Verify intel data through independent sources'
      });
    }

    const score = this.calculateIntelQualityScore(intel, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate intel quality score
   */
  private static calculateIntelQualityScore(
    intel: Intel,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct for errors and warnings
    score -= errors.length * 25;
    score -= warnings.length * 10;

    // Bonus for good practices
    if (intel.tags?.length > 0) score += 5;
    if (intel.verified) score += 10;
    if (intel.hash) score += 5;
    if (intel.latitude && intel.longitude) score += 5;

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Intelligence Validator
 */
export class IntelligenceValidator {
  
  /**
   * Validate processed intelligence
   */
  static validateIntelligence(intelligence: Intelligence): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // First validate as raw intel
    const intelValidation = IntelValidator.validateIntel(intelligence);
    errors.push(...intelValidation.errors);
    warnings.push(...intelValidation.warnings);

    // Additional intelligence-specific validation
    if (!intelligence.analysis?.trim()) {
      errors.push({
        field: 'analysis',
        message: 'Analysis is required for processed intelligence',
        severity: 'ERROR',
        code: 'INTEL_101'
      });
    }

    if (intelligence.confidence < 0 || intelligence.confidence > 100) {
      errors.push({
        field: 'confidence',
        message: 'Confidence must be between 0 and 100',
        severity: 'ERROR',
        code: 'INTEL_102'
      });
    }

    if (!intelligence.processedBy?.trim()) {
      errors.push({
        field: 'processedBy',
        message: 'Processor identification is required',
        severity: 'ERROR',
        code: 'INTEL_103'
      });
    }

    // Quality checks
    if (intelligence.confidence < 50) {
      warnings.push({
        field: 'confidence',
        message: 'Low confidence rating',
        recommendation: 'Consider additional analysis or corroborating sources'
      });
    }

    if (!intelligence.recommendations?.length) {
      warnings.push({
        field: 'recommendations',
        message: 'No recommendations provided',
        recommendation: 'Add actionable recommendations based on analysis'
      });
    }

    const score = this.calculateIntelligenceQualityScore(intelligence, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate intelligence quality score
   */
  private static calculateIntelligenceQualityScore(
    intelligence: Intelligence,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct for errors and warnings
    score -= errors.length * 20;
    score -= warnings.length * 8;

    // Bonus for good practices
    if (intelligence.analysis.length > 100) score += 10;
    if (intelligence.confidence >= 75) score += 10;
    if (intelligence.recommendations?.length > 0) score += 5;
    if (intelligence.relatedIntel?.length > 0) score += 5;

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Intelligence Report Validator
 */
export class IntelligenceReportValidator {
  
  /**
   * Validate intelligence report
   */
  static validateReport(report: IntelReportData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!report.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Report title is required',
        severity: 'ERROR',
        code: 'REPORT_001'
      });
    }

    if (!report.content?.trim()) {
      errors.push({
        field: 'content',
        message: 'Report content is required',
        severity: 'ERROR',
        code: 'REPORT_002'
      });
    }

    if (!report.executiveSummary?.trim()) {
      errors.push({
        field: 'executiveSummary',
        message: 'Executive summary is required',
        severity: 'ERROR',
        code: 'REPORT_003'
      });
    }

    if (!report.author?.trim()) {
      errors.push({
        field: 'author',
        message: 'Report author is required',
        severity: 'ERROR',
        code: 'REPORT_004'
      });
    }

    // Classification validation
    const classValidation = ClassificationUtils.validate(report.classification);
    if (!classValidation.isValid) {
      classValidation.errors.forEach(error => {
        errors.push({
          field: 'classification',
          message: error,
          severity: 'ERROR',
          code: 'REPORT_005'
        });
      });
    }

    // Content quality checks
    if (report.executiveSummary.length < 50) {
      warnings.push({
        field: 'executiveSummary',
        message: 'Executive summary is very short',
        recommendation: 'Expand executive summary to provide better overview'
      });
    }

    if (!report.keyFindings?.length) {
      warnings.push({
        field: 'keyFindings',
        message: 'No key findings specified',
        recommendation: 'Add key findings to highlight important discoveries'
      });
    }

    if (!report.recommendations?.length) {
      warnings.push({
        field: 'recommendations',
        message: 'No recommendations provided',
        recommendation: 'Add actionable recommendations'
      });
    }

    if (!report.sources?.length) {
      warnings.push({
        field: 'sources',
        message: 'No sources specified',
        recommendation: 'Document intelligence sources used'
      });
    }

    // Quality metrics validation
    if (report.confidence < 0 || report.confidence > 100) {
      errors.push({
        field: 'confidence',
        message: 'Confidence must be between 0 and 100',
        severity: 'ERROR',
        code: 'REPORT_006'
      });
    }

    if (report.confidence < 60) {
      warnings.push({
        field: 'confidence',
        message: 'Low confidence rating',
        recommendation: 'Consider additional analysis or sources'
      });
    }

    const score = this.calculateReportQualityScore(report, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate report quality score
   */
  private static calculateReportQualityScore(
    report: IntelReportData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct for errors and warnings
    score -= errors.length * 15;
    score -= warnings.length * 5;

    // Bonus for completeness
    if (report.executiveSummary.length > 100) score += 5;
    if (report.keyFindings?.length >= 3) score += 5;
    if (report.recommendations?.length >= 2) score += 5;
    if (report.sources?.length > 0) score += 10;
    if (report.confidence >= 80) score += 10;
    if (report.attachments?.length > 0) score += 5;

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Requirement Validator
 */
export class RequirementValidator {
  
  /**
   * Validate intelligence requirement
   */
  static validateRequirement(requirement: IntelRequirement): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!requirement.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Requirement title is required',
        severity: 'ERROR',
        code: 'REQ_001'
      });
    }

    if (!requirement.description?.trim()) {
      errors.push({
        field: 'description',
        message: 'Requirement description is required',
        severity: 'ERROR',
        code: 'REQ_002'
      });
    }

    if (!requirement.requestedBy?.trim()) {
      errors.push({
        field: 'requestedBy',
        message: 'Requestor identification is required',
        severity: 'ERROR',
        code: 'REQ_003'
      });
    }

    // Deadline validation
    if (requirement.deadline <= Date.now()) {
      errors.push({
        field: 'deadline',
        message: 'Deadline cannot be in the past',
        severity: 'ERROR',
        code: 'REQ_004'
      });
    }

    // Essential elements validation
    if (!requirement.essentialElements?.length) {
      errors.push({
        field: 'essentialElements',
        message: 'At least one essential element is required',
        severity: 'ERROR',
        code: 'REQ_005'
      });
    }

    // Quality checks
    if (!requirement.preferredSources?.length) {
      warnings.push({
        field: 'preferredSources',
        message: 'No preferred sources specified',
        recommendation: 'Specify preferred intelligence sources'
      });
    }

    if (!requirement.areasOfInterest?.length && !requirement.targetLocation) {
      warnings.push({
        field: 'geographic',
        message: 'No geographic focus specified',
        recommendation: 'Define areas of interest or target locations'
      });
    }

    const score = this.calculateRequirementQualityScore(requirement, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate requirement quality score
   */
  private static calculateRequirementQualityScore(
    requirement: IntelRequirement,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct for errors and warnings
    score -= errors.length * 20;
    score -= warnings.length * 10;

    // Bonus for completeness
    if (requirement.essentialElements.length >= 3) score += 10;
    if (requirement.preferredSources?.length > 0) score += 5;
    if (requirement.areasOfInterest?.length > 0) score += 5;
    if (requirement.justification?.length > 50) score += 5;

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Threat Assessment Validator
 */
export class ThreatAssessmentValidator {
  
  /**
   * Validate threat assessment
   */
  static validateThreatAssessment(assessment: ThreatAssessment): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!assessment.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Threat assessment title is required',
        severity: 'ERROR',
        code: 'THREAT_001'
      });
    }

    if (!assessment.description?.trim()) {
      errors.push({
        field: 'description',
        message: 'Threat description is required',
        severity: 'ERROR',
        code: 'THREAT_002'
      });
    }

    if (!assessment.attackVectors?.length) {
      errors.push({
        field: 'attackVectors',
        message: 'At least one attack vector is required',
        severity: 'ERROR',
        code: 'THREAT_003'
      });
    }

    // Likelihood validation
    if (assessment.likelihood < 0 || assessment.likelihood > 100) {
      errors.push({
        field: 'likelihood',
        message: 'Likelihood must be between 0 and 100',
        severity: 'ERROR',
        code: 'THREAT_004'
      });
    }

    // Confidence validation
    if (assessment.confidence < 0 || assessment.confidence > 100) {
      errors.push({
        field: 'confidence',
        message: 'Confidence must be between 0 and 100',
        severity: 'ERROR',
        code: 'THREAT_005'
      });
    }

    // Quality checks
    if (!assessment.basedOnIntel?.length) {
      warnings.push({
        field: 'basedOnIntel',
        message: 'No supporting intelligence specified',
        recommendation: 'Reference supporting intelligence reports'
      });
    }

    if (!assessment.recommendations?.length) {
      warnings.push({
        field: 'recommendations',
        message: 'No recommendations provided',
        recommendation: 'Add mitigation recommendations'
      });
    }

    if (assessment.confidence < 60) {
      warnings.push({
        field: 'confidence',
        message: 'Low confidence rating',
        recommendation: 'Gather additional intelligence to increase confidence'
      });
    }

    const score = this.calculateThreatAssessmentQualityScore(assessment, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate threat assessment quality score
   */
  private static calculateThreatAssessmentQualityScore(
    assessment: ThreatAssessment,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct for errors and warnings
    score -= errors.length * 15;
    score -= warnings.length * 8;

    // Bonus for completeness
    if (assessment.attackVectors.length >= 2) score += 5;
    if (assessment.potentialImpacts?.length >= 2) score += 5;
    if (assessment.recommendations?.length >= 2) score += 5;
    if (assessment.basedOnIntel?.length > 0) score += 10;
    if (assessment.confidence >= 75) score += 10;

    return Math.max(0, Math.min(100, score));
  }
}
