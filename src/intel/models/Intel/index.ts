// Intel Domain Models - Barrel Export
// Implementation of Phase 3: Clean Type Hierarchy Architecture

// =============================================================================
// FOUNDATION LAYER - No Dependencies
// =============================================================================

// Raw Intel Types (Core Foundation)
export * from './Intel';

// Core Classifications and Enums
export * from './Classification';
export * from './IntelEnums';
export * from './IntelLocation';

// =============================================================================
// DATA ABSTRACTION LAYER - Depends on Foundation
// =============================================================================

// Metadata Management
export * from './IntelReportMetaData';

// =============================================================================
// PROCESSING LAYER - Depends on Data Layer
// =============================================================================

// Unified Intel Report Interface
export * from './IntelReport';

// Legacy Intelligence Types (Compatibility)
export * from './Intelligence';

// =============================================================================
// VISUALIZATION LAYER - Depends on Processing Layer
// =============================================================================

// 3D Visualization and Clean Types
export * from './IntelVisualization3D';

// =============================================================================
// OPERATIONAL CAPABILITIES - Cross-Cutting Concerns
// =============================================================================

// Sources and Collection
export * from './Sources';
export * from './Requirements';

// Assessments
export * from './Assessments';

// Utilities
export * from './Validators';

// =============================================================================
// TYPE HIERARCHY DOCUMENTATION & ENHANCEMENTS
// =============================================================================

// Type Hierarchy Definition and Validation
export * from './TypeHierarchy';

// Re-export key interfaces for convenience
export type {
  Intel,
  IntelRequirement
} from './Intel';

export type {
  Intelligence,
  IntelligenceSummary
} from './Intelligence';

export type {
  ThreatAssessment,
  RiskAssessment,
  ThreatCategory,
  ThreatActorType,
  RiskLevel
} from './Assessments';

export type {
  SourceMetadata,
  SourceCapabilities,
  CollectionMethod,
  DataQuality,
  PrimaryIntelSource
} from './Sources';

export type {
  CollectionPriority,
  RequirementCategory,
  EssentialElement,
  AreaOfInterest,
  CollectionPlan,
  CollectionTasking
} from './Requirements';

export type {
  ClassificationMarking
} from './Classification';

// Utility exports
export {
  IntelValidator,
  IntelligenceValidator,
  IntelligenceReportValidator,
  RequirementValidator,
  ThreatAssessmentValidator
} from './Validators';

export {
  ClassificationUtils
} from './Classification';

export {
  SourceUtils
} from './Sources';

export {
  RequirementsUtils
} from './Requirements';

export {
  ThreatAssessmentUtils
} from './Assessments';

// Unified Intel Report types (NEW - Phase 2)
export type {
  IntelReport,
  UnifiedIntelReport,
  IntelEntity,
  IntelRelationship,
  Evidence
} from './IntelReport';

export {
  IntelReportBuilder,
  IntelReportAdapter
} from './IntelReport';

// Core Intel Data types (NEW - Phase 2)
// Intel Report Metadata types (NEW - Phase 2)
export type {
  IntelReportMetaData,
  IntelMetadata
} from './IntelReportMetaData';

export {
  IntelReportMetaDataBuilder,
  IntelMetadataUtils
} from './IntelReportMetaData';

// Version information
export const INTEL_DOMAIN_VERSION = '1.0.0';
export const INTEL_DOMAIN_UPDATED = '2025-07-12';
