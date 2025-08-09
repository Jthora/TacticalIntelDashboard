/**
 * EXPORTED COPY
 * Source: src/types/DataVault.ts
 * Date: 2025-08-09
 */

/**
 * DataVault - Secure Export Format
 * 
 * DataVault is an encrypted, password-protected, compressed export format
 * for Intel data. It enables secure sharing and transport of intelligence
 * information between systems and users.
 * 
 * NOTE: This is an EXPORT FORMAT, not a storage system.
 * DataVault packages any raw data from the application into secure bundles.
 * 
 * INTEGRATION_TAG: INTEL_FILE_FORMAT_REFERENCE 2025-08-09 (external compatibility marker)
 */

// =============================================================================
// CORE DATAVAULT INTERFACES
// =============================================================================

/**
 * Encryption configuration for DataVault export
 */
export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyDerivation: 'PBKDF2' | 'Argon2id';
  iterations: number;
  saltLength: number;
  ivLength: number;
}

/**
 * Password protection configuration
 */
export interface PasswordConfig {
  minLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireMixedCase: boolean;
  hashingAlgorithm: 'bcrypt' | 'scrypt' | 'argon2';
}

/**
 * Compression settings for DataVault
 */
export interface CompressionConfig {
  algorithm: 'gzip' | 'brotli' | 'lz4';
  level: number; // 1-9 for gzip, 1-11 for brotli
  enableDictionary: boolean;
}

/**
 * Core DataVault interface - represents an encrypted export package
 */
export interface DataVault {
  // Export Metadata
  exportId: string;
  exportedAt: string; // ISO date string
  exportType: 'intel' | 'intelReport' | 'intelReportPackage' | 'workspace' | 'mixed';
  title: string;
  description?: string;
  exportedBy: string; // User identifier
  
  // Security Configuration
  encryption: EncryptionConfig;
  passwordProtection: PasswordConfig;
  compressionSettings: CompressionConfig;
  
  // Content Metadata (references to what's being exported)
  contentManifest: ContentManifest;
  
  // Encrypted Content (the actual data)
  content: ArrayBuffer; // Encrypted zip data
  
  // Integrity & Validation
  checksum: string;
  version: string;
  
  // Export Operations
  package(): Promise<Buffer>; // Create encrypted zip from source data
  validate(): Promise<ValidationResult>; // Validate export integrity
  calculateSize(): Promise<number>; // Calculate total export size
}

/**
 * Content manifest describing what's in the DataVault
 */
export interface ContentManifest {
  intelFiles: ContentFileInfo[]; // .intel files being exported
  reportFiles: ContentFileInfo[]; // .intelReport files being exported  
  packageFolders: ContentFolderInfo[]; // .intelReportPackage folders being exported
  assetFiles: ContentFileInfo[]; // Supporting assets (images, docs, etc.)
  totalFiles: number;
  totalSize: number; // Uncompressed size in bytes
  fileTypes: string[]; // List of file extensions
}

/**
 * Information about a file in the DataVault
 */
export interface ContentFileInfo {
  path: string; // Relative path within the vault
  originalPath?: string; // Original path in source system
  size: number; // File size in bytes
  type: string; // File type/extension
  checksum: string; // File integrity hash
  metadata?: Record<string, unknown>; // File-specific metadata
}

/**
 * Information about a folder in the DataVault
 */
export interface ContentFolderInfo {
  path: string; // Relative path within the vault
  originalPath?: string; // Original path in source system
  fileCount: number;
  totalSize: number;
  structure: ContentFileInfo[]; // Files within the folder
}

// =============================================================================
// INTEL-SPECIFIC DATAVAULT SPECIALIZATIONS
// =============================================================================

/**
 * DataVault specialized for Intel data export
 */
export interface IntelDataVault extends DataVault {
  exportType: 'intel';
  intelMetadata: IntelExportMetadata;
  qualityAssessment: IntelQualityAssessment;
  sourceProtection: SourceProtectionLevel;
}

/**
 * DataVault specialized for IntelReport export
 */
export interface IntelReportDataVault extends DataVault {
  exportType: 'intelReport';
  reportMetadata: IntelReportExportMetadata;
  analysisLocks: AnalysisLock[];
  distributionHistory: DistributionEntry[];
}

/**
 * DataVault specialized for IntelReportPackage export (folders)
 */
export interface IntelReportPackageDataVault extends DataVault {
  exportType: 'intelReportPackage';
  packageMetadata: PackageExportMetadata;
  collaborationSettings: CollaborationSettings;
  versionHistory: PackageVersion[];
}

// =============================================================================
// EXPORT METADATA INTERFACES
// =============================================================================

/**
 * Metadata for Intel export operations
 */
export interface IntelExportMetadata {
  classification: string;
  sourceReliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  confidence: number; // 0-100
  sensitivity: 'PUBLIC' | 'SENSITIVE' | 'CONFIDENTIAL' | 'SECRET';
  retentionPolicy: RetentionPolicy;
  accessLog: AccessLogEntry[];
}

/**
 * Metadata for IntelReport export operations
 */
export interface IntelReportExportMetadata {
  reportType: string;
  priority: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
  targetAudience: string[];
  analysisType: string;
  methodologies: string[];
  reviewStatus: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  approvalChain: ApprovalEntry[];
}

/**
 * Metadata for IntelReportPackage export operations
 */
export interface PackageExportMetadata {
  packageType: string;
  version: string;
  dependencies: string[];
  compatibility: string[];
  maintainer: string;
  contributors: string[];
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

/**
 * Quality assessment for Intel data
 */
export interface IntelQualityAssessment {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  timeliness: number; // 0-100
  relevance: number; // 0-100
  overall: number; // 0-100
  assessedBy: string;
  assessedAt: string;
}

/**
 * Source protection levels for Intel export
 */
export type SourceProtectionLevel = 
  | 'OPEN' // No source protection needed
  | 'PROTECTED' // Source details should be protected
  | 'CLASSIFIED' // Source details are classified
  | 'COMPARTMENTED'; // Source details are compartmented

/**
 * Analysis lock for preventing concurrent modifications
 */
export interface AnalysisLock {
  lockId: string;
  lockedBy: string;
  lockedAt: string;
  lockType: 'READ' | 'WRITE' | 'EXCLUSIVE';
  expiresAt?: string;
}

/**
 * Distribution history entry
 */
export interface DistributionEntry {
  distributedTo: string;
  distributedBy: string;
  distributedAt: string;
  method: 'VAULT' | 'LINK' | 'COPY' | 'REFERENCE';
  purpose: string;
}

/**
 * Data retention policy
 */
export interface RetentionPolicy {
  retainUntil?: string; // ISO date string
  retainIndefinitely: boolean;
  archiveAfter?: string; // ISO date string
  deleteAfter?: string; // ISO date string
  complianceRequirements: string[];
}

/**
 * Access log entry
 */
export interface AccessLogEntry {
  accessedBy: string;
  accessedAt: string;
  action: 'VIEW' | 'DOWNLOAD' | 'MODIFY' | 'EXPORT' | 'SHARE';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
}

/**
 * Approval entry for review chains
 */
export interface ApprovalEntry {
  approvedBy: string;
  approvedAt: string;
  level: 'TECHNICAL' | 'MANAGERIAL' | 'SECURITY' | 'LEGAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  comments?: string;
}

/**
 * Collaboration settings for shared packages
 */
export interface CollaborationSettings {
  allowEditing: boolean;
  allowCommenting: boolean;
  allowSharing: boolean;
  requireApproval: boolean;
  maxCollaborators?: number;
  inviteOnly: boolean;
}

/**
 * Package version information
 */
export interface PackageVersion {
  version: string;
  createdAt: string;
  createdBy: string;
  changes: string[];
  previousVersion?: string;
  tags: string[];
}

// =============================================================================
// EXPORT/IMPORT OPERATION INTERFACES
// =============================================================================

/**
 * Options for creating DataVault exports
 */
export interface ExportOptions {
  includeAssets: boolean;
  includeMetadata: boolean;
  compressionLevel: number;
  encryptionKey?: string;
  password?: string;
  format: 'zip' | 'tar' | 'encrypted-zip';
  sanitizeData: boolean; // Remove sensitive fields before export
  validateBeforeExport: boolean;
}

/**
 * Result of a DataVault import operation
 */
export interface ImportResult {
  success: boolean;
  extractedFiles: string[];
  importedIntel: ImportedIntelInfo[];
  importedReports: ImportedReportInfo[];
  importedPackages: ImportedPackageInfo[];
  warnings: string[];
  errors: string[];
  manifest: ContentManifest;
}

/**
 * Information about imported Intel
 */
export interface ImportedIntelInfo {
  id: string;
  originalPath: string;
  importedPath: string;
  type: string;
  size: number;
  validated: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Information about imported IntelReports
 */
export interface ImportedReportInfo {
  id: string;
  originalPath: string;
  importedPath: string;
  reportType: string;
  size: number;
  validated: boolean;
  containedIntel: string[]; // IDs of Intel contained in the report
}

/**
 * Information about imported IntelReportPackages
 */
export interface ImportedPackageInfo {
  id: string;
  originalPath: string;
  importedPath: string;
  packageType: string;
  fileCount: number;
  totalSize: number;
  structure: ContentFileInfo[];
}

/**
 * Validation result for DataVault operations
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  checksumValid: boolean;
  encryptionValid: boolean;
  structureValid: boolean;
}

/**
 * Validation error information
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'ERROR' | 'CRITICAL';
}

/**
 * Validation warning information
 */
export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  recommendation?: string;
}

// =============================================================================
// NOTE: All interfaces above are automatically exported
// =============================================================================

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

/**
 * Default encryption configuration
 */
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 100000,
  saltLength: 32,
  ivLength: 16
};

/**
 * Default password configuration
 */
export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  minLength: 12,
  requireSpecialChars: true,
  requireNumbers: true,
  requireMixedCase: true,
  hashingAlgorithm: 'argon2'
};

/**
 * Default compression configuration
 */
export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  algorithm: 'gzip',
  level: 6,
  enableDictionary: false
};

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeAssets: true,
  includeMetadata: true,
  compressionLevel: 6,
  format: 'encrypted-zip',
  sanitizeData: false,
  validateBeforeExport: true
};
